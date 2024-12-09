/** @format*/
// TODO: Merge with @/interfaces/stats.ts

import { LangString } from "./i18n/types"

export type StatisticsWorkerMessage = {
    type: "korpStatistics"
    data: StatsNormalized
    reduceVals: string[]
    groupStatistics: string[]
}

export type StatisticsWorkerResult = [Dataset, SlickgridColumn[], SearchParams]

export type SlickgridColumn = Slick.Column<Dataset> & {
    translation?: LangString
}

/** Like `KorpStatsResponse` but the stats are necessarily arrays. */
export type StatsNormalized = {
    corpora: {
        [name: string]: StatsColumn[]
    }
    combined: StatsColumn[]
    count: number
    time: number
}

export type StatsColumn = {
    sums: AbsRelTuple
    rows: StatsRow[]
}

/** Frequency count as absolute and relative (to some total size). */
export type AbsRelTuple = { absolute: number; relative: number }

export type StatsRow = AbsRelTuple & {
    value: Record<string, string | string[]>
}

export type SearchParams = {
    reduceVals: string[]
    ignoreCase: boolean
    originalCorpora: string
    corpora: string[]
    prevNonExpandedCQP: string
}

export type Row = TotalRow | SingleRow

export type TotalRow = RowBase & {
    id: "row_total"
}

export type SingleRow = RowBase & {
    formattedValue: Record<string, string>
    /** For each match token, a record of non-simplified attr values, e.g. ["foo:12", "foo:34"] */
    statsValues: Record<string, string[]>[]
}

export const isTotalRow = (row: Row): row is TotalRow => row.rowId === 0

export type RowBase = {
    rowId: number
    /** Frequency counts keyed by uppercase corpus id */
    count: Record<string, AbsRelSeq>
    total: AbsRelSeq
}

export type Dataset = Row[]

export type AbsRelSeq = [number, number]
