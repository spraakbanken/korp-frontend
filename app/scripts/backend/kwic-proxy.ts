/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import { Factory } from "@/util"
import { ProgressReport } from "./types"
import { QueryParams, QueryResponse } from "./types/query"
import { korpRequest } from "./common"
import { expandCqp } from "@/cqp_parser/cqp"

export class KwicProxy extends BaseProxy {
    prevParams: QueryParams | null
    queryData?: string

    constructor() {
        super()
        this.queryData = undefined
        this.prevParams = null
    }

    async makeRequest(
        options: KorpQueryRequestOptions,
        progressCallback?: (data: ProgressReport<"query">) => void,
        kwicCallback?: (data: QueryResponse) => void
    ): Promise<QueryResponse> {
        this.resetRequest()
        const abortSignal = this.abortController.signal

        const command = options.command || "query"

        const params: QueryParams = {
            default_context: settings.default_overview_context,
            ...options,
        }

        const show: string[] = []
        const show_struct: string[] = []

        for (let corpus of settings.corpusListing.selected) {
            for (let key in corpus.within) {
                // val = corpus.within[key]
                show.push(key.split(" ").pop()!)
            }
            for (let key in corpus.attributes) {
                // val = corpus.attributes[key]
                show.push(key)
            }

            if (corpus["struct_attributes"] != null) {
                $.each(corpus["struct_attributes"], function (key, val) {
                    if ($.inArray(key, show_struct) === -1) {
                        return show_struct.push(key)
                    }
                })
                if (corpus["reading_mode"]) {
                    show_struct.push("text__id")
                }
            }
        }

        if (params.cqp) {
            params.cqp = expandCqp(params.cqp)
        }

        params.show = _.uniq(["sentence"].concat(show)).join(",")
        params.show_struct = _.uniq(show_struct).join(",")

        this.prevParams = params

        // If the result callback is called in the progress handler, do not do it again at finish.
        const kwicCallbackOnce = _.once(kwicCallback || (() => {}))

        function onProgress(progress: ProgressReport<"query">) {
            if (!progress) return
            progressCallback?.(progress)

            // Show current page of results if they are available
            // The request may continue to count hits in the background
            if ("kwic" in progress.data) {
                kwicCallbackOnce(progress.data as QueryResponse)
            }
        }

        const data = await korpRequest(command, params, { abortSignal, onProgress })
        this.queryData = data.query_data
        kwicCallbackOnce(data)
        return data
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory

export type KorpQueryRequestOptions = QueryParams & {
    command?: "query" | "relations_sentences"
}
