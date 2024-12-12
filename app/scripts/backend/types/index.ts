/** @format */

import { AttrValuesParams, AttrValuesResponseDeep, AttrValuesResponseFlat } from "./attr-values"
import { CorpusConfigParams, CorpusConfigResponse } from "./corpus-config"
import { CorpusInfoParams, CorpusInfoResponse } from "./corpus-info"
import { CountParams, CountResponse } from "./count"
import { LemgramCountParams, LemgramCountResponse } from "./lemgram-count"
import { LoglikeParams, LoglikeResponse } from "./loglike"
import { QueryParams, QueryResponse } from "./query"

export * from "./common"

/** Maps a Korp backend endpoint name to the expected parameters and response */
export type API = {
    attr_values: {
        params: AttrValuesParams
        // Depth of data structure depends on amount of attributes in the `attr` param
        response: AttrValuesResponseFlat | AttrValuesResponseDeep
    }
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
    lemgram_count: {
        params: LemgramCountParams
        response: LemgramCountResponse
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
