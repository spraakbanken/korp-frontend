/** @format */
/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Information/paths/~1corpus_info/get */

export type CorpusInfoParams = {
    corpus: string
}

export type CorpusInfoResponse = {
    corpora: Record<string, CorpusInfo>
    total_sentences: number
    total_size: number
}

export type CorpusInfo = {
    /** Lists of attribute names present in the corpus. */
    attrs: CorpusInfoAttrs
    /** Miscellaneous information about the corpus given by Corpus Workbench, including any key-value pairs from the corresponding .info file. */
    info: CorpusInfoInfo
}

export type CorpusInfoAttrs = {
    /** Positional attributes */
    p: string[]
    /** Structural attributes */
    s: string[]
    /** Align attributes, for linked corpora */
    a: string[]
}

export type CorpusInfoInfo = {
    Name?: string
    Size?: `${number}`
    Charset?: string
    Sentences?: `${number}`
    Saldo?: `${number}`
    FirstDate?: `${number}-${number}-${number} ${number}:${number}:${number}` | ""
    LastDate?: string
    Updated?: `${number}-${number}-${number}`
    Protected?: "true" | "false" | ""
    DateResolution?: string
    KorpModes?: string
}
