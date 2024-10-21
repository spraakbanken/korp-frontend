/** @format */
import _ from "lodash"
import angular, { IHttpService, IPromise } from "angular"
import settings from "@/settings"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethod } from "@/util"
import "@/karp/service"
import { KarpService } from "@/karp/service"

export type LexiconsService = {
    relatedWordSearch: (lemgram: string) => IPromise<LexiconsRelatedWordsResponse>
    getLemgrams: (wf: string, resources: string[], corporaIDs: string[]) => IPromise<LemgramCount[]>
    getSenses: (wf: string) => IPromise<SenseResult[]>
}
export type LexiconsRelatedWordsResponse = LexiconsRelatedWordsItem[]
export type LexiconsRelatedWordsItem = {
    label: string
    words: string[]
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1lemgram_count/get */
type KorpLemgramCountResponse = {
    time: number
    [lemgram: string]: number
}

export type LemgramCount = { lemgram: string; count: number }
export type SenseResult = { sense: string; desc: string }

angular.module("korpApp").factory("lexicons", [
    "$http",
    "karp",
    function ($http: IHttpService, karp: KarpService): LexiconsService {
        return {
            async getLemgrams(wf: string, resources: string[], corporaIDs: string[]) {
                const lemgrams = await karp.getLemgrams(wf, resources).then(({ data }) => data.hits)

                if (lemgrams.length == 0) return []

                const counts = await $http<KorpLemgramCountResponse>(
                    httpConfAddMethod({
                        url: settings["korp_backend_url"] + "/lemgram_count",
                        method: "GET",
                        params: {
                            lemgram: lemgrams.join(","),
                            count: "lemgram",
                            corpus: corporaIDs.join(","),
                        },
                        headers: getAuthorizationHeader(),
                    })
                ).then(({ data }) => _.omit(data, "time"))

                return lemgrams.map((lemgram) => ({ lemgram, count: counts[lemgram] || 0 }))
            },

            async getSenses(wf: string) {
                const lemgrams = await karp.getLemgrams(wf, ["saldom"]).then(({ data }) => data.hits)
                if (lemgrams.length == 0) return []

                const senses = await karp.getSenses(lemgrams).then(({ data }) => data.hits)
                return senses.map(({ senseID, primary }) => ({ sense: senseID, desc: primary }))
            },

            async relatedWordSearch(lemgram: string) {
                const senses = await karp.getSenseId(lemgram).then(({ data }) => data.hits)
                if (senses.length == 0) return []

                const frames = await karp.getSwefnFrame(senses).then(({ data }) => data.hits)
                return frames.map((entry) => ({ label: entry.swefnID, words: entry.LUs }))
            },
        }
    },
])
