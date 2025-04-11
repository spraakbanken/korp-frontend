/** @format */
import { ApiKwic } from "./common"

/**
 * The `query` and `relations_sentences` endpoints are combined here.
 * @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get
 * @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture/paths/~1relations_sentences/get
 */
export type QueryParams = {
    /* Required for `query` */
    corpus?: string
    /* Required for `query` */
    cqp?: string
    start?: number
    end?: number
    default_context?: string
    context?: string
    show?: string
    show_struct?: string
    /** Required for `relations_sentences` */
    source?: string
    default_within?: string
    within?: string
    in_order?: boolean
    sort?: string
    random_seed?: number
    cut?: number
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    incremental?: boolean
    query_data?: string
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get */
export type QueryResponse = {
    /** Search hits */
    kwic: ApiKwic[]
    /** Total number of hits */
    hits: number
    /** Number of hits for each corpus */
    corpus_hits: Record<string, number>
    /** Order of corpora in result */
    corpus_order: string[]
    /** Execution time in seconds */
    time: number
    /** A hash of this query */
    query_data: string
}
