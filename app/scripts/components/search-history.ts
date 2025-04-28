/** @format */
import { loc } from "@/i18n"
import { SearchHistoryService } from "@/services/search-history"
import { SearchesService } from "@/services/searches"
import { getSearchParamNames, LocationService, SearchParams } from "@/urlparams"
import { html, splitFirst, unregescape } from "@/util"
import angular, { IScope } from "angular"
import "@/services/search-history"
import "@/services/searches"
import { StoreService } from "@/services/store"

type HistoryScope = IScope & {
    getOptions: () => Option[]
    /** Recent search queries, most recent first */
    items: SearchParams[]
    /** Selected option */
    value?: Option
}

type Option = { id: string; label: string }
type SearchOption = Option & { params: SearchParams }

const isSearchOption = (option: Option): option is SearchOption => "params" in option

const createSearchOption = (params: SearchParams): SearchOption => ({
    id: JSON.stringify(params),
    label: getLabel(params),
    params,
})

const getLabel = (params: SearchParams): string => {
    if (!params.search) return "–"
    if (params.search == "cqp") return params.cqp || "–"
    const [type, value] = splitFirst("|", params.search)
    return type === "lemgram" ? unregescape(value) : value
}

angular.module("korpApp").component("searchHistory", {
    template: html`<select
        ng-model="value"
        ng-options="option.label for option in getOptions() track by option.id"
        class="w-40"
    ></select>`,
    controller: [
        "$location",
        "$scope",
        "searches",
        "searchHistory",
        "store",
        function (
            $location: LocationService,
            $scope: HistoryScope,
            searches: SearchesService,
            searchHistory: SearchHistoryService,
            store: StoreService
        ) {
            $scope.getOptions = () => [
                { id: "_label", label: loc("search_history", store.lang) },
                { id: "_clear", label: loc("search_history_clear", store.lang) },
                ...$scope.items.map(createSearchOption),
            ]

            /** Read stored search history */
            const refreshItems = () => ($scope.items = searchHistory.getItems())

            /** Select the label option */
            const resetValue = () => ($scope.value = $scope.getOptions().find((option) => option.id == "_label"))

            // Set state (and trigger a search) when an option is selected
            $scope.$watch("value", () => {
                if (!$scope.value) return
                if (isSearchOption($scope.value)) {
                    // Set used params and reset unused params to their default values.
                    const params = $scope.value.params
                    getSearchParamNames().forEach((key) => $location.search(key, params[key] ?? null))

                    // Wait for param changes like corpus selection to propagate to app state
                    $scope.$applyAsync(() => searches.doSearch())
                } else if ($scope.value.id == "_clear") {
                    searchHistory.clear()
                    resetValue()
                }
            })

            // Initialize
            refreshItems()
            resetValue()

            // Subscribe to new searches
            searchHistory.listen(refreshItems)
        },
    ],
})
