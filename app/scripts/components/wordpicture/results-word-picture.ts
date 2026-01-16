import angular, { IController, IScope, ITimeoutService } from "angular"
import { RelationsProxy, RelationsEmptyError, RelationsQuery } from "@/backend/proxy/relations-proxy"
import { csvPrepend, MatchedRelation, WordPicture } from "@/word-picture"
import { html } from "@/util"
import { RelationsSort } from "@/backend/types/relations"
import { loc } from "@/i18n"
import "@/components/util/help-box"
import "@/components/util/json_button"
import "@/components/util/korp-error"
import "@/components/wordpicture/word-picture"
import { StoreService } from "@/services/store"
import { CsvType, downloadCsvFile } from "@/csv"
import { ProgressHandler } from "@/backend/types"
import { RelationsTimeProxy } from "@/backend/proxy/relations-time-proxy"
import { WordpicExampleTask } from "@/task/wordpic-example-task"
import { RootScope } from "@/root-scope.types"

type ResultsWordPictureController = IController & {
    isActive: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsWordPictureScope = IScope & {
    activated: boolean
    data?: { range: string; data: WordPicture }[]
    downloadOption: CsvType | ""
    error?: string
    limit: string // Number as string to work with <select ng-model>
    limitOptions: number[]
    onClickExample: (relation: MatchedRelation) => void
    /** The value needs to be an object in order to work with ng-model within ng-repeat */
    periodSelected?: { value: string }
    proxy: RelationsProxy
    proxyTime: RelationsTimeProxy
    showWordClass: boolean
    /** Sort param for the relations request. */
    sort: RelationsSort
    /** Model for the sort input. */
    sortLocal: RelationsSort
    /** Whether data should be split by timespans */
    split: PeriodOption | false
    /** Model for the split-by-time input. */
    splitLocal: PeriodOption | false
    warning?: string
}

type PeriodOption = { size: number; order: "asc" | "desc" }

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]

angular.module("korpApp").component("resultsWordPicture", {
    template: html`
        <div ng-if="warning" class="korp-warning" role="status">{{warning}}</div>
        <korp-error ng-if="error" message="{{error}}"></korp-error>

        <div ng-show="!error && data">
            <div class="bg-gray-100 mb-4 p-2 flex flex-wrap items-baseline justify-between gap-4">
                <div class="flex flex-wrap items-baseline gap-4">
                    <label>
                        {{'word_pic_split' | loc:$root.lang}}:
                        <select ng-model="splitLocal">
                            <option ng-value="false">{{'word_pic_split_none' | loc:$root.lang}}</option>
                            <option ng-value="{size: 1, order: 'desc'}">
                                1 {{'word_pic_split_option_desc' | loc:$root.lang}}
                            </option>
                            <option ng-value="{size: 1, order: 'asc'}">
                                1 {{'word_pic_split_option_asc' | loc:$root.lang}}
                            </option>
                            <option ng-value="{size: 5, order: 'desc'}">
                                5 {{'word_pic_split_option_desc' | loc:$root.lang}}
                            </option>
                            <option ng-value="{size: 5, order: 'asc'}">
                                5 {{'word_pic_split_option_asc' | loc:$root.lang}}
                            </option>
                            <option ng-value="{size: 10, order: 'desc'}">
                                10 {{'word_pic_split_option_desc' | loc:$root.lang}}
                            </option>
                            <option ng-value="{size: 10, order: 'asc'}">
                                10 {{'word_pic_split_option_asc' | loc:$root.lang}}
                            </option>
                        </select>
                    </label>
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
                                <option value="freq">{{'stat_freq' | loc:$root.lang}}</option>
                                <option value="freq_relative">{{'stat_freq_relative' | loc:$root.lang}}</option>
                                <option value="mi">{{'stat_mi' | loc:$root.lang}}</option>
                                <option value="rmi">{{'stat_rmi' | loc:$root.lang}}</option>
                            </select>
                            <i
                                ng-show="sortLocal == 'mi' || sortLocal == 'rmi'"
                                class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                uib-tooltip="{{'stat_mi_help' | loc:$root.lang}}"
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

            <div ng-show="data && split" class="my-4 flex flex-wrap items-baseline gap-2">
                <span>{{'word_pic_period_select_label' | loc:$root.lang}}:</span>
                <div class="btn-group flex-wrap gap-y-1">
                    <button
                        type="button"
                        class="btn btn-default btn-sm"
                        ng-model="periodSelected.value"
                        uib-btn-radio="''"
                    >
                        {{'all' | loc:$root.lang}}
                    </button>
                    <button
                        ng-repeat="period in data"
                        type="button"
                        class="btn btn-default btn-sm"
                        ng-model="periodSelected.value"
                        uib-btn-radio="period.range"
                    >
                        {{period.range}}
                    </button>
                </div>
            </div>

            <div ng-repeat="period in data">
                <div ng-show="!split || !periodSelected.value || periodSelected.value == period.range">
                    <h3 ng-if="period.range != 'all'">{{ period.range }}</h3>
                    <word-picture
                        data="period.data"
                        limit="limit"
                        on-click-example="onClickExample(relation)"
                        show-word-class="showWordClass"
                        sort="sort"
                    ></word-picture>
                </div>
            </div>
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
        "$rootScope",
        "$scope",
        "$timeout",
        "store",
        function (
            $rootScope: RootScope,
            $scope: ResultsWordPictureScope,
            $timeout: ITimeoutService,
            store: StoreService,
        ) {
            const $ctrl = this as ResultsWordPictureController
            $scope.activated = false
            $scope.downloadOption = ""
            $scope.limit = String(LIMITS[0])
            $scope.limitOptions = [...LIMITS]
            $scope.periodSelected = { value: "" }
            $scope.proxy = new RelationsProxy()
            $scope.proxyTime = new RelationsTimeProxy()
            $scope.sort = "mi"
            $scope.sortLocal = "mi"
            $scope.splitLocal = false

            const progressHandler: ProgressHandler = (progressObj) =>
                $timeout(() => $ctrl.setProgress(true, progressObj.percent))
            $scope.proxy.setProgressHandler(progressHandler)
            $scope.proxyTime.setProgressHandler(progressHandler)

            $scope.$watch("data", () => {
                if (!$scope.data) return
                // Include options up to the first that is higher than the longest column
                const max = Math.max(...$scope.data.map((period) => period.data.getMaxColumnLength()))
                const endIndex = LIMITS.findIndex((limit) => limit >= max)
                $scope.limitOptions = LIMITS.slice(0, endIndex + 1)
                // Clamp previously selected value
                if (Number($scope.limit) > LIMITS[endIndex]) $scope.limit = String(LIMITS[endIndex])
                // Apply inputs
                $scope.sort = $scope.sortLocal
                $scope.split = $scope.splitLocal
            })

            $scope.$watch("sortLocal", () => $scope.sortLocal && makeRequest())
            $scope.$watch("splitLocal", () => $scope.splitLocal != undefined && makeRequest())

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

            async function makeRequest() {
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

                try {
                    if ($scope.splitLocal) {
                        const data = await $scope.proxyTime.makeRequest(
                            query.type,
                            query.word,
                            $scope.sortLocal,
                            $scope.splitLocal.size,
                        )
                        const periods = Object.entries(data)
                            .map(([range, data]) => ({ range, data }))
                            .sort((a, b) => a.range.localeCompare(b.range))
                        if ($scope.splitLocal.order == "desc") periods.reverse()
                        $timeout(() => ($scope.data = periods))
                    } else {
                        const data = await $scope.proxy.makeRequest(query.type, query.word, $scope.sortLocal)
                        $timeout(() => ($scope.data = [{ range: "all", data }]))
                    }
                } catch (error) {
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
                } finally {
                    $timeout(() => $ctrl.setProgress(false, 0))
                }
            }

            $scope.onClickExample = function (relation) {
                $rootScope.kwicTabs.push(new WordpicExampleTask(relation.source.join(","), !!$scope.split))
            }

            // Create and download CSV file when the download selector is used
            $scope.$watch("downloadOption", () => {
                // Skip if empty (at init or if the label option is selected)
                if (!$scope.downloadOption) return

                if (!$scope.data) throw new Error("Word picture data missing")

                // Assemble data from all periods
                let rows = []
                for (const period of $scope.data) {
                    let periodRows = period.data.generateCsv()
                    if ($scope.split) csvPrepend(periodRows, "period", period.range)

                    // Strip header except for the first set of rows
                    if (rows.length) periodRows.shift()
                    rows.push(...periodRows)
                }

                downloadCsvFile("word-picture", rows, $scope.downloadOption)

                // Reset to the label option
                $scope.downloadOption = ""
            })
        },
    ],
})
