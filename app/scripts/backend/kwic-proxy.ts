/** @format */
import { uniq } from "lodash"
import settings from "@/settings"
import ProxyBase from "@/backend/proxy-base"
import { Factory } from "@/util"
import { QueryParams, QueryResponse } from "./types/query"
import { expandCqp } from "@/cqp_parser/cqp"

export type KwicProxyInput = [KorpQueryRequestOptions]

export type KorpQueryRequestOptions = QueryParams & {
    command?: "query" | "relations_sentences"
}

export class KwicProxy extends ProxyBase<"query", KwicProxyInput, QueryResponse> {
    command: "query" | "relations_sentences"
    protected readonly endpoint = "query"
    prevParams: QueryParams | null
    queryData?: string

    constructor() {
        super()
        this.queryData = undefined
        this.prevParams = null
    }

    protected buildParams(options: KorpQueryRequestOptions): QueryParams {
        this.command = options.command || "query"

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
        return response
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory
