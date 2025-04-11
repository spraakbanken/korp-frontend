/** @format */
import angular, { IController, IRootElementService, ITimeoutService } from "angular"
import _ from "lodash"
import moment, { Moment } from "moment"
import CSV from "comma-separated-values/csv"
import settings from "@/settings"
import graphProxyFactory, { GraphProxy } from "@/backend/graph-proxy"
import { expandOperators } from "@/cqp_parser/cqp"
import { formatFrequency, formatRelativeHits, html } from "@/util"
import { loc } from "@/i18n"
import { formatUnixDate, getTimeCqp, GRANULARITIES, parseDate, LEVELS, FORMATS, Level } from "@/trend-diagram/util"
import "@/components/korp-error"
import { GraphTab, RootScope } from "@/root-scope.types"
import { Histogram } from "@/backend/types"
import { JQueryExtended } from "@/jquery.types"
import { CorpusListing } from "@/corpus_listing"
import { CountTimeResponse, GraphStats, GraphStatsCqp } from "@/backend/types/count-time"

type ResultsTrendDiagramController = IController & {
    data: GraphTab
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
    graph?: Graph
    time_grid: Slick.Grid<any>
    hasEmptyIntervals?: boolean
    zoom: Level
    proxy: GraphProxy
    $result: JQLite
    mode: "line" | "bar" | "table"
    error?: string
}

type Series = {
    data: SeriesPoint[]
    abs_data: SeriesPoint[]
    color: string
    name: string
    cqp: string
    emptyIntervals?: SeriesPoint[][]
}

type Point = { x: Moment; y: number }

type SeriesPoint = {
    /** Unix timestamp */
    x: number
    y: number
    zoom: Level
}

// Rickshaw graph
type Graph = {
    series: Series[]
    [key: string]: any
}

type TableRow = {
    label: string
    [timestamp: `${number}${string}`]: [number, number]
}

const PALETTE = [
    "#ca472f",
    "#0b84a5",
    "#f6c85f",
    "#9dd866",
    "#ffa056",
    "#8dddd0",
    "#df9eaa",
    "#6f4e7c",
    "#544e4d",
    "#0e6e16",
    "#975686",
]

angular.module("korpApp").component("resultsTrendDiagram", {
    template: html`
        <korp-error ng-if="$ctrl.error" message="{{$ctrl.error}}"></korp-error>

        <div class="graph_tab" ng-show="!$ctrl.error">
            <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
                <div class="btn-group form_switch">
                    <label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'line'">
                        {{'line' | loc:$root.lang}}
                    </label>
                    <label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'bar'">
                        {{'bar' | loc:$root.lang}}
                    </label>
                    <label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'table'">
                        {{'table' | loc:$root.lang}}
                    </label>
                </div>
                <label ng-if="$ctrl.mode == 'table'">
                    <input type="checkbox" ng-model="$root.statsRelative" />
                    {{"num_results_relative" | loc:$root.lang}}
                    <i
                        class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                        uib-tooltip="{{'relative_help' | loc:$root.lang}}"
                    ></i>
                </label>
            </div>

            <div class="non_time_div">
                <span rel="localize[non_time_before]"></span><span class="non_time"></span
                ><span rel="localize[non_time_after]"></span>
            </div>

            <div class="legend" ng-style='{visibility : !$ctrl.loading && $ctrl.isGraph() ? "visible" : "hidden"}'>
                <div
                    class="line"
                    ng-show="$ctrl.hasEmptyIntervals"
                    uib-tooltip="{{'graph_material_tooltip' | loc:$root.lang}}"
                >
                    <a class="action"></a>
                    <div class="swatch" style="background-color: #999"></div>
                    <span class="label"> <em>{{'graph_material' | loc:$root.lang}} </em></span>
                </div>
            </div>
            <div style="clear: both;"></div>

            <div class="chart_container">
                <div class="preloader" ng-class="{loading: $ctrl.loading}">
                    <i class="fa fa-spinner fa-spin fa-5x"></i>
                </div>
                <div class="chart" ng-show="$ctrl.isGraph()" ng-click="$ctrl.graphClickHandler()"></div>
            </div>

            <div class="preview"></div>

            <div class="time_table" style="margin-top:20px" ng-show="$ctrl.isTable()"></div>

            <div class="exportTimeStatsSection" ng-show="$ctrl.isTable()">
                <select class="timeKindOfData">
                    <option value="relative">{{'statstable_relfigures' | loc:$root.lang}}</option>
                    <option value="absolute">{{'statstable_absfigures' | loc:$root.lang}}</option></select
                ><select class="timeKindOfFormat">
                    <option value="TSV">{{'statstable_exp_tsv' | loc:$root.lang}}</option>
                    <option value="CSV">{{'statstable_exp_csv' | loc:$root.lang}}</option></select
                ><a class="export btn btn-default btn-sm">{{'statstable_export' | loc:$root.lang}}</a>
            </div>
        </div>
    `,
    bindings: {
        data: "<",
        loading: "<",
        setProgress: "<",
    },
    controller: [
        "$rootScope",
        "$timeout",
        "$element",
        function ($rootScope: RootScope, $timeout: ITimeoutService, $element: IRootElementService) {
            const $ctrl = this as ResultsTrendDiagramController
            $ctrl.zoom = "year"
            $ctrl.proxy = graphProxyFactory.create()
            $ctrl.$result = $element.find(".graph_tab")
            $ctrl.mode = "line"

            $ctrl.$onInit = () => {
                const interval = $ctrl.data.corpusListing.getMomentInterval()
                if (!interval) {
                    console.error("No interval")
                    return
                }
                checkZoomLevel(interval[0], interval[1], true)
            }

            $rootScope.$watch("statsRelative", () => {
                if (!$ctrl.time_grid) return
                // Trigger reformatting
                $ctrl.time_grid.setColumns($ctrl.time_grid.getColumns())
            })

            $ctrl.isGraph = () => ["line", "bar"].includes($ctrl.mode)
            $ctrl.isTable = () => $ctrl.mode === "table"

            $ctrl.graphClickHandler = () => {
                const target = $(".chart", $ctrl.$result)
                const time = $(".detail .x_label > span", target).data("val")
                let cqp = $(".detail .item.active > span", target).data("cqp")
                const zoom = $ctrl.zoom

                if (!cqp) {
                    return
                }

                const timecqp = getTimeCqp(time, zoom, LEVELS.indexOf(zoom) < 3)
                const decodedCQP = decodeURIComponent(cqp)
                const opts = {
                    corpus: $ctrl.data.corpusListing.stringifySelected(),
                    cqp: $ctrl.data.cqp,
                    cqp2: expandOperators(decodedCQP),
                    cqp3: timecqp,
                    expand_prequeries: false,
                }

                $rootScope.kwicTabs.push({ queryParams: opts })
            }

            function drawPreloader(from: Moment, to: Moment): void {
                const left = $ctrl.graph ? $ctrl.graph.x(from.unix()) : 0
                const width = $ctrl.graph ? $ctrl.graph.x(to.unix()) - left : "100%"
                $(".preloader", $ctrl.$result).css({ left, width })
            }

            function setZoom(zoom: Level, from: Moment, to: Moment) {
                $ctrl.zoom = zoom
                const fmt = "YYYYMMDDHHmmss"

                drawPreloader(from, to)
                $ctrl.proxy.granularity = GRANULARITIES[zoom]
                makeRequest(
                    $ctrl.data.cqp,
                    $ctrl.data.subcqps,
                    $ctrl.data.corpusListing,
                    $ctrl.data.showTotal,
                    from.format(fmt) as `${number}`,
                    to.format(fmt) as `${number}`
                )
            }

            function checkZoomLevelDefault() {
                if (!$ctrl.graph) {
                    console.error("No graph")
                    return
                }
                const domain = $ctrl.graph.renderer.domain()
                checkZoomLevel(moment.unix(domain.x[0]), moment.unix(domain.x[1]))
            }

            function checkZoomLevel(from: Moment, to: Moment, forceSearch?: boolean) {
                const oldZoom = $ctrl.zoom
                const idealNumHits = 1000
                const newZoom = _.minBy(LEVELS, function (zoom) {
                    const nPoints = to.diff(from, zoom)
                    return Math.abs(idealNumHits - nPoints)
                })!

                if ((newZoom && oldZoom !== newZoom) || forceSearch) {
                    setZoom(newZoom, from, to)
                }
            }

            function fillMissingDate(data: Point[]): Point[] {
                const dateArray = data.map((point) => point.x)
                const min = _.minBy(dateArray, (mom) => mom.toDate())
                const max = _.maxBy(dateArray, (mom) => mom.toDate())

                if (!min || !max) {
                    return data
                }

                // Round range boundaries, e.g. [June 5, Sep 18] => [June 1, Sep 30]
                min.startOf($ctrl.zoom)
                max.endOf($ctrl.zoom)

                // Number of time units between min and max
                const n_diff = moment(max).diff(min, $ctrl.zoom)

                // Create a mapping from unix timestamps to counts
                const momentMapping: Record<number, number> = _.fromPairs(
                    data.map((point) => [moment(point.x).startOf($ctrl.zoom).unix(), point.y])
                )

                // Step through the range and fill in missing timestamps
                /** Copied counts for unseen timestamps in the range */
                const newMoments: Point[] = []
                let lastYVal: number = 0
                for (const i of _.range(0, n_diff + 1)) {
                    const newMoment = moment(min).add(i, $ctrl.zoom)
                    const count = momentMapping[newMoment.unix()]
                    // If this timestamp has been counted, don't fill this timestamp but remember the count
                    // Distinguish between null (no text at timestamp) and undefined (timestamp has not been counted)
                    if (count !== undefined) lastYVal = count
                    // If there's no count here, fill this timestamp with the last seen count
                    else newMoments.push({ x: newMoment, y: lastYVal })
                }

                // Merge actual counts with filled ones
                return [...data, ...newMoments]
            }

            function getSeriesData(data: Histogram, zoom: Level): SeriesPoint[] {
                delete data[""]
                const points: Point[] = _.map(data, (y, date) => ({ x: parseDate($ctrl.zoom, date), y: y! }))
                const pointsFilled = fillMissingDate(points)
                const output: SeriesPoint[] = pointsFilled.map((point) => ({
                    x: point.x.unix(),
                    y: point.y,
                    zoom,
                }))
                output.sort((a, b) => a.x - b.x)
                return output
            }

            /** Percentage of hits that are undated. */
            function getNonTime(): number {
                // TODO: move settings.corpusListing.selected to the subview
                const non_time = _.reduce(
                    _.map(settings.corpusListing.selected, "non_time"),
                    (a, b) => (a || 0) + (b || 0),
                    0
                )
                const sizelist = _.map(settings.corpusListing.selected, (item) => Number(item.info.Size))
                const totalsize = _.reduce(sizelist, (a, b) => a + b, 0)
                return (non_time / totalsize) * 100
            }

            /** Find intervals within the full timespan where no material is dated. */
            function getEmptyIntervals(data: SeriesPoint[]): SeriesPoint[][] {
                const intervals: SeriesPoint[][] = []
                let i = 0

                while (i < data.length) {
                    let item = data[i]

                    if (item.y === null) {
                        const interval = [_.clone(item)]
                        let breaker = true
                        while (breaker) {
                            i++
                            item = data[i]
                            if ((item != null ? item.y : undefined) === null) {
                                interval.push(_.clone(item))
                            } else {
                                intervals.push(interval)
                                breaker = false
                            }
                        }
                    }
                    i++
                }

                return intervals
            }

            /** Adds divs with .empty_area to fill spaces in graph where there is no dated material */
            function drawIntervals(graph: Graph): void {
                const emptyIntervals = graph.series[0].emptyIntervals!
                $ctrl.hasEmptyIntervals = !!emptyIntervals.length
                const [from, to]: number[] = graph.renderer.domain().x

                const unitSpan = moment.unix(to).diff(moment.unix(from), $ctrl.zoom)
                const unitWidth = graph.width / unitSpan

                $(".empty_area", $ctrl.$result).remove()
                for (const list of emptyIntervals) {
                    const max = _.maxBy(list, "x")!
                    const min = _.minBy(list, "x")!
                    const from = graph.x(min.x)
                    const to = graph.x(max.x)

                    $("<div>", { class: "empty_area" })
                        .css({
                            left: from - unitWidth / 2,
                            width: to - from + unitWidth,
                        })
                        .appendTo(graph.element)
                }
            }

            function setBarMode(): void {
                /**
                 * This code enables the first series in the legend if there are none selected (except sum)
                 * It then disables the sum data series since that data does not make sense in bar mode
                 * If the sum data series is disabled first, it will not work
                 */
                if ($(".legend .line", $ctrl.$result).length > 1) {
                    const allNonSumSeries = $(".legend li.line:not(:last-child)", $ctrl.$result)
                    if (allNonSumSeries.toArray().some((item) => $(item).is(".disabled"))) {
                        $(".legend li:first .action", $ctrl.$result).click()
                    }
                    $(".legend li:last:not(.disabled) .action", $ctrl.$result).click()
                }
            }

            function setTableMode(series: Series[]) {
                $(".chart,.legend", $ctrl.$result).hide()
                $(".time_table", $ctrl.$result.parent()).show()
                const nRows = series.length || 2
                let h = nRows * 2 + 4
                h = Math.min(h, 40)
                $(".time_table:visible", $ctrl.$result).height(`${h}.1em`)
                if ($ctrl.time_grid != null) {
                    $ctrl.time_grid.resizeCanvas()
                }
                $(".exportTimeStatsSection", $ctrl.$result).show()

                $(".exportTimeStatsSection .btn.export", $ctrl.$result).click(() => {
                    const selVal = $(".timeKindOfData option:selected", $ctrl.$result).val()
                    const selType = $(".timeKindOfFormat option:selected", $ctrl.$result).val()
                    const dataDelimiter = selType === "TSV" ? "\t" : ";"

                    const header = [loc("stats_hit")]

                    for (let cell of series[0].data) {
                        const stampformat = FORMATS[cell.zoom]
                        header.push(moment(cell.x * 1000).format(stampformat))
                    }

                    const output: (string | number)[][] = [header]

                    for (let row of series) {
                        const cells: (string | number)[] = [row.name === "&Sigma;" ? "Σ" : row.name]
                        for (let cell of row.data) {
                            if (selVal === "relative") {
                                cells.push(cell.y)
                            } else {
                                const i = _.sortedIndexOf(_.map(row.abs_data, "x"), cell.x)
                                cells.push(row.abs_data[i].y)
                            }
                        }
                        output.push(cells)
                    }

                    const csv = new CSV(output, {
                        delimiter: dataDelimiter,
                    })

                    const csvstr = csv.encode()
                    const blob = new Blob([csvstr], { type: `text/${selType}` })
                    const csvUrl = URL.createObjectURL(blob)

                    const a = document.createElement("a")
                    a.href = csvUrl
                    a.download = `export.${selType}`
                    a.style.display = "none"
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(csvUrl)
                })
            }

            function renderTable(series: Series[]) {
                const rows: TableRow[] = []
                const columnsMap: Record<string, Slick.Column<any>> = {}
                for (const seriesRow of series) {
                    const tableRow: TableRow = { label: seriesRow.name }
                    for (const item of seriesRow.data) {
                        const stampformat = FORMATS[item.zoom]
                        const timestamp = moment(item.x * 1000).format(stampformat) as `${number}${string}` // this needs to be fixed for other resolutions
                        columnsMap[timestamp] = {
                            name: timestamp,
                            field: timestamp,
                            formatter(row, cell, value, columnDef, dataContext) {
                                return value == undefined ? "" : formatFrequency($rootScope, value)
                            },
                            cssClass: "text-right",
                        }
                        const i = _.sortedIndexOf(_.map(seriesRow.abs_data, "x"), item.x)
                        // [absolute, relative], like in statistics_worker.ts
                        tableRow[timestamp] = [seriesRow.abs_data[i].y, item.y]
                    }
                    rows.push(tableRow)
                }
                // Sort columns
                const columns: Slick.Column<any>[] = [
                    {
                        name: "Hit",
                        field: "label",
                        formatter(row, cell, value, columnDef, dataContext) {
                            return value
                        },
                    },
                ]
                for (const key of _.keys(columnsMap).sort()) {
                    columns.push(columnsMap[key])
                }

                const time_grid = new Slick.Grid($(".time_table", $ctrl.$result), rows, columns, {
                    enableCellNavigation: false,
                    enableColumnReorder: false,
                    forceFitColumns: false,
                })
                $(".time_table", $ctrl.$result).width("100%")
                $ctrl.time_grid = time_grid
            }

            function makeSeries(Rickshaw: any, data: CountTimeResponse, cqp: string, zoom: Level) {
                const createTotalSeries = (stats: GraphStats) => ({
                    data: getSeriesData(stats.relative, zoom),
                    color: "steelblue",
                    name: "&Sigma;",
                    cqp,
                    abs_data: getSeriesData(stats.absolute, zoom),
                })

                const createSubquerySeries = (stats: GraphStatsCqp, i: number) => ({
                    data: getSeriesData(stats.relative, zoom),
                    color: PALETTE[i % PALETTE.length],
                    name: $ctrl.data.labelMapping[stats.cqp],
                    cqp: stats.cqp,
                    abs_data: getSeriesData(stats.absolute, zoom),
                })

                const series: Series[] = _.isArray(data.combined)
                    ? data.combined.map((item, i) =>
                          "cqp" in item ? createSubquerySeries(item, i) : createTotalSeries(item)
                      )
                    : [createTotalSeries(data.combined)]

                Rickshaw.Series.zeroFill(series)

                const emptyIntervals = getEmptyIntervals(series[0].data)
                series[0].emptyIntervals = emptyIntervals

                for (let s of series) {
                    s.data = _.filter(s.data, (item) => item.y !== null)
                    s.abs_data = _.filter(s.abs_data, (item) => item.y !== null)
                }

                return series
            }

            /** Replace a part of the graph with new data (of a higher/lower resolution) */
            function spliceData(newSeries: Series[]) {
                if (!$ctrl.graph) {
                    console.error("No graph")
                    return
                }
                for (let seriesIndex = 0; seriesIndex < $ctrl.graph.series.length; seriesIndex++) {
                    const seriesObj = $ctrl.graph.series[seriesIndex]
                    const first = newSeries[seriesIndex].data[0].x
                    const last = _.last(newSeries[seriesIndex].data)!.x

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

            function previewPanStop() {
                if (!$ctrl.graph) {
                    console.error("No graph")
                    return
                }
                const visibleData = $ctrl.graph.stackData()
                const grouped = _.groupBy(visibleData[0], "zoom")

                for (let zoomLevel in grouped) {
                    const points = grouped[zoomLevel]
                    if (zoomLevel !== $ctrl.zoom) {
                        const from = moment.unix(points[0].x)
                        from.startOf($ctrl.zoom)
                        const to = moment.unix(_.last(points).x)
                        to.endOf($ctrl.zoom)
                        setZoom($ctrl.zoom, from, to)
                    }
                }
            }

            function renderGraph(
                Rickshaw: any,
                data: CountTimeResponse,
                cqp: string,
                currentZoom: Level,
                showTotal?: boolean
            ) {
                let series: Series[]

                const done = () => {
                    $ctrl.setProgress(false, 100)
                    $(window).trigger("resize")
                }

                if ($ctrl.graph) {
                    series = makeSeries(Rickshaw, data, cqp, currentZoom)
                    spliceData(series)
                    drawIntervals($ctrl.graph)
                    $ctrl.graph.render()
                    done()
                    return
                }

                const nontime = getNonTime()

                if (nontime) {
                    const nontimeEl = $(".non_time", $ctrl.$result)
                        .empty()
                        .text(nontime.toFixed(2) + "%")
                        .parent() as JQueryExtended
                    nontimeEl.localize()
                } else {
                    $(".non_time_div", $ctrl.$result).hide()
                }

                series = makeSeries(Rickshaw, data, cqp, currentZoom)

                const graph = new Rickshaw.Graph({
                    element: $(".chart", $ctrl.$result).empty().get(0),
                    renderer: "line",
                    interpolation: "linear",
                    series,
                    padding: {
                        top: 0.1,
                        right: 0.01,
                    },
                })
                let width = $(".tab-pane").width()
                graph.setSize({ width })
                graph.render()
                $ctrl.graph = graph

                drawIntervals(graph)

                $(window).on(
                    "resize",
                    _.throttle(() => {
                        if ($ctrl.$result.is(":visible")) {
                            width = $(".tab-pane").width()
                            graph.setSize()
                            $ctrl.preview.configure({ width })
                            $ctrl.preview.render()
                            return graph.render()
                        }
                    }, 200)
                )

                $(".form_switch", $ctrl.$result).click(() => {
                    const val = $ctrl.mode
                    for (let cls of $ctrl.$result.attr("class").split(" ")) {
                        if (cls.match(/^form-/)) {
                            $ctrl.$result.removeClass(cls)
                        }
                    }
                    $ctrl.$result.addClass(`form-${val}`)
                    $(".chart,.legend", $ctrl.$result.parent()).show()
                    $(".time_table", $ctrl.$result.parent()).hide()
                    if (val === "bar") {
                        setBarMode()
                    } else if (val === "table") {
                        renderTable(series)
                        setTableMode(series)
                    }

                    if (val !== "table") {
                        graph.setRenderer(val)
                        graph.render()
                        $(".exportTimeStatsSection", $ctrl.$result).hide()
                    }
                })

                // Add legend and toggling
                const legendElement = $(".legend", $ctrl.$result).get(0)
                const legend = new Rickshaw.Graph.Legend({ element: legendElement, graph })
                new Rickshaw.Graph.Behavior.Series.Toggle({ graph, legend })

                if (!showTotal && $(".legend .line", $ctrl.$result).length > 1) {
                    $(".legend .line:last .action", $ctrl.$result).click()
                }

                new Rickshaw.Graph.HoverDetail({
                    // xFormatter and yFormatter are called once for every data series per "hover detail creation"
                    // formatter is only called once per per "hover detail creation"
                    graph,
                    xFormatter(x: number) {
                        return `<span data-val='${x}'>${formatUnixDate($ctrl.zoom, x)}</span>`
                    },

                    yFormatter(y: number) {
                        const val = formatRelativeHits(y, $rootScope.lang)
                        return `<br><span rel='localize[rel_hits_short]'>${loc("rel_hits_short")}</span> ` + val
                    },
                    formatter(series: Series, x: number, y: number, formattedX: string, formattedY: string) {
                        let abs_y
                        const i = _.sortedIndexOf(_.map(series.data, "x"), x)
                        try {
                            abs_y = series.abs_data[i].y
                        } catch (e) {
                            console.log("i", i, x)
                        }

                        const rel = series.name + ":&nbsp;" + formattedY
                        return `<span data-cqp="${encodeURIComponent(series.cqp)}">
                                ${rel}
                                <br>
                                ${loc("abs_hits_short")}: ${abs_y?.toLocaleString($rootScope.lang)}
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

                $ctrl.preview = new Rickshaw.Graph.RangeSlider.Preview({
                    graph,
                    element: $(".preview", $ctrl.$result).get(0),
                })

                $("body").on("mouseup", ".preview .middle_handle", () => {
                    previewPanStop()
                })

                $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
                    if (!$ctrl.loading) {
                        previewPanStop()
                    }
                })

                const old_render = xAxis.render
                xAxis.render = _.throttle(() => {
                    old_render.call(xAxis)
                    drawIntervals(graph)
                    checkZoomLevelDefault()
                }, 20)

                xAxis.render()

                const yAxis = new Rickshaw.Graph.Axis.Y({
                    graph,
                })

                yAxis.render()

                done()
            }

            async function makeRequest(
                cqp: string,
                subcqps: string[],
                corpora: CorpusListing,
                showTotal: boolean,
                from: `${number}`,
                to: `${number}`
            ) {
                const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
                $ctrl.setProgress(true, 0)
                $ctrl.error = undefined
                const currentZoom = $ctrl.zoom
                const reqPromise = $ctrl.proxy.makeRequest(
                    cqp,
                    subcqps,
                    corpora.stringifySelected(),
                    from,
                    to,
                    (progress) => $timeout(() => $ctrl.setProgress(true, progress.percent))
                )

                try {
                    const [Rickshaw, graphData] = await Promise.all([rickshawPromise, reqPromise])
                    $timeout(() => renderGraph(Rickshaw, graphData, cqp, currentZoom, showTotal))
                } catch (error) {
                    $timeout(() => {
                        console.error(error)
                        $ctrl.error = error
                        $ctrl.setProgress(false, 0)
                    })
                }
            }
        },
    ],
})
