/** @format */
import * as authenticationProxy from "@/components/auth/auth"
import { expandOperators } from "@/cqp_parser/cqp"
import settings from "@/settings"
import _ from "lodash"
import { API, ProgressReport, ProgressResponse, ResponseBase } from "@/backend/types"

/** The Proxy classes wrap API requests with pre-/postprocessing and progress reporting. */
export default abstract class BaseProxy<K extends keyof API> {
    pendingRequests: JQuery.jqXHR[]

    constructor() {
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
    }

    abort(): void {
        this.pendingRequests.forEach((req) => req.abort())
        this.cleanup()
    }

    cleanup(): void {}

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

    calcProgress(e: ProgressEvent): ProgressReport<K> {
        const xhr = e.target as XMLHttpRequest
        type PartialResponse = ResponseBase & ProgressResponse & Partial<API[K]["response"]>
        let struct: PartialResponse = {}

        try {
            // try to parse the partial response
            struct = this.parseJSON(xhr.responseText)
        } catch (error) {
            struct = {}
        }

        /** Look up sizes of corpora and sum them */
        const getCorpusSize = (corpora: string[]) =>
            corpora.map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size)).reduce((a, b) => a + b, 0)

        /** Number of hits */
        let totalResults = 0
        /** Number of tokens processed */
        let progress = 0

        Object.keys(struct).forEach((key: string & keyof PartialResponse) => {
            if (key !== "progress_corpora" && key.split("_")[0] === "progress") {
                const val = struct[key] as ProgressResponse[`progress_${number}`]
                const corpus = typeof val == "string" ? val : val["corpus"]
                progress += getCorpusSize(corpus.split("|"))
                if (typeof val != "string" && "hits" in val) {
                    totalResults += Number(val.hits)
                }
            }
        })

        /** Number of tokens in the corpora in the current result page */
        let total = 0
        if (struct.progress_corpora?.length) {
            const corpora = struct.progress_corpora.flatMap((corpus) => corpus.split("|"))
            total = getCorpusSize(corpora)
        }

        const stats = total ? (progress / total) * 100 : 0

        return {
            struct,
            stats,
            totalResults,
        }
    }
}
