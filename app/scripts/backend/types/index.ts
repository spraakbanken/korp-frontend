/** @format */

import { AttrValuesParams, AttrValuesResponseDeep, AttrValuesResponseFlat } from "./attr-values"
import { CorpusConfigParams, CorpusConfigResponse } from "./corpus-config"
import { CorpusInfoParams, CorpusInfoResponse } from "./corpus-info"
import { CountParams, CountResponse } from "./count"
import { CountTimeParams, CountTimeResponse } from "./count-time"
import { LemgramCountParams, LemgramCountResponse } from "./lemgram-count"
import { LoglikeParams, LoglikeResponse } from "./loglike"
import { QueryParams, QueryResponse } from "./query"
import { RelationsParams, RelationsResponse } from "./relations"
import { TimespanParams, TimespanResponse } from "./timespan"

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
    count_time: {
        params: CountTimeParams
        response: CountTimeResponse
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
    relations: {
        params: RelationsParams
        response: RelationsResponse
    }
    relations_sentences: {
        // TODO Create correct types for `RelationSentences*`
        params: QueryParams
        response: QueryResponse
    }
    timespan: {
        params: TimespanParams
        response: TimespanResponse
    }
}
