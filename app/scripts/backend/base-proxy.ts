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

    calcProgress(e: ProgressEvent): ProgressReport<R> {
        const xhr = e.target as XMLHttpRequest
        const newText = xhr.responseText.slice(this.prev.length)
        type PartialResponse = ResponseBase & ProgressResponse & Partial<R>
        let struct: PartialResponse = {}

        try {
            // try to parse a chunk from the progress object
            // combined with previous chunks that were not parseable
            // TODO Just use xhr.responseText, skip chunkCache and prev
            struct = this.parseJSON(this.chunkCache + newText)
            // if parse succceeds, we don't care about the content of previous progress events anymore
            this.chunkCache = ""
        } catch (error) {
            // if we fail to parse a chunk, combine it with previous failed chunks
            this.chunkCache += newText
        }

        Object.keys(struct).forEach((key: string & keyof PartialResponse) => {
            if (key !== "progress_corpora" && key.split("_")[0] === "progress") {
                const val = struct[key] as ProgressResponse["progress_0"]
                const currentCorpus = typeof val == "string" ? val : val["corpus"]
                const sum = currentCorpus
                    .split("|")
                    .map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size))
                    .reduce((a, b) => a + b, 0)
                this.progress += sum
                if (typeof val != "string" && "hits" in val)
                    this.total_results = (this.total_results || 0) + Number(val.hits)
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

        const stats = this.total ? (this.progress / this.total) * 100 : 0

        this.prev = xhr.responseText
        return {
            struct,
            stats,
            total_results: this.total_results,
        }
    }
}
