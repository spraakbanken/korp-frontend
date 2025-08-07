/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html } from "@/util"
import "@/services/compare-searches"
import "@/components/simple-search"
import "@/components/extended/extended-standard"
import "@/components/extended/extended-parallel"
import "@/components/advanced-search"
import "@/components/compare-search"
import "@/components/search-history"
import "@/directives/click-cover"
import "@/directives/tab-hash"
import { CompareSearches } from "@/services/compare-searches"
import { SavedSearch } from "@/local-storage"
import { StoreService } from "@/services/store"

type SearchtabsController = IController & {
    parallelMode: boolean
    noCorporaSelected: boolean
    savedSearches: SavedSearch[]
}

angular.module("korpApp").component("searchtabs", {
    template: html`
        <div click-cover="$ctrl.noCorporaSelected" class="mb-2">
            <uib-tabset class="tabbable search_tabs" tab-hash="search_tab" active="activeTab">
                <uib-tab heading='{{"simple" | loc:$root.lang}}' ng-if="!$ctrl.parallelMode">
                    <simple-search></simple-search>
                </uib-tab>

                <!-- Without ng-if="$ctrl" this tab will be rendered before the others, messing up tab numbers which should correspond to "search_tab" state -->
                <uib-tab class="extended" heading='{{"detailed" | loc:$root.lang}}' ng-if="$ctrl">
                    <div>
                        <extended-standard ng-if="!$ctrl.parallelMode"></extended-standard>
                        <extended-parallel ng-if="$ctrl.parallelMode"></extended-parallel>
                    </div>
                </uib-tab>

                <uib-tab heading='{{"advanced" | loc:$root.lang}}' ng-if="!$ctrl.parallelMode">
                    <advanced-search></advanced-search>
                </uib-tab>

                <uib-tab ng-if="!$ctrl.parallelMode">
                    <uib-tab-heading>
                        {{'compare' | loc:$root.lang}}
                        <span class="badge" ng-if="$ctrl.savedSearches.length">{{$ctrl.savedSearches.length}}</span>
                    </uib-tab-heading>
                    <compare-search></compare-search>
                </uib-tab>

                <div class="flex justify-end items-center">
                    <search-history class="hidden md:block shrink min-w-0 m-1"></search-history>
                </div>
            </uib-tabset>
        </div>
    `,
    controller: [
        "compareSearches",
        "store",
        function (compareSearches: CompareSearches, store: StoreService) {
            const $ctrl = this as SearchtabsController
            $ctrl.parallelMode = !!settings.parallel
            $ctrl.savedSearches = compareSearches.savedSearches

            store.watch("corpus", (selected) => {
                $ctrl.noCorporaSelected = !selected.length
            })
        },
    ],
})
