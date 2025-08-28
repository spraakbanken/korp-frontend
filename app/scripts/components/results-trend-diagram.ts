/** @format */
import angular, { IController, IRootElementService, IScope, ITimeoutService } from "angular"
import { throttle } from "lodash"
import { Moment } from "moment"
import { expandOperators } from "@/cqp_parser/cqp"
import { downloadFile, html } from "@/util"
import { getTimeCqp, LEVELS, Level, findOptimalLevel, Series, createTrendTableCsv } from "@/trend-diagram/util"
import "@/components/korp-error"
import { RootScope } from "@/root-scope.types"
import { CountTimeResponse } from "@/backend/types/count-time"
import { StoreService } from "@/services/store"
import { ExampleTask } from "@/backend/task/example-task"
import { TrendTask } from "@/backend/task/trend-task"
import { TrendGraph } from "@/trend-diagram/graph"
import { renderTable } from "@/trend-diagram/trend-table"

type ResultsTrendDiagramController = IController & {
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
    task: TrendTask
    graph?: TrendGraph
    time_grid: Slick.Grid<any>
    hasEmptyIntervals?: boolean
    $result: JQLite
    error?: string
}

type ResultsTrendDiagramScope = IScope & {
    downloadCsvType: "csv" | "tsv"
    download: () => void
    isGraph: boolean
    isInitDone: boolean
    mode: "line" | "bar" | "table"
    nontime: number
    statsRelative: boolean
}

angular.module("korpApp").component("resultsTrendDiagram", {
    template: html`
        <korp-error ng-if="$ctrl.error" message="{{$ctrl.error}}"></korp-error>

        <div class="graph_tab" ng-show="!$ctrl.error">
            <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
                <div class="btn-group form_switch">
                    <button
                        class="btn btn-default btn-sm"
                        ng-model="mode"
                        uib-btn-radio="'line'"
                        ng-disabled="!isInitDone"
                    >
                        {{'line' | loc:$root.lang}}
                    </button>
                    <button
                        class="btn btn-default btn-sm"
                        ng-model="mode"
                        uib-btn-radio="'bar'"
                        ng-disabled="!isInitDone"
                    >
                        {{'bar' | loc:$root.lang}}
                    </button>
                    <button
                        class="btn btn-default btn-sm"
                        ng-model="mode"
                        uib-btn-radio="'table'"
                        ng-disabled="!isInitDone"
                    >
                        {{'table' | loc:$root.lang}}
                    </button>
                </div>
                <label ng-show="mode == 'table'">
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

            <div class="legend" ng-show="isGraph && !$ctrl.loading">
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
                <div class="chart" ng-show="isGraph" ng-click="$ctrl.graphClickHandler()"></div>
            </div>

            <div class="preview" ng-show="isGraph"></div>

            <div class="time_table mt-4 w-full" ng-show="mode == 'table'"></div>
            <div ng-show="mode == 'table'">
                <select ng-model="downloadCsvType">
                    <option value="tsv">{{'statstable_exp_tsv' | loc:$root.lang}}</option>
                    <option value="csv">{{'statstable_exp_csv' | loc:$root.lang}}</option>
                </select>
                <button class="btn btn-default btn-sm" ng-click="download()">
                    {{'statstable_export' | loc:$root.lang}}
                </button>
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
            $ctrl.$result = $element.find(".graph_tab")
            $scope.downloadCsvType = "tsv"
            $scope.isGraph = true
            $scope.mode = "line"

            $ctrl.$onInit = () => {
                const interval = $ctrl.task.corpusListing.getMomentInterval()
                if (!interval) throw new Error("Time interval missing")
                const [from, to] = interval
                makeRequest(from, to)

                $scope.nontime = $ctrl.task.corpusListing.getUndatedRatio() * 100
            }

            $ctrl.$onChanges = (changes) => {
                if (changes.loading && $ctrl.graph) $ctrl.graph.loading = $ctrl.loading
            }

            store.watch("statsRelative", () => {
                $scope.statsRelative = store.statsRelative
                if (!$ctrl.time_grid) return
                // Trigger reformatting
                $ctrl.time_grid.setColumns($ctrl.time_grid.getColumns())
            })

            $scope.$watch("mode", () => {
                if (!$scope.mode) return
                $scope.isGraph = ["line", "bar"].includes($scope.mode)

                if ($scope.mode === "table") {
                    const el = $(".time_table", $ctrl.$result).get(0)!
                    // Render in next tick when the container is showing.
                    $timeout(() => ($ctrl.time_grid = renderTable(store, el, $ctrl.graph!.series)))
                } else {
                    if (!$ctrl.graph) return

                    if ($scope.mode === "bar") setBarMode()

                    $ctrl.graph.graph.setRenderer($scope.mode)
                    $ctrl.graph.graph.render()
                }
            })

            $scope.$watch("statsRelative", () => (store.statsRelative = $scope.statsRelative))

            $ctrl.graphClickHandler = () => {
                const target = $(".chart", $ctrl.$result)
                const time = $(".detail .x_label > span", target).data("val")
                let cqp = $(".detail .item.active > span", target).data("cqp")
                const zoom = $ctrl.graph!.zoom

                if (!cqp) {
                    return
                }

                const timecqp = getTimeCqp(time, zoom, LEVELS.indexOf(zoom) < 3)
                const decodedCQP = decodeURIComponent(cqp)

                const corpusIds = $ctrl.task.corpusListing.getSelectedCorpora()
                const cqps = [$ctrl.task.cqp, expandOperators(decodedCQP), timecqp]
                $rootScope.kwicTabs.push(new ExampleTask(corpusIds, cqps, $ctrl.task.defaultWithin))
            }

            $scope.download = function () {
                const csv = createTrendTableCsv($ctrl.graph!.series, store.statsRelative, $scope.downloadCsvType)
                const mimeType = $scope.downloadCsvType == "tsv" ? "text/tab-separated-values" : "text/csv"
                downloadFile(csv, `korp-trend-table.${$scope.downloadCsvType}`, mimeType)
            }

            function drawPreloader(from: Moment, to: Moment): void {
                const left = $ctrl.graph ? $ctrl.graph.graph.x(from.unix()) : 0
                const width = $ctrl.graph ? $ctrl.graph.graph.x(to.unix()) - left : "100%"
                $(".preloader", $ctrl.$result).css({ left, width })
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

            function renderGraph(Rickshaw: any, data: CountTimeResponse, currentZoom: Level) {
                const series = TrendGraph.makeSeries(Rickshaw, data, currentZoom, $ctrl.task.cqp, $ctrl.task.subqueries)

                // Create or update graph
                if ($ctrl.graph) $ctrl.graph.spliceGraphData(series)
                else {
                    $ctrl.graph = new TrendGraph(
                        Rickshaw,
                        $ctrl.$result,
                        series,
                        currentZoom,
                        makeRequest,
                        store,
                        $ctrl.task.showTotal
                    )
                }

                $ctrl.graph.refresh()
                $ctrl.hasEmptyIntervals = $ctrl.graph.hasEmptyIntervals

                $ctrl.setProgress(false, 100)
                $(window).trigger("resize")
            }

            function setupInteraction() {
                $(window).on(
                    "resize",
                    throttle(() => {
                        if ($ctrl.$result.is(":visible")) {
                            const width = $(".tab-pane").width()
                            $ctrl.graph!.graph.setSize()
                            $ctrl.graph!.preview.configure({ width })
                            $ctrl.graph!.preview.render()
                            return $ctrl.graph!.graph.render()
                        }
                    }, 200)
                )
            }

            async function makeRequest(from: Moment, to: Moment) {
                drawPreloader(from, to)
                $ctrl.setProgress(true, 0)
                $ctrl.error = undefined
                const currentZoom = $ctrl.graph?.zoom || findOptimalLevel(from, to)

                const reqPromise = $ctrl.task.send(currentZoom, from, to, (progress) =>
                    $timeout(() => $ctrl.setProgress(true, progress.percent))
                )

                try {
                    const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
                    const [Rickshaw, graphData] = await Promise.all([rickshawPromise, reqPromise])
                    $timeout(() => {
                        renderGraph(Rickshaw, graphData, currentZoom)
                        if (!$scope.isInitDone) {
                            setupInteraction()
                            $scope.isInitDone = true
                        }
                    })
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
