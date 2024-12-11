/** @format */
import _ from "lodash"
import { SavedSearch } from "@/local-storage"
import settings from "@/settings"
import { normalizeStatsData } from "@/backend/stats-proxy"
import { MapResult, parseMapData } from "@/map_services"
import { korpRequest } from "./common"
import { Response, WithinParameters } from "./types"
import { QueryResponse } from "./types/query"
import { CountParams } from "./types/count"

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

/** Note: since this is using native Promise, we must use it with something like $q or $scope.$apply for AngularJS to react when they resolve. */
export async function requestCompare(
    cmpObj1: SavedSearch,
    cmpObj2: SavedSearch,
    reduce: string[]
): Promise<CompareResult> {
    reduce = _.map(reduce, (item) => item.replace(/^_\./, ""))
    let cl = settings.corpusListing
    // remove all corpora which do not include all the "reduce"-attributes
    const corpora1 = cmpObj1.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))
    const corpora2 = cmpObj2.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))

    const attrs = { ...cl.getCurrentAttributes(), ...cl.getStructAttrs() }
    const split = reduce.filter((r) => (attrs[r] && attrs[r].type) === "set").join(",")

    const rankedReduce = _.filter(reduce, (item) => cl.getCurrentAttributes(cl.getReduceLang())[item]?.ranked)
    const top = rankedReduce.map((item) => item + ":1").join(",")

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

    const data = await korpRequest("loglike", params)

    if ("ERROR" in data) {
        // TODO Create a KorpBackendError which could be displayed nicely
        throw new Error(data.ERROR.value)
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

    return [{ positive, negative }, max, cmpObj1, cmpObj2, reduce]
}

export async function requestMapData(
    cqp: string,
    cqpExprs: Record<string, string>,
    within: WithinParameters,
    attribute: MapAttribute,
    relative?: boolean
): Promise<MapRequestResult> {
    const params: CountParams = {
        group_by_struct: attribute.label,
        cqp,
        corpus: attribute.corpora.join(","),
        incremental: true,
        split: attribute.label,
        relative_to_struct: relative ? attribute.label : undefined,
        ...settings.corpusListing.getWithinParameters(),
    }

    Object.keys(cqpExprs).map((cqp, i) => (params[`subcqp${i}`] = cqp))

    const data = await korpRequest("count", params)

    if ("ERROR" in data) {
        // TODO Create a KorpBackendError which could be displayed nicely
        throw new Error(data.ERROR.value)
    }

    const normalizedData = normalizeStatsData(data) as any // TODO Type correctly
    let result = parseMapData(normalizedData, cqp, cqpExprs)
    return { corpora: attribute.corpora, cqp, within, data: result, attribute }
}

export async function getDataForReadingMode(inputCorpus: string, textId: string): Promise<Response<QueryResponse>> {
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

    return korpRequest("query", params)
}
