/** @format */
import _ from "lodash"
import angular, { IDeferred, IHttpService, IPromise, IQService } from "angular"
import settings from "@/settings"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { httpConfAddMethod } from "@/util"

export type LexiconsService = {
    relatedWordSearch: (lemgram: string) => IPromise<LexiconsRelatedWordsResponse>
    // TODO Type Karp API
    getLemgrams: (wf: string, resources: string[] | string, corporaIDs: string[]) => IPromise<any>
    getSenses: (wf: string) => IPromise<any>
}
export type LexiconsRelatedWordsResponse = LexiconsRelatedWordsItem[]
export type LexiconsRelatedWordsItem = {
    label: string
    words: string[]
}

angular.module("korpApp").factory("lexicons", [
    "$q",
    "$http",
    function ($q: IQService, $http: IHttpService): LexiconsService {
        const karpURL = "https://ws.spraakbanken.gu.se/ws/karp/v4"
        return {
            getLemgrams(wf: string, resources: string[] | string, corporaIDs: string[]) {
                const deferred = $q.defer()

                const args = {
                    q: wf,
                    resource: $.isArray(resources) ? resources.join(",") : resources,
                    mode: "external",
                }

                $http({
                    method: "GET",
                    url: `${karpURL}/autocomplete`,
                    params: args,
                })
                    .then(function (response: any) {
                        // TODO Type Karp API
                        let { data } = response
                        if (data === null) {
                            return deferred.resolve([])
                        } else {
                            // Pick the lemgrams. Would be nice if this was done by the backend instead.
                            const karpLemgrams = _.map(
                                data.hits.hits,
                                (entry) => entry._source.FormRepresentations[0].lemgram
                            )

                            if (karpLemgrams.length === 0) {
                                deferred.resolve([])
                                return
                            }

                            let lemgram = karpLemgrams.join(",")
                            const corpora = corporaIDs.join(",")
                            const headers = getAuthorizationHeader()
                            return $http<any>(
                                httpConfAddMethod({
                                    url: settings["korp_backend_url"] + "/lemgram_count",
                                    method: "GET",
                                    params: {
                                        lemgram: lemgram,
                                        count: "lemgram",
                                        corpus: corpora,
                                    },
                                    headers,
                                })
                            ).then(({ data }) => {
                                delete data.time
                                const allLemgrams = []
                                for (lemgram in data) {
                                    const count = data[lemgram]
                                    allLemgrams.push({ lemgram: lemgram, count: count })
                                }
                                for (let klemgram of karpLemgrams) {
                                    if (!data[klemgram]) {
                                        allLemgrams.push({ lemgram: klemgram, count: 0 })
                                    }
                                }
                                return deferred.resolve(allLemgrams)
                            })
                        }
                    })
                    .catch((response) => deferred.resolve([]))
                return deferred.promise
            },
            getSenses(wf: string) {
                const deferred = $q.defer()

                const args = {
                    q: wf,
                    resource: "saldom",
                    mode: "external",
                }

                $http<any>({
                    method: "GET",
                    url: `${karpURL}/autocomplete`,
                    params: args,
                })
                    .then((response) => {
                        let { data } = response
                        if (data === null) {
                            return deferred.resolve([])
                        } else {
                            let karpLemgrams = _.map(
                                data.hits.hits,
                                (entry) => entry._source.FormRepresentations[0].lemgram
                            )
                            if (karpLemgrams.length === 0) {
                                deferred.resolve([])
                                return
                            }

                            karpLemgrams = karpLemgrams.slice(0, 100)

                            const senseargs = {
                                q: `extended||and|lemgram|equals|${karpLemgrams.join("|")}`,
                                resource: "saldo",
                                show: "sense,primary",
                                size: 500,
                            }

                            return $http<any>({
                                method: "GET",
                                url: `${karpURL}/minientry`,
                                params: senseargs,
                            })
                                .then(function ({ data }) {
                                    if (data.hits.total === 0) {
                                        deferred.resolve([])
                                        return
                                    }
                                    const senses = _.map(data.hits.hits, (entry) => ({
                                        sense: entry._source.Sense[0].senseid,
                                        desc:
                                            entry._source.Sense[0].SenseRelations &&
                                            entry._source.Sense[0].SenseRelations.primary,
                                    }))
                                    deferred.resolve(senses)
                                })
                                .catch((response) => deferred.resolve([]))
                        }
                    })
                    .catch((response) => deferred.resolve([]))
                return deferred.promise
            },
            relatedWordSearch(lemgram: string) {
                const def: IDeferred<LexiconsRelatedWordsResponse> = $q.defer()
                $http<any>({
                    url: `${karpURL}/minientry`,
                    method: "GET",
                    params: {
                        q: `extended||and|lemgram|equals|${lemgram}`,
                        show: "sense",
                        resource: "saldo",
                    },
                }).then(function ({ data }) {
                    if (data.hits.total === 0) {
                        def.resolve([])
                    } else {
                        const senses = _.map(data.hits.hits, (entry) => entry._source.Sense[0].senseid)

                        $http<any>({
                            url: `${karpURL}/minientry`,
                            method: "GET",
                            params: {
                                q: `extended||and|LU|equals|${senses.join("|")}`,
                                show: "LU,sense",
                                resource: "swefn",
                            },
                        }).then(function ({ data }) {
                            if (data.hits.total === 0) {
                                def.resolve([])
                            } else {
                                const eNodes: LexiconsRelatedWordsResponse = _.map(data.hits.hits, (entry) => ({
                                    label: entry._source.Sense[0].senseid.replace("swefn--", ""),
                                    words: entry._source.Sense[0].LU,
                                }))

                                return def.resolve(eNodes)
                            }
                        })
                    }
                })

                return def.promise
            },
        }
    },
])
