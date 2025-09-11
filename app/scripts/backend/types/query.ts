import { ApiKwic } from "./common"

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Concordance/paths/~1query/get */
export type QueryParams = {
    corpus: string
    cqp: string
    start?: number
    end?: number
    default_context?: string
    context?: string
    show?: string
    show_struct?: string
    default_within?: string
    within?: string
    in_order?: boolean
    sort?: QueryParamSort
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

export type QueryParamSort = "" | "keyword" | "left" | "right" | "random"
