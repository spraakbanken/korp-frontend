/** @format */
/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1timespan/get */

import { Granularity, Histogram, NumericString, Response } from "./common"

export type TimespanParams = {
    corpus: string
    granularity?: Granularity
    from?: NumericString
    to?: NumericString
    strategy?: 1 | 2 | 3
    per_corpus?: boolean
    combined?: boolean
    incremental?: boolean
}

export type TimespanResponse = {
    /** An object with corpus names as keys and time statistics objects as values */
    corpora: Record<string, Histogram>
    /** Number of tokens per time period */
    combined: Histogram
    /** Execution time in seconds */
    time: number
}
