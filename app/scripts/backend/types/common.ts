/** @format */

/** A Korp response is either successful or has error info */
export type Response<R> = ResponseBase & (R | ErrorResponse)

/** All responses have time info. */
export type ResponseBase = {
    /** Execution time in seconds */
    time?: number
}

/** An error response has an error message. */
export type ErrorResponse = {
    ERROR: ErrorMessage
}

export type ErrorMessage = {
    /** Name of exception */
    type: string
    /** Error message, human-readable but technical */
    value: string
}

/**
 * This is also included in a response if the `incremental` param was given.
 *
 * It is suitable for reading piece by piece in order to display progress feedback to the user.
 */
export type ProgressResponse = {
    /** Selected corpora in the order they will be searched. This is returned first. */
    progress_corpora?: string[]
    /** Repeated for each corpus (or sometimes batch of corpora?) Hits can be 0. These are returned a few at a time. */
    [progress_n: `progress_${number}`]: string | { corpus: string; hits: number }
}

export type ProgressReport<R = {}> = {
    /** Response data */
    struct: ResponseBase & ProgressResponse & Partial<R>
    /** How many percent of the material has been searched. */
    stats: number
    /** How many search hits so far. */
    total_results: number | null
}

/** Frequency count as absolute and relative (to some total size). */
export type AbsRelTuple = { absolute: number; relative: number }

/** A string consisting of numbers. */
export type NumericString = `${number}`

/** Specifies how precise dates should be handled. */
export type Granularity = "y" | "m" | "d" | "h" | "n" | "s"

/** Frequencies by time period (of some granularity). */
export type Histogram = {
    /** Frequency by time period. The date string matches something like `YYYY` or `YYYYMMDDhhmmss`, usually depending on a `granularity` parameter. */
    [date: NumericString]: number
    /** Frequency of items at unknown time */
    ""?: number
}

export type WithinParameters = {
    default_within: string
    within: string
}

/** Search hit */
export type ApiKwic = {
    corpus: string
    /** An object for each token in the context, with attribute values for that token */
    tokens: Token[]
    /** Attribute values for the context (e.g. sentence) */
    structs: Record<string, any>
    /** Specifies the position of the match in the context. If `in_order` is false, `match` will consist of a list of match objects, one per highlighted word */
    match: KwicMatch | KwicMatch[]
    /** Hits from aligned corpora if available, otherwise omitted */
    aligned: {
        [linkedCorpusId: `${string}-${string}`]: Token[]
    }
}

/** Specifies the position of a match in a context */
type KwicMatch = {
    /** Start position of the match within the context */
    start: number
    /** End position of the match within the context */
    end: number
    /** Global corpus position of the match */
    position: number
}

export type Token = {
    word: string
    /** Start/end tags */
    structs?: {
        open?: {
            [element: string]: {
                [attr: string]: string
            }
        }[]
        close?: string[]
    }
    [attr: string]: any
}
