/** @format */
import settings from "@/settings"
import { pageToRange } from "./common"
import { QueryParams, QueryResponse } from "./types/query"
import kwicProxyFactory from "./kwic-proxy"

export class ExampleTask {
    readonly proxy = kwicProxyFactory.create()
    constructor(readonly queryParams: QueryParams, public isReading?: boolean) {}

    abort(): void {
        this.proxy.abort()
    }

    protected getParams(page: number, hpp: number, inOrder?: boolean, within?: string): QueryParams {
        const corpusIds = this.queryParams.corpus?.split(",")
        const contextParams = settings.corpusListing.getContextParam(this.isReading, corpusIds)
        const { start, end } = pageToRange(page || 0, hpp)
        const opts = {
            ...this.queryParams,
            ...contextParams,
            in_order: inOrder,
            start,
            end,
            // example tab cannot handle incremental
            incremental: false,
        }

        opts.default_within ??= within
        opts.within = settings.corpusListing.getWithinParam(opts.default_within)

        return opts
    }

    send(page: number, hpp: number, inOrder?: boolean, within?: string): Promise<QueryResponse> {
        const opts = this.getParams(page, hpp, inOrder, within)
        return this.proxy.makeRequest(opts)
    }
}
