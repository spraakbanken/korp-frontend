/** @format */
import _ from "lodash"
import assignWith from "lodash/assignWith"
import fromPairs from "lodash/fromPairs"
import pickBy from "lodash/pickBy"
import range from "lodash/range"
import settings from "@/settings"
import timeProxyFactory from "./backend/time-proxy"

/** Fetch and process time data for all corpora in the mode. */
export const getTimeData: () => Promise<[[number, number][], number] | undefined> = _.memoize(async () => {
    if (!settings.has_timespan) return undefined

    const timeProxy = timeProxyFactory.create()
    const [dataByCorpus, combined, rest] = await timeProxy.makeRequest()

    if (combined.length == 0) return [[], 0]

    // this adds data to the corpora in settings
    for (const [id, struct] of Object.entries(dataByCorpus)) {
        const corpus = settings.corpora[id.toLowerCase()]
        timeProxy.expandTimeStruct(struct)
        corpus.non_time = struct[""]
        corpus.time = _.omit(struct, "")
        // Enable the special date interval search attribute for corpora that have some timestamped data
        if (Object.keys(corpus.time).length > 1) {
            corpus.common_attributes ??= {}
            corpus.common_attributes.date_interval = true
        }
    }
    timeData = [combined, rest]
    return [combined, rest]
})

/** Time data, if available.
 *
 * This gets set in `getTimeData()` and is then used in some other functions in this module.
 * Make sure to await `getTimeData()` before using any other of these functions.
 */
let timeData: [[number, number][], number] | undefined

/**
 * Find some even points within a range of years.
 *
 * E.g: (1830, 2024) => [1850, 1900, 1950, 2000]
 */
export function calculateYearTicks(min: number, max: number) {
    // Find a reasonable step size
    const step = [1000, 500, 100, 50, 10, 5].find((i) => i <= (max - min) / 2) || 1
    const round = (year: number) => Math.ceil(year / step) * step
    // `range` excludes end value, which is fine because we used `ceil`
    // `max + 1` to have last year included in case `step` is 1
    return range(round(min), round(max + 1), step)
}

/** Data size per year of all corpora. */
export const getTimeDataPairs = (): [number, number][] => timeData![0]

/** Data size of unknown year in all corpora. */
export const getCountUndated = (): number => timeData![1]

/** Get data size per year of all corpora. */
export const getSeries = () => fromPairs(getTimeDataPairs()) as YearSeries

/** Get data size per year of selected corpora. */
export function getSeriesSelected() {
    // `pickBy` removes zeroes.
    const series = settings.corpusListing.selected.map((corpus) => ("time" in corpus ? pickBy(corpus.time) : {}))
    return sumYearSeries(...series)
}

/** Get data size of unknown year in selected corpora */
export function getCountUndatedSelected() {
    return settings.corpusListing.selected.reduce((sum, corpus) => sum + (corpus["non_time"] || 0), 0)
}

/** Get first and last year in all available corpora. */
export function getSpan(): { min: number; max: number } | undefined {
    const timeData = getTimeDataPairs()
    if (!timeData.length) return undefined
    return { min: timeData[0][0], max: timeData[timeData.length - 1][0] }
}

/** Sum numbers by year. */
export const sumYearSeries = (...series: YearSeries[]): YearSeries =>
    assignWith({}, ...series, (sum: number | undefined, value: number) => (sum || 0) + value)

/** Numeric data by year. */
export type YearSeries = Record<number, number>
