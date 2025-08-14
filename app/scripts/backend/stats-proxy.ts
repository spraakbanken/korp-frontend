/** @format */
import _ from "lodash"
import settings from "@/settings"
import type { ProgressHandler } from "@/backend/types"
import { Factory } from "@/util"
import { CountParams, CountResponse, CountsMerged, CountsSplit } from "./types/count"
import { korpRequest } from "./common"
import Abortable from "./base-proxy"
import { expandCqp } from "@/cqp_parser/cqp"

export class StatsProxy extends Abortable {
    prevParams: CountParams | null = null

    async makeRequest(
        cqp: string,
        attrs: string[],
        options: { defaultWithin?: string; ignoreCase?: boolean; onProgress?: ProgressHandler<"count"> } = {}
    ): Promise<CountsMerged> {
        const { ignoreCase, onProgress } = options
        this.abort()

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
            cqp: expandCqp(cqp),
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
        const abortSignal = this.getAbortSignal()
        const data = await korpRequest("count", params, { abortSignal, onProgress })
        // Since we are not using the `subcqp{N}` parameter, we know the result is not split by subqueries.
        return data as CountsMerged
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
