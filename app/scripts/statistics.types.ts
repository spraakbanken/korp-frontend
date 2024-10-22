/** @format*/
// TODO: Merge with @/interfaces/stats.ts

import { StatsColumn } from "./backend/types"
import { SlickgridColumn } from "./statistics"
import { Dataset } from "./statistics_worker"

export type StatisticsWorkerMessage = {
    type: "korpStatistics"
    data: StatsNormalized
    reduceVals: string[]
    groupStatistics: string[]
}

export type StatisticsWorkerResult = [Dataset, SlickgridColumn[], SearchParams]

/** Like `CountResponse` but the stats are necessarily arrays. */
export type StatsNormalized = {
    corpora: {
        [name: string]: StatsColumn[]
    }
    combined: StatsColumn[]
    count: number
    time: number
}

export type SearchParams = {
    reduceVals: string[]
    ignoreCase: boolean
    originalCorpora: string
    corpora: string[]
    prevNonExpandedCQP: string
}
