/** @format */
import _ from "lodash"
import angular, { IHttpService, IPromise, IQService } from "angular"
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
    "$q",
    "$http",
    "karp",
    function ($q: IQService, $http: IHttpService, karp: KarpService): LexiconsService {
        return {
            getLemgrams(wf: string, resources: string[], corporaIDs: string[]) {
                // TODO Can we skip creating deferreds and return promises directly?
                const deferred = $q.defer<LemgramCount[]>()

                karp.getLemgrams(wf, resources)
                    .then(({ data }) => {
                        if (data.total === 0) {
                            deferred.resolve([])
                            return
                        }

                        const karpLemgrams = data.hits
                        $http<KorpLemgramCountResponse>(
                            httpConfAddMethod({
                                url: settings["korp_backend_url"] + "/lemgram_count",
                                method: "GET",
                                params: {
                                    lemgram: karpLemgrams.join(","),
                                    count: "lemgram",
                                    corpus: corporaIDs.join(","),
                                },
                                headers: getAuthorizationHeader(),
                            })
                        ).then(({ data }) => {
                            const keys = Object.keys(data).filter((key) => key != "time")
                            const allLemgrams: LemgramCount[] = []
                            for (const lemgram of keys) {
                                const count = data[lemgram]
                                allLemgrams.push({ lemgram: lemgram, count: count })
                            }
                            for (let klemgram of karpLemgrams) {
                                if (!data[klemgram]) {
                                    allLemgrams.push({ lemgram: klemgram, count: 0 })
                                }
                            }
                            deferred.resolve(allLemgrams)
                        })
                    })
                    .catch(() => deferred.resolve([]))
                return deferred.promise
            },

            getSenses(wf: string) {
                const deferred = $q.defer<SenseResult[]>()

                karp.getLemgrams(wf, ["saldom"])
                    .then(({ data }) => {
                        if (data.total === 0) {
                            deferred.resolve([])
                            return
                        }

                        const karpLemgrams = data.hits.slice(0, 100)
                        if (karpLemgrams.length === 0) {
                            deferred.resolve([])
                            return
                        }

                        karp.getSenses(karpLemgrams)
                            .then(function ({ data }) {
                                const senses = _.map(data.hits, ({ senseID, primary }) => ({
                                    sense: senseID,
                                    desc: primary,
                                }))
                                deferred.resolve(senses)
                            })
                            .catch(() => deferred.resolve([]))
                    })
                    .catch(() => deferred.resolve([]))
                return deferred.promise
            },

            relatedWordSearch(lemgram: string) {
                const def = $q.defer<LexiconsRelatedWordsResponse>()
                karp.getSenseId(lemgram).then(({ data }) => {
                    if (data.total === 0) {
                        def.resolve([])
                    } else {
                        karp.getSwefnFrame(data.hits).then(({ data }) => {
                            const eNodes = _.map(data.hits, (entry) => ({
                                label: entry.swefnID,
                                words: entry.LUs,
                            }))
                            def.resolve(eNodes)
                        })
                    }
                })
                return def.promise
            },
        }
    },
])
