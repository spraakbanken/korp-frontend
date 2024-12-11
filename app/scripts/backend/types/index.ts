/** @format */

import { QueryParams, QueryResponse } from "./query"
export * from "./common"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
    query: {
        params: QueryParams
        response: QueryResponse
    }
}
