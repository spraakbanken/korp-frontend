/** @format */
import _ from "lodash"
import angular, { IDeferred, IHttpService, IPromise, IQService, IScope } from "angular"
import settings from "@/settings"
import currentMode from "@/mode"
import * as authenticationProxy from "@/components/auth/auth"
import { parseMapData } from "./map_services"
import { updateSearchHistory } from "@/history"
import { KorpStatsResponse, normalizeStatsData } from "@/backend/stats-proxy"
import { httpConfAddMethod, httpConfAddMethodAngular, unregescape } from "@/util"
import { mergeCqpExprs, parse, stringify } from "./cqp_parser/cqp"
import { localStorageGet, localStorageSet, SavedSearch } from "@/local-storage"
import { HashParams, LocationService } from "@/urlparams"
import { KorpResponse } from "./backend/types"
import { RootScope } from "./root-scope.types"

const korpApp = angular.module("korpApp")

export type UtilsService = {
    /** Set up sync between a url param and a scope variable. */
    setupHash: (scope: IScope, config: SetupHashConfigItem[]) => void
}

type SetupHashConfigItem<K extends keyof HashParams = keyof HashParams, T = any> = {
    /** Name of url param */
    key: K
    /** Name of scope variable; defaults to `key` */
    scope_name?: string
    /** A function on the scope to pass value to, instead of setting `scope_name` */
    scope_func?: string
    /** Expression to watch for changes; defaults to `scope_name` */
    expr?: string
    /** Default value of the scope variable, corresponding to the url param being empty */
    default?: HashParams[K]
    /** Runs when the value is changed in scope or url */
    post_change?: (val: HashParams[K]) => void
    /** Parse url param value */
    val_in?: (val: HashParams[K]) => T
    /** Stringify scope variable value */
    val_out?: (val: T) => HashParams[K]
}

export type BackendService = {
    requestCompare: (cmpObj1: SavedSearch, cmpObj2: SavedSearch, reduce: string[]) => IPromise<CompareResult>
    relatedWordSearch: LexiconsService["relatedWordSearch"]
    requestMapData: (
        cqp: string,
        cqpExprs: Record<string, string>,
        within: { default_within: string; within: string },
        attribute: any,
        relative: boolean
    ) => IPromise<any>
    [f: string]: any // TODO Type out the functions
}
type KorpLoglikeResponse = {
    /** Log-likelihood average. */
    average: number
    /** Log-likelihood values. */
    loglike: Record<string, number>
    /** Absolute frequency for the values in set 1. */
    set1: Record<string, number>
    /** Absolute frequency for the values in set 2. */
    set2: Record<string, number>
}
export type CompareResult = [CompareTables, number, SavedSearch, SavedSearch, string[]]
export type CompareTables = { positive: CompareItem[]; negative: CompareItem[] }
type CompareItemRaw = {
    value: string
    loglike: number
    abs: number
}
export type CompareItem = {
    /** Value of given attribute without probability suffixes */
    key: string
    /** Log-likelihood value */
    loglike: number
    /** Absolute frequency */
    abs: number
    /** Values of given attribute, as found including probability suffixes */
    elems: string[]
    tokenLists: string[][]
}

export type SearchesService = {
    activeSearch: {
        /** "word", "lemgram" or "cqp" */
        type: string
        val: string
    } | null
    /** is resolved when parallel search controller is loaded */
    langDef: IDeferred<never>
    kwicSearch: (cqp: string) => void
    getCqpExpr: () => string
}

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

korpApp.factory("utils", [
    "$location",
    ($location: LocationService): UtilsService => ({
        setupHash(scope, config) {
            // Sync from url to scope
            const onWatch = () =>
                config.forEach((obj) => {
                    let val = $location.search()[obj.key]
                    if (val == null) {
                        if ("default" in obj) {
                            val = obj.default
                        } else {
                            if (obj.post_change) obj.post_change(val)
                            return
                        }
                    }

                    val = obj.val_in ? obj.val_in(val) : val

                    if ("scope_name" in obj) {
                        scope[obj.scope_name] = val
                    } else if ("scope_func" in obj) {
                        scope[obj.scope_func](val)
                    } else {
                        scope[obj.key] = val
                    }
                })

            onWatch()
            scope.$watch(() => $location.search(), onWatch)

            // Sync from scope to url
            config.forEach((obj) =>
                scope.$watch(obj.expr || obj.scope_name || obj.key, (val: any) => {
                    val = obj.val_out ? obj.val_out(val) : val
                    if (val === obj.default) {
                        val = null
                    }
                    $location.search(obj.key, val || null)
                    if (obj.post_change) obj.post_change(val)
                })
            )
        },
    }),
])

korpApp.factory("backend", [
    "$http",
    "$q",
    "lexicons",
    ($http: IHttpService, $q: IQService, lexicons: LexiconsService): BackendService => ({
        requestCompare(cmpObj1, cmpObj2, reduce) {
            reduce = _.map(reduce, (item) => item.replace(/^_\./, ""))
            let cl = settings.corpusListing
            // remove all corpora which do not include all the "reduce"-attributes
            const filterFun = (item) => cl.corpusHasAttrs(item, reduce)
            const corpora1 = _.filter(cmpObj1.corpora, filterFun)
            const corpora2 = _.filter(cmpObj2.corpora, filterFun)

            let attrs = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs())
            const split = _.filter(reduce, (r) => (attrs[r] && attrs[r].type) === "set").join(",")

            const rankedReduce = _.filter(reduce, (item) => {
                let attr = cl.getCurrentAttributes(cl.getReduceLang())[item]
                return attr && attr.ranked
            })
            const top = _.map(rankedReduce, (item) => item + ":1").join(",")

            const def: IDeferred<CompareResult> = $q.defer()
            const params = {
                group_by: reduce.join(","),
                set1_corpus: corpora1.join(",").toUpperCase(),
                set1_cqp: cmpObj1.cqp,
                set2_corpus: corpora2.join(",").toUpperCase(),
                set2_cqp: cmpObj2.cqp,
                max: 50,
                split,
                top,
            }

            const conf = httpConfAddMethodAngular({
                url: settings["korp_backend_url"] + "/loglike",
                method: "GET",
                params,
                headers: {},
            })

            _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

            const xhr = $http<KorpResponse<KorpLoglikeResponse>>(conf)

            xhr.then(function (response) {
                const { data } = response

                if ("ERROR" in data) {
                    def.reject()
                    return
                }

                const objs: CompareItemRaw[] = _.map(data.loglike, (value, key) => ({
                    value: key,
                    loglike: value,
                    abs: value > 0 ? data.set2[key] : data.set1[key],
                }))

                const tables = _.groupBy(objs, (obj) => (obj.loglike > 0 ? "positive" : "negative"))

                let max = 0
                const groupAndSum = function (table: CompareItemRaw[]) {
                    // Merge items that are different only by probability suffix ":<number>"
                    const groups = _.groupBy(table, (obj) => obj.value.replace(/(:.+?)(\/|$| )/g, "$2"))
                    const res = _.map(groups, (items, key): CompareItem => {
                        // Add up similar items.
                        const tokenLists = key.split("/").map((tokens) => tokens.split(" "))
                        const loglike = _.sumBy(items, "loglike")
                        const abs = _.sumBy(items, "abs")
                        const elems = items.map((item) => item.value)
                        max = Math.max(max, Math.abs(loglike))
                        return { key, loglike, abs, elems, tokenLists }
                    })
                    return res
                }
                const positive = groupAndSum(tables.positive)
                const negative = groupAndSum(tables.negative)

                return def.resolve([{ positive, negative }, max, cmpObj1, cmpObj2, reduce])
            })

            return def.promise
        },

        relatedWordSearch(lemgram) {
            return lexicons.relatedWordSearch(lemgram)
        },

        requestMapData(cqp, cqpExprs, within, attribute, relative) {
            const cqpSubExprs = {}
            _.map(_.keys(cqpExprs), (subCqp, idx) => (cqpSubExprs[`subcqp${idx}`] = subCqp))

            const params = {
                group_by_struct: attribute.label,
                cqp,
                corpus: attribute.corpora.join(","),
                incremental: true,
                split: attribute.label,
                relative_to_struct: relative ? attribute.label : undefined,
            }
            _.extend(params, settings.corpusListing.getWithinParameters())

            _.extend(params, cqpSubExprs)

            const conf = httpConfAddMethod({
                url: settings["korp_backend_url"] + "/count",
                method: "GET",
                params,
                headers: {},
            })

            _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

            return $http<KorpStatsResponse>(conf).then(
                function ({ data }) {
                    const normalizedData = normalizeStatsData(data) as any // TODO Type correctly
                    let result = parseMapData(normalizedData, cqp, cqpExprs)
                    return { corpora: attribute.corpora, cqp, within, data: result, attribute }
                },
                (err) => {
                    console.log("err", err)
                }
            )
        },

        getDataForReadingMode(inputCorpus, textId) {
            const corpus = inputCorpus.toUpperCase()
            const corpusSettings = settings.corpusListing.get(inputCorpus)

            // TODO: is this good enough?
            const show = _.keys(corpusSettings.attributes)
            const showStruct = _.keys(corpusSettings["struct_attributes"])

            const params = {
                corpus: corpus,
                cqp: `[_.text__id = "${textId}" & lbound(text)]`,
                context: corpus + ":1 text",
                // _head and _tail are needed for all corpora, so that Korp will know what whitespace to use
                // For sentence_id, we should find a more general solution, but here is one Språkbanken
                // corpus who needs sentence_id in order to map the selected sentence in the KWIC to
                // a sentence in the reading mode text.
                show: show.join(",") + ",sentence_id,_head,_tail",
                show_struct: showStruct.join(","),
                within: corpus + ":text",
                start: 0,
                end: 0,
            }

            const conf = httpConfAddMethod({
                url: settings["korp_backend_url"] + "/query",
                method: "GET",
                params,
                headers: {},
            })

            _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

            return $http(conf).then(
                function ({ data }) {
                    return data
                },
                (err) => {
                    console.log("err", err)
                }
            )
        },
    }),
])

/**
 * This service watches the `search` URL param and tells result controllers to send API requests.
 *
 * It also reads the `cqp` URL param (but doesn't watch it).
 * If the search query has meaningfully changed, the result controllers are notified so they can make their API
 * requests.
 *
 */
korpApp.factory("searches", [
    "$location",
    "$rootScope",
    "$q",
    function ($location: LocationService, $rootScope: RootScope, $q: IQService): SearchesService {
        const searches: SearchesService = {
            activeSearch: null,
            langDef: $q.defer(),

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            kwicSearch(cqp: string) {
                $rootScope.$emit("make_request", cqp, this.activeSearch)
            },

            getCqpExpr(): string {
                if (!this.activeSearch) return null
                if (this.activeSearch.type === "word" || this.activeSearch.type === "lemgram")
                    return $rootScope.simpleCQP
                return this.activeSearch.val
            },
        }

        // Watch the `search` URL param
        $rootScope.$watch(
            () => $location.search().search,
            (searchExpr: string) => {
                if (!searchExpr) return

                // The value is a string like <type>|<expr>
                const [type, ...valueSplit] = searchExpr.split("|")
                let value = valueSplit.join("|")

                // Store new query in search history
                // For Extended search, `value` is empty (then the CQP is instead in the `cqp` URL param)
                if (value) {
                    const historyValue = type === "lemgram" ? unregescape(value) : value
                    updateSearchHistory(historyValue, $location.absUrl())
                }
                $q.all([searches.langDef.promise, $rootScope.globalFilterDef.promise]).then(function () {
                    if (type === "cqp") {
                        if (!value) {
                            value = $location.search().cqp
                        }
                    }
                    // Update stored search query
                    if (["cqp", "word", "lemgram"].includes(type)) {
                        searches.activeSearch = { type, val: value }
                    }

                    // For Extended/Advanced search, merge with global filters and trigger API requests
                    // (For Simple search, the equivalent is handled in the simple-search component)
                    if (type === "cqp") {
                        if ($rootScope.globalFilter) {
                            value = stringify(mergeCqpExprs(parse(value || "[]"), $rootScope.globalFilter))
                        }
                        searches.kwicSearch(value)
                    }
                })
            }
        )

        return searches
    },
])

export class CompareSearches {
    key: "saved_searches" | `saved_searches_${string}`
    savedSearches: SavedSearch[]

    constructor() {
        this.key = currentMode !== "default" ? `saved_searches_${currentMode}` : "saved_searches"
        this.savedSearches = localStorageGet(this.key) || []
    }

    saveSearch(name: string, cqp: string): void {
        const searchObj = {
            label: name || cqp,
            cqp,
            corpora: settings.corpusListing.getSelectedCorpora(),
        }
        this.savedSearches.push(searchObj)
        localStorageSet(this.key, this.savedSearches)
    }

    flush(): void {
        this.savedSearches = []
        localStorageSet(this.key, this.savedSearches)
    }
}

korpApp.service("compareSearches", CompareSearches)

korpApp.factory("lexicons", [
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
                            const headers = authenticationProxy.getAuthorizationHeader()
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
