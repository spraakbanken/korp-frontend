/** @format */
import { Token } from "@/backend/kwic-proxy"
import { CorpusTransformed } from "@/settings/config-transformed.types"

/** Mapping from event names to the type of the associated payload. */
export type EventMap = {
    select_word: SelectWordEvent | null
    lemgram_search: LemgramSearchEvent
    cqp_search: CqpSearchEvent
    login_needed: LoginNeededEvent
    login: null
    logout: null
}

export type EventName = keyof EventMap

export type SelectWordEvent = {
    /** Structural attributes */
    sentenceData: Record<string, any>
    /** Selected token */
    wordData: Token
    /** Corpus id in lowercase */
    corpus: string
    /** All tokens in the context, e.g. the full sentence */
    tokens: Token[]
    inReadingMode: boolean
}

export type LemgramSearchEvent = {
    value: string
}

export type CqpSearchEvent = {
    cqp: string
}

export type LoginNeededEvent = {
    loginNeededFor: CorpusTransformed[]
}
