/** @format */
import { expandOperators } from "@/cqp_parser/cqp"

/** The Proxy classes wrap API requests with pre-/postprocessing and progress reporting. */
export default abstract class BaseProxy {
    abortController: AbortController

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
    }
}
