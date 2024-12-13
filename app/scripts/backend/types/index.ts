/** @format */

import { CorpusConfigParams, CorpusConfigResponse } from "./corpus-config"
import { CorpusInfoParams, CorpusInfoResponse } from "./corpus-info"
import { CountParams, CountResponse } from "./count"
import { LoglikeParams, LoglikeResponse } from "./loglike"
import { QueryParams, QueryResponse } from "./query"

export * from "./common"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
    corpus_config: {
        params: CorpusConfigParams
        response: CorpusConfigResponse
    }
    corpus_info: {
        params: CorpusInfoParams
        response: CorpusInfoResponse
    }
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
