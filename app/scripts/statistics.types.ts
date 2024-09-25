/** @format*/
// TODO: Merge with @/interfaces/stats.ts

import { SlickgridColumn } from "./statistics"
import { Dataset } from "./statistics_worker"

export type StatisticsWorkerMessage = {
    type: "korpStatistics"
    data: StatsNormalized
    reduceVals: string[]
    groupStatistics: string[]
}

export type StatisticsWorkerResult = [Dataset, SlickgridColumn[], SearchParams]

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
