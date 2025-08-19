/** @format */
import settings, { getDefaultWithin } from "@/settings"
import { pageToRange } from "../common"
import { QueryParams, QueryResponse } from "../types/query"
import kwicProxyFactory from "../proxy/kwic-proxy"
import { CorpusListing } from "@/corpus_listing"

export class ExampleTask {
    readonly corpusListing: CorpusListing
    readonly proxy = kwicProxyFactory.create()
    constructor(readonly queryParams: QueryParams, public isReading?: boolean) {
        const corpusIds = queryParams.corpus!.split(",")
        this.corpusListing = settings.corpusListing.subsetFactory(corpusIds)
    }

    abort(): void {
        this.proxy.abort()
    }

    protected getParams(page: number, hpp: number): QueryParams {
        const { start, end } = pageToRange(page || 0, hpp)

        const contextParams = this.corpusListing.getContextParams(!!this.isReading)

        const opts = {
            ...this.queryParams,
            ...contextParams,
            start,
            end,
            // example tab cannot handle incremental
            incremental: false,
        }

        opts.default_within ??= getDefaultWithin()
        opts.within = this.corpusListing.getWithinParam(opts.default_within)

        return opts
    }

    send(page: number, hpp: number): Promise<QueryResponse> {
        const opts = this.getParams(page, hpp)
        return this.proxy.makeRequest(opts)
    }
}
