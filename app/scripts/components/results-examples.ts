/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import { html } from "@/util"
import { ApiKwic } from "@/backend/types"
import "@/components/korp-error"
import "@/components/kwic"
import { StoreService } from "@/services/store"
import { ExampleTask } from "@/backend/example-task"
import { WordpicExampleTask } from "@/backend/wordpic-example-task"

type ResultsExamplesController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
    task: ExampleTask | WordpicExampleTask
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
                params="task.proxy.params"
                corpus-order="corpusOrder"
            ></kwic>
        </div>`,
    bindings: {
        isActive: "<",
        loading: "<",
        setProgress: "<",
        task: "<",
    },
    controller: [
        "$scope",
        "$timeout",
        "store",
        function ($scope: ResultsExamplesScope, $timeout: ITimeoutService, store: StoreService) {
            const $ctrl = this as ResultsExamplesController

            $ctrl.$onInit = () => {
                // Context mode can be set when creating the tab. If not, use URL param
                $scope.isReading = $ctrl.task.isReading ?? store.reading_mode
                $scope.hitsPerPage = store.hpp
                makeRequest()
            }

            $scope.$on("abort_requests", () => {
                $ctrl.task.abort()
                if ($ctrl.loading) {
                    $scope.aborted = true
                    $ctrl.setProgress(false, 0)
                }
            })

            $scope.pageChange = function (page) {
                $scope.page = page
                makeRequest()
            }

            $scope.toggleReading = function () {
                // TODO For wordpic examples, do not allow switching mode, because /relations_sentences does not support it
                $scope.isReading = !$scope.isReading
                $ctrl.task.isReading = $scope.isReading
                makeRequest()
            }

            function makeRequest(): void {
                // Abort any running request
                if ($ctrl.loading) $ctrl.task.abort()

                $ctrl.setProgress(true, 0)
                $ctrl.task
                    .send($scope.page || 0, $scope.hitsPerPage)
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
                    .finally(() => $timeout(() => $ctrl.setProgress(false, 0)))
            }
        },
    ],
})
