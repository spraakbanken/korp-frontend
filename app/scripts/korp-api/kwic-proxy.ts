/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy, { type AjaxSettings } from "@/korp-api/base-proxy"
import { angularLocationSearch, httpConfAddMethod } from "@/util"

type Interval = { start: number; end: number }

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get */
type KorpQueryParams = {
    corpus: string
    cqp: string
    start?: number
    end?: number
    default_context?: string
    context?: string
    show?: string
    show_struct?: string
    default_within?: string
    within?: string
    in_order?: boolean
    sort?: string
    random_seed?: number
    cut?: number
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    incremental?: boolean
}

type MakeRequestOptions = {
    ajaxParams?: KorpQueryParams & {
        command?: string
    }
}

export default class KwicProxy extends BaseProxy {
    foundKwic: boolean
    prevCQP?: string
    prevParams: KorpQueryParams | null
    prevRequest: JQuery.AjaxSettings | null
    prevUrl?: string
    queryData?: string

    constructor() {
        super()
        this.prevRequest = null
        this.queryData = null
        this.prevParams = null
        this.foundKwic = false
    }

    makeRequest(options: MakeRequestOptions, page: number, progressCallback, kwicCallback) {
        const self = this
        this.foundKwic = false
        super.makeRequest()
        if (!kwicCallback) {
            console.error("No callback for query result")
            return
        }
        self.progress = 0

        if (!options.ajaxParams.within) {
            _.extend(options.ajaxParams, settings.corpusListing.getWithinParameters())
        }

        function getPageInterval(): Interval {
            const hpp: string | number = angularLocationSearch().hpp
            const itemsPerPage = Number(hpp) || settings["hits_per_page_default"]
            const start = (page || 0) * itemsPerPage
            const end = start + itemsPerPage - 1
            return { start, end }
        }

        const command = options.ajaxParams.command || "query"
        delete options.ajaxParams.command

        const data: KorpQueryParams = {
            default_context: settings["default_overview_context"],
            ...getPageInterval(),
            ...options.ajaxParams,
        }

        const show = []
        const show_struct = []

        for (let corpus of settings.corpusListing.selected) {
            for (let key in corpus.within) {
                // val = corpus.within[key]
                show.push(_.last(key.split(" ")))
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

        if (angularLocationSearch()["in_order"] != null) {
            data.in_order = false
        }

        this.prevRequest = data
        this.prevParams = data
        const ajaxSettings: AjaxSettings = {
            url: settings["korp_backend_url"] + "/" + command,
            data: data,
            beforeSend(req, settings) {
                self.prevRequest = settings
                self.addAuthorizationHeader(req)
                self.prevUrl = self.makeUrlWithParams(this.url, data)
            },

            success(data, status, jqxhr) {
                self.queryData = data.query_data
                self.cleanup()
                if (data.incremental === false || !this.foundKwic) {
                    return kwicCallback(data)
                }
            },

            progress(data, e) {
                const progressObj = self.calcProgress(e)
                if (progressObj == null) return

                progressCallback(progressObj)
                if (progressObj["struct"].kwic) {
                    this.foundKwic = true
                    return kwicCallback(progressObj["struct"])
                }
            },
        }

        const def = $.ajax(httpConfAddMethod(ajaxSettings))
        this.pendingRequests.push(def)
        return def
    }
}
