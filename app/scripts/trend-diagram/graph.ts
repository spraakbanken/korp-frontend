/** @format */
import moment from "moment"
import { getEmptyIntervals, getSeriesData, Level, PALETTE, Series } from "./util"
import { last as _last, isArray, maxBy, minBy } from "lodash"
import { CountTimeResponse, GraphStats, GraphStatsCqp } from "@/backend/types/count-time"

// Rickshaw graph
// The https://www.npmjs.com/package/@types/rickshaw lib just says `any`
export type Graph = {
    series: Series[]
    [key: string]: any
}

export function makeSeries(
    Rickshaw: any,
    data: CountTimeResponse,
    zoom: Level,
    cqp: string,
    subqueries: [string, string][]
) {
    const createTotalSeries = (stats: GraphStats) => ({
        data: getSeriesData(stats.relative, zoom),
        color: "steelblue",
        name: "&Sigma;",
        cqp,
        abs_data: getSeriesData(stats.absolute, zoom),
    })

    const labels = Object.fromEntries(subqueries)
    const createSubquerySeries = (stats: GraphStatsCqp, i: number) => ({
        data: getSeriesData(stats.relative, zoom),
        color: PALETTE[i % PALETTE.length],
        name: labels[stats.cqp],
        cqp: stats.cqp,
        abs_data: getSeriesData(stats.absolute, zoom),
    })

    const series: Series[] = isArray(data.combined)
        ? data.combined.map((item, i) => ("cqp" in item ? createSubquerySeries(item, i) : createTotalSeries(item)))
        : [createTotalSeries(data.combined)]

    Rickshaw.Series.zeroFill(series)

    const emptyIntervals = getEmptyIntervals(series[0].data)
    series[0].emptyIntervals = emptyIntervals

    for (let s of series) {
        s.data = s.data.filter((item) => item.y !== null)
        s.abs_data = s.abs_data.filter((item) => item.y !== null)
    }

    return series
}

/** Replace a part of the graph with new data (of a higher/lower resolution) */
export function spliceGraphData(graph: Graph, newSeries: Series[]) {
    for (let seriesIndex = 0; seriesIndex < graph.series.length; seriesIndex++) {
        const seriesObj = graph.series[seriesIndex]
        const first = newSeries[seriesIndex].data[0].x
        const last = _last(newSeries[seriesIndex].data)!.x

        // Walk through old data, match timestamps with new data and find out what part to replace
        let startSplice = false
        let from = 0
        // Default to replacing everything in case counting fails?
        let n_elems = seriesObj.data.length + newSeries[seriesIndex].data.length
        let j = 0
        for (let i = 0; i < seriesObj.data.length; i++) {
            const { x } = seriesObj.data[i]
            if (x >= first && !startSplice) {
                // Overlapping range starts here
                startSplice = true
                from = i
            }
            if (startSplice) {
                // Count number of elements to replace
                j++
                // Stop counting at end of new data
                if (x >= last) {
                    n_elems = j
                    break
                }
            }
        }

        // Replace overlap with new data
        seriesObj.data.splice(from, n_elems, ...newSeries[seriesIndex].data)
        seriesObj.abs_data.splice(from, n_elems, ...newSeries[seriesIndex].abs_data)
    }
}

/** Get spaces in graph where there is no dated material */
export function getEmptyBlocks(graph: Graph, zoom: Level): { left: number; width: number }[] {
    const emptyIntervals = graph.series[0].emptyIntervals!
    const [from, to]: number[] = graph.renderer.domain().x

    const unitSpan = moment.unix(to).diff(moment.unix(from), zoom)
    const unitWidth = graph.width / unitSpan

    return emptyIntervals.map((list) => {
        const max = maxBy(list, "x")!
        const min = minBy(list, "x")!
        const from = graph.x(min.x)
        const to = graph.x(max.x)

        return {
            left: from - unitWidth / 2,
            width: to - from + unitWidth,
        }
    })
}
