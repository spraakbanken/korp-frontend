/** @format */
import angular, { IController } from "angular"
import { isEqual } from "lodash"
import { html } from "@/util"
import { prefixAttr } from "@/settings"
import { RootScope } from "@/root-scope.types"
import { SavedSearch } from "@/services/local-storage"
import { AttributeOption, corpusListing } from "@/corpora/corpus_listing"
import { savedSearches } from "@/search/saved-searches"
import { CompareTask } from "@/task/compare-task"

type CompareSearchController = IController & {
    prefixAttr: typeof prefixAttr
    savedSearches: SavedSearch[]
    cmp1: SavedSearch
    cmp2: SavedSearch
    updateAttributes: () => void
    currentAttrs: AttributeOption[]
    reduce: string
    sendCompare: () => void
    deleteCompares: () => void
}

angular.module("korpApp").component("compareSearch", {
    template: html`
        <div class="search_compare">
            <button
                class="btn btn-sm btn-danger delete"
                ng-click="$ctrl.deleteCompares()"
                ng-show="$ctrl.savedSearches.length > 1"
            >
                <i class="fa fa-trash-o"></i>{{'compare_delete' | loc:$root.lang}}
            </button>
            <div ng-show="$ctrl.savedSearches.length < 2">
                <div class="bs-callout bs-callout-warning">{{'compare_warning' | loc:$root.lang}}</div>
            </div>
            <div ng-show="$ctrl.savedSearches.length > 1">
                {{'compare_vb' | loc:$root.lang}}
                <select
                    ng-options="search.label for search in $ctrl.savedSearches"
                    ng-model="$ctrl.cmp1"
                    ng-change="$ctrl.updateAttributes()"
                ></select>
                {{'compare_with' | loc:$root.lang}}
                <select
                    ng-options="search.label for search in $ctrl.savedSearches"
                    ng-model="$ctrl.cmp2"
                    ng-change="$ctrl.updateAttributes()"
                ></select>
                {{'compare_reduce' | loc:$root.lang}}
                <select
                    ng-model="$ctrl.reduce"
                    ng-options="$ctrl.prefixAttr(obj) as obj.label | locObj:$root.lang group by obj.group | loc for obj in $ctrl.currentAttrs"
                ></select>
                <button class="btn btn-sm btn-default search" ng-click="$ctrl.sendCompare()">
                    {{'compare_vb' | loc:$root.lang}}
                </button>
            </div>
        </div>
    `,
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as CompareSearchController

            $ctrl.reduce = "word"
            $ctrl.prefixAttr = prefixAttr

            $ctrl.$onInit = () => {
                updateSavedSearches()
                savedSearches.listen(() => updateSavedSearches())
            }

            function updateSavedSearches() {
                const searches = savedSearches.list()
                if (!isEqual($ctrl.savedSearches, searches)) {
                    $ctrl.savedSearches = searches
                    $ctrl.cmp1 = searches[0]
                    $ctrl.cmp2 = searches[1]
                    $ctrl.updateAttributes()
                }
            }

            $ctrl.updateAttributes = () => {
                if ($ctrl.cmp1 && $ctrl.cmp2) {
                    const listing = corpusListing.subsetFactory([...$ctrl.cmp1.corpora, ...$ctrl.cmp2.corpora])
                    $ctrl.currentAttrs = listing.getAttributeGroupsCompare()
                }
            }

            $ctrl.sendCompare = () =>
                $rootScope.compareTabs.push(new CompareTask($ctrl.cmp1, $ctrl.cmp2, [$ctrl.reduce]))

            $ctrl.deleteCompares = () => savedSearches.clear()
        },
    ],
})
