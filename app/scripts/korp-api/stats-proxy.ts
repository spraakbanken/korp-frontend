/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy, { AjaxSettings } from "@/korp-api/base-proxy"
import { angularLocationSearch, httpConfAddMethod } from "@/util"
import { statisticsService } from "@/statistics"

export function normalizeStatsData(data) {
    if (!_.isArray(data.combined)) {
        data.combined = [data.combined]
    }

    for (let [corpusID, obj] of _.toPairs(data.corpora)) {
        if (!_.isArray(obj)) {
            data.corpora[corpusID] = [obj]
        }
    }
}

export default class StatsProxy extends BaseProxy {
    prevParams: KorpStatsParams | null
    prevRequest: AjaxSettings | null
    prevUrl?: string

    constructor() {
        super()
        this.prevRequest = null
        this.prevParams = null
    }

    makeParameters(reduceVals, cqp, ignoreCase): KorpStatsParams {
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        const groupBy = []
        const groupByStruct = []
        for (let reduceVal of reduceVals) {
            if (
                structAttrs[reduceVal] &&
                (structAttrs[reduceVal]["group_by"] || "group_by_struct") == "group_by_struct"
            ) {
                groupByStruct.push(reduceVal)
            } else {
                groupBy.push(reduceVal)
            }
        }
        const parameters = {
            group_by: groupBy.join(","),
            group_by_struct: groupByStruct.join(","),
            cqp: this.expandCQP(cqp),
            corpus: settings.corpusListing.stringifySelected(true),
            incremental: true,
        }
        _.extend(parameters, settings.corpusListing.getWithinParameters())
        if (ignoreCase) {
            _.extend(parameters, { ignore_case: "word" })
        }
        return parameters
    }

    makeRequest(cqp: string, callback): JQuery.Promise<KorpStatsResponse> {
        const self = this
        this.resetRequest()
        const reduceval = angularLocationSearch().stats_reduce || "word"
        const reduceVals = reduceval.split(",")

        const ignoreCase = angularLocationSearch().stats_reduce_insensitive != null

        const reduceValLabels = _.map(reduceVals, function (reduceVal) {
            if (reduceVal === "word") {
                return settings["word_label"]
            }
            const maybeReduceAttr = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[
                reduceVal
            ]
            if (maybeReduceAttr) {
                return maybeReduceAttr.label
            } else {
                return settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())[reduceVal].label
            }
        })

        const data = this.makeParameters(reduceVals, cqp, ignoreCase)
        // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
        const originalCorpora = settings.corpusListing.stringifySelected(false)

        const wordAttrs = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        data.split = _.filter(reduceVals, (reduceVal) => {
            return (
                (wordAttrs[reduceVal] && wordAttrs[reduceVal].type == "set") ||
                (structAttrs[reduceVal] && structAttrs[reduceVal].type == "set")
            )
        }).join(",")

        const rankedReduceVals = _.filter(reduceVals, (reduceVal) => {
            if (wordAttrs[reduceVal]) {
                return wordAttrs[reduceVal].ranked
            }
        })
        data.top = _.map(rankedReduceVals, (reduceVal) => reduceVal + ":1").join(",")

        this.prevParams = data
        const def: JQuery.Deferred<KorpStatsResponse> = $.Deferred()

        const ajaxSettings: AjaxSettings = {
            url: settings["korp_backend_url"] + "/count",
            data,
            beforeSend(req, settings) {
                self.prevRequest = settings
                self.addAuthorizationHeader(req)
                self.prevUrl = self.makeUrlWithParams(this.url, data)
            },

            error(jqXHR, textStatus, errorThrown) {
                console.log(`gettings stats error, status: ${textStatus}`)
                return def.reject(textStatus, errorThrown)
            },

            progress(data, e) {
                const progressObj = self.calcProgress(e)
                if (progressObj == null) {
                    return
                }
                if (typeof callback === "function") {
                    callback(progressObj)
                }
            },

            success: (data) => {
                self.cleanup()
                if (data.ERROR != null) {
                    console.log("gettings stats failed with error", data.ERROR)
                    def.reject(data)
                    return
                }
                normalizeStatsData(data)
                statisticsService.processData(def, originalCorpora, data, reduceVals, reduceValLabels, ignoreCase, cqp)
            },
        }
        this.pendingRequests.push($.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<KorpStatsResponse>)

        return def.promise()
    }
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count/get */
type KorpStatsParams = {
    /** Corpus names, separated by comma */
    corpus: string
    /** CQP query */
    cqp: string
    /** Positional attribute by which the hits should be grouped. Defaults to "word" if neither `group_by` nor `group_by_struct` is defined */
    group_by?: string
    /** Structural attribute by which the hits should be grouped. The value for the first token of the hit will be used */
    group_by_struct?: string
    /** Prevent search from crossing boundaries of the given structural attribute, e.g. 'sentence'. */
    default_within?: string
    /** Like default_within, but for specific corpora, overriding the default. Specified using the format 'corpus:attribute' */
    within?: string
    ignore_case?: string
    relative_to_struct?: string
    split?: string
    top?: string
    [cqpn: `cqp${number}`]: string
    expand_prequeries?: boolean
    [subcqpn: `subcqp${number}`]: string
    start?: number
    end?: number
    /** Incrementally return progress updates when the calculation for each corpus is finished */
    incremental?: boolean
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1count/get */
type KorpStatsResponse = {
    corpora: {
        [name: string]: StatsColumn
    }
    combined: StatsColumn
    /** Total number of different values */
    count: number
    /** Execution time in seconds */
    time: number
}

type StatsColumn = {
    sums: AbsRelTuple
    rows: StatsRow[]
}

type AbsRelTuple = { absolute: number; relative: number }

type StatsRow = AbsRelTuple & {
    value: Record<string, string | string[]>
}
