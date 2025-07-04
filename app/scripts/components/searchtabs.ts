/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
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
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { CompareSearches } from "@/services/compare-searches"
import { SavedSearch } from "@/local-storage"
import { StoreService } from "@/services/store"
import { UtilsService } from "@/services/utils"
import { Tab } from "bootstrap"

type SearchtabsController = IController & {
    parallelMode: boolean
    noCorporaSelected: boolean
    savedSearches: SavedSearch[]
}

type SearchtabsScope = IScope & {
    activeTab: number
    setTab: (index: number) => void
}

angular.module("korpApp").component("searchtabs", {
    template: html`<div click-cover="$ctrl.noCorporaSelected" id="searchtabs" class="mb-2">
        <ul class="nav nav-tabs items-baseline" role="tablist" aria-label="{{ 'search' | loc:$root.lang }}">
            <li ng-if="!$ctrl.parallelMode" class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    role="tab"
                    data-bs-toggle="tab"
                    data-bs-target="#searchtab-simple"
                    ng-on-show.bs.tab="setTab(0)"
                >
                    {{"simple" | loc:$root.lang}}
                </button>
            </li>

            <li class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    role="tab"
                    data-bs-toggle="tab"
                    data-bs-target="#searchtab-extended"
                    ng-on-show.bs.tab="setTab(1)"
                >
                    {{"detailed" | loc:$root.lang}}
                </button>
            </li>

            <li ng-if="!$ctrl.parallelMode" class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    role="tab"
                    data-bs-toggle="tab"
                    data-bs-target="#searchtab-advanced"
                    ng-on-show.bs.tab="setTab(2)"
                >
                    {{"advanced" | loc:$root.lang}}
                </button>
            </li>

            <li ng-if="!$ctrl.parallelMode" class="nav-item" role="presentation">
                <button
                    class="nav-link"
                    role="tab"
                    data-bs-toggle="tab"
                    data-bs-target="#searchtab-compare"
                    ng-on-show.bs.tab="setTab(3)"
                >
                    {{'compare' | loc:$root.lang}}
                    <span class="badge" ng-if="$ctrl.savedSearches.length">{{$ctrl.savedSearches.length}}</span>
                </button>
            </li>

            <li class="ml-auto hidden md:block">
                <search-history class=" dmin-w-0 m-1"></search-history>
            </li>
        </ul>

        <div class="tab-content p-4 border border-t-0">
            <div class="tab-pane" role="tabpanel" tabindex="0" id="searchtab-simple">
                <simple-search></simple-search>
            </div>

            <div class="tab-pane" role="tabpanel" tabindex="0" id="searchtab-extended">
                <extended-standard ng-if="!$ctrl.parallelMode"></extended-standard>
                <extended-parallel ng-if="$ctrl.parallelMode"></extended-parallel>
            </div>

            <div class="tab-pane" role="tabpanel" tabindex="0" id="searchtab-advanced">
                <advanced-search></advanced-search>
            </div>

            <div class="tab-pane" role="tabpanel" tabindex="0" id="searchtab-compare">
                <compare-search></compare-search>
            </div>
        </div>
    </div>`,
    controller: [
        "$scope",
        "$timeout",
        "compareSearches",
        "store",
        "utils",
        function (
            $scope: SearchtabsScope,
            $timeout: ITimeoutService,
            compareSearches: CompareSearches,
            store: StoreService,
            utils: UtilsService
        ) {
            const $ctrl = this as SearchtabsController
            $scope.activeTab = 0

            /** Bootstrap tab handles */
            const tabs: Tab[] = []

            $ctrl.$onInit = () => {
                // Set up sync between url and scope
                utils.setupHash($scope, {
                    key: "search_tab",
                    scope_name: "activeTab",
                    val_in: Number,
                    default: 0,
                })

                // Postpone until ng-if's have resolved
                $timeout(() => {
                    // Create triggers for each tab
                    document
                        .querySelectorAll("#searchtabs .nav-tabs .nav-link")
                        .forEach((linkEl) => tabs.push(new Tab(linkEl)))
                    syncActiveTab()
                })
            }

            $scope.$watch("activeTab", syncActiveTab)

            $scope.setTab = (index) => ($scope.activeTab = index)

            function syncActiveTab() {
                console.log($scope.activeTab)
                tabs[$scope.activeTab]?.show()
            }

            $ctrl.parallelMode = !!settings.parallel
            if ($ctrl.parallelMode) {
                const corpusListing = settings.corpusListing as ParallelCorpusListing
                corpusListing.setActiveLangs([settings.start_lang!])
            }

            $ctrl.savedSearches = compareSearches.savedSearches

            store.watch("corpus", (selected) => {
                $ctrl.noCorporaSelected = !selected.length
            })
        },
    ],
})
