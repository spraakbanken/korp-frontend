/** @format */
import _ from "lodash"
import settings from "@/settings"
import type { ProgressHandler } from "@/backend/types"
import { StatisticsProcessed } from "@/statistics.types"
import { locationSearchGet, Factory } from "@/util"
import { statisticsService } from "@/statistics"
import { CountParams, CountResponse, StatsColumn } from "./types/count"
import { korpRequest } from "./common"
import BaseProxy from "./base-proxy"

export type StatsResult = StatisticsProcessed & {
    /** Total number of rows before possibly limited by configured max. */
    rowCount: number
}

/** Like `CountResponse` but the stats are necessarily arrays. */
export type StatsNormalized = CountResponse & {
    corpora: {
        [name: string]: StatsColumn[]
    }
    combined: StatsColumn[]
}

/**
 * Stats in the response can be split by subqueries if the `subcqp#` param is used, but otherwise not.
 *
 * This function adds a split (converts non-arrays to single-element arrays) if not, so higher code can assume the same shape regardless.
 */
export function normalizeStatsData(data: CountResponse): StatsNormalized {
    const combined = Array.isArray(data.combined) ? data.combined : [data.combined]
    const corpora = _.mapValues(data.corpora, (stats) => (Array.isArray(stats) ? stats : [stats]))
    return { ...data, combined, corpora }
}

export class StatsProxy extends BaseProxy {
    prevParams: CountParams | null = null

    async makeRequest(cqp: string, onProgress: ProgressHandler<"count">): Promise<StatsResult> {
        this.resetRequest()
        const abortSignal = this.abortController.signal

        const reduceVals = (locationSearchGet("stats_reduce") || "word").split(",")
        const ignoreCase = locationSearchGet("stats_reduce_insensitive") != null

        // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
        const originalCorpora: string = settings.corpusListing.stringifySelected(false)

        const wordAttrs = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        /** Configs of reduced attributes keyed by name, excluding "word" */
        const attrs = _.pick({ ...wordAttrs, ...structAttrs }, reduceVals)

        const missingAttrs = reduceVals.filter((name) => !attrs[name] && name != "word")
        if (missingAttrs.length) throw new Error(`Trying to reduce by missing attribute ${missingAttrs}`)

        const labels = reduceVals.map((name) => (name == "word" ? settings["word_label"] : attrs[name]?.label))

        // Struct attrs go in the `group_by_struct` param, except if they have `group_by: group_by`.
        const isStruct = (name: string) => structAttrs[name] && structAttrs[name]["group_by"] != "group_by"
        const [groupByStruct, groupBy] = _.partition(reduceVals, isStruct)

        const withinParams = settings.corpusListing.getWithinParameters()
        // Replace "ABC-aa|ABC-bb:link" with "ABC-aa:link"
        if (settings.parallel) withinParams.within = withinParams.within?.replace(/\|.*?:/g, ":")

        const params: CountParams = {
            group_by: groupBy.join(),
            group_by_struct: groupByStruct.join(),
            cqp: this.expandCQP(cqp),
            corpus: settings.corpusListing.stringifySelected(true),
            end: settings["statistics_limit"] ? settings["statistics_limit"] - 1 : undefined,
            ignore_case: ignoreCase ? "word" : undefined,
            incremental: true,
            split: reduceVals.filter((name) => attrs[name]?.type == "set").join(),
            // For ranked attributes, only count the top-ranking value in a token.
            top: reduceVals.filter((name) => attrs[name]?.ranked).join(),
            ...withinParams,
        }

        this.prevParams = params
        const data = await korpRequest("count", params, { abortSignal, onProgress })

        const normalizedData = normalizeStatsData(data)
        const dataProcessed = await statisticsService.processData(
            originalCorpora,
            normalizedData,
            reduceVals,
            labels,
            ignoreCase,
            cqp
        )

        return { ...dataProcessed, rowCount: data.count }
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
