/** @format */
import * as authenticationProxy from "@/components/auth/auth"
import { expandOperators } from "@/cqp_parser/cqp"
import _ from "lodash"
import { API } from "@/backend/types"
import { calcProgress } from "./common"

/** The Proxy classes wrap API requests with pre-/postprocessing and progress reporting. */
export default abstract class BaseProxy<K extends keyof API> {
    abortController: AbortController
    pendingRequests: JQuery.jqXHR[] = []

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
        this.abortController = new AbortController()
    }

    /** Abort any running request */
    abort(): void {
        this.abortController?.abort()
        this.pendingRequests.forEach((req) => req.abort())
    }

    hasPending(): boolean {
        return _.some(_.map(this.pendingRequests, (req) => req.readyState !== 4 && req.readyState !== 0))
    }

    addAuthorizationHeader(req: JQuery.jqXHR): void {
        const header: Record<string, string> = authenticationProxy.getAuthorizationHeader()
        _.toPairs(header).forEach(([name, value]) => req.setRequestHeader(name, value))
    }

    calcProgress = (e: ProgressEvent) => calcProgress<K>((e.target as XMLHttpRequest).responseText)
}
