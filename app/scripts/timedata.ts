/** @format */
import { memoize, omit, range } from "lodash"
import settings from "@/settings"
import { Histogram } from "./backend/types"
import { korpRequest } from "./backend/common"

/**
 * Time data, if available.
 *
 * This gets set in `getTimeData()`, so make sure to await that before using this.
 */
export let timeData: [[number, number][], number] | undefined

/** Fetch and process time data for all corpora in the mode. */
export const getTimeData: () => Promise<[[number, number][], number] | undefined> = memoize(async () => {
    if (!settings.has_timespan) return undefined

    const corpus = settings.corpusListing.stringifyAll()
    if (!corpus) return undefined

    const data = await korpRequest("timespan", { granularity: "y", corpus })

    const rest = data.combined[""] || 0
    delete data.combined[""]

    expandTimeStruct(data.combined)

    // Re-structure the combined counts as year-count tuples for plotting
    const combined: [number, number][] = Object.entries(data.combined)
        .filter(([key, val]) => key && val)
        .map(([key, val]) => [parseInt(key), val])
    combined.sort((a, b) => a[0] - b[0])
    if (combined.length == 0) return [[], 0]

    addToCorpora(data.corpora)

    // Store time data for non-async use
    timeData = [combined, rest]
    return timeData
})

/** Add each missing year with the previous year's value */
function expandTimeStruct(struct: Histogram): void {
    const years = Object.keys(struct)
        .filter((key) => key !== "")
        .map(Number)
    if (!years.length) return

    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)

    if (Number.isNaN(maxYear) || Number.isNaN(minYear)) {
        console.log("expandTimestruct broken, years:", years)
        return
    }

    let prevCount = struct[`${minYear}`]
    for (const year of range(minYear, maxYear)) {
        if (struct[`${year}`] == undefined) struct[`${year}`] = prevCount
        else prevCount = struct[`${year}`]
    }
}

/** Add time data to corpora */
function addToCorpora(dataByCorpus: Record<string, Histogram>) {
    for (const [id, struct] of Object.entries(dataByCorpus)) {
        const corpus = settings.corpora[id.toLowerCase()]
        expandTimeStruct(struct)
        corpus.non_time = struct[""]
        corpus.time = omit(struct, "")
        // Enable the special date interval search attribute for corpora that have some timestamped data
        if (Object.keys(corpus.time).length > 1) {
            corpus.common_attributes ??= {}
            corpus.common_attributes.date_interval = true
        }
    }

    // Update list of common attributes
    settings.corpusListing.updateAttributes()
}
