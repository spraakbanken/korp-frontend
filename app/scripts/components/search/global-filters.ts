import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import "./global-filter"
import { StoreService } from "@/services/store"
import { FilterData, GlobalFilterManager } from "@/search/global-filter-manager"
import { corpusListing } from "@/corpora/corpus_listing"

type GlobalFiltersScope = IScope & {
    filters: Record<string, FilterData>
    select: (attr: string, selected: string[]) => void
    show: boolean
}

/**
 * "Global filters" are text-level CQP conditions for selected attributes, that are managed separately in the GUI and
 * then merged with the tokens of the query when sending it to the backend. The core functions manage the state of the
 * filters, which lives in the root scope. The GUI component is duplicated in simple and extended search, and it
 * manages user-selected values.
 */
angular.module("korpApp").component("globalFilters", {
    template: html`<div ng-if="show" class="mb-4">
        <span class="font-bold"> {{ 'global_filter' | loc:$root.lang}}:</span>
        <div class="inline-block">
            <span ng-repeat="(attr, filter) in filters">
                <global-filter
                    attr="attr"
                    attr-def="filter.attribute"
                    attr-value="filter.value"
                    options="filter.options"
                    on-change="select(attr, selected)"
                ></global-filter>
                <span ng-if="!$last">{{"and" | loc:$root.lang}}</span>
            </span>
        </div>
    </div>`,
    bindings: {},
    controller: [
        "$scope",
        "store",
        function ($scope: GlobalFiltersScope, store: StoreService) {
            const $ctrl = this as IController

            const manager = new GlobalFilterManager(store)

            $ctrl.$onInit = () => {
                /** Update available filters when changing corpus selection. */
                store.watch("corpus", async () => {
                    if (corpusListing.selected.length > 0) {
                        // Load values for available attributes.
                        const attrs = Object.values(corpusListing.getDefaultFilters())
                        $scope.show = attrs.length > 0
                        manager.update(attrs)
                    }
                })

                /** Set up sync from url params to local data. */
                store.watch("global_filter", () => manager.setSelection(store.global_filter), true)

                manager.listen(() =>
                    $scope.$applyAsync(() => {
                        $scope.filters = { ...manager.filters }
                        // Update the CQP fragment used when searching
                        store.globalFilter = manager.getCqp()
                        // Update URL
                        store.global_filter = manager.getSelection()
                    }),
                )
            }

            $scope.select = (attr, selected) => {
                manager.select(attr, selected)
            }
        },
    ],
})
