/** @format */
import * as authenticationProxy from "@/components/auth/auth"
import { expandOperators } from "@/cqp_parser/cqp"
import settings from "@/settings"
import _ from "lodash"
import { ProgressReport, ProgressResponse, ResponseBase } from "@/backend/types"

/** The Proxy classes wrap API requests with pre-/postprocessing and progress reporting. */
export default abstract class BaseProxy<R extends {} = {}> {
    prev: string
    chunkCache: string
    progress: number
    total: number | null
    total_results: number | null
    pendingRequests: JQuery.jqXHR[]

    constructor() {
        this.prev = ""
        this.chunkCache = ""
        this.progress = 0
        this.total = null
        this.total_results = null
        this.pendingRequests = []
    }

    expandCQP(cqp: string): string {
        try {
            return expandOperators(cqp)
        } catch (e) {
            console.warn("CQP expansion failed", cqp, e)
            return cqp
        }
    }

    resetRequest(): void {
        this.abort()
        this.prev = ""
        this.chunkCache = ""
        this.progress = 0
        this.total_results = null
        this.total = null
    }

    /**
     * Return a URL with baseUrl base and data encoded as URL parameters.
     * If baseUrl already contains URL parameters, return it as is.
     *
     * Note that this function is now largely redundant: when called
     * for GET URLs already containing URL parameters, it does
     * nothing, whereas the GET URL returned by it for a POST URL
     * typically results in an "URI too long" error, if
     * settings.backendURLMaxLength is configured appropriately for
     * the Web server on which the backend runs.
     */
    makeUrlWithParams(baseUrl: string, data: Record<string, any>): string {
        if (baseUrl.indexOf("?") != -1) {
            return baseUrl
        }
        return (
            baseUrl +
            "?" +
            _.toPairs(data)
                .map(function ([key, val]) {
                    val = encodeURIComponent(val)
                    return key + "=" + val
                })
                .join("&")
        )
    }

    abort(): void {
        this.pendingRequests.forEach((req) => req.abort())
        this.cleanup()
    }

    cleanup(): void {
        this.prev = ""
    }

    hasPending(): boolean {
        return _.some(_.map(this.pendingRequests, (req) => req.readyState !== 4 && req.readyState !== 0))
    }

    /** Try to parse partial JSON data (of an in-progress HTTP response). */
    parseJSON<T = any>(data: string): T {
        try {
            let json = data
            if (json[0] !== "{") {
                json = `{${json}`
            }
            // If it ends with comma + space, replace that with a closing curly.
            if (json.match(/,\s*$/)) {
                json = json.replace(/,\s*$/, "") + "}"
            }
            return JSON.parse(json)
        } catch (e) {
            return JSON.parse(data)
        }
    }

    addAuthorizationHeader(req: JQuery.jqXHR): void {
        const header: Record<string, string> = authenticationProxy.getAuthorizationHeader()
        _.toPairs(header).forEach(([name, value]) => req.setRequestHeader(name, value))
    }

    calcProgress(e: any): ProgressReport<R> {
        const newText = e.target.responseText.slice(this.prev.length)
        let struct: ResponseBase & ProgressResponse & Partial<R> = {}

        try {
            // try to parse a chunk from the progress object
            // combined with previous chunks that were not parseable
            struct = this.parseJSON(this.chunkCache + newText)
            // if parse succceeds, we don't care about the content of previous progress events anymore
            this.chunkCache = ""
        } catch (error) {
            // if we fail to parse a chunk, combine it with previous failed chunks
            this.chunkCache += newText
        }

        Object.keys(struct).forEach((key) => {
            if (key !== "progress_corpora" && key.split("_")[0] === "progress") {
                const val = struct[key]
                const currentCorpus = val["corpus"] || val
                const sum = _(currentCorpus.split("|"))
                    .map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size))
                    .reduce((a, b) => a + b, 0)
                this.progress += sum
                this.total_results += val["hits"] !== null ? parseInt(val["hits"]) : null
            }
        })

        if (this.total == null && struct.progress_corpora && struct.progress_corpora.length) {
            const tmp = $.map(struct["progress_corpora"], function (corpus) {
                if (!corpus.length) {
                    return
                }

                return _(corpus.split("|"))
                    .map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size))
                    .reduce((a, b) => a + b, 0)
            })
            this.total = _.reduce(tmp, (val1, val2) => val1 + val2, 0)
        }

        const stats = (this.progress / this.total) * 100

        this.prev = e.target.responseText
        return {
            struct,
            stats,
            total_results: this.total_results,
        }
    }
}
