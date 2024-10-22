/** @format */

import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethodFetch } from "@/util"
import { ApiKwic, KorpResponse, StatsColumn } from "@/backend/types"
import settings from "@/settings"

async function korpRequest<T extends Record<string, any> = {}, P extends Record<string, any> = {}>(
    endpoint: string,
    params: P
): Promise<KorpResponse<T>> {
    const { url, request } = httpConfAddMethodFetch(settings.korp_backend_url + "/" + endpoint, params)
    request.headers = { ...request.headers, ...getAuthorizationHeader() }
    const response = await fetch(url, request)
    return (await response.json()) as KorpResponse<T>
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1loglike/get */
export type LoglikeResponse = {
    /** Log-likelihood average. */
    average: number
    /** Log-likelihood values. */
    loglike: Record<string, number>
    /** Absolute frequency for the values in set 1. */
    set1: Record<string, number>
    /** Absolute frequency for the values in set 2. */
    set2: Record<string, number>
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1loglike/get */
export type LoglikeParams = {
    group_by: string
    set1_corpus: string
    set1_cqp: string
    set2_corpus: string
    set2_cqp: string
    max: `${number}`
    split: string
    top: string
}

export const loglike = (params: LoglikeParams) => korpRequest<LoglikeResponse>("loglike", params)

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count/get */
export type CountParams = {
    /** Corpus names, separated by comma */
    corpus: string
    /** CQP query */
    cqp: string
    /** Positional attribute by which the hits should be grouped. Defaults to "word" if neither `group_by` nor `group_by_struct` is defined */
    group_by?: string
    /** Structural attribute by which the hits should be grouped. The value for the first token of the hit will be used */
    group_by_struct?: string
    /** Prevent search from crossing boundaries of the given structural attribute, e.g. 'sentence'. */
    default_within?: string
    /** Like default_within, but for specific corpora, overriding the default. Specified using the format 'corpus:attribute' */
    within?: string
    ignore_case?: string
    relative_to_struct?: string
    split?: string
    top?: string
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    [subcqpn: `subcqp${number}`]: string
    start?: number
    end?: number
    /** Incrementally return progress updates when the calculation for each corpus is finished */
    incremental?: boolean
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count/get */
export type CountResponse = {
    corpora: {
        [name: string]: StatsColumn | StatsColumn[]
    }
    combined: StatsColumn | StatsColumn[]
    /** Total number of different values */
    count: number
    /** Execution time in seconds */
    time: number
}

export const count = (params: CountParams) => korpRequest<CountResponse>("count", params)

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

export const query = (params: QueryParams) => korpRequest<QueryResponse>("query", params)
