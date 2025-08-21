/** @format */
import angular, { IController, IRootElementService, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import moment, { Moment } from "moment"
import { expandOperators } from "@/cqp_parser/cqp"
import { downloadFile, formatFrequency, formatRelativeHits, html } from "@/util"
import { loc } from "@/i18n"
import {
    formatUnixDate,
    getTimeCqp,
    LEVELS,
    FORMATS,
    Level,
    findOptimalLevel,
    Series,
    createTrendTableCsv,
} from "@/trend-diagram/util"
import "@/components/korp-error"
import { RootScope } from "@/root-scope.types"
import { CountTimeResponse } from "@/backend/types/count-time"
import { StoreService } from "@/services/store"
import { ExampleTask } from "@/backend/task/example-task"
import { TrendTask } from "@/backend/task/trend-task"
import { getEmptyBlocks, Graph, makeSeries, spliceGraphData } from "@/trend-diagram/graph"

type ResultsTrendDiagramController = IController & {
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
    task: TrendTask
    graph?: Graph
    time_grid: Slick.Grid<any>
    hasEmptyIntervals?: boolean
    zoom: Level
    $result: JQLite
    mode: "line" | "bar" | "table"
    error?: string
}

type ResultsTrendDiagramScope = IScope & {
    nontime: number
    statsRelative: boolean
}

type TableRow = {
    label: string
    [timestamp: `${number}${string}`]: [number, number]
}

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
                <label ng-show="$ctrl.mode == 'table'">
                    <input type="checkbox" ng-model="statsRelative" />
                    {{"num_results_relative" | loc:$root.lang}}
                    <i
                        class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                        uib-tooltip="{{'relative_help' | loc:$root.lang}}"
                    ></i>
                </label>
            </div>

            <div ng-if="nontime">
                {{ 'non_time_before' | loc:$root.lang }} {{ nontime | number:2 }}% {{ 'non_time_after' | loc:$root.lang
                }}
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
                    <option value="tsv">{{'statstable_exp_tsv' | loc:$root.lang}}</option>
                    <option value="csv">{{'statstable_exp_csv' | loc:$root.lang}}</option></select
                ><a class="export btn btn-default btn-sm">{{'statstable_export' | loc:$root.lang}}</a>
            </div>
        </div>
    `,
    bindings: {
        loading: "<",
        setProgress: "<",
        task: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "$timeout",
        "$element",
        "store",
        function (
            $rootScope: RootScope,
            $scope: ResultsTrendDiagramScope,
            $timeout: ITimeoutService,
            $element: IRootElementService,
            store: StoreService
        ) {
            const $ctrl = this as ResultsTrendDiagramController
            $ctrl.zoom = "year"
            $ctrl.$result = $element.find(".graph_tab")
            $ctrl.mode = "line"

            $ctrl.$onInit = () => {
                const interval = $ctrl.task.corpusListing.getMomentInterval()
                if (!interval) throw new Error("Time interval missing")
                const [from, to] = interval
                $ctrl.zoom = findOptimalLevel(from, to)
                makeRequest(from, to)

                $scope.nontime = getNonTime()
            }

            store.watch("statsRelative", () => {
                $scope.statsRelative = store.statsRelative
                if (!$ctrl.time_grid) return
                // Trigger reformatting
                $ctrl.time_grid.setColumns($ctrl.time_grid.getColumns())
            })

            $scope.$watch("statsRelative", () => (store.statsRelative = $scope.statsRelative))

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

                const corpusIds = $ctrl.task.corpusListing.getSelectedCorpora()
                const cqps = [$ctrl.task.cqp, expandOperators(decodedCQP), timecqp]
                $rootScope.kwicTabs.push(new ExampleTask(corpusIds, cqps, $ctrl.task.defaultWithin))
            }

            function drawPreloader(from: Moment, to: Moment): void {
                const left = $ctrl.graph ? $ctrl.graph.x(from.unix()) : 0
                const width = $ctrl.graph ? $ctrl.graph.x(to.unix()) - left : "100%"
                $(".preloader", $ctrl.$result).css({ left, width })
            }

            /** Change the current zoom level if needed to match a given date range. */
            function checkZoomLevel(from: Moment, to: Moment) {
                const newZoom = findOptimalLevel(from, to)
                // Trigger search if new zoom level is different
                if (newZoom && $ctrl.zoom !== newZoom) {
                    $ctrl.zoom = newZoom
                    makeRequest(from, to)
                }
            }

            /** Percentage of selected material that is undated. */
            function getNonTime(): number {
                const corpora = $ctrl.task.corpusListing.selected
                const non_time = _.sum(corpora.map((corpus) => corpus.non_time || 0))
                const totalsize = _.sum(corpora.map((corpus) => Number(corpus.info.Size) || 0))
                return (non_time / totalsize) * 100
            }

            /** Adds divs with .empty_area to fill spaces in graph where there is no dated material */
            function drawIntervals(graph: Graph): void {
                const emptyIntervals = getEmptyBlocks(graph, $ctrl.zoom)
                $ctrl.hasEmptyIntervals = !!emptyIntervals.length
                $(".empty_area", $ctrl.$result).remove()
                for (const { left, width } of emptyIntervals) {
                    $("<div>", { class: "empty_area" }).css({ left, width }).appendTo(graph.element)
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
                    const frequencyType = $(".timeKindOfData option:selected", $ctrl.$result).val()
                    const csvType = $(".timeKindOfFormat option:selected", $ctrl.$result).val()
                    const csv = createTrendTableCsv(series, frequencyType, csvType)
                    const mimeType = csvType == "tsv" ? "text/tab-separated-values" : "text/csv"
                    downloadFile(csv, `korp-trend-table.${csvType}`, mimeType)
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
                                return value == undefined ? "" : formatFrequency(store, value)
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
                        makeRequest(from, to)
                    }
                }
            }

            function renderGraph(Rickshaw: any, data: CountTimeResponse, currentZoom: Level) {
                let series: Series[]

                const done = () => {
                    $ctrl.setProgress(false, 100)
                    $(window).trigger("resize")
                }

                if ($ctrl.graph) {
                    series = makeSeries(Rickshaw, data, currentZoom, $ctrl.task.cqp, $ctrl.task.subqueries)
                    spliceGraphData($ctrl.graph, series)
                    drawIntervals($ctrl.graph)
                    $ctrl.graph.render()
                    done()
                    return
                }

                series = makeSeries(Rickshaw, data, currentZoom, $ctrl.task.cqp, $ctrl.task.subqueries)

                const graph: Graph = new Rickshaw.Graph({
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

                if (!$ctrl.task.showTotal && $(".legend .line", $ctrl.$result).length > 1) {
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
                        const val = formatRelativeHits(y, store.lang)
                        return `<br>${loc("rel_hits_short")} ${val}`
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
                    const [from, to] = graph.renderer.domain().x
                    checkZoomLevel(moment.unix(from), moment.unix(to))
                }, 20)

                xAxis.render()

                const yAxis = new Rickshaw.Graph.Axis.Y({
                    graph,
                })

                yAxis.render()

                done()
            }

            async function makeRequest(from: Moment, to: Moment) {
                drawPreloader(from, to)
                $ctrl.setProgress(true, 0)
                $ctrl.error = undefined
                const currentZoom = $ctrl.zoom

                const reqPromise = $ctrl.task.send(currentZoom, from, to, (progress) =>
                    $timeout(() => $ctrl.setProgress(true, progress.percent))
                )

                try {
                    const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
                    const [Rickshaw, graphData] = await Promise.all([rickshawPromise, reqPromise])
                    $timeout(() => renderGraph(Rickshaw, graphData, currentZoom))
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
