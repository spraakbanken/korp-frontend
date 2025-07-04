/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import { html } from "@/util"
import settings from "@/settings"
import { ApiKwic } from "@/backend/types"
import kwicProxyFactory, { KorpQueryRequestOptions, KwicProxy } from "@/backend/kwic-proxy"
import "@/components/korp-error"
import "@/components/kwic"
import { StoreService } from "@/services/store"

type ResultsExamplesController = IController & {
    isActive: boolean
    isReading: boolean
    loading: boolean
    queryParams: KorpQueryRequestOptions
    setProgress: (event: { loading: boolean; progress: number }) => void
    closeDynamicTab: () => void
}

type ResultsExamplesScope = IScope & {
    aborted?: boolean
    corpusHits?: Record<string, number>
    corpusOrder?: string[]
    cqp?: string
    error?: string
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage: number
    isReading: boolean
    kwic?: ApiKwic[]
    page?: number
    pageChange: (page: number) => void
    proxy: KwicProxy
    toggleReading: () => void
}

angular.module("korpApp").component("resultsExamples", {
    template: html`<korp-error ng-if="error" message="{{error}}"></korp-error>
        <div class="results-kwic" ng-if="!error" ng-class="{reading_mode: isReading, loading: $ctrl.loading}">
            <kwic
                aborted="aborted"
                context="isReading"
                loading="$ctrl.loading"
                active="$ctrl.isActive"
                hits-in-progress="hitsInProgress"
                hits="hits"
                kwic-input="kwic"
                corpus-hits="corpusHits"
                on-context-change="toggleReading"
                page="page"
                page-event="pageChange"
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
        queryParams: "<",
        setProgress: "&",
    },
    controller: [
        "$scope",
        "$timeout",
        "store",
        function ($scope: ResultsExamplesScope, $timeout: ITimeoutService, store: StoreService) {
            const $ctrl = this as ResultsExamplesController

            $scope.proxy = kwicProxyFactory.create()

            $ctrl.$onInit = () => {
                // Context mode can be set when creating the tab. If not, use URL param
                $scope.isReading = $ctrl.isReading ?? store.reading_mode
                $scope.hitsPerPage = store.hpp
                makeRequest()
            }

            $scope.$on("abort_requests", () => {
                $scope.proxy.abort()
                if ($ctrl.loading) {
                    $scope.aborted = true
                    $ctrl.setProgress({ loading: false, progress: 0 })
                }
            })

            $scope.pageChange = function (page) {
                $scope.page = page
                makeRequest()
            }

            $scope.toggleReading = function () {
                $scope.isReading = !$scope.isReading
                makeRequest()
            }

            function makeRequest(): void {
                const opts = $ctrl.queryParams
                opts.in_order = store.in_order

                // example tab cannot handle incremental = true
                opts.incremental = false

                opts.start = ($scope.page || 0) * $scope.hitsPerPage
                opts.end = opts.start + $scope.hitsPerPage - 1

                const preferredContext = $scope.isReading
                    ? settings["default_reading_context"]
                    : settings["default_overview_context"]
                const avoidContext = $scope.isReading
                    ? settings["default_overview_context"]
                    : settings["default_reading_context"]

                opts.default_context = preferredContext
                const corpora = opts.corpus ? opts.corpus.split(",") : []
                opts.context = settings.corpusListing.getContextQueryStringFromCorpusId(
                    corpora,
                    preferredContext,
                    avoidContext
                )

                opts.default_within ??= store.within
                opts.within = settings.corpusListing.getWithinParam(opts.default_within)

                // Abort any running request
                if ($ctrl.loading) $scope.proxy.abort()

                $ctrl.setProgress({ loading: true, progress: 0 })
                $scope.proxy
                    .makeRequest(opts)
                    .then((data) =>
                        $timeout(() => {
                            if (!data.kwic) data.kwic = []
                            $scope.corpusOrder = data.corpus_order
                            $scope.kwic = data.kwic
                            $scope.hits = data.hits
                            $scope.hitsInProgress = data.hits
                            $scope.corpusHits = data.corpus_hits
                        })
                    )
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => ($scope.error = error))
                    })
                    .finally(() => $timeout(() => $ctrl.setProgress({ loading: false, progress: 0 })))
            }
        },
    ],
})
