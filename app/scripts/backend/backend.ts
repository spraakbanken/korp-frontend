/** @format */
import _ from "lodash"
import angular, { IDeferred, IHttpService, IPromise, IQService } from "angular"
import { getAuthorizationHeader } from "@/components/auth/auth"
import { KorpResponse, WithinParameters } from "@/backend/types"
import { SavedSearch } from "@/local-storage"
import settings from "@/settings"
import { httpConfAddMethod, httpConfAddMethodAngular } from "@/util"
import { KorpStatsResponse, normalizeStatsData } from "@/backend/stats-proxy"
import { MapResult, parseMapData } from "@/map_services"
import { KorpQueryResponse } from "@/backend/kwic-proxy"
import "@/backend/lexicons"

export type BackendService = {
    requestCompare: (cmpObj1: SavedSearch, cmpObj2: SavedSearch, reduce: string[]) => IPromise<CompareResult>
    requestMapData: (
        cqp: string,
        cqpExprs: Record<string, string>,
        within: WithinParameters,
        attribute: MapAttribute,
        relative: boolean
    ) => IPromise<MapRequestResult | void>
    getDataForReadingMode: (inputCorpus: string, textId: string) => IPromise<KorpResponse<KorpQueryResponse> | void>
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

export type MapRequestResult = {
    corpora: string[]
    cqp: string
    within: WithinParameters
    data: MapResult[]
    attribute: MapAttribute
}
type MapAttribute = { label: string; corpora: string[] }

angular.module("korpApp").factory("backend", [
    "$http",
    "$q",
    "lexicons",
    ($http: IHttpService, $q: IQService): BackendService => ({
        requestCompare(cmpObj1, cmpObj2, reduce) {
            reduce = _.map(reduce, (item) => item.replace(/^_\./, ""))
            let cl = settings.corpusListing
            // remove all corpora which do not include all the "reduce"-attributes
            const corpora1 = cmpObj1.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))
            const corpora2 = cmpObj2.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))

            const attrs = { ...cl.getCurrentAttributes(), ...cl.getStructAttrs() }
            const split = reduce.filter((r) => (attrs[r] && attrs[r].type) === "set").join(",")

            const rankedReduce = _.filter(reduce, (item) => cl.getCurrentAttributes(cl.getReduceLang())[item]?.ranked)
            const top = rankedReduce.map((item) => item + ":1").join(",")

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
                headers: getAuthorizationHeader(),
            })

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
                headers: getAuthorizationHeader(),
            })

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
                headers: getAuthorizationHeader(),
            })

            return $http<KorpResponse<KorpQueryResponse>>(conf).then(
                (response) => response.data,
                (err) => {
                    console.log("err", err)
                }
            )
        },
    }),
])
