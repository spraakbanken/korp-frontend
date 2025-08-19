/** @format */
import settings from "@/settings"
import ProxyBase from "./proxy-base"
import { Factory } from "@/util"
import { QueryParams, QueryResponse } from "../types/query"
import { expandCqp } from "@/cqp_parser/cqp"

export class KwicProxy extends ProxyBase<"query"> {
    protected readonly endpoint = "query"
    /** Cache token for quicker paging requests. Must be unset if the query is changed. */
    queryData?: string

    constructor() {
        super()
        this.queryData = undefined
    }

    protected buildParams(options: QueryParams): QueryParams {
        const params: QueryParams = {
            default_context: settings.default_overview_context,
            ...options,
            ...settings.corpusListing.buildShowParams(),
        }

        if (params.cqp) {
            params.cqp = expandCqp(params.cqp)
        }

        return params
    }

    async makeRequest(options: QueryParams): Promise<QueryResponse> {
        const params = this.buildParams(options)
        const data = await this.send(params)
        this.queryData = data.query_data
        return data
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory
