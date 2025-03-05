/** @format */
import _ from "lodash"
import angular, { ITimeoutService } from "angular"
import settings from "@/settings"
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { Dataset, SearchParams, SlickgridColumn } from "@/statistics.types"
import { TabHashScope } from "@/directives/tab-hash"

type StatsResultCtrlScope = TabHashScope & {
    $root: RootScope
    aborted: boolean
    activate: () => void
    columns: SlickgridColumn[]
    data: Dataset
    error?: string
    loading: boolean
    progress: number
    proxy: StatsProxy
    searchParams: SearchParams
    showStatistics: boolean
    warning?: string
    makeRequest: (cqp: string) => void
    onentry: () => void
    renderResult: (columns: SlickgridColumn[], data: Dataset) => void
    resetView: () => void
    resultError: (err: any) => void
}

angular.module("korpApp").directive("statsResultCtrl", () => ({
    controller: [
        "$scope",
        "$location",
        "$rootScope",
        "$timeout",
        (
            $scope: StatsResultCtrlScope,
            $location: LocationService,
            $rootScope: RootScope,
            $timeout: ITimeoutService
        ) => {
            const s = $scope
            s.loading = false
            s.progress = 0

            s.proxy = statsProxyFactory.create()

            $rootScope.$on("make_request", (event, cqp: string) => {
                s.makeRequest(cqp)
            })

            s.$on("abort_requests", () => {
                s.proxy.abort()
                if (s.loading) {
                    s.aborted = true
                    s.loading = false
                }
            })

            s.onentry = () => {
                // Enable statistics when opening tab
                if (!s.showStatistics) s.activate()

                // workaround for bug in slickgrid
                // slickgrid should add this automatically, but doesn't
                $("#myGrid").css("position", "relative")
                $(window).trigger("resize")
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
                s.progress = 0
                s.loading = false
            }

            s.makeRequest = (cqp) => {
                if (!s.showStatistics) return

                // Abort any running request
                if (s.loading) s.proxy.abort()
                s.resetView()

                const inOrder = $location.search().in_order == null
                if (!inOrder) {
                    s.warning = "stats_not_in_order_warn"
                    return
                }

                const grid = document.getElementById("myGrid")
                if (!grid) throw new Error("myGrid element not found")
                grid.innerHTML = ""

                if (settings.parallel) {
                    cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
                }

                s.loading = true
                s.proxy
                    .makeRequest(cqp, (progressObj) => $timeout(() => (s.progress = progressObj.percent)))
                    .then((result) =>
                        $timeout(() => {
                            const [data, columns, searchParams] = result
                            s.loading = false
                            s.data = data
                            s.searchParams = searchParams
                            s.renderResult(columns, data)
                        })
                    )
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

                s.loading = false
            }

            $scope.activate = function () {
                s.showStatistics = true
                const cqp = $rootScope.getActiveCqp()
                if (cqp) {
                    s.makeRequest(cqp)
                }
            }
        },
    ],
}))
