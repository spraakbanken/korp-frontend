import { QueryResponse } from "./query"

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture/paths/~1relations_sentences/get */
export type RelationsSentencesParams = {
    /** Required for `relations_sentences` */
    source: string
    start?: number
    end?: number
    show?: string
    show_struct?: string
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Word-Picture/paths/~1relations_sentences/get */
export type RelationsSentencesResponse = QueryResponse
