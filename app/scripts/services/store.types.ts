import { QueryParamSort } from "@/backend/types/query"
import { CqpQuery } from "@/cqp_parser/cqp.types"

/**
 * The store service provides state management. It uses the Root Scope to store and watch properties.
 * It is wrapped in a Proxy to allow direct access to properties as well as the service methods.
 */
export type StoreService = StoreBase & Store

/** Store methods. */
export type StoreBase = {
    get: <K extends keyof Store>(key: K) => Store[K]
    set: <K extends keyof Store>(key: K, value: Store[K]) => void
    watch: <K extends keyof Store>(
        subject: K,
        listener: (newValue: Store[K], oldValue: Store[K]) => void,
        deep?: boolean,
    ) => void
    watchGroup: (subjects: (keyof Store)[], listener: () => void) => void
}

/** Stored state. */
export type Store = {
    /** Last executed search query. */
    activeSearch?: {
        type?: "word" | "lemgram"
        cqp: string
    }
    /** Selected corpus ids in lowercase */
    corpus: string[]
    /** CQP query for Extended search, possibly with frontend-specific operators */
    cqp: string
    /** CQP query for each selected language in parallel mode; mapped to URL params `cqp_<lang>` */
    cqpParallel: Record<string, string>
    /** What modal to show */
    display?: "about"
    /** The current Extended search query as CQP */
    extendedCqp?: string
    /** CQP fragment built from selected filter values. */
    globalFilter?: CqpQuery
    /** A simple attribute–values structure of selected filters. */
    global_filter: Record<string, string[]>
    /** Hits per page */
    hpp: number
    /** In simple search, match case-insensitive */
    isCaseInsensitive: boolean
    /** Whether tokens in current query should match in order; default is true */
    in_order: boolean
    /** UI language */
    lang: string
    /** In simple search, match anywhere in a word */
    mid_comp: boolean
    /** Page number of KWIC result */
    page?: number
    /** In parallel mode, what languages to build a query for */
    parallel_corpora: string[]
    /** In simple search, match beginning of word */
    prefix: boolean
    /** Randomized number used when sorting hits by random. Stored for reproducible urls. */
    random_seed?: number
    /** Whether to KWIC with more context */
    reading_mode: boolean
    /**
     * Search query for Simple or Advanced search: `<mode>|<query>`
     * where `mode` can be:
     *   - "word", for simple word search
     *   - "lemgram", when using autocomplete in Simple
     *   - "cqp", for advanced mode (`query` is a CQP expression)
     */
    search?: `${string}|${string}` | "cqp"
    /** The current Simple search query as CQP */
    simpleCqp?: string
    /** Search result order */
    sort: QueryParamSort
    /** Attributes on which to aggregate counts in statistics query */
    stats_reduce: string
    /** Attributes on which to aggregate counts, case-insensitively, in statistics query */
    stats_reduce_insensitive: string
    /** Whether frequency numbers should be shown as absolute or relative (per million tokens) */
    statsRelative: boolean
    /** In simple search, match end of word */
    suffix: boolean
    /** Chunk size to evaluate search query within, e.g. "sentence" or "paragraph" */
    within?: string
}
