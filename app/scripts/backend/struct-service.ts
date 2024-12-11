/** @format */
import _ from "lodash"
import angular, { IHttpService, IPromise } from "angular"
import settings from "@/settings"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethod } from "@/util"
import { Response } from "./types"

export type StructService = {
    /** Find which unique values occur and count them. */
    countAttrValues: (
        corpora: string[],
        attrs: string[],
        /** Attributes whose values should be split by "|" */
        split?: string[]
    ) => IPromise<RecursiveRecord<number>>
    /** Find which unique values occur for a given attribute. */
    getAttrValues: (
        corpora: string[],
        attr: string,
        /** Whether values should be split by "|" */
        split?: boolean
    ) => IPromise<string[]>
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1attr_values/get */
export type StructServiceParameters = {
    corpus: string
    attr: string
    count?: boolean
    /** Include per-corpus results. Enabled by default. */
    per_corpus?: boolean
    /** Include combined results. Enabled by default. */
    combined?: boolean
    /** Attributes whose values should be split by "|" */
    split?: string
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1attr_values/get */
export type AttrValuesDeepResponse = {
    // The presence of `corpora` and `combined` actually depends on the `per_corpus` and `combined` parameters.
    corpora: { [corpus: string]: AttrValues }
    combined: AttrValues
}

export type AttrValuesFlatResponse = {
    /** Lists of values keyed innermost by attribute names and outermost by corpus ids */
    corpora: Record<string, Record<string, string[]>>
    /** Lists of values across all given corpora, keyed by attribute names */
    combined: Record<string, string[]>
}

/**
 * Value structures by attribute path.
 *
 * For the path author>year, the structure would be:
 * `{ "author>year": { "J.K. Rofling": { "2010": 42, ... } } }`
 */
export type AttrValues = { [attrPath: string]: RecursiveRecord<number> }

// This version of TypeScript has a problem with recursive types, so we have to use {[_]:_} syntax here?
export type RecursiveRecord<T> = Record<string, T> | { [k: string]: RecursiveRecord<T> }

angular.module("korpApp").factory("structService", [
    "$http",
    ($http: IHttpService): StructService => {
        async function request<R>(params: StructServiceParameters): Promise<R> {
            const url = settings["korp_backend_url"] + "/attr_values"
            const headers = getAuthorizationHeader()

            const conf = httpConfAddMethod({ url, method: "GET", params, headers })

            const { data } = await $http<Response<R>>(conf)
            if ("ERROR" in data) throw new Error(data.ERROR.value)
            return data
        }

        return {
            // Memoize the function so that the backend /attr_values is called
            // only once for each combination of corpora and attributes
            countAttrValues: _.memoize(
                async function (corpora, attrs, split = []) {
                    // Join attributes as a hierarchical path that shapes the response
                    const attributePath = attrs.join(">")

                    const data = await request<AttrValuesDeepResponse>({
                        corpus: corpora.join(","),
                        attr: attributePath,
                        count: true,
                        per_corpus: false,
                        split: split.join(",") || undefined,
                    })
                    return data.combined[attributePath]
                },
                // Memoize based on the values of all arguments
                (...args) => JSON.stringify(args)
            ),

            getAttrValues: _.memoize(
                async (corpora, attr, split) => {
                    const data = await request<AttrValuesFlatResponse>({
                        corpus: corpora.join(","),
                        attr: attr,
                        per_corpus: false,
                        split: split ? attr : undefined,
                    })

                    return data.combined[attr]
                },
                // Memoize based on the values of all arguments
                (...args) => JSON.stringify(args)
            ),
        }
    },
])
