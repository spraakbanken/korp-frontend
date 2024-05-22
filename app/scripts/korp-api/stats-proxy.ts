/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/korp-api/base-proxy"
import type { AjaxSettings, KorpResponse, ProgressResponse, ProgressCallback } from "@/korp-api/korp-api.types"
import { StatsNormalized, StatsColumn, StatisticsWorkerResult } from "@/statistics.types"
import { locationSearchGet, httpConfAddMethod } from "@/util"
import { statisticsService } from "@/statistics"

/**
 * Stats in the response can be split by subqueries if the `subcqp#` param is used, but otherwise not.
 *
 * This function adds a split (converts non-arrays to single-element arrays) if not, so higher code can assume the same shape regardless.
 */
export function normalizeStatsData(data: KorpStatsResponse): StatsNormalized {
    const combined = !Array.isArray(data.combined) ? [data.combined] : data.combined

    const corpora: Record<string, StatsColumn[]> = {}
    for (let [corpusID, obj] of _.toPairs(data.corpora)) {
        if (!Array.isArray(obj)) {
            corpora[corpusID] = [obj]
        }
    }

    return { ...data, combined, corpora }
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

    makeParameters(reduceVals: string[], cqp: string, ignoreCase: boolean): KorpStatsParams {
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

    makeRequest(cqp: string, callback: ProgressCallback): JQuery.Promise<StatisticsWorkerResult> {
        const self = this
        this.resetRequest()
        const reduceval = locationSearchGet("stats_reduce") || "word"
        const reduceVals = reduceval.split(",")

        const ignoreCase = locationSearchGet("stats_reduce_insensitive") != null

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
        const originalCorpora: string = settings.corpusListing.stringifySelected(false)

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
        const def: JQuery.Deferred<StatisticsWorkerResult> = $.Deferred()

        const url = settings["korp_backend_url"] + "/count"
        const ajaxSettings: AjaxSettings<KorpResponse<KorpStatsResponse>> = {
            url,
            data,
            beforeSend(req, settings) {
                self.prevRequest = settings
                self.addAuthorizationHeader(req)
                self.prevUrl = self.makeUrlWithParams(url, data)
            },

            error(jqXHR, textStatus, errorThrown) {
                console.log(`gettings stats error, status: ${textStatus}`)
                return def.reject(textStatus, errorThrown)
            },

            progress(data: ProgressResponse, e) {
                const progressObj = self.calcProgress(e)
                if (progressObj == null) {
                    return
                }
                if (typeof callback === "function") {
                    callback(progressObj)
                }
            },

            success: (data: KorpResponse<KorpStatsResponse>) => {
                self.cleanup()
                if ("ERROR" in data) {
                    console.log("gettings stats failed with error", data.ERROR)
                    def.reject(data)
                    return
                }
                const normalizedData = normalizeStatsData(data)
                statisticsService.processData(
                    def,
                    originalCorpora,
                    normalizedData,
                    reduceVals,
                    reduceValLabels,
                    ignoreCase,
                    cqp
                )
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
        [name: string]: StatsColumn | StatsColumn[]
    }
    combined: StatsColumn | StatsColumn[]
    /** Total number of different values */
    count: number
    /** Execution time in seconds */
    time: number
}
