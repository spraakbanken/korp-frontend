/** @format */
import _ from "lodash"
import angular, { IDeferred, IHttpService, IPromise, IQService } from "angular"
import settings from "@/settings"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethod } from "@/util"
import { Karp7QueryResponse, Karp7SaldoEntry, Karp7SwefnEntry } from "@/karp/karp7.types"

export type LexiconsService = {
    relatedWordSearch: (lemgram: string) => IPromise<LexiconsRelatedWordsResponse>
    // TODO Type Karp API
    getLemgrams: (wf: string, resources: string[], corporaIDs: string[]) => IPromise<any>
    getSenses: (wf: string) => IPromise<any>
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

type LemgramCount = { lemgram: string; count: number }

angular.module("korpApp").factory("lexicons", [
    "$q",
    "$http",
    function ($q: IQService, $http: IHttpService): LexiconsService {
        const karpURL = "https://spraakbanken4.it.gu.se/karp/v7"
        // query for saldom resource to find all entries that have wf as a non-compound word form
        const wfQuery = (wf: string) =>
            "inflectionTable(and(equals|writtenForm|" +
            wf +
            "||not(equals|msd|c||equals|msd|ci||equals|msd|cm||equals|msd|sms)))"

        return {
            getLemgrams(wf: string, resources: string[], corporaIDs: string[]) {
                const deferred = $q.defer()

                $http<Karp7QueryResponse<string>>({
                    method: "GET",
                    url: `${karpURL}/query/${resources.join(",")}`,
                    params: {
                        q: wfQuery(wf),
                        path: "entry.lemgram",
                    },
                })
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
                const deferred = $q.defer()

                $http<Karp7QueryResponse<string>>({
                    method: "GET",
                    url: `${karpURL}/query/saldom`,
                    params: {
                        q: wfQuery(wf),
                        path: "entry.lemgram",
                    },
                })
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

                        $http<Karp7QueryResponse<Karp7SaldoEntry>>({
                            method: "GET",
                            url: `${karpURL}/query/saldo`,
                            params: {
                                q:
                                    "or(" +
                                    _.map(karpLemgrams, (lemgram) => `equals|lemgrams|${lemgram}`).join("||") +
                                    ")",
                                path: "entry",
                                size: 500,
                            },
                        })
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
                $http<Karp7QueryResponse<string>>({
                    url: `${karpURL}/query/saldo`,
                    method: "GET",
                    params: {
                        q: `equals|lemgrams|${lemgram}`,
                        path: "entry.senseID",
                    },
                }).then(({ data }) => {
                    if (data.total === 0) {
                        def.resolve([])
                    } else {
                        $http<Karp7QueryResponse<Karp7SwefnEntry>>({
                            url: `${karpURL}/query/swefn`,
                            method: "GET",
                            params: {
                                q: "and(" + _.map(data.hits, (sense) => `equals|LUs|${sense}`).join("||") + ")",
                                path: "entry",
                            },
                        }).then(({ data }) => {
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
