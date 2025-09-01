/** @format */
import { corpusListing } from "@/corpora/corpus_listing"
import { Factory } from "@/util"
import { QueryParams, QueryResponse } from "../types/query"
import { StoreService } from "@/services/store"
import { QueryProxyBase } from "./query-proxy-base"

export class KwicProxy extends QueryProxyBase {
    constructor(protected readonly store: StoreService) {
        super()
    }

    protected buildParams(cqp: string, isPaging = false): QueryParams {
        const corpusIds = corpusListing.getSelectedCorpora()
        const options = {
            isPaging,
            isReading: this.store.reading_mode,
            defaultWithin: this.store.within,
            page: this.store.page,
        }
        const params = this.buildParamsBase(corpusIds, cqp, this.store.hpp, options)

        return {
            ...params,
            incremental: true,
            in_order: this.store.in_order ? undefined : false,
            random_seed: this.store.random_seed,
            sort: this.store.sort || undefined,
        }
    }

    makeRequest(cqp: string, isPaging = false): Promise<QueryResponse> {
        const params = this.buildParams(cqp, isPaging)
        return this.send(params)
    }
}

const kwicProxyFactory = new Factory(KwicProxy)
export default kwicProxyFactory
