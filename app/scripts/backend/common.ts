/** @format */
import axios from "axios"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, ProgressHandler, ProgressReport, ProgressResponse, Response } from "./types"
import { pickBy } from "lodash"
import { selectHttpMethod } from "@/util"

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
    const conf = selectHttpMethod({
        url: settings.korp_backend_url + "/" + endpoint,
        params,
        headers: getAuthorizationHeader(),
        signal: options.abortSignal,
        onDownloadProgress: (event) => {
            const xhr = event.event?.target as XMLHttpRequest | undefined
            if (xhr && options.onProgress) {
                const progress = calcProgress<K>(xhr.responseText)
                if (progress) options.onProgress(progress)
            }
        },
    })

    const response = await axios.request<Response<API[K]["response"]>>(conf)
    const data = response.data

    if ("ERROR" in data) {
        const { type, value } = data.ERROR as ErrorMessage
        throw new KorpBackendError(type, value)
    }

    return data
}

export class KorpBackendError extends Error {
    constructor(public readonly type: string, public readonly value: string) {
        super(`${type}: ${value}`)
        this.name = "KorpBackendError"
    }
}

export function calcProgress<K extends keyof API>(partialJson: string): ProgressReport<K> | undefined {
    const data = parsePartialJson<ProgressResponse & Response<API[K]["response"]>>(partialJson)
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
