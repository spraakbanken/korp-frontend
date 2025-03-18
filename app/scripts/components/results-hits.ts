/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import kwicProxyFactory, { type KwicProxy } from "@/backend/kwic-proxy"
import { ApiKwic, ProgressReport } from "@/backend/types"
import { QueryParams, QueryResponse } from "@/backend/types/query"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { UtilsService } from "@/services/utils"
import "@/services/utils"
import { html } from "@/util"

type KwicCtrlController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

export type KwicCtrlScope = IScope & {
    aborted?: boolean
    buildQueryOptions: (isPaging: boolean) => QueryParams
    corpusHits?: Record<string, number>
    corpusOrder?: string[]
    cqp?: string
    error?: string
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage?: `${number}` | number
    initialSearch?: boolean
    isReadingMode: () => boolean
    kwic?: ApiKwic[]
    makeRequest: (isPaging?: boolean) => void
    onProgress: (progressObj: ProgressReport<"query">, isPaging?: boolean) => void
    page?: number
    pageChange: (page: number) => void
    proxy: KwicProxy
    randomSeed?: number
    reading_mode?: boolean
    readingChange: () => void
    renderCompleteResult: (data: QueryResponse, isPaging?: boolean) => void
    renderResult: (data: QueryResponse) => void
    toggleReading: () => void
}

angular.module("korpApp").component("resultsHits", {
    template: html`
        <div class="results-kwic" ng-class="{reading_mode : reading_mode, loading: $ctrl.loading}">
            <korp-error ng-if="error" message="{{error}}"></korp-error>
            <kwic
                ng-if="!error"
                aborted="aborted"
                loading="$ctrl.loading"
                active="$ctrl.isActive"
                hits-in-progress="hitsInProgress"
                hits="hits"
                kwic-input="kwic"
                corpus-hits="corpusHits"
                is-reading="reading_mode"
                page="page"
                page-event="pageChange"
                on-reading-change="toggleReading"
                hits-per-page="hitsPerPage"
                prev-params="proxy.prevParams"
                prev-url="proxy.prevUrl"
                corpus-order="corpusOrder"
                show-search-options="true"
            ></kwic>
            <json-button endpoint="'query'" params="proxy.prevParams"></json-button>
        </div>
    `,
    bindings: {
        isActive: "<",
        loading: "<",
        setProgress: "<",
    },
    controller: [
        "$location",
        "$rootScope",
        "$scope",
        "$timeout",
        "utils",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: KwicCtrlScope,
            $timeout: ITimeoutService,
            utils: UtilsService
        ) {
            const $ctrl = this as KwicCtrlController

            const s = $scope

            s.initialSearch = true

            $rootScope.$on("make_request", (msg, cqp) => {
                $scope.cqp = cqp
                // only set this on the initial search, not when paging
                $scope.hitsPerPage = $location.search()["hpp"] || settings["hits_per_page_default"]

                // reset randomSeed when doing a search, but not for the first request
                if (!$scope.initialSearch) {
                    $scope.randomSeed = undefined
                } else {
                    $scope.randomSeed = Number($location.search()["random_seed"])
                }
                $scope.initialSearch = false
                $scope.makeRequest(false)
            })

            s.proxy = kwicProxyFactory.create()

            $scope.page = Number($location.search().page) || 0

            s.pageChange = function (page) {
                s.page = page
                s.makeRequest(true)
            }

            // Sync url param for page number
            utils.setupHash($scope, { key: "page", val_in: Number })

            s.$on("abort_requests", () => {
                s.proxy.abort()
                if ($ctrl.loading) {
                    s.aborted = true
                    $ctrl.setProgress(false, 0)
                }
            })

            s.readingChange = function () {
                s.makeRequest(false)
            }

            s.reading_mode = $location.search().reading_mode
            s.toggleReading = function () {
                s.reading_mode = !s.reading_mode
                $location.search("reading_mode", s.reading_mode || undefined)
                s.readingChange()
            }

            s.buildQueryOptions = (isPaging) => {
                let avoidContext, preferredContext
                const getSortParams = function () {
                    const { sort } = $location.search()
                    if (!sort) {
                        return {}
                    }
                    if (sort === "random") {
                        if (!isPaging && !s.randomSeed) {
                            s.randomSeed = Math.ceil(Math.random() * 10000000)
                            $location.search("random_seed", s.randomSeed)
                        }
                        return {
                            sort,
                            random_seed: s.randomSeed,
                        }
                    } else {
                        $location.search("random_seed", null)
                    }
                    return { sort }
                }

                if (s.isReadingMode()) {
                    preferredContext = settings["default_reading_context"]
                    avoidContext = settings["default_overview_context"]
                } else {
                    preferredContext = settings["default_overview_context"]
                    avoidContext = settings["default_reading_context"]
                }

                const context = settings.corpusListing.getContextQueryString(preferredContext, avoidContext)

                if (!isPaging) {
                    s.proxy.queryData = undefined
                }

                const cqp = s.cqp || s.proxy.prevCQP
                if (!cqp) throw new Error("cqp missing")

                const params: QueryParams = {
                    corpus: settings.corpusListing.stringifySelected(),
                    cqp,
                    query_data: s.proxy.queryData,
                    context,
                    default_context: preferredContext,
                    incremental: true,
                }

                Object.assign(params, getSortParams())
                return params
            }

            s.onProgress = (progressObj, isPaging) => {
                $ctrl.setProgress(true, Math.round(progressObj.percent))
                if (!isPaging && progressObj.hits !== null) {
                    s.hitsInProgress = progressObj.hits
                }
            }

            s.makeRequest = (isPaging = false) => {
                if (!isPaging) {
                    s.page = Number($location.search().page) || 0
                }

                // Abort any running request
                if ($ctrl.loading) s.proxy.abort()

                $ctrl.setProgress(true, 0)
                s.aborted = false
                s.error = undefined

                const ajaxParams = s.buildQueryOptions(isPaging)

                s.proxy
                    .makeRequest(
                        { ajaxParams },
                        s.page,
                        (progressObj) => $timeout(() => s.onProgress(progressObj, isPaging)),
                        (data) => $timeout(() => s.renderResult(data))
                    )
                    .then((data) =>
                        $timeout(() => {
                            $ctrl.setProgress(false, 0)
                            s.renderCompleteResult(data, isPaging)
                        })
                    )
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => {
                            s.error = error
                            $ctrl.setProgress(false, 0)
                        })
                    })
            }

            s.isReadingMode = () => {
                return s.reading_mode || false
            }

            s.renderCompleteResult = (data, isPaging) => {
                s.renderResult(data)
                if (!isPaging) {
                    s.hits = data.hits
                    s.hitsInProgress = data.hits
                    s.corpusHits = data.corpus_hits
                }
            }

            s.renderResult = (data) => {
                if (!data.kwic) {
                    data.kwic = []
                }

                s.corpusOrder = data.corpus_order
                s.kwic = data.kwic
            }
        },
    ],
})
