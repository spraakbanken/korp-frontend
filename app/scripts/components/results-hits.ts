/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import kwicProxyFactory, { type KwicProxy } from "@/backend/proxy/kwic-proxy"
import { ApiKwic } from "@/backend/types"
import { QueryResponse } from "@/backend/types/query"
import { RootScope } from "@/root-scope.types"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/kwic"
import "@/services/utils"
import { html } from "@/util"
import { StoreService } from "@/services/store"

type ResultsHitsController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsHitsScope = IScope & {
    aborted?: boolean
    corpusHits?: Record<string, number>
    corpusOrder?: string[]
    cqp: string
    error?: string
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage: number
    initialSearch?: boolean
    kwic?: ApiKwic[]
    onUpdateSearch: () => void
    page?: number
    pageChange: (page: number) => void
    proxy: KwicProxy
    isReading: boolean
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
                params="proxy.params"
                corpus-order="corpusOrder"
                show-search-options="true"
                on-update-search="onUpdateSearch()"
            ></kwic>
            <json-button endpoint="query" data="proxy.response"></json-button>
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
            $scope.proxy = kwicProxyFactory.create(store)
            $scope.isReading = store.reading_mode || false

            $ctrl.$onInit = () => {
                $scope.page = store.page
                $scope.hitsPerPage = store.hpp
            }

            store.watch("activeSearch", (search) => {
                if (!search) return
                $scope.cqp = search.cqp
                $scope.onUpdateSearch()
            })

            $scope.onUpdateSearch = () => {
                // only set this on the initial search, not when paging
                $scope.hitsPerPage = store.hpp

                // reset seed when doing a search, but not for the first request
                if (!$scope.initialSearch) {
                    store.random_seed = undefined
                }
                $scope.initialSearch = false
                makeRequest(false)
            }

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

            function makeRequest(isPaging?: boolean) {
                // Abort any running request
                if ($ctrl.loading) $scope.proxy.abort()

                $ctrl.setProgress(true, 0)
                $scope.aborted = false
                $scope.error = undefined
                let hasKwic = false

                // Randomize new seed if new search
                if (store.sort == "random" && !store.random_seed && !isPaging) {
                    store.random_seed = Math.ceil(Math.random() * 10000000)
                } else store.random_seed = undefined

                $scope.proxy
                    .setProgressHandler((progressObj) =>
                        $timeout(() => {
                            $ctrl.setProgress(true, Math.round(progressObj.percent))
                            if (!isPaging && progressObj.hits !== null) {
                                $scope.hitsInProgress = progressObj.hits
                            }
                            // Store the KWIC data for the current page as soon as it is available.
                            // The request may continue to count hits across corpora.
                            if (!hasKwic && "kwic" in progressObj.data) {
                                renderResult(progressObj.data as QueryResponse)
                                hasKwic = true
                            }
                        })
                    )
                    .makeRequest($scope.cqp, isPaging)
                    .then((data) =>
                        $timeout(() => {
                            $ctrl.setProgress(false, 0)
                            if (!hasKwic) renderResult(data)
                            if (!isPaging) {
                                $scope.hits = data.hits
                                $scope.hitsInProgress = data.hits
                                $scope.corpusHits = data.corpus_hits
                                $scope.corpusOrder = data.corpus_order
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
                $scope.kwic = data.kwic
            }
        },
    ],
})
