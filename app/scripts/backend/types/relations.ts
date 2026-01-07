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
}

export type RelationsResponse = {
    relations?: Relation[]
    /** Execution time in seconds */
    time: number
}

export type RelationsSort = "freq" | "freq_relative" | "mi" | "rmi"

export type Relation = {
    dep: string
    depextra: string
    deppos: string
    freq: number
    freq_relative: number
    head: string
    headpos: string
    /** Lexicographer's mutual information score */
    mi: number
    rel: string
    /** Relative LMI */
    rmi: number
    /** List of IDs, for getting the source sentences */
    source: string[]
}
