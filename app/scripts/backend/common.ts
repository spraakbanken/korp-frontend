/** @format */
import { selectHttpMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, ProgressHandler, ProgressReport, ProgressResponse, Response as KResponse } from "./types"
import { omitBy, pickBy } from "lodash"

type RequestOptions<K extends keyof API> = {
    /** Abort signal to cancel the request */
    abortSignal?: AbortSignal
    /** Callback to visualize progress and paged data */
    onProgress?: ProgressHandler<K>
}

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"],
    options: RequestOptions<K> = {}
): Promise<API[K]["response"]> {
    // Skip params with `null` or `undefined`
    params = omitBy(params, (value) => value == null) as API[K]["params"]
    // Switch to POST if the URL would be to long
    const { url, request } = selectHttpMethod(settings.korp_backend_url + "/" + endpoint, params)
    request.headers = { ...request.headers, ...getAuthorizationHeader() }
    if (options.abortSignal) request.signal = options.abortSignal

    // Send request
    const response = await fetch(url, request)

    // If progress handler given, parse response data as it comes in
    const json = await readIncrementally(response, (json) => {
        if (options.onProgress) {
            const progress = calcProgress<K>(json)
            if (progress) options.onProgress(progress)
        }
    })
    const data: KResponse<API[K]["response"]> = JSON.parse(json)

    if ("ERROR" in data) {
        const { type, value } = data.ERROR as ErrorMessage
        throw new KorpBackendError(type, value)
    }

    return data
}

/** Read and handle a HTTP response body as it comes in */
async function readIncrementally(response: Response, handle: (content: string) => void): Promise<string> {
    const reader = response.body!.getReader()
    let content = ""
    while (true) {
        const { done, value } = await reader.read()
        content += new TextDecoder("utf-8").decode(value)
        handle(content)
        if (done) break
    }
    return content
}

export class KorpBackendError extends Error {
    constructor(public readonly type: string, public readonly value: string) {
        super(`${type}: ${value}`)
        this.name = "KorpBackendError"
    }
}

export function calcProgress<K extends keyof API>(partialJson: string): ProgressReport<K> | undefined {
    const data = parsePartialJson<ProgressResponse & KResponse<API[K]["response"]>>(partialJson)
    if (!data) return

    /** Look up sizes of corpora and sum them */
    const getCorpusSize = (corpora: string[]) =>
        corpora.map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size)).reduce((a, b) => a + b, 0)

    /** Number of hits (`null` if this API endpoint doesn't report search hits) */
    let hits: number | null = null
    /** Number of tokens processed */
    let progress = 0

    type ProgressItem = ProgressResponse[`progress_${number}`]
    const progressItems = Object.values(pickBy(data, (value, key) => /progress_\d+/.test(key))) as ProgressItem[]

    for (const val of progressItems) {
        const corpus = typeof val == "string" ? val : val.corpus
        progress += getCorpusSize(corpus.split("|"))
        if (typeof val != "string" && "hits" in val) {
            hits = (hits || 0) + Number(val.hits)
        }
    }

    /** Number of tokens in the corpora in the current result page */
    const allCorpora = data.progress_corpora?.flatMap((corpus) => corpus.split("|"))
    const total = allCorpora ? getCorpusSize(allCorpora) : 0

    const percent = total ? (progress / total) * 100 : 0

    return { data, percent, hits }
}

/** Try to parse partial JSON data (of an in-progress HTTP response). Quite likely to throw `SyntaxError`. */
export function parsePartialJson<T = any>(json: string): Partial<T> | undefined {
    try {
        // If it ends with comma + space, replace that with a closing curly.
        return JSON.parse(json.replace(/,\s*$/, "}"))
    } catch {}
}

export const pageToRange = (page: number, size: number) => ({ start: page * size, end: page * size + size - 1 })
