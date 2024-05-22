/** @format */

/** A Korp response is either successful or has error info. */
export type KorpResponse<T> = (T | KorpErrorResponse) & {
    /** Execution time in seconds */
    time?: number
}

export type KorpErrorResponse = {
    ERROR: {
        type: string
        value: string
    }
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
    [progress_n: `progress${number}`]: string | { corpus: string; hits: number }
    /** Other parts of the response, not related to progress tracking. */
    [k: string]: any
}

/** Extends JQuery `jaxSettings` with stuff we use. */
export type AjaxSettings<T = any> = JQuery.AjaxSettings<T> & {
    progress?: (data: T, e: any) => void
}

export type ProgressReport = {
    struct: ProgressResponse
    /** How many percent of the material has been searched. */
    stats: number
    /** How many search hits so far. */
    total_results: number
}

export type ProgressCallback = (ProgressReport) => void

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
