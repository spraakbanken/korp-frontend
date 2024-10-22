/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { AjaxSettings, KorpResponse, ProgressReport } from "@/backend/types"
import { locationSearchGet, httpConfAddMethod, Factory } from "@/util"
import { QueryParams, QueryResponse } from "./client"

export class KwicProxy extends BaseProxy<QueryResponse> {
    foundKwic: boolean
    prevCQP?: string
    prevParams: QueryParams | null
    prevRequest: JQuery.AjaxSettings | null
    prevUrl?: string
    queryData?: string

    constructor() {
        super()
        this.prevRequest = null
        this.queryData = undefined
        this.prevParams = null
        this.foundKwic = false
    }

    makeRequest(
        options: KorpQueryRequestOptions,
        page: number | undefined,
        progressCallback: (data: ProgressReport<QueryResponse>) => void,
        kwicCallback: (data: KorpResponse<QueryResponse>) => void
    ): JQuery.jqXHR<KorpResponse<QueryResponse>> {
        const self = this
        this.foundKwic = false
        this.resetRequest()
        if (!kwicCallback) {
            throw new Error("No callback for query result")
        }
        self.progress = 0

        if (!options.ajaxParams.within) {
            _.extend(options.ajaxParams, settings.corpusListing.getWithinParameters())
        }

        function getPageInterval(): Interval {
            const hpp = locationSearchGet("hpp")
            const itemsPerPage = Number(hpp) || settings.hits_per_page_default
            const start = (page || 0) * itemsPerPage
            const end = start + itemsPerPage - 1
            return { start, end }
        }

        const command = options.ajaxParams.command || "query"

        const data: QueryParams = {
            default_context: settings.default_overview_context,
            ...getPageInterval(),
            ...options.ajaxParams,
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

        if (data.cqp) {
            data.cqp = this.expandCQP(data.cqp)
        }
        this.prevCQP = data.cqp

        data.show = _.uniq(["sentence"].concat(show)).join(",")
        data.show_struct = _.uniq(show_struct).join(",")

        if (locationSearchGet("in_order") != null) {
            data.in_order = false
        }

        this.prevRequest = data
        this.prevParams = data
        const ajaxSettings: AjaxSettings = {
            url: settings.korp_backend_url + "/" + command,
            data: data,
            beforeSend(req, settings) {
                self.prevRequest = settings
                self.addAuthorizationHeader(req)
                self.prevUrl = self.makeUrlWithParams(this.url, data)
            },

            success(data: QueryResponse, status, jqxhr) {
                self.queryData = data.query_data
                self.cleanup()
                // TODO Should be `options.ajaxParams.incremental`?
                if (data["incremental"] === false || !this.foundKwic) {
                    return kwicCallback(data)
                }
            },

            progress(data, e) {
                const progressObj = self.calcProgress(e)
                if (progressObj == null) return

                progressCallback(progressObj)
                if ("kwic" in progressObj.struct) {
                    this.foundKwic = true
                    return kwicCallback(progressObj.struct as QueryResponse)
                }
            },
        }

        const def = $.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<KorpResponse<QueryResponse>>
        this.pendingRequests.push(def)
        return def
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory

export type KorpQueryRequestOptions = {
    // TODO Should start,end really exist here as well as under ajaxParams?
    start?: number
    end?: number
    ajaxParams: QueryParams & {
        command?: string
    }
}

type Interval = { start: number; end: number }
