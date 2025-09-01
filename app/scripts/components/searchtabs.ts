/** @format */
import angular, { IController } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import "@/components/simple-search"
import "@/components/extended/extended-standard"
import "@/components/extended/extended-parallel"
import "@/components/advanced-search"
import "@/components/compare-search"
import "@/components/search-history"
import "@/directives/click-cover"
import "@/directives/tab-hash"
import { StoreService } from "@/services/store"
import { savedSearches } from "@/search/saved-searches"

type SearchtabsController = IController & {
    parallelMode: boolean
    noCorporaSelected: boolean
    savedSearches: number
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
                        <span class="badge" ng-if="$ctrl.savedSearches">{{$ctrl.savedSearches}}</span>
                    </uib-tab-heading>
                    <compare-search></compare-search>
                </uib-tab>

                <div ng-if="!$ctrl.parallelMode" class="flex justify-end items-center">
                    <search-history class="hidden md:block shrink min-w-0 m-1"></search-history>
                </div>
            </uib-tabset>
        </div>
    `,
    controller: [
        "store",
        function (store: StoreService) {
            const $ctrl = this as SearchtabsController
            $ctrl.parallelMode = !!settings.parallel
            $ctrl.savedSearches = savedSearches.list().length

            store.watch("corpus", (selected) => {
                $ctrl.noCorporaSelected = !selected.length
            })

            savedSearches.listen(() => ($ctrl.savedSearches = savedSearches.list().length))
        },
    ],
})
