/** @format */
import angular, { IController, ITimeoutService } from "angular"
import _ from "lodash"
import { html } from "@/util"
import settings from "@/settings"
import { KwicCtrlScope } from "./results-hits"
import { LocationService } from "@/urlparams"
import { ApiKwic, ProgressReport } from "@/backend/types"
import { QueryResponse } from "@/backend/types/query"
import kwicProxyFactory, { KorpQueryRequestOptions, KwicProxy } from "@/backend/kwic-proxy"

type ExampleCtrlController = IController & {
    isActive: boolean
    isReading: boolean
    loading: boolean
    queryParams: KorpQueryRequestOptions
    setProgress: (loading: boolean, progress: number) => void
    newDynamicTab: () => void
    closeDynamicTab: () => void
}

type ScopeBase = Omit<KwicCtrlScope, "makeRequest">

type ExampleCtrlScope = ScopeBase & {
    aborted?: boolean
    closeTab: (idx: number, e: Event) => void
    corpusHits?: Record<string, number>
    corpusOrder?: string[]
    cqp?: string
    error?: string
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage?: `${number}` | number
    isReading: boolean
    kwic?: ApiKwic[]
    loading?: boolean
    makeRequest: (isPaging?: boolean) => void
    onProgress: (progressObj: ProgressReport<"query">, isPaging?: boolean) => void
    page?: number
    pageChange: (page: number) => void
    proxy: KwicProxy
    readingChange: () => void
    renderCompleteResult: (data: QueryResponse, isPaging?: boolean) => void
    renderResult: (data: QueryResponse) => void
    setupReadingWatch: () => void
    toggleReading: () => void
}

angular.module("korpApp").component("resultsExamples", {
    template: html`<korp-error ng-if="error" message="{{error}}"></korp-error>
        <div class="results-kwic" ng-if="!error" ng-class="{reading_mode: isReading, loading: $ctrl.loading}">
            <kwic
                aborted="aborted"
                loading="$ctrl.loading"
                active="$ctrl.isActive"
                hits-in-progress="hitsInProgress"
                hits="hits"
                kwic-input="kwic"
                corpus-hits="corpusHits"
                is-reading="isReading"
                page="page"
                page-event="pageChange"
                on-reading-change="toggleReading"
                hits-per-page="hitsPerPage"
                prev-params="proxy.prevParams"
                prev-url="proxy.prevUrl"
                corpus-order="corpusOrder"
            ></kwic>
        </div>`,
    bindings: {
        isActive: "<",
        isReading: "<",
        loading: "<",
        newDynamicTab: "<",
        queryParams: "<",
        setProgress: "<",
    },
    controller: [
        "$location",
        "$scope",
        "$timeout",
        function ($location: LocationService, $scope: ExampleCtrlScope, $timeout: ITimeoutService) {
            const $ctrl = this as ExampleCtrlController

            const s = $scope
            s.proxy = kwicProxyFactory.create()
            s.hits = undefined
            s.hitsInProgress = undefined
            s.hitsPerPage = $location.search()["hpp"] || settings["hits_per_page_default"]
            s.page = 0
            s.error = undefined
            s.kwic = undefined
            s.corpusHits = undefined
            s.aborted = false

            $ctrl.$onInit = () => {
                $ctrl.newDynamicTab() // TODO Move this call to when $root.kwicTab is changed?
                // Context mode can be set when creating the tab. If not, use URL param
                $scope.isReading = $ctrl.isReading ?? $location.search().reading_mode
                if ($ctrl.queryParams) {
                    // TODO Is this ever false?
                    s.makeRequest()
                }
            }

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

            s.onProgress = (progressObj, isPaging) => {
                $ctrl.setProgress(true, Math.round(progressObj.percent))
                if (!isPaging && progressObj.hits !== null) {
                    s.hitsInProgress = progressObj.hits
                }
            }

            s.renderCompleteResult = (data, isPaging) => {
                s.renderResult(data)
                if (!isPaging) {
                    s.hits = data.hits
                    s.hitsInProgress = data.hits
                    s.corpusHits = data.corpus_hits
                }
            }

            s.pageChange = function (page) {
                s.page = page
                s.makeRequest()
            }

            s.toggleReading = function () {
                $scope.isReading = !$scope.isReading
                s.makeRequest()
            }

            s.setupReadingWatch = _.once(function () {
                let init = true
                return s.$watch("reading_mode", function () {
                    if (!init) {
                        s.readingChange()
                    }
                    init = false
                })
            })

            s.renderResult = (data) => {
                if (!data.kwic) {
                    data.kwic = []
                }

                s.corpusOrder = data.corpus_order
                s.kwic = data.kwic

                s.setupReadingWatch()
            }

            s.makeRequest = () => {
                const items_per_page = Number($location.search().hpp || settings["hits_per_page_default"])
                const opts = $ctrl.queryParams

                // example tab cannot handle incremental = true
                opts.ajaxParams.incremental = false

                opts.ajaxParams.start = (s.page || 0) * items_per_page
                opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

                const preferredContext = s.isReading
                    ? settings["default_reading_context"]
                    : settings["default_overview_context"]
                const avoidContext = s.isReading
                    ? settings["default_overview_context"]
                    : settings["default_reading_context"]

                const corpora = opts.ajaxParams.corpus ? opts.ajaxParams.corpus.split(",") : []
                const context = settings.corpusListing.getContextQueryStringFromCorpusId(
                    corpora,
                    preferredContext,
                    avoidContext
                )
                _.extend(opts.ajaxParams, { context, default_context: preferredContext })

                // Abort any running request
                if ($ctrl.loading) s.proxy.abort()

                $ctrl.setProgress(true, 0)
                s.proxy
                    .makeRequest(opts, undefined)
                    .then((data) =>
                        $timeout(() => {
                            s.renderResult(data)
                            s.renderCompleteResult(data)
                        })
                    )
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => (s.error = error))
                    })
                    .finally(() => $timeout(() => $ctrl.setProgress(false, 0)))
            }
        },
    ],
})
