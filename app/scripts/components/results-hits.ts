/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import kwicProxyFactory, { type KwicProxy } from "@/backend/kwic-proxy"
import { ApiKwic } from "@/backend/types"
import { QueryParams, QueryResponse } from "@/backend/types/query"
import { RootScope } from "@/root-scope.types"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/kwic"
import "@/services/utils"
import { html } from "@/util"
import { StoreService } from "@/services/store"
import { pageToRange } from "@/backend/common"

type ResultsHitsController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsHitsScope = IScope & {
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
    initialSearch?: boolean
    kwic?: ApiKwic[]
    page?: number
    pageChange: (page: number) => void
    proxy: KwicProxy
    isReading?: boolean
    toggleReading: () => void
}

angular.module("korpApp").component("resultsHits", {
    template: html`
        <div class="results-kwic" ng-class="{reading_mode : isReading, loading: $ctrl.loading}">
            <korp-error ng-if="error" message="{{error}}"></korp-error>
            <kwic
                ng-if="!error"
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
        "$rootScope",
        "$scope",
        "$timeout",
        "store",
        function ($rootScope: RootScope, $scope: ResultsHitsScope, $timeout: ITimeoutService, store: StoreService) {
            const $ctrl = this as ResultsHitsController

            $scope.initialSearch = true
            $scope.proxy = kwicProxyFactory.create()
            $scope.isReading = store.reading_mode

            $ctrl.$onInit = () => {
                $scope.page = store.page
                $scope.hitsPerPage = store.hpp
            }

            $rootScope.$on("make_request", (msg, cqp) => {
                $scope.cqp = cqp
                // only set this on the initial search, not when paging
                $scope.hitsPerPage = store.hpp

                // reset seed when doing a search, but not for the first request
                if (!$scope.initialSearch) {
                    store.random_seed = undefined
                }
                $scope.initialSearch = false
                makeRequest(false)
            })

            store.watch("page", (value, old) => {
                if (value === old) return
                $scope.page = store.page
                makeRequest(true)
            })

            $scope.pageChange = (page) => {
                store.page = page
            }

            $scope.$on("abort_requests", () => {
                $scope.proxy.abort()
                if ($ctrl.loading) {
                    $scope.aborted = true
                    $ctrl.setProgress(false, 0)
                }
            })

            $scope.toggleReading = function () {
                $scope.isReading = !$scope.isReading
                store.reading_mode = $scope.isReading
                makeRequest()
            }

            function buildQueryOptions(isPaging?: boolean): QueryParams {
                const contextParams = settings.corpusListing.getContextParam($scope.isReading)
                const { start, end } = pageToRange(store.page || 0, store.hpp)

                if (!isPaging) {
                    $scope.proxy.queryData = undefined
                }

                const cqp = $scope.cqp
                if (!cqp) throw new Error("cqp missing")

                const default_within = store.within
                const within = settings.corpusListing.getWithinParam(default_within)

                const params: QueryParams = {
                    corpus: settings.corpusListing.stringifySelected(),
                    cqp,
                    in_order: store.in_order,
                    default_within,
                    within,
                    query_data: $scope.proxy.queryData,
                    ...contextParams,
                    sort: store.sort || undefined,
                    start,
                    end,
                    incremental: true,
                }

                if (store.sort == "random") {
                    // Randomize new seed if new search
                    if (!isPaging && !store.random_seed) {
                        store.random_seed = Math.ceil(Math.random() * 10000000)
                    }
                    params.random_seed = store.random_seed
                } else {
                    store.random_seed = undefined
                }

                return params
            }

            function makeRequest(isPaging?: boolean) {
                // Abort any running request
                if ($ctrl.loading) $scope.proxy.abort()

                $ctrl.setProgress(true, 0)
                $scope.aborted = false
                $scope.error = undefined

                $scope.proxy
                    .setProgressHandler((progressObj) =>
                        $timeout(() => {
                            $ctrl.setProgress(true, Math.round(progressObj.percent))
                            if (!isPaging && progressObj.hits !== null) {
                                $scope.hitsInProgress = progressObj.hits
                            }
                            // Store the KWIC data for the current page as soon as it is availbale.
                            // The request may continue to count hits across corpora.
                            if ("kwic" in progressObj.data) {
                                renderResult(progressObj.data as QueryResponse)
                            }
                        })
                    )
                    .makeRequest(buildQueryOptions(isPaging))
                    .then((data) =>
                        $timeout(() => {
                            $ctrl.setProgress(false, 0)
                            renderResult(data)
                            if (!isPaging) {
                                $scope.hits = data.hits
                                $scope.hitsInProgress = data.hits
                                $scope.corpusHits = data.corpus_hits
                            }
                        })
                    )
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => {
                            $scope.error = error
                            $ctrl.setProgress(false, 0)
                        })
                    })
            }

            function renderResult(data: QueryResponse) {
                if (!data.kwic) data.kwic = []
                $scope.corpusOrder = data.corpus_order
                $scope.kwic = data.kwic
            }
        },
    ],
})
