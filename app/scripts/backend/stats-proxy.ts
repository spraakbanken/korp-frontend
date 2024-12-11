/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { Response, ProgressResponse, ProgressReport } from "@/backend/types"
import { StatisticsWorkerResult } from "@/statistics.types"
import { locationSearchGet, httpConfAddMethod, Factory } from "@/util"
import { statisticsService } from "@/statistics"
import { AjaxSettings } from "@/jquery.types"
import { CountParams, CountResponse, StatsColumn, StatsNormalized } from "./types/count"

/**
 * Stats in the response can be split by subqueries if the `subcqp#` param is used, but otherwise not.
 *
 * This function adds a split (converts non-arrays to single-element arrays) if not, so higher code can assume the same shape regardless.
 */
export function normalizeStatsData(data: CountResponse): StatsNormalized {
    const combined = !Array.isArray(data.combined) ? [data.combined] : data.combined

    const corpora: Record<string, StatsColumn[]> = {}
    for (let [corpusID, obj] of _.toPairs(data.corpora)) {
        if (!Array.isArray(obj)) {
            corpora[corpusID] = [obj]
        }
    }

    return { ...data, combined, corpora }
}

export class StatsProxy extends BaseProxy<CountResponse> {
    prevParams: CountParams | null
    prevRequest: AjaxSettings | null
    prevUrl?: string

    constructor() {
        super()
        this.prevRequest = null
        this.prevParams = null
    }

    makeParameters(reduceVals: string[], cqp: string, ignoreCase: boolean): CountParams {
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        const groupBy: string[] = []
        const groupByStruct: string[] = []
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

    makeRequest(
        cqp: string,
        callback: (data: ProgressReport<CountResponse>) => void
    ): JQuery.Promise<StatisticsWorkerResult> {
        const self = this
        this.resetRequest()
        const reduceval = locationSearchGet("stats_reduce") || "word"
        const reduceVals = reduceval.split(",")

        const ignoreCase = locationSearchGet("stats_reduce_insensitive") != null

        const reduceValLabels = _.map(reduceVals, function (reduceVal) {
            if (reduceVal === "word") {
                return settings.word_label
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

        const url = settings.korp_backend_url + "/count"
        const ajaxSettings: AjaxSettings<Response<CountResponse>> = {
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

            success: (data: Response<CountResponse>) => {
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
        this.pendingRequests.push($.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<CountResponse>)

        return def.promise()
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
