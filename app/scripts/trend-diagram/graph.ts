/** @format */
import moment, { Moment } from "moment"
import { findOptimalLevel, formatUnixDate, getEmptyIntervals, getSeriesData, Level, PALETTE, Series } from "./util"
import { last as _last, groupBy, isArray, last, maxBy, minBy, sortedIndexOf, throttle } from "lodash"
import { CountTimeResponse, GraphStats, GraphStatsCqp } from "@/backend/types/count-time"
import { StoreService } from "@/services/store"
import { formatRelativeHits } from "@/util"
import { loc } from "@/i18n"

// Rickshaw graph
// The https://www.npmjs.com/package/@types/rickshaw lib just says `any`
export type Graph = {
    series: Series[]
    [key: string]: any
}

export class TrendGraph {
    readonly graph: Graph
    public hasEmptyIntervals?: boolean
    public loading = true
    readonly preview: any // A Rickshaw preview range slider

    constructor(
        readonly Rickshaw: any,
        protected el: JQLite,
        public series: Series[],
        public zoom: Level,
        protected makeRequest: (from: Moment, to: Moment) => void,
        store: StoreService,
        readonly showTotal = false
    ) {
        const graph: Graph = new Rickshaw.Graph({
            element: $(".chart", el).empty().get(0),
            renderer: "line",
            interpolation: "linear",
            series,
            padding: {
                top: 0.1,
                right: 0.01,
            },
        })
        this.graph = graph

        // Add legend and toggling
        const legendElement = $(".legend", el).get(0)
        const legend = new Rickshaw.Graph.Legend({ element: legendElement, graph })
        new Rickshaw.Graph.Behavior.Series.Toggle({ graph, legend })

        if (!showTotal && $(".legend .line", el).length > 1) {
            $(".legend .line:last .action", el).click()
        }

        new Rickshaw.Graph.HoverDetail({
            // xFormatter and yFormatter are called once for every data series per "hover detail creation"
            // formatter is only called once per per "hover detail creation"
            graph,
            xFormatter(x: number) {
                return `<span data-val='${x}'>${formatUnixDate(zoom, x)}</span>`
            },

            yFormatter(y: number) {
                const val = formatRelativeHits(y, store.lang)
                return `<br>${loc("rel_hits_short", store.lang)} ${val}`
            },
            formatter(series: Series, x: number, y: number, formattedX: string, formattedY: string) {
                let abs_y
                const i = sortedIndexOf(
                    series.data.map((point) => point.x),
                    x
                )
                try {
                    abs_y = series.abs_data[i].y
                } catch (e) {
                    console.log("i", i, x)
                }

                const rel = series.name + ":&nbsp;" + formattedY
                return `<span data-cqp="${encodeURIComponent(series.cqp)}">
                                ${rel}
                                <br>
                                ${loc("abs_hits_short")}: ${abs_y?.toLocaleString(store.lang)}
                            </span>`
            },
        })

        // [first, last] = settings.corpusListing.getTimeInterval()
        // [firstVal, lastVal] = settings.corpusListing.getMomentInterval()

        // TODO: fix decade again
        // timeunit = if last - first > 100 then "decade" else @zoom

        const time = new Rickshaw.Fixtures.Time()
        // Fix time.ceil for decades: Rickshaw.Fixtures.Time.ceil
        // returns one decade too small values for 1900 and before.
        // (The root cause may be Rickshaw's approximate handling of
        // leap years: 1900 was not a leap year.)
        const old_ceil = time.ceil
        time.ceil = (time: number, unit: any) => {
            if (unit.name === "decade") {
                const out = Math.ceil(time / unit.seconds) * unit.seconds
                const mom = moment(out * 1000)
                const monthDay = mom.date()
                // If the day of the month is not 1, it is within the
                // previous month (December), so add enough days to
                // move the date to the expected month (January).
                if (monthDay !== 1) {
                    mom.add(32 - monthDay, "day")
                }
                return mom.unix()
            } else {
                return old_ceil(time, unit)
            }
        }

        const xAxis = new Rickshaw.Graph.Axis.Time({
            graph,
            // Use the fixed .ceil for decades
            timeFixture: time,
            // timeUnit: time.unit("month") # TODO: bring back decade
        })

        this.preview = new Rickshaw.Graph.RangeSlider.Preview({
            graph,
            element: $(".preview", el).get(0),
        })

        $("body").on("mouseup", ".preview .middle_handle", () => {
            this.previewPanStop()
        })

        $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
            if (!this.loading) {
                this.previewPanStop()
            }
        })

        const old_render = xAxis.render
        xAxis.render = throttle(() => {
            old_render.call(xAxis)
            this.drawIntervals()
            const [from, to] = graph.renderer.domain().x
            this.checkZoomLevel(moment.unix(from), moment.unix(to))
        }, 20)

        xAxis.render()

        const yAxis = new Rickshaw.Graph.Axis.Y({
            graph,
        })

        yAxis.render()
    }

    static makeSeries(
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
    spliceGraphData(newSeries: Series[]) {
        for (let seriesIndex = 0; seriesIndex < this.graph.series.length; seriesIndex++) {
            const seriesObj = this.graph.series[seriesIndex]
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

    refresh() {
        this.drawIntervals()
        this.graph.render()
    }

    /** Adds divs with .empty_area to fill spaces in graph where there is no dated material */
    drawIntervals(): void {
        const emptyIntervals = this.getEmptyBlocks()
        this.hasEmptyIntervals = !!emptyIntervals.length
        $(".empty_area", this.el).remove()
        for (const { left, width } of emptyIntervals) {
            $("<div>", { class: "empty_area" }).css({ left, width }).appendTo(this.graph.element)
        }
    }

    /** Get spaces in graph where there is no dated material */
    getEmptyBlocks(): { left: number; width: number }[] {
        const emptyIntervals = this.graph.series[0].emptyIntervals!
        const [from, to]: number[] = this.graph.renderer.domain().x

        const unitSpan = moment.unix(to).diff(moment.unix(from), this.zoom)
        const unitWidth = this.graph.width / unitSpan

        return emptyIntervals.map((list) => {
            const max = maxBy(list, "x")!
            const min = minBy(list, "x")!
            const from = this.graph.x(min.x)
            const to = this.graph.x(max.x)

            return {
                left: from - unitWidth / 2,
                width: to - from + unitWidth,
            }
        })
    }

    /** Change the current zoom level if needed to match a given date range. */
    checkZoomLevel(from: Moment, to: Moment) {
        const newZoom = findOptimalLevel(from, to)
        // Trigger search if new zoom level is different
        if (newZoom && this.zoom !== newZoom) {
            this.zoom = newZoom
            this.makeRequest(from, to)
        }
    }

    previewPanStop() {
        const visibleData = this.graph.stackData()
        const grouped = groupBy(visibleData[0], "zoom")

        for (let zoomLevel in grouped) {
            const points = grouped[zoomLevel]
            if (zoomLevel !== this.zoom) {
                const from = moment.unix(points[0].x)
                from.startOf(this.zoom)
                const to = moment.unix(last(points).x)
                to.endOf(this.zoom)
                this.makeRequest(from, to)
            }
        }
    }
}
