/** @format */
import settings from "@/settings"
import ProxyBase from "./proxy-base"
import { Factory } from "@/util"
import { QueryParams, QueryResponse } from "../types/query"
import { expandCqp } from "@/cqp_parser/cqp"

export class KwicProxy extends ProxyBase<"query"> {
    protected readonly endpoint = "query"
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

    makeRequest(options: QueryParams): Promise<QueryResponse> {
        const params = this.buildParams(options)
        return this.send(params)
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory
