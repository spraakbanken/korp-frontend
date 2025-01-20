/** @format */
/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1attr_values/get */

export type AttrValuesParams = {
    corpus: string
    attr: string
    count?: boolean
    /** Include per-corpus results. Enabled by default. */
    per_corpus?: boolean
    /** Include combined results. Enabled by default. */
    combined?: boolean
    /** Attributes whose values should be split by "|" */
    split?: string
}

export type AttrValuesResponseDeep = {
    // The presence of `corpora` and `combined` actually depends on the `per_corpus` and `combined` parameters.
    corpora: { [corpus: string]: AttrValues }
    combined: AttrValues
}

export type AttrValuesResponseFlat = {
    /** Lists of values keyed innermost by attribute names and outermost by corpus ids */
    corpora: Record<string, Record<string, string[]>>
    /** Lists of values across all given corpora, keyed by attribute names */
    combined: Record<string, string[]>
}

/**
 * Value structures by attribute path.
 *
 * For the path author>year, the structure would be:
 * `{ "author>year": { "J.K. Rofling": { "2010": 42, ... } } }`
 */
export type AttrValues = { [attrPath: string]: RecursiveRecord<number> }

// This version of TypeScript has a problem with recursive types, so we have to use {[_]:_} syntax here?
export type RecursiveRecord<T> = Record<string, T> | { [k: string]: RecursiveRecord<T> }
