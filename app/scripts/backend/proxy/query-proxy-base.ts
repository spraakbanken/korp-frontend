import { getDefaultWithin } from "@/settings"
import { corpusListing } from "@/corpora/corpus_listing"
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
        const cl = corpusListing.subsetFactory(corpusIds)
        const defaultWithin = options.defaultWithin || getDefaultWithin()

        return {
            corpus: cl.stringifySelected(),
            cqp: expandCqp(cqp),
            default_within: defaultWithin,
            within: cl.getWithinParam(defaultWithin),
            ...cl.getContextParams(!!options.isReading),
            ...cl.buildShowParams(),
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
