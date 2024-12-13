/** @format */
import { buildUrl } from "./util"

const karpURL = "https://spraakbanken4.it.gu.se/karp/v7"

export type KarpResponse<T> = {
    total: number
    hits: T[]
    distribution: Record<string, number>
}

export type SaldoEntry = {
    senseID: string
    primary: string
    // There's more, but not used here
}

export type SwefnEntry = {
    swefnID: string
    LUs: string[]
    // There's more, but not used here
}

/** Query for saldom resource to find all entries that have wf as a non-compound word form */
const wfQuery = (wf: string) =>
    `inflectionTable(and(equals|writtenForm|${wf}||not(equals|msd|c||equals|msd|ci||equals|msd|cm||equals|msd|sms)))`

/** Create a query condition for a field matching any of several values */
const equals = (field: string, values: string[]) =>
    `or(${values.map((value) => `equals|${field}|${value}`).join("||")})`

/** Query lexicons in the Karp API */
async function query<T>(lexicons: string[], q: string, path: string, params?: object) {
    const url = `${karpURL}/query/${lexicons.join(",")}`
    const response = await fetch(buildUrl(url, { q, path, ...params }))
    return (await response.json()) as KarpResponse<T>
}

export const getLemgrams = (wordForm: string, morphologies: string[]) =>
    query<string>(morphologies, wfQuery(wordForm), "entry.lemgram", { size: 100 })

export const getSenseId = (lemgram: string) => query<string>(["saldo"], `equals|lemgrams|${lemgram}`, "entry.senseID")

export const getSenses = (lemgrams: string[]) =>
    query<SaldoEntry>(["saldo"], equals("lemgrams", lemgrams), "entry", { size: 500 })

export const getSwefnFrame = (senses: string[]) => query<SwefnEntry>(["swefn"], equals("LUs", senses), "entry")
