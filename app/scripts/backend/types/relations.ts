/** @format */
/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture */

export type RelationsParams = {
    corpus: string
    word: string
    type?: string
    min?: number
    max?: number
    incremental?: boolean
    sort?: "freq" | "mi"
}

export type RelationsResponse = {
    relations: ApiRelation[]
    /** Execution time in seconds */
    time: number
}

export type ApiRelation = {
    dep: string
    depextra: string
    deppos: string
    freq: number
    head: string
    headpos: string
    /** Lexicographer's mutual information score */
    mi: number
    rel: string
    /** List of IDs, for getting the source sentences */
    source: string[]
}
