/** @format */

import { CountParams, CountResponse } from "./count"
import { QueryParams, QueryResponse } from "./query"
export * from "./common"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
    count: {
        params: CountParams
        response: CountResponse
    }
    query: {
        params: QueryParams
        response: QueryResponse
    }
}
