/** @format */
/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count_time/get */

import { AbsRelTuple, Granularity, Histogram, NumericString } from "./common"

export type CountTimeParams = {
    corpus: string
    cqp: string
    default_within?: string
    with?: string
    [subcqpn: `subcqp${string}`]: string
    granularity?: Granularity
    from?: NumericString
    to?: NumericString
    strategy?: 1 | 2 | 3
    per_corpus?: boolean
    combined?: boolean
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    incremental?: boolean
}

export type CountTimeResponse = {
    corpora: Record<string, GraphStats | (GraphStats | GraphStatsCqp)[]>
    combined: GraphStats | (GraphStats | GraphStatsCqp)[]
}

export type GraphStats = {
    absolute: Histogram
    relative: Histogram
    sums: AbsRelTuple
}

/** Stats contains subquery if graph was created with multiple rows selected in the stats table. */
export type GraphStatsCqp = GraphStats & { cqp: string }
