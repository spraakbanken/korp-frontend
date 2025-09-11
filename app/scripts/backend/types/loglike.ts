/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Misc/paths/~1loglike/get */
export type LoglikeParams = {
    set1_corpus: string
    set1_cqp: string
    set2_corpus: string
    set2_cqp: string
    group_by?: string
    group_by_struct?: string
    ignore_case?: boolean
    max: number
    split: string
    top: string
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
