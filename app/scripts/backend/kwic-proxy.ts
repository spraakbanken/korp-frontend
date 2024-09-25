/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { AjaxSettings, KorpResponse, ProgressReport, ProgressResponse } from "@/backend/types"
import { locationSearchGet, httpConfAddMethod, Factory } from "@/util"

export class KwicProxy extends BaseProxy<KorpQueryResponse> {
    foundKwic: boolean
    prevCQP?: string
    prevParams: KorpQueryParams | null
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
        progressCallback: (data: ProgressReport<KorpQueryResponse>) => void,
        kwicCallback: (data: KorpResponse<KorpQueryResponse>) => void
    ): JQuery.jqXHR<KorpResponse<KorpQueryResponse>> {
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

        const data: KorpQueryParams = {
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

            success(data: KorpQueryResponse, status, jqxhr) {
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
                    return kwicCallback(progressObj.struct as KorpQueryResponse)
                }
            },
        }

        const def = $.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<KorpResponse<KorpQueryResponse>>
        this.pendingRequests.push(def)
        return def
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get */
export type KorpQueryParams = {
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
    query_data?: string
}

export type KorpQueryRequestOptions = {
    // TODO Should start,end really exist here as well as under ajaxParams?
    start?: number
    end?: number
    ajaxParams: KorpQueryParams & {
        command?: string
    }
}

type Interval = { start: number; end: number }

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get */
export type KorpQueryResponse = {
    /** Search hits */
    kwic: ApiKwic[]
    /** Total number of hits */
    hits: number
    /** Number of hits for each corpus */
    corpus_hits: Record<string, number>
    /** Order of corpora in result */
    corpus_order: string[]
    /** Execution time in seconds */
    time: number
    /** A hash of this query */
    query_data: string
}

/** Search hits */
export type ApiKwic = {
    /** An object for each token in the context, with attribute values for that token */
    tokens: Token[]
    /** Attribute values for the context (e.g. sentence) */
    structs: Record<string, any>
    /** Specifies the position of the match in the context. If `in_order` is false, `match` will consist of a list of match objects, one per highlighted word */
    match: KwicMatch | KwicMatch[]
    /** Hits from aligned corpora if available, otherwise omitted */
    aligned: {
        [linkedCorpusId: `${string}-${string}`]: Record<string, any>[]
    }
}

/** Specifies the position of a match in a context */
type KwicMatch = {
    /** Start position of the match within the context */
    start: number
    /** End position of the match within the context */
    end: number
    /** Global corpus position of the match */
    position: number
}

export type Token = {
    word: string
    [attr: string]: any
}
