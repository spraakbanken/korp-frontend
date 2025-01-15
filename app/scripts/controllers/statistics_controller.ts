/** @format */
import _ from "lodash"
import angular, { ITimeoutService } from "angular"
import settings from "@/settings"
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { ProgressReport } from "@/backend/types"
import { Dataset, SearchParams, SlickgridColumn } from "@/statistics.types"
import { SearchesService } from "@/services/searches"
import "@/services/searches"
import { TabHashScope } from "@/directives/tab-hash"

type StatsResultCtrlScope = TabHashScope & {
    $root: RootScope
    aborted: boolean
    activate: () => void
    columns: SlickgridColumn[]
    countCorpora: () => number | null
    data: Dataset
    error?: string
    hasResult: boolean
    inOrder: boolean
    loading: boolean
    no_hits: boolean
    progress: number
    proxy: StatsProxy
    searchParams: SearchParams
    showStatistics: boolean
    makeRequest: (cqp: string) => void
    onentry: () => void
    onProgress: (progressObj: ProgressReport<"count">, isPaging?: boolean) => void
    renderResult: (columns: SlickgridColumn[], data: Dataset) => void
    resetView: () => void
    resultError: (err: any) => void
    shouldSearch: () => boolean
}

angular.module("korpApp").directive("statsResultCtrl", () => ({
    controller: [
        "$scope",
        "$location",
        "searches",
        "$rootScope",
        "$timeout",
        (
            $scope: StatsResultCtrlScope,
            $location: LocationService,
            searches: SearchesService,
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
                s.no_hits = false
                s.aborted = false
                s.progress = 0
            }

            s.onProgress = (progressObj) => (s.progress = Math.round(progressObj["percent"]))

            s.makeRequest = (cqp) => {
                s.error = undefined
                const grid = document.getElementById("myGrid")
                if (!grid) throw new Error("myGrid element not found")
                grid.innerHTML = ""

                s.hasResult = false
                if (!s.shouldSearch()) {
                    return
                }

                s.hasResult = true

                if (settings.parallel) {
                    cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
                }

                // Abort any running request
                if (s.loading) s.proxy.abort()
                s.resetView()

                s.loading = true
                s.proxy
                    .makeRequest(cqp, (progressObj) => $timeout(() => s.onProgress(progressObj)))
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
                        if ((error.name = "AbortError")) return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => {
                            s.resetView()
                            s.error = error
                            s.loading = false
                        })
                    })
            }

            s.renderResult = (columns, data) => {
                s.columns = columns

                if (data[0].total[0] === 0) {
                    s.no_hits = true
                    return
                }

                s.loading = false
            }

            if (settings["statistics_search_default"]) {
                s.$watch(
                    () => $location.search().hide_stats,
                    (val) => (s.showStatistics = val == null)
                )
            } else {
                s.$watch(
                    () => $location.search().show_stats,
                    (val) => (s.showStatistics = val != null)
                )
            }

            s.$watch(
                () => $location.search().in_order,
                (val) => (s.inOrder = val == null)
            )

            s.shouldSearch = () => s.showStatistics && s.inOrder

            $scope.activate = function () {
                if (settings["statistics_search_default"]) {
                    $location.search("hide_stats", null)
                } else {
                    $location.search("show_stats", true)
                }
                const cqp = searches.getCqpExpr()
                s.showStatistics = true
                s.makeRequest(cqp)
            }

            s.countCorpora = () => {
                return s.proxy.prevParams && s.proxy.prevParams.corpus.split(",").length
            }
        },
    ],
}))
