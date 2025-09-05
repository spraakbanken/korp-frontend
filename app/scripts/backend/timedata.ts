import { assignWith, memoize, omit, pickBy, range } from "lodash"
import settings from "@/settings"
import { Histogram } from "./types"
import { korpRequest } from "./common"
import { corpusListing } from "@/corpora/corpus_listing"

/**
 * Time data, if available.
 *
 * This gets set in `getTimeData()`, so make sure to await that before using this.
 */
export let timeData: [[number, number][], number] | undefined

/** Fetch and process time data for all corpora in the mode. */
export const getTimeData: () => Promise<[[number, number][], number] | undefined> = memoize(async () => {
    if (!settings.has_timespan) return undefined

    const corpus = corpusListing.stringifyAll()
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
    corpusListing.updateAttributes()
}

/** Data size per year of all corpora. */
export const getTimeDataPairs = (): [number, number][] => timeData![0]

/** Data size of unknown year in all corpora. */
export const getCountUndated = (): number => timeData![1]

/** Get data size per year of all corpora. */
export const getSeries = () => Object.fromEntries(getTimeDataPairs()) as YearSeries

/** Get data size per year of selected corpora. */
export function getSeriesSelected() {
    // `pickBy` removes zeroes.
    const series = corpusListing.selected.map((corpus) => ("time" in corpus ? pickBy(corpus.time) : {}))
    // Sum the counts by year for each corpora
    return assignWith<YearSeries>({}, ...series, (sum: number | undefined, value: number) => (sum || 0) + value)
}

/** Get data size of unknown year in selected corpora */
export function getCountUndatedSelected() {
    return corpusListing.selected.reduce((sum, corpus) => sum + (corpus["non_time"] || 0), 0)
}

/** Get first and last year in all available corpora. */
export function getSpan(): { min: number; max: number } | undefined {
    const timeData = getTimeDataPairs()
    if (!timeData.length) return undefined
    return { min: timeData[0][0], max: timeData[timeData.length - 1][0] }
}

/** Numeric data by year. */
export type YearSeries = Record<number, number>
