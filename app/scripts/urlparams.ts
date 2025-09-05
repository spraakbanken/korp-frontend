/** @format */
import { QueryParamSort } from "@/backend/types/query"

/** Supported parameters for the `?<key>=<value>` part of the URL. */
export type UrlParams = {
    /** Current Korp mode (= a set of corpora and app configuration) */
    mode: string
}

/** Supported parameters for the `#?<key>=<value>` part of the URL. */
export type HashParams = {
    /** Selected corpus ids, comma-separated */
    corpus?: string
    /** CQP query for Extended search, possibly with frontend-specific operators */
    cqp?: string
    /** CQP query for Extended search in parallel mode */
    [cqpN: `cqp_${string}`]: string
    /** Modal to show */
    display?: "about"
    /** Conditions entered for search filters, as Base64-encoded JSON */
    global_filter?: string
    /** Hits per page */
    hpp?: number
    /** Whether tokens in current query should match in order; default is true */
    in_order?: "false"
    /** In simple search, match case-insensitive */
    isCaseInsensitive?: true
    /** UI language as three-letter code */
    lang?: string
    /** In simple search, match anywhere in a word */
    mid_comp?: true
    /** Current page number of the search result */
    page?: string
    parallel_corpora?: string
    /** In simple search, match beginning of word */
    prefix?: true
    random_seed?: `${number}`
    /** Whether to KWIC with more context */
    reading_mode?: boolean
    /** What result tab is active */
    result_tab?: number
    /**
     * Search query for Simple or Advanced search: `<mode>|<query>`
     * where `mode` can be:
     *   - "word", for simple word search
     *   - "lemgram", when using autocomplete in Simple
     *   - "cqp", for advanced mode (`query` is a CQP expression)
     */
    search?: `${string}|${string}` | "cqp"
    /** Current search mode */
    search_tab?: number
    /** Search result order */
    sort?: QueryParamSort
    /** Attributes on which to aggregate counts in statistics query */
    stats_reduce?: string
    /** Attributes on which to aggregate counts, case-insensitively, in statistics query */
    stats_reduce_insensitive?: string
    /** In simple search, match end of word */
    suffix?: true
    /** Chunk size to evaluate search query within, e.g. "sentence" or "paragraph" */
    within?: string
}

export type SearchParams = Pick<HashParams, SearchParamNames>

export type SearchParamNames = Extract<
    keyof HashParams,
    | "corpus"
    | "cqp"
    | "global_filter"
    | "in_order"
    | "parallel_corpora"
    | "search"
    | "search_tab"
    | "within"
    | "prefix"
    | "mid_comp"
    | "suffix"
    | "isCaseInsensitive"
>

/** Parameters that define a search result set */
export const getSearchParamNames = (): SearchParamNames[] => [
    "corpus",
    "cqp",
    "global_filter",
    "in_order",
    "parallel_corpora",
    "search",
    "search_tab",
    "within",
    "prefix",
    "mid_comp",
    "suffix",
    "isCaseInsensitive",
]

/** Get a parameter from the `?<key>=<value>` part of the URL. */
export const getUrlParam = <K extends keyof UrlParams>(key: K) =>
    new URLSearchParams(window.location.search).get(key) as UrlParams[K]

/**
 * Get a parameter from the `#?<key>=<value>` part of the URL.
 * It is preferred to use the Angular `$location` service to read and modify this.
 * Use this only when outside Angular context.
 */
export const getUrlHash = <K extends keyof HashParams>(key: K) =>
    new URLSearchParams(window.location.hash.slice(2)).get(key) as HashParams[K]
