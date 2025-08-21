/** @format */
import settings, { getDefaultWithin } from "@/settings"
import { QueryParams, QueryResponse } from "../types/query"
import ProxyBase from "./proxy-base"
import { expandCqp } from "@/cqp_parser/cqp"
import { pageToRange } from "../common"

export type QueryParamOptions = {
    isPaging?: boolean
    page?: number
    isReading?: boolean
    defaultWithin?: string
}

export abstract class QueryProxyBase extends ProxyBase<"query"> {
    protected readonly endpoint = "query"
    /** Cache token for quicker paging requests. */
    protected queryData?: string

    protected buildParamsBase(corpusIds: string[], cqp: string, hpp: number, options: QueryParamOptions): QueryParams {
        if (!options.isPaging) this.queryData = undefined
        const corpusListing = settings.corpusListing.subsetFactory(corpusIds)
        const defaultWithin = options.defaultWithin || getDefaultWithin()

        return {
            corpus: corpusListing.stringifySelected(),
            cqp: expandCqp(cqp),
            default_within: defaultWithin,
            within: corpusListing.getWithinParam(defaultWithin),
            ...corpusListing.getContextParams(!!options.isReading),
            ...corpusListing.buildShowParams(),
            query_data: this.queryData,
            ...pageToRange(options.page || 0, hpp),
        }
    }

    protected async send(params: QueryParams): Promise<QueryResponse> {
        const data = await super.send(params)
        this.queryData = data.query_data
        return data
    }
}
