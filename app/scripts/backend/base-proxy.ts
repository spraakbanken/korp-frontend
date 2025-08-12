/** @format */

/** The Proxy classes wrap API requests with pre-/postprocessing and progress reporting. */
export default abstract class BaseProxy {
    abortController: AbortController

    resetRequest(): void {
        this.abort()
        this.abortController = new AbortController()
    }

    /** Abort any running request */
    abort(): void {
        this.abortController?.abort()
    }
}
