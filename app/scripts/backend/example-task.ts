/** @format */
import settings from "@/settings"
import { pageToRange } from "./common"
import { QueryParams } from "./types/query"

export class ExampleTask {
    constructor(readonly queryParams: QueryParams, public isReading?: boolean) {}

    getParams(page: number, hpp: number, inOrder?: boolean, within?: string): QueryParams {
        const { start, end } = pageToRange(page || 0, hpp)
        const opts = {
            ...this.queryParams,
            in_order: inOrder,
            start,
            end,
            // example tab cannot handle incremental
            incremental: false,
        }

        const preferredContext = this.isReading
            ? settings["default_reading_context"]
            : settings["default_overview_context"]
        const avoidContext = this.isReading ? settings["default_overview_context"] : settings["default_reading_context"]
        opts.default_context = preferredContext
        opts.context = settings.corpusListing.getContextParam(preferredContext, avoidContext, opts.corpus?.split(","))

        opts.default_within ??= within
        opts.within = settings.corpusListing.getWithinParam(opts.default_within)
        return opts
    }
}
