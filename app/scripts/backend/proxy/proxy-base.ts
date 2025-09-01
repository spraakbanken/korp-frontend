/** @format */
import { korpRequest } from "../common"
import { API, ProgressHandler } from "../types"

/** Handles the request and processes input and outputs for a given Korp backend API endpoint. */
export default abstract class ProxyBase<K extends keyof API = keyof API> {
    private abortController = new AbortController()
    protected abstract readonly endpoint: K
    private onProgress?: ProgressHandler<K>
    private params?: API[K]["params"]
    private response?: API[K]["response"]

    /** Abort any running request */
    abort(): void {
        this.abortController?.abort()
        this.abortController = new AbortController()
    }

    protected getAbortSignal(): AbortSignal {
        return this.abortController.signal
    }

    getParams(): API[K]["params"] {
        if (!this.params) throw new Error("No params set")
        return this.params
    }

    getResponse(): API[K]["response"] {
        if (!this.response) throw new Error("No response data available")
        return this.response
    }

    abstract makeRequest(...args: any[]): Promise<any>

    protected async send(params: API[K]["params"]): Promise<API[K]["response"]> {
        this.params = params
        this.response = await korpRequest(this.endpoint, params, {
            abortSignal: this.getAbortSignal(),
            onProgress: this.onProgress,
        })
        return this.response
    }

    setProgressHandler(onProgress: ProgressHandler<K>): this {
        this.onProgress = onProgress
        return this
    }
}
