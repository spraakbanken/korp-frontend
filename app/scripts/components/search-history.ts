/** @format */
import { loc } from "@/i18n"
import { RootScope } from "@/root-scope.types"
import { SearchHistoryService } from "@/services/search-history"
import { SearchesService } from "@/services/searches"
import { LocationService, SearchParams } from "@/urlparams"
import { html, splitFirst, unregescape } from "@/util"
import angular, { IScope } from "angular"
import "@/services/search-history"

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
    const [type, value] = splitFirst("|", params.search)
    return type === "lemgram" ? unregescape(value) : value
}

angular.module("korpApp").component("searchHistory", {
    template: html`<select
        ng-model="value"
        ng-options="option.label for option in getOptions() track by option.id"
    ></select>`,
    controller: [
        "$location",
        "$rootScope",
        "$scope",
        "searches",
        "searchHistory",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: HistoryScope,
            searches: SearchesService,
            searchHistory: SearchHistoryService
        ) {
            $scope.getOptions = () => [
                { id: "_label", label: loc("search_history", $rootScope.lang) },
                { id: "_clear", label: loc("search_history_clear", $rootScope.lang) },
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
                    $location.search($scope.value.params)
                    // The Searches watcher stupidly only watches the `search` param, so trigger it explicitly
                    searches.triggerSearch()
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
