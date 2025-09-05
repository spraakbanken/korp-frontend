export type CqpQuery = CqpToken[]

export type CqpToken = {
    and_block?: Condition[][]
    bound?: Record<"lbound" | "rbound", true>
    /** `[min]` or `[min, max]` */
    repeat?: [number] | [number, number]
    struct?: string
    start?: boolean
}

export type Condition = {
    type: string
    op: OperatorKorp
    val: Value
    flags?: Record<string, true>
}

export type Value = string | DateRange

/** Should be `[fromdate, todate, fromtime, totime]` */
export type DateRange = (string | number)[]

export type Operator = "=" | "!=" | "contains" | "not contains"

export type OperatorKorp =
    | Operator
    | "^="
    | "_="
    | "&="
    | "*="
    | "!*="
    | "rank_contains"
    | "not_rank_contains"
    | "highest_rank"
    | "not_highest_rank"
    | "regexp_contains"
    | "not_regexp_contains"
    | "starts_with_contains"
    | "not_starts_with_contains"
    | "incontains_contains"
    | "not_incontains_contains"
    | "ends_with_contains"
    | "not_ends_with_contains"
