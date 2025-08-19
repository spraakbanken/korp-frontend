/** @format */
import { AbsRelTuple } from "./common"

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
export type CountResponse = CountsMerged | CountsSplit

/** Statistics when `subcqp{N}` parameters are not used. */
export type CountsMerged = CountResponseBase & {
    combined: StatsColumn
    corpora: Record<string, StatsColumn>
}

/** Statistics split by `subcqp{N}` parameters. */
export type CountsSplit = CountResponseBase & {
    combined: StatsColumn[]
    corpora: Record<string, StatsColumn[]>
}

export type CountResponseBase = {
    /** Total number of different values */
    count: number
    /** Execution time in seconds */
    time: number
}

export type StatsColumn = {
    sums: AbsRelTuple
    rows: StatsRow[]
    /** For a multi-series request, the `subcqp{N}` is copied to this property. */
    cqp?: string
}

export type StatsRow = AbsRelTuple & {
    value: Record<string, string | string[]>
}
