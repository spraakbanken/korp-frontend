/** @format */
import _ from "lodash"
import settings from "@/settings"
import type { ProgressHandler } from "@/backend/types"
import { Factory } from "@/util"
import { CountParams, CountResponse, CountsSplit } from "./types/count"
import { korpRequest } from "./common"
import BaseProxy from "./base-proxy"

/**
 * Stats in the response can be split by subqueries if the `subcqp#` param is used, but otherwise not.
 *
 * This function adds a split (converts non-arrays to single-element arrays) if not, so higher code can assume the same shape regardless.
 */
export function normalizeStatsData(data: CountResponse): CountsSplit {
    const combined = Array.isArray(data.combined) ? data.combined : [data.combined]
    const corpora = _.mapValues(data.corpora, (stats) => (Array.isArray(stats) ? stats : [stats]))
    return { ...data, combined, corpora }
}

export class StatsProxy extends BaseProxy {
    prevParams: CountParams | null = null

    async makeRequest(
        cqp: string,
        attrs: string[],
        options: { defaultWithin?: string; ignoreCase?: boolean; onProgress?: ProgressHandler<"count"> } = {}
    ): Promise<CountsSplit> {
        const { ignoreCase, onProgress } = options
        this.resetRequest()
        const abortSignal = this.abortController.signal

        /** Configs of reduced attributes keyed by name, excluding "word" */
        const attributes = _.pick(settings.corpusListing.getReduceAttrs(), attrs)

        const missingAttrs = attrs.filter((name) => !attributes[name] && name != "word")
        if (missingAttrs.length) throw new Error(`Trying to reduce by missing attribute ${missingAttrs}`)

        // Struct attrs go in the `group_by_struct` param, except if they have `group_by: group_by`.
        const isStruct = (name: string) =>
            attributes[name]?.["is_struct_attr"] && attributes[name]["group_by"] != "group_by"
        const [groupByStruct, groupBy] = _.partition(attrs, isStruct)

        let within = settings.corpusListing.getWithinParam(options.defaultWithin)
        // Replace "ABC-aa|ABC-bb:link" with "ABC-aa:link"
        if (settings.parallel) within = within?.replace(/\|.*?:/g, ":")

        const params: CountParams = {
            group_by: groupBy.join(),
            group_by_struct: groupByStruct.join(),
            cqp: this.expandCQP(cqp),
            corpus: settings.corpusListing.stringifySelected(true),
            end: settings["statistics_limit"] ? settings["statistics_limit"] - 1 : undefined,
            ignore_case: ignoreCase ? "word" : undefined,
            incremental: true,
            split: attrs.filter((name) => attributes[name]?.type == "set").join(),
            // For ranked attributes, only count the top-ranking value in a token.
            top: attrs.filter((name) => attributes[name]?.ranked).join(),
            default_within: options.defaultWithin,
            within,
        }

        this.prevParams = params
        const data = await korpRequest("count", params, { abortSignal, onProgress })
        return normalizeStatsData(data)
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
