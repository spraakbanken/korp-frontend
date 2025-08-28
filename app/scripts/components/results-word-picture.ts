/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import { RelationsProxy, RelationsEmptyError, TableDrawData, RelationsQuery } from "@/backend/proxy/relations-proxy"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import { RelationsSort } from "@/backend/types/relations"
import { loc } from "@/i18n"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/word-picture"
import { StoreService } from "@/services/store"

type ResultsWordPictureController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsWordPictureScope = IScope & {
    $root: RootScope
    activated: boolean
    changeSort: (sort: RelationsSort) => void
    data?: TableDrawData[]
    error?: string
    proxy: RelationsProxy
    /** Sort param for the relations request. */
    sort: RelationsSort
    warning?: string
}

angular.module("korpApp").component("resultsWordPicture", {
    template: html`
        <div ng-if="!error">
            <word-picture data="data" on-sort-change="changeSort(sort)" sort="sort" warning="warning"></word-picture>
        </div>
        <korp-error ng-if="error" message="{{error}}"></korp-error>
        <json-button ng-if="!warning && !error" endpoint="relations" data="proxy.response"></json-button>
    `,
    bindings: {
        isActive: "<",
        loading: "<",
        setProgress: "<",
    },
    controller: [
        "$scope",
        "$timeout",
        "store",
        function ($scope: ResultsWordPictureScope, $timeout: ITimeoutService, store: StoreService) {
            const $ctrl = this as ResultsWordPictureController
            $scope.proxy = new RelationsProxy()
            $scope.activated = false
            $scope.sort = "mi"

            store.watch("globalFilter", () => {
                if (store.globalFilter) $scope.warning = loc("word_pic_global_filter", store.lang)
            })

            store.watch("activeSearch", (search) => {
                if (!search) return
                makeRequest()
            })

            // Enable word picture when opening tab
            $ctrl.$onChanges = (changes) => {
                if (changes.isActive?.currentValue && !$scope.activated) {
                    $scope.activated = true
                    if (store.activeSearch) makeRequest()
                }
            }

            $scope.$on("abort_requests", () => {
                $scope.proxy.abort()
                if ($ctrl.loading) {
                    $scope.warning = loc("search_aborted", store.lang)
                    $ctrl.setProgress(false, 0)
                }
            })

            $scope.changeSort = (sort) => {
                $scope.sort = sort
                makeRequest()
            }

            function resetView(warning?: string) {
                $scope.data = undefined
                $scope.error = undefined
                $scope.warning = warning
            }

            function makeRequest() {
                if (!$scope.activated) return resetView()

                let query: RelationsQuery
                try {
                    query = RelationsProxy.parseCqp(store.activeSearch!.cqp)
                } catch (error) {
                    // The search query is not compatible with word picture
                    console.warn(error)
                    return resetView(loc("word_pic_bad_search", store.lang))
                }

                if (store.globalFilter) return resetView(loc("word_pic_global_filter", store.lang))

                // Abort any running request
                if ($ctrl.loading) $scope.proxy.abort()

                $ctrl.setProgress(true, 0)
                $scope.warning = undefined
                $scope.proxy
                    .setProgressHandler((progressObj) => $timeout(() => $ctrl.setProgress(true, progressObj.percent)))
                    .makeRequest(query.type, query.word, $scope.sort)
                    .then((data) => $timeout(() => ($scope.data = data)))
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return

                        if (error instanceof RelationsEmptyError) {
                            resetView(loc("no_stats_results", store.lang))
                            return
                        }

                        console.error(error)
                        $timeout(() => {
                            $scope.error = error
                            $ctrl.setProgress(false, 0)
                        })
                    })
                    .finally(() => $timeout(() => $ctrl.setProgress(false, 0)))
            }
        },
    ],
})
