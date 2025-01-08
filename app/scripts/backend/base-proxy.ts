/** @format */
import * as authenticationProxy from "@/components/auth/auth"
import { expandOperators } from "@/cqp_parser/cqp"
import _ from "lodash"
import { API } from "@/backend/types"
import { calcProgress } from "./common"

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
    }

    hasPending(): boolean {
        return _.some(_.map(this.pendingRequests, (req) => req.readyState !== 4 && req.readyState !== 0))
    }

    addAuthorizationHeader(req: JQuery.jqXHR): void {
        const header: Record<string, string> = authenticationProxy.getAuthorizationHeader()
        _.toPairs(header).forEach(([name, value]) => req.setRequestHeader(name, value))
    }

    calcProgress = (e: ProgressEvent) => calcProgress<K>(e)
}
