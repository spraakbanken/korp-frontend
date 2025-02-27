/** @format */
import { memoize, omit } from "lodash"
import settings from "@/settings"
import timeProxyFactory from "./backend/time-proxy"

/** Fetch and process time data for all corpora in the mode. */
export const getTimeData: () => Promise<[[number, number][], number] | undefined> = memoize(async () => {
    if (!settings.has_timespan) return undefined

    const timeProxy = timeProxyFactory.create()
    const [dataByCorpus, combined, rest] = await timeProxy.makeRequest()

    if (combined.length == 0) return [[], 0]

    // this adds data to the corpora in settings
    for (const [id, struct] of Object.entries(dataByCorpus)) {
        const corpus = settings.corpora[id.toLowerCase()]
        timeProxy.expandTimeStruct(struct)
        corpus.non_time = struct[""]
        corpus.time = omit(struct, "")
        // Enable the special date interval search attribute for corpora that have some timestamped data
        if (Object.keys(corpus.time).length > 1) {
            corpus.common_attributes ??= {}
            corpus.common_attributes.date_interval = true
        }
    }
    timeData = [combined, rest]
    return [combined, rest]
})

/**
 * Time data, if available.
 *
 * This gets set in `getTimeData()`, so make sure to await that before using this.
 */
export let timeData: [[number, number][], number] | undefined
