import { QueryParams, QueryResponse } from "../types/query"
import { QueryProxyBase } from "./query-proxy-base"

export class ExampleProxy extends QueryProxyBase {
    constructor(
        readonly corpusIds: string[],
        readonly cqps: string[],
        readonly defaultWithin?: string,
    ) {
        super()
    }

    protected buildParams(page: number, hpp: number, isPaging = false, isReading = false): QueryParams {
        // Split the cqp list to a primary `cqp` and subsequent `cqp2` etc.
        const cqp = this.cqps[0]
        const cqpN = Object.fromEntries(this.cqps.map((cqp, i) => [`cqp${i + 1}`, cqp]).slice(1))

        const options = {
            defaultWithin: this.defaultWithin,
            isPaging,
            isReading,
            page,
        }
        const params = this.buildParamsBase(this.corpusIds, cqp, hpp, options)

        return {
            ...params,
            ...cqpN,
            expand_prequeries: false,
        }
    }

    makeRequest(page: number, hpp: number, isPaging = false, isReading = false): Promise<QueryResponse> {
        const params = this.buildParams(page, hpp, isPaging, isReading)
        return this.send(params)
    }
}
