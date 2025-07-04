/** @format */
import _ from "lodash"
import angular, { IController, IScope, ITimeoutService } from "angular"
import settings from "@/settings"
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import { RootScope } from "@/root-scope.types"
import { Dataset, SearchParams, SlickgridColumn } from "@/statistics.types"
import { html } from "@/util"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/statistics"
import { createColumns, statisticsService } from "@/statistics"
import { StoreService } from "@/services/store"

type ResultsStatisticsController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsStatisticsScope = IScope & {
    aborted: boolean
    rowCount: number
    columns: SlickgridColumn[]
    /** Last submitted cqp */
    cqp: string
    data: Dataset
    error?: string
    proxy: StatsProxy
    searchParams: SearchParams
    showStatistics: boolean
    warning?: string
    makeRequest: (cqp: string) => void
    renderResult: (columns: SlickgridColumn[], data: Dataset) => void
    resetView: () => void
    resultError: (err: any) => void
}

angular.module("korpApp").component("resultsStatistics", {
    template: html`
        <statistics
            aborted="aborted"
            columns="columns"
            data="data"
            error="error"
            loading="$ctrl.loading"
            prev-params="proxy.prevParams"
            row-count="rowCount"
            search-params="searchParams"
            warning="warning"
        ></statistics>
        <korp-error ng-if="error" message="{{error}}"></korp-error>
        <json-button ng-if="!warning && !error" endpoint="'count'" params="proxy.prevParams"></json-button>
    `,
    bindings: {
        isActive: "<",
        loading: "<",
        setProgress: "<",
    },
    controller: [
        "$scope",
        "$rootScope",
        "$timeout",
        "store",
        function (
            $scope: ResultsStatisticsScope,
            $rootScope: RootScope,
            $timeout: ITimeoutService,
            store: StoreService
        ) {
            const $ctrl = this as ResultsStatisticsController
            const s = $scope

            s.proxy = statsProxyFactory.create()

            $rootScope.$on("make_request", (event, cqp: string) => {
                $scope.cqp = cqp
                s.makeRequest($scope.cqp)
            })

            s.$on("abort_requests", () => {
                s.proxy.abort()
                if ($ctrl.loading) {
                    s.aborted = true
                    $ctrl.setProgress(false, 0)
                }
            })

            $ctrl.$onChanges = (changes) => {
                if (changes.isActive?.currentValue) {
                    // Enable statistics when first opening tab
                    if (!s.showStatistics) {
                        s.showStatistics = true
                        if ($scope.cqp) s.makeRequest($scope.cqp)
                    }

                    // workaround for bug in slickgrid
                    // slickgrid should add this automatically, but doesn't
                    $("#myGrid").css("position", "relative")
                    $(window).trigger("resize")
                }
            }

            s.resetView = () => {
                $("myGrid").empty()
                $("#exportStatsSection").show()
                $("#exportButton").attr({
                    download: null,
                    href: null,
                })
                s.warning = undefined
                s.error = undefined
                s.aborted = false
                $ctrl.setProgress(false, 0)
            }

            s.makeRequest = (cqp) => {
                if (!s.showStatistics) return

                // Abort any running request
                if ($ctrl.loading) s.proxy.abort()
                s.resetView()

                if (!store.in_order) {
                    s.warning = "stats_not_in_order_warn"
                    return
                }

                const grid = document.getElementById("myGrid")
                if (!grid) throw new Error("myGrid element not found")
                grid.innerHTML = ""

                if (settings.parallel) {
                    cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
                }

                const attrs = (store.stats_reduce || "word").split(",")
                const ignoreCase = !!store.stats_reduce_insensitive
                // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
                const corpora: string = settings.corpusListing.stringifySelected(false)

                $ctrl.setProgress(true, 0)
                s.proxy
                    .makeRequest(cqp, attrs, {
                        defaultWithin: store.within,
                        ignoreCase,
                        onProgress: (progressObj) => $timeout(() => $ctrl.setProgress(true, progressObj.percent)),
                    })
                    .then(async (data) => {
                        const columns = createColumns(store, Object.keys(data.corpora), attrs)

                        const { rows, params } = await statisticsService.processData(
                            corpora,
                            data,
                            attrs,
                            ignoreCase,
                            cqp
                        )
                        $timeout(() => {
                            $ctrl.setProgress(false, 0)
                            s.data = rows
                            s.searchParams = params
                            s.rowCount = data.count
                            s.renderResult(columns, rows)
                        })
                    })
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => {
                            s.resetView()
                            s.error = error
                        })
                    })
            }

            s.renderResult = (columns, data) => {
                s.columns = columns

                if (data[0].total[0] === 0) {
                    s.warning = "no_stats_results"
                    return
                }

                $ctrl.setProgress(false, 0)
            }
        },
    ],
})
