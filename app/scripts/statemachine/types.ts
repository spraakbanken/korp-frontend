/** @format */
import { Token } from "@/backend/kwic-proxy"

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
