/** @format */
import { loc } from "@/i18n"
import { getSearchParamNames, SearchParams } from "@/urlparams"
import { html } from "@/util"
import { LocationService } from "@/angular-util"
import angular, { IScope } from "angular"
import { StoreService } from "@/services/store"
import {
    addToSearchHistory,
    clearSearchHistory,
    createSearchOption,
    getSearchHistory,
    isSearchOption,
    Option,
} from "@/search-history"

type HistoryScope = IScope & {
    getOptions: () => Option[]
    /** Recent search queries, most recent first */
    items: SearchParams[]
    /** Selected option */
    value?: Option
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
        "store",
        function ($location: LocationService, $scope: HistoryScope, store: StoreService) {
            $scope.getOptions = () => [
                { id: "_label", label: loc("search_history", store.lang) },
                { id: "_clear", label: loc("search_history_clear", store.lang) },
                ...$scope.items.map(createSearchOption),
            ]

            /** Read stored search history */
            const refreshItems = () => ($scope.items = getSearchHistory())

            /** Select the label option */
            const resetValue = () => ($scope.value = $scope.getOptions().find((option) => option.id == "_label"))

            // When a new search is made, capture it from the URL
            store.watch("activeSearch", () => {
                addToSearchHistory($location.search())
                refreshItems()
            })

            // Set state (and trigger a search) when an option is selected
            $scope.$watch("value", () => {
                if (!$scope.value) return
                if (isSearchOption($scope.value)) {
                    // Set used params and reset unused params to their default values.
                    const params = $scope.value.params
                    getSearchParamNames().forEach((key) => $location.search(key, params[key] ?? null))
                    resetValue()
                } else if ($scope.value.id == "_clear") {
                    clearSearchHistory()
                    refreshItems()
                    resetValue()
                }
            })

            // Initialize
            refreshItems()
            resetValue()
        },
    ],
})
