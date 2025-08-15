/** @format */
import _ from "lodash"
import settings from "@/settings"
import { Factory } from "@/util"
import { CountParams, CountsMerged } from "./types/count"
import ProxyBase from "./proxy-base"
import { expandCqp } from "@/cqp_parser/cqp"

export type StatsProxyInput = [string, string[], string | undefined, boolean | undefined]

export class StatsProxy extends ProxyBase<"count"> {
    protected readonly endpoint = "count"
    prevParams: CountParams | null = null

    protected buildParams(cqp: string, attrs: string[], defaultWithin?: string, ignoreCase?: boolean): CountParams {
        /** Configs of reduced attributes keyed by name, excluding "word" */
        const attributes = _.pick(settings.corpusListing.getReduceAttrs(), attrs)

        const missingAttrs = attrs.filter((name) => !attributes[name] && name != "word")
        if (missingAttrs.length) throw new Error(`Trying to reduce by missing attribute ${missingAttrs}`)

        // Struct attrs go in the `group_by_struct` param, except if they have `group_by: group_by`.
        const isStruct = (name: string) =>
            attributes[name]?.["is_struct_attr"] && attributes[name]["group_by"] != "group_by"
        const [groupByStruct, groupBy] = _.partition(attrs, isStruct)

        let within = settings.corpusListing.getWithinParam(defaultWithin)
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
            default_within: defaultWithin,
            within,
        }

        this.prevParams = params
        return params
    }

    async makeRequest(
        cqp: string,
        attrs: string[],
        defaultWithin?: string,
        ignoreCase?: boolean
    ): Promise<CountsMerged> {
        const params = this.buildParams(cqp, attrs, defaultWithin, ignoreCase)
        // We know it's the merged type, not split, because we are not using `subcqp{N}` params.
        return (await this.send(params)) as CountsMerged
    }
}

const statsProxyFactory = new Factory(StatsProxy)
export default statsProxyFactory
