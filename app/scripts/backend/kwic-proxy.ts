/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import { locationSearchGet, Factory, buildUrl } from "@/util"
import { ProgressReport, Response } from "./types"
import { QueryParams, QueryResponse } from "./types/query"
import { korpEndpointUrl, korpRequest } from "./common"

export class KwicProxy extends BaseProxy<QueryResponse> {
    prevCQP?: string
    prevParams: QueryParams | null
    prevUrl?: string // Used for download
    queryData?: string

    constructor() {
        super()
        this.queryData = undefined
        this.prevParams = null
    }

    async makeRequest(
        options: KorpQueryRequestOptions,
        page: number | undefined,
        progressCallback: (data: ProgressReport<QueryResponse>) => void,
        kwicCallback: (data: Response<QueryResponse>) => void
    ): Promise<QueryResponse> {
        const self = this
        this.resetRequest()
        if (!kwicCallback) {
            throw new Error("No callback for query result")
        }
        self.progress = 0

        if (!options.ajaxParams.within) {
            _.extend(options.ajaxParams, settings.corpusListing.getWithinParameters())
        }

        function getPageInterval(): { start: number; end: number } {
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

        this.prevParams = data
        this.prevUrl = buildUrl(korpEndpointUrl("query"), data)

        const abortController = new AbortController()
        this.abortControllers.push(abortController)
        let foundKwic = false

        const request = korpRequest(command, data, {
            abortSignal: abortController.signal,
            onProgress(e) {
                // Calculate progress, used for progress bars
                const progressObj = self.calcProgress(e.event!)
                progressCallback(progressObj)

                // Show current page of results if they are available
                // The request may continue to count hits in the background
                if ("kwic" in progressObj.struct) {
                    foundKwic = true
                    kwicCallback(progressObj.struct as QueryResponse)
                }
            },
        })

        const result = await request
        self.queryData = result.query_data
        self.cleanup()
        // Run the callback to show results, if not already done by the progress handler
        if (!foundKwic) kwicCallback(result)
        return result
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory

export type KorpQueryRequestOptions = {
    // TODO Should start,end really exist here as well as under ajaxParams?
    start?: number
    end?: number
    ajaxParams: QueryParams & {
        command?: "query" | "relations_sentences"
    }
}
