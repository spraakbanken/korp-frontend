/** @format */
import { omit } from "lodash"
import * as karp from "@/services/karp"
import { korpRequest } from "./common"

export type LemgramCount = { lemgram: string; count: number }

export type SenseResult = { sense: string; desc: string }

/** Look up lemgrams matching a given wordform and count them in selected corpora. */
export async function getLemgrams(wf: string, resources: string[], corporaIDs: string[]): Promise<LemgramCount[]> {
    const lemgrams = (await karp.getLemgrams(wf, resources)).hits
    if (lemgrams.length == 0) return []

    const data = await korpRequest("lemgram_count", {
        lemgram: lemgrams.join(","),
        count: "lemgram",
        corpus: corporaIDs.join(","),
    })
    const counts = omit(data, "time")

    return lemgrams.map((lemgram) => ({ lemgram, count: counts[lemgram] || 0 }))
}

/** Look up SALDO senses of lemgrams of a given wordform. */
export async function getSenses(wf: string): Promise<SenseResult[]> {
    const lemgrams = (await karp.getLemgrams(wf, ["saldom"])).hits
    if (lemgrams.length == 0) return []

    const senses = (await karp.getSenses(lemgrams)).hits
    return senses.map(({ senseID, primary }) => ({ sense: senseID, desc: primary }))
}

/** Look up SweFN frames matching a given lemgram and get their other lexical units (LUs)  */
export async function relatedWordSearch(lemgram: string): Promise<karp.SwefnEntry[]> {
    const senses = (await karp.getSenseId(lemgram)).hits
    if (senses.length == 0) return []

    const frames = (await karp.getSwefnFrame(senses)).hits
    if (frames.length == 0) return []

    // Lower some nasty words
    const skiplist = ["Excreting"]
    const first = frames.findIndex((entry) => !skiplist.includes(entry.swefnID))
    if (first > 0) frames.splice(0, first + 1, frames[first], ...frames.slice(0, first))

    return frames
}
