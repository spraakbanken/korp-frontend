/** @format */

import { ILocationService } from "angular"

/** Extends the Angular Location service to assign types for supported URL hash params. */
export type LocationService = Omit<ILocationService, "search"> & {
    search(): HashParams
    search(search: HashParams): LocationService
    search<K extends keyof HashParams>(search: K, paramValue: HashParams[K] | any): LocationService
}

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
    /** Conditions entered for search filters, as Base64-encoded JSON */
    global_filter?: string
    /** Opposite of `show_stats`, used if the `statistics_search_default` setting is enabled */
    hide_stats?: boolean
    /** Hits per page */
    hpp?: number
    /** Whether tokens in current query should match in order; default is true */
    in_order?: "false"
    /** UI language as three-letter code */
    lang?: string
    /** Current page number of the search result */
    page?: string
    parallel_corpora?: string
    random_seed?: `${number}`
    /** Whether the reading mode is enabled */
    reading_mode?: boolean
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
    /** Whether a statistics query should be made when searching */
    show_stats?: boolean
    /** Search result order */
    sort?: "" | "keyword" | "left" | "right" | "random"
    /** Attributes on which to aggregate counts in statistics query */
    stats_reduce?: string
    /** Attributes on which to aggregate counts, case-insensitively, in statistics query */
    stats_reduce_insensitive?: string
    /** Chunk size to evaluate search query within, e.g. "sentence" or "paragraph" */
    within?: string
    /** Whether a word picture query should be made when searching */
    word_pic?: boolean
}
