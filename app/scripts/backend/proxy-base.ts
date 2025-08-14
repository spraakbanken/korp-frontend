/** @format */
import { korpRequest } from "./common"
import { API, ProgressHandler } from "./types"

/** Handles the request and processes input and outputs for a given Korp backend API endpoint. */
export default abstract class ProxyBase<K extends keyof API, I extends any[], O> {
    private abortController = new AbortController()
    protected abstract readonly endpoint: K
    onProgress?: ProgressHandler<K>
    private response?: API[K]["response"]

    /** Abort any running request */
    abort(): void {
        this.abortController?.abort()
        this.abortController = new AbortController()
    }

    protected abstract buildParams(...args: I): API[K]["params"]

    protected getAbortSignal(): AbortSignal {
        return this.abortController.signal
    }

    getResponse(): API[K]["response"] {
        if (!this.response) throw new Error("No response data available")
        return this.response
    }

    async makeRequest(...args: I): Promise<O> {
        const params = this.buildParams(...args)
        this.response = await this.send(params)
        const result = this.processResult(this.response)
        return result
    }

    protected abstract processResult(response: API[K]["response"]): O

    protected send(params: API[K]["params"]): Promise<API[K]["response"]> {
        return korpRequest(this.endpoint, params, {
            abortSignal: this.getAbortSignal(),
            onProgress: this.onProgress,
        })
    }

    setProgressHandler(onProgress: ProgressHandler<K>): this {
        this.onProgress = onProgress
        return this
    }
}
