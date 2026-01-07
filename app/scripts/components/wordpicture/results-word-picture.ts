import angular, { IController, IScope, ITimeoutService } from "angular"
import { RelationsProxy, RelationsEmptyError, RelationsQuery } from "@/backend/proxy/relations-proxy"
import { WordPicture } from "@/word-picture"
import { html } from "@/util"
import { RelationsSort } from "@/backend/types/relations"
import { loc } from "@/i18n"
import "@/components/util/help-box"
import "@/components/util/json_button"
import "@/components/util/korp-error"
import "@/components/wordpicture/word-picture"
import { StoreService } from "@/services/store"
import { CsvType, downloadCsvFile } from "@/csv"

type ResultsWordPictureController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsWordPictureScope = IScope & {
    activated: boolean
    data?: WordPicture
    downloadOption: CsvType | ""
    error?: string
    limit: string // Number as string to work with <select ng-model>
    limitOptions: number[]
    proxy: RelationsProxy
    showWordClass: boolean
    /** Sort param for the relations request. */
    sort: RelationsSort
    /** Model for the sort input. */
    sortLocal: RelationsSort
    warning?: string
}

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]

angular.module("korpApp").component("resultsWordPicture", {
    template: html`
        <div ng-if="warning" class="korp-warning" role="status">{{warning}}</div>
        <korp-error ng-if="error" message="{{error}}"></korp-error>

        <div ng-show="!error && data">
            <div class="bg-gray-100 mb-4 p-2 flex flex-wrap items-baseline justify-between gap-4">
                <div class="flex flex-wrap items-baseline gap-4">
                    <label>
                        <input ng-model="showWordClass" type="checkbox" />
                        {{'show_wordclass' | loc:$root.lang}}
                    </label>
                    <select ng-model="limit">
                        <option ng-repeat="option in limitOptions" value="{{option}}">
                            {{'word_pic_show_some' | loc:$root.lang}} {{option}} {{'word_pic_hits' | loc:$root.lang}}
                        </option>
                    </select>
                    <div class="flex flex-wrap gap-2">
                        <label>
                            {{'sort_by' | loc:$root.lang}}:
                            <select ng-model="sortLocal">
                                <option value="mi">{{'stat_lmi' | loc:$root.lang}}</option>
                                <option value="freq">{{'stat_frequency' | loc:$root.lang}}</option>
                            </select>
                            <i
                                class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                uib-tooltip="{{'stat_lmi' | loc:$root.lang}}: {{'stat_lmi_help' | loc:$root.lang}}"
                            ></i>
                        </label>
                    </div>
                </div>

                <div class="flex flex-wrap items-baseline gap-4">
                    <select ng-show="!$ctrl.loading && data && !warning && !error" ng-model="downloadOption">
                        <option value="">{{ "download" | loc:$root.lang }}</option>
                        <option value="comma">{{ "csv_comma" | loc:$root.lang }}</option>
                        <option value="tab">{{ "csv_tab" | loc:$root.lang }}</option>
                    </select>

                    <json-button
                        ng-if="!$ctrl.loading && data && !warning && !error"
                        endpoint="relations"
                        data="proxy.response"
                    ></json-button>
                </div>
            </div>

            <word-picture data="data" limit="limit" show-word-class="showWordClass" sort="sort"></word-picture>
        </div>

        <help-box>
            <p>{{'word_pic_description' | loc:$root.lang}}</p>
            <p>{{'word_pic_result_description' | loc:$root.lang}}</p>
        </help-box>
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
            $scope.activated = false
            $scope.downloadOption = ""
            $scope.limit = String(LIMITS[0])
            $scope.limitOptions = [...LIMITS]
            $scope.proxy = new RelationsProxy()
            $scope.sort = "mi"
            $scope.sortLocal = "mi"

            $scope.$watch("data", () => {
                if (!$scope.data) return
                // Include options up to the first that is higher than the longest column
                const max = $scope.data.getMaxColumnLength()
                const endIndex = LIMITS.findIndex((limit) => limit >= max)
                $scope.limitOptions = LIMITS.slice(0, endIndex + 1)
                // Clamp previously selected value
                if (Number($scope.limit) > LIMITS[endIndex]) $scope.limit = String(LIMITS[endIndex])
                // Apply sort
                $scope.sort = $scope.sortLocal
            })

            $scope.$watch("sortLocal", () => $scope.sortLocal && makeRequest())

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

            function resetView(warning?: string) {
                $scope.data = undefined
                $scope.error = undefined
                $scope.warning = warning
            }

            function makeRequest() {
                if (!$scope.activated) return resetView()

                if (store.globalFilter) return resetView(loc("word_pic_global_filter", store.lang))

                let query: RelationsQuery
                try {
                    query = RelationsProxy.parseCqp(store.activeSearch!.cqp)
                } catch (error) {
                    // The search query is not compatible with word picture
                    console.warn(error)
                    return resetView(loc("word_pic_bad_search", store.lang))
                }

                // Abort any running request
                if ($ctrl.loading) $scope.proxy.abort()

                $ctrl.setProgress(true, 0)
                $scope.warning = undefined
                $scope.proxy
                    .setProgressHandler((progressObj) => $timeout(() => $ctrl.setProgress(true, progressObj.percent)))
                    .makeRequest(query.type, query.word, $scope.sortLocal)
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

            // Create and download CSV file when the download selector is used
            $scope.$watch("downloadOption", () => {
                // Skip if empty (at init or if the label option is selected)
                if (!$scope.downloadOption) return

                if (!$scope.data) throw new Error("Word picture data missing")
                const rows = $scope.data.generateCsv()
                downloadCsvFile("word-picture", rows, $scope.downloadOption)

                // Reset to the label option
                $scope.downloadOption = ""
            })
        },
    ],
})
