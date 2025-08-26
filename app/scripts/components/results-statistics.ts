/** @format */
import _ from "lodash"
import angular, { IController, IScope, ITimeoutService } from "angular"
import settings from "@/settings"
import statsProxyFactory, { StatsProxy } from "@/backend/proxy/stats-proxy"
import { RootScope } from "@/root-scope.types"
import { Dataset, SearchParams } from "@/statistics/statistics.types"
import { html } from "@/util"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/statistics"
import { processStatisticsResult } from "@/statistics/statistics"
import { StoreService } from "@/services/store"

type ResultsStatisticsController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsStatisticsScope = IScope & {
    aborted: boolean
    rowCount: number
    /** Last submitted cqp */
    cqp: string
    data: Dataset
    error?: string
    proxy: StatsProxy
    searchParams: SearchParams
    showStatistics: boolean
    warning?: string
    makeRequest: () => void
    onUpdateSearch: () => void
    renderResult: (data: Dataset) => void
    resetView: () => void
    resultError: (err: any) => void
}

angular.module("korpApp").component("resultsStatistics", {
    template: html`
        <statistics
            aborted="aborted"
            data="data"
            error="error"
            loading="$ctrl.loading"
            on-update-search="onUpdateSearch()"
            params="proxy.params"
            row-count="rowCount"
            search-params="searchParams"
            warning="warning"
        ></statistics>
        <korp-error ng-if="error" message="{{error}}"></korp-error>
        <json-button ng-if="data && !loading && !warning" endpoint="count" data="proxy.response"></json-button>
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

            store.watch("activeSearch", (search) => {
                if (!search) return
                $scope.cqp = search.cqp
                s.makeRequest()
            })

            $scope.onUpdateSearch = () => {
                $scope.makeRequest()
            }

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
                        if ($scope.cqp) s.makeRequest()
                    }

                    // Re-fit grid in case it was generated while another tab was active
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

            s.makeRequest = () => {
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

                let cqp = $scope.cqp
                if (settings.parallel) {
                    cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
                }

                const attrs = (store.stats_reduce || "word").split(",")
                const ignoreCase = !!store.stats_reduce_insensitive
                // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
                const corpora: string = settings.corpusListing.stringifySelected(false)

                $ctrl.setProgress(true, 0)
                s.proxy
                    .setProgressHandler((progressObj) => $timeout(() => $ctrl.setProgress(true, progressObj.percent)))
                    .makeRequest(cqp, attrs, store.within, ignoreCase)
                    .then(async (data) => {
                        const { rows, params } = await processStatisticsResult(corpora, data, attrs, ignoreCase, cqp)
                        $timeout(() => {
                            $ctrl.setProgress(false, 0)
                            s.data = rows
                            s.searchParams = params
                            s.rowCount = data.count

                            if (data.combined.sums.absolute == 0) s.warning = "no_stats_results"
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
        },
    ],
})
