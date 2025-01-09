/** @format */
import { fetchConfAddMethod } from "@/util"
import { getAuthorizationHeader } from "@/components/auth/auth"
import settings from "@/settings"
import { API, ErrorMessage, ProgressHandler, ProgressReport, ProgressResponse, Response, ResponseBase } from "./types"
import { omitBy, pickBy } from "lodash"

type RequestOptions<K extends keyof API> = {
    onProgress?: ProgressHandler<K>
}

export async function korpRequest<K extends keyof API>(
    endpoint: K,
    params: API[K]["params"],
    options: RequestOptions<K> = {}
): Promise<API[K]["response"]> {
    params = omitBy(params, (value) => value == null) as API[K]["params"]
    const { url, request } = fetchConfAddMethod(settings.korp_backend_url + "/" + endpoint, params)
    request.headers = { ...request.headers, ...getAuthorizationHeader() }

    const response = await fetch(url, request)

    let data: Response<API[K]["response"]>
    if (options.onProgress && response.body) {
        const reader = response.body.getReader()
        let json = ""
        // Iterate while fetching
        while (true) {
            const { done, value } = await reader.read()
            const text = new TextDecoder("utf-8").decode(value)
            json += text
            const progress = calcProgress(json)
            options.onProgress(progress)
            if (done) break
        }
        data = JSON.parse(json)
    } else {
        data = await response.json()
    }

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

export function calcProgress<K extends keyof API>(partialJson: string): ProgressReport<K> {
    type PartialResponse = ResponseBase & ProgressResponse & Partial<API[K]["response"]>

    let data: PartialResponse = {}
    try {
        data = parsePartialJson(partialJson)
    } catch (error) {
        data = {}
    }

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

/** Try to parse partial JSON data (of an in-progress HTTP response). */
function parsePartialJson<T = any>(data: string): T {
    // If it ends with comma + space, replace that with a closing curly.
    const reEndsWithComma = /,\s*$/
    if (data.match(reEndsWithComma)) {
        data = data.replace(reEndsWithComma, "}")
    }
    return JSON.parse(data)
}
