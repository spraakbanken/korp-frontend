/** @format*/
import { CountsSplit } from "@/backend/types/count"
import { LangString } from "@/i18n/types"

export type StatisticsWorkerMessage = {
    type: "korpStatistics"
    data: CountsSplit
    groupStatistics: string[]
}

export type StatisticsProcessed = {
    rows: Dataset
    params: SearchParams
}

export type SlickgridColumn = Slick.Column<Dataset> & {
    translation?: LangString
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
    /** HTML representations of each attribute value */
    formattedValue: Record<string, string>
    /** Plain-text representations of each attribute value */
    plainValue: Record<string, string>
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
