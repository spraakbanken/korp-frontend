/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { ProgressHandler } from "@/backend/types"
import { StatisticsWorkerResult } from "@/statistics.types"
import { locationSearchGet, Factory } from "@/util"
import { statisticsService } from "@/statistics"
import { CountParams, CountResponse, StatsColumn } from "./types/count"
import { korpRequest } from "./common"

/** Like `CountResponse` but the stats are necessarily arrays. */
export type StatsNormalized = {
    corpora: {
        [name: string]: StatsColumn[]
    }
    combined: StatsColumn[]
    count: number
    time: number
}

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

export class StatsProxy extends BaseProxy<"count"> {
    prevParams: CountParams | null

    constructor() {
        super()
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

    async makeRequest(cqp: string, onProgress: ProgressHandler<"count">): Promise<StatisticsWorkerResult> {
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

        const params = this.makeParameters(reduceVals, cqp, ignoreCase)
        // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
        const originalCorpora: string = settings.corpusListing.stringifySelected(false)

        const wordAttrs = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        params.split = _.filter(reduceVals, (reduceVal) => {
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
        params.top = _.map(rankedReduceVals, (reduceVal) => reduceVal + ":1").join(",")

        this.prevParams = params

        const data = await korpRequest("count", params, { onProgress: onProgress })
        // TODO pendingRequests, abort

        const normalizedData = normalizeStatsData(data)
        return statisticsService.processData(
            originalCorpora,
            normalizedData,
            reduceVals,
            reduceValLabels,
            ignoreCase,
            cqp
        )
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
