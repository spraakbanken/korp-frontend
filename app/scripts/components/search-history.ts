/** @format */
import { loc } from "@/i18n"
import { SearchHistoryService } from "@/services/search-history"
import { SearchesService } from "@/services/searches"
import { getSearchParamNames, SearchParams } from "@/urlparams"
import { html, LocationService } from "@/util"
import angular, { IScope } from "angular"
import "@/services/search-history"
import "@/services/searches"
import { StoreService } from "@/services/store"
import { createSearchOption, isSearchOption, Option } from "@/search-history"

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
