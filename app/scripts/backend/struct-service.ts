/** @format */
import _ from "lodash"
import angular, { IHttpService, IPromise, IQService } from "angular"
import settings from "@/settings"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethod } from "@/util"
import { KorpResponse } from "./types"

export type StructService = {
    /** Returns list if `options.returnByCorpora` is set to false, otherwise record of lists. */
    getStructValues: (
        corpora: string[],
        attributes: string[],
        options?: StructServiceOptions
    ) => IPromise<Record<string, AttrValues> | AttrValues>
}

export type StructServiceOptions = {
    count?: boolean
    returnByCorpora?: boolean
    split?: boolean
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1attr_values/get */
export type StructServiceParameters = {
    corpus: string
    struct: string
    count: boolean
    split?: string
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1attr_values/get */
export type StructServiceResponse = {
    corpora: { [corpus: string]: AttrValues }
    combined: AttrValues
}

export type AttrValues = RecursiveRecord<string[] | Record<string, number>>

export type RecursiveRecord<T> = T | { [k: string]: RecursiveRecord<T> }

angular.module("korpApp").factory("structService", [
    "$http",
    "$q",
    ($http: IHttpService, $q: IQService): StructService => ({
        // Memoize the function so that the backend /struct_values is called
        // only once for each combination of corpora, attributes and options
        getStructValues: _.memoize(
            function (corpora, attributes, options = {}) {
                const { count = true, returnByCorpora = true, split } = options
                const def = $q.defer<Record<string, string[]> | string[]>()

                const structValue = attributes.join(">")

                const params: StructServiceParameters = {
                    corpus: corpora.join(","),
                    struct: structValue,
                    count,
                }

                if (split) params.split = _.last(attributes)

                const conf = httpConfAddMethod({
                    url: settings["korp_backend_url"] + "/struct_values",
                    method: "GET",
                    params,
                    headers: getAuthorizationHeader(),
                })

                $http<KorpResponse<StructServiceResponse>>(conf).then(({ data }) => {
                    if ("ERROR" in data) {
                        def.reject()
                        return
                    }

                    if (returnByCorpora) {
                        const result: Record<string, string[]> = {}
                        for (const corpora in data.corpora) {
                            const values = data.corpora[corpora]
                            result[corpora] = values[structValue]
                        }
                        def.resolve(result)
                    } else {
                        const result: string[] = []
                        for (const corpora in data.corpora) {
                            const values = data.corpora[corpora]
                            result.push(...values[structValue])
                        }
                        def.resolve(result)
                    }
                })

                return def.promise
            },
            // Memoize based on the values of all arguments
            (...args) => JSON.stringify(args)
        ),
    }),
])
