/** @format */

import { CountParams, CountResponse } from "./count"
import { LoglikeParams, LoglikeResponse } from "./loglike"
import { QueryParams, QueryResponse } from "./query"

export * from "./common"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
    count: {
        params: CountParams
        response: CountResponse
    }
    loglike: {
        params: LoglikeParams
        response: LoglikeResponse
    }
    query: {
        params: QueryParams
        response: QueryResponse
    }
}
