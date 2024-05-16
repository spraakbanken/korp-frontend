/** @format */
import _ from "lodash"
import jStorage from "../lib/jstorage"
import settings from "@/settings"
import currentMode from "@/mode"
import model from "@/model"
import * as authenticationProxy from "@/components/auth/auth"
import { parseMapData } from "./map_services"
import { updateSearchHistory } from "@/history"
import { normalizeStatsData } from "@/korp-api/stats-proxy"
import { httpConfAddMethod, httpConfAddMethodAngular, unregescape } from "@/util"
import { mergeCqpExprs, parse, stringify } from "./cqp_parser/cqp"

const korpApp = angular.module("korpApp")

korpApp.factory("utils", [
    "$location",
    ($location) => ({
        valfilter(attrobj) {
            if (attrobj["is_struct_attr"]) {
                return `_.${attrobj.value}`
            } else {
                return attrobj.value
            }
        },

        setupHash(scope, config) {
            const onWatch = () => {
                for (let obj of config) {
                    let val = $location.search()[obj.key]
                    if (val == null) {
                        if ("default" in obj) {
                            val = obj.default
                        } else {
                            if (typeof obj.post_change === "function") {
                                obj.post_change(val)
                            }
                            continue
                        }
                    }

                    val = (obj.val_in || _.identity)(val)

                    if ("scope_name" in obj) {
                        scope[obj.scope_name] = val
                    } else if ("scope_func" in obj) {
                        scope[obj.scope_func](val)
                    } else {
                        scope[obj.key] = val
                    }
                }
            }
            onWatch()
            scope.$watch(
                () => $location.search(),
                () => onWatch()
            )

            for (let obj of config) {
                const watch = obj.expr || obj.scope_name || obj.key
                scope.$watch(
                    watch,
                    ((obj, watch) =>
                        function (val) {
                            val = (obj.val_out || _.identity)(val)
                            if (val === obj.default) {
                                val = null
                            }
                            $location.search(obj.key, val || null)
                            if (typeof obj.post_change === "function") {
                                obj.post_change(val)
                            }
                        })(obj, watch)
                )
            }
        },
    }),
])

korpApp.factory("backend", [
    "$http",
    "$q",
    "lexicons",
    ($http, $q, lexicons) => ({
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

            const def = $q.defer()
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
                params,
                headers: {},
            })

            _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

            const xhr = $http(conf)

            xhr.then(function (response) {
                let max
                const { data } = response

                if (data.ERROR) {
                    def.reject()
                    return
                }

                const loglikeValues = data.loglike

                const objs = _.map(loglikeValues, (value, key) => ({
                    value: key,
                    loglike: value,
                }))

                const tables = _.groupBy(objs, function (obj) {
                    if (obj.loglike > 0) {
                        obj.abs = data.set2[obj.value]
                        return "positive"
                    } else {
                        obj.abs = data.set1[obj.value]
                        return "negative"
                    }
                })

                const groupAndSum = function (table, currentMax) {
                    const groups = _.groupBy(table, (obj) => obj.value.replace(/(:.+?)(\/|$| )/g, "$2"))

                    const res = _.map(_.toPairs(groups), function ([key, value]) {
                        const tokenLists = _.map(key.split("/"), (tokens) => tokens.split(" "))

                        let loglike = 0
                        let abs = 0
                        const cqp = []
                        const elems = []

                        for (let val of value) {
                            abs += val.abs
                            loglike += val.loglike
                            elems.push(val.value)
                        }
                        if (Math.abs(loglike) > currentMax) {
                            currentMax = Math.abs(loglike)
                        }
                        return { key, loglike, abs, elems, tokenLists }
                    })

                    return [res, currentMax]
                }
                ;[tables.positive, max] = groupAndSum(tables.positive, 0)
                ;[tables.negative, max] = groupAndSum(tables.negative, max)

                return def.resolve([tables, max, cmpObj1, cmpObj2, reduce], xhr)
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
                params,
                headers: {},
            })

            _.extend(conf.headers, authenticationProxy.getAuthorizationHeader())

            return $http(conf).then(
                function ({ data }) {
                    normalizeStatsData(data)
                    let result = parseMapData(data, cqp, cqpExprs)
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
    "$http",
    "$q",
    function ($location, $rootScope, $http, $q) {
        class Searches {
            constructor() {
                /**
                 * @typedef ActiveSearch
                 * @property {string} type "word", "lemgram" or "cqp"
                 * @property {string} val
                 */
                /** @type {ActiveSearch | null} */
                this.activeSearch = null

                // is resolved when parallel search controller is loaded
                this.langDef = $q.defer()
            }

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            kwicSearch(cqp) {
                $rootScope.$emit("make_request", cqp, this.activeSearch)
            }
        }

        const searches = new Searches()

        searches.getCqpExpr = function () {
            const search = searches.activeSearch
            let cqpExpr = null
            if (search) {
                if (search.type === "word" || search.type === "lemgram") {
                    cqpExpr = $rootScope.simpleCQP
                } else {
                    cqpExpr = search.val
                }
            }
            return cqpExpr
        }

        // Watch the `search` URL param
        $rootScope.$watch(
            () => $location.search().search,
            (searchExpr) => {
                if (!searchExpr) return

                // The value is a string like <type>|<expr>
                let [type, ...value] = (searchExpr && searchExpr.split("|")) || []
                value = value.join("|")

                // Store new query in search history
                // For Extended search, `value` is empty (then the CQP is instead in the `cqp` URL param)
                if (value) {
                    let historyValue
                    if (type === "lemgram") {
                        historyValue = unregescape(value)
                    } else {
                        historyValue = value
                    }
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

korpApp.service(
    "compareSearches",
    class CompareSearches {
        constructor() {
            if (currentMode !== "default") {
                this.key = `saved_searches_${currentMode}`
            } else {
                this.key = "saved_searches"
            }
            this.savedSearches = jStorage.get(this.key) || []
        }

        saveSearch(name, cqp) {
            const searchObj = {
                label: name || cqp,
                cqp,
                corpora: settings.corpusListing.getSelectedCorpora(),
            }
            this.savedSearches.push(searchObj)
            return jStorage.set(this.key, this.savedSearches)
        }

        flush() {
            this.savedSearches.splice(0, 9e9, ...[].concat([]))
            return jStorage.set(this.key, this.savedSearches)
        }
    }
)

korpApp.factory("lexicons", [
    "$q",
    "$http",
    function ($q, $http) {
        const karpURL = "https://ws.spraakbanken.gu.se/ws/karp/v4"
        return {
            getLemgrams(wf, resources, corporaIDs) {
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
                    .then(function (response) {
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
                            return $http(
                                httpConfAddMethod({
                                    url: settings["korp_backend_url"] + "/lemgram_count",
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

            getSenses(wf) {
                const deferred = $q.defer()

                const args = {
                    q: wf,
                    resource: "saldom",
                    mode: "external",
                }

                $http({
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

                            return $http({
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

            relatedWordSearch(lemgram) {
                const def = $q.defer()
                $http({
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

                        $http({
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
                                const eNodes = _.map(data.hits.hits, (entry) => ({
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
