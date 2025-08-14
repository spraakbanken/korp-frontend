/** @format */
import { once, uniq } from "lodash"
import settings from "@/settings"
import ProxyBase from "@/backend/proxy-base"
import { Factory } from "@/util"
import { ProgressHandler } from "./types"
import { QueryParams, QueryResponse } from "./types/query"
import { expandCqp } from "@/cqp_parser/cqp"

export type KwicProxyInput = [KorpQueryRequestOptions, ((data: QueryResponse) => void) | undefined]

export type KorpQueryRequestOptions = QueryParams & {
    command?: "query" | "relations_sentences"
}

export class KwicProxy extends ProxyBase<"query", KwicProxyInput, QueryResponse> {
    command: "query" | "relations_sentences"
    protected readonly endpoint = "query"
    kwicCallback?: (data: QueryResponse) => void
    prevParams: QueryParams | null
    queryData?: string

    constructor() {
        super()
        this.queryData = undefined
        this.prevParams = null
    }

    protected buildParams(options: KorpQueryRequestOptions, kwicCallback?: (data: QueryResponse) => void): QueryParams {
        this.command = options.command || "query"
        this.kwicCallback = once(kwicCallback || (() => {}))

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

        params.show = uniq(["sentence"].concat(show)).join(",")
        params.show_struct = uniq(show_struct).join(",")

        this.prevParams = params
        return params
    }

    protected processResult(response: QueryResponse): QueryResponse {
        this.kwicCallback?.(response)
        return response
    }

    setProgressHandler(onProgress: ProgressHandler<"query">): this {
        return super.setProgressHandler((progress) => {
            if (!progress) return
            onProgress?.(progress)

            // Show current page of results if they are available
            // The request may continue to count hits in the background
            if ("kwic" in progress.data) {
                this.kwicCallback?.(progress.data as QueryResponse)
            }
        })
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory
