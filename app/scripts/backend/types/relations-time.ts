import { Relation, RelationsParams } from "./relations"

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture/paths/~1relations_time/get */
export type RelationsTimeParams = RelationsParams & {
    period_align?: "oldest"
    period_size?: number
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture/paths/~1relations_time/get */
export type RelationsTimeResponse = {
    range: { start: number; end: number }
    period_size: number
    relations_time: Record<string, Relation[]>
}
