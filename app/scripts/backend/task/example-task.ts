/** @format */
import { QueryParams, QueryResponse } from "../types/query"
import { ExampleProxy } from "../proxy/example-proxy"

export class ExampleTask {
    readonly proxy: ExampleProxy

    constructor(
        readonly corpusIds: string[],
        readonly cqps: string[],
        defaultWithin?: string,
        readonly isReadingInit = false
    ) {
        this.proxy = new ExampleProxy(corpusIds, cqps, defaultWithin)
    }

    abort(): void {
        this.proxy.abort()
    }

    send(page: number, hpp: number, isPaging: boolean, isReading: boolean): Promise<QueryResponse> {
        return this.proxy.makeRequest(page, hpp, isPaging, isReading)
    }
}
