/** @format */
import _ from "lodash"
import angular, { IScope, ITimeoutService } from "angular"
import settings from "@/settings"
import currentMode from "@/mode"
import statsProxyFactory, { StatsProxy } from "@/backend/stats-proxy"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { ProgressReport } from "@/backend/types"
import { Dataset } from "@/statistics_worker"
import { SearchParams } from "@/statistics.types"
import { SlickgridColumn } from "@/statistics"

type StatsResultCtrlScope = IScope & {
    $parent: any
    $root: RootScope
    aborted: boolean
    activate: () => void
    columns: SlickgridColumn[]
    countCorpora: () => number | null
    data: Dataset
    error: boolean
    gridData: any
    hasResult: boolean
    ignoreAbort: boolean
    inOrder: boolean
    loading: boolean
    no_hits: boolean
    progress: number
    proxy: StatsProxy
    searchParams: SearchParams
    showStatistics: boolean
    tabindex: number
    isActive: () => boolean
    makeRequest: (cqp: string) => void
    onentry: () => void
    onexit: () => void
    onProgress: (progressObj: ProgressReport, isPaging?: boolean) => void
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
            searches,
            $rootScope: RootScope,
            $timeout: ITimeoutService
        ) => {
            const s = $scope
            s.loading = false
            s.error = false
            s.progress = 0

            s.tabindex = 2
            s.gridData = null

            s.proxy = statsProxyFactory.create()

            $rootScope.$on("make_request", (event, cqp: string) => {
                s.makeRequest(cqp)
            })

            s.$on("abort_requests", () => {
                s.proxy.abort()
            })

            s.onentry = () => {
                s.$root.jsonUrl = s.proxy.prevUrl
                // workaround for bug in slickgrid
                // slickgrid should add this automatically, but doesn't
                $("#myGrid").css("position", "relative")
                $(window).trigger("resize")
            }

            s.onexit = () => {
                s.$root.jsonUrl = null
            }

            s.isActive = () => {
                return s.tabindex == s.$parent.$parent.tabset.active
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
            }

            s.onProgress = (progressObj) => (s.progress = Math.round(progressObj["stats"]))

            s.makeRequest = (cqp) => {
                s.error = false
                const grid = document.getElementById("myGrid")
                grid.innerHTML = ""

                s.hasResult = false
                if (!s.shouldSearch()) {
                    return
                }

                s.hasResult = true

                if (currentMode === "parallel") {
                    cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
                }

                if (s.proxy.hasPending()) {
                    s.ignoreAbort = true
                } else {
                    s.ignoreAbort = false
                    s.resetView()
                }

                s.loading = true
                s.proxy
                    .makeRequest(cqp, (progressObj) => {
                        $timeout(() => s.onProgress(progressObj))
                    })
                    .then(
                        (result) => {
                            $timeout(() => {
                                const [data, columns, searchParams] = result
                                s.loading = false
                                s.data = data
                                s.searchParams = searchParams
                                s.renderResult(columns, data)
                            })
                        },
                        (textStatus, err) => {
                            $timeout(() => {
                                if (s.ignoreAbort) {
                                    return
                                }
                                s.loading = false
                                if (textStatus === "abort") {
                                    s.aborted = true
                                } else {
                                    s.resultError(err)
                                }
                            })
                        }
                    )
            }

            s.resultError = (data) => {
                console.error("json fetch error: ", data)
                s.loading = false
                s.resetView()
                s.error = true
            }

            s.renderResult = (columns, data) => {
                if (s.isActive()) {
                    s.$root.jsonUrl = s.proxy.prevUrl
                }

                s.columns = columns

                s.gridData = data

                if (data[0].total_value[0] === 0) {
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
