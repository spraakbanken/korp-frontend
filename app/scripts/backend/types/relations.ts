/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture */

export type RelationsParams = {
    corpus: string
    word: string
    /** Search type. Defaults to "word". */
    type?: "word" | "lemgram"
    min?: number
    max?: number
    incremental?: boolean
    sort?: RelationsSort
    /** Split items by time spans */
    split_time?: boolean
}

export type RelationsResponse = {
    /** Split by time spans if the `split_time` param is enabled */
    relations?: Relation[] | Record<string, Relation[]>
    /** Execution time in seconds */
    time: number
}

export type RelationsSort = "freq" | "mi"

export type Relation = {
    dep: string
    depextra: string
    deppos: string
    /** Absolute frequency */
    freq: number
    head: string
    headpos: string
    /** Lexicographer's mutual information score */
    mi: number
    rel: string
    /** List of IDs, for getting the source sentences */
    source: string[]
}
