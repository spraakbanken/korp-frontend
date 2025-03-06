/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html } from "@/util"
import { loc } from "@/i18n"
import "@/services/compare-searches"
import "@/components/simple-search"
import "@/components/extended/extended-standard"
import "@/components/extended/extended-parallel"
import "@/components/advanced-search"
import "@/components/compare-search"
import "@/components/search-history"
import "@/directives/click-cover"
import "@/directives/tab-hash"
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { CompareSearches } from "@/services/compare-searches"
import { RootScope } from "@/root-scope.types"
import { LocationService, SortMethod } from "@/urlparams"
import { SavedSearch } from "@/local-storage"

type SearchtabsController = IController & {
    parallelMode: boolean
    getHppFormat: (val: number) => string
    getSortFormat: (val: string) => string
    hitsPerPage: number
    isCompareSelected: boolean
    kwicSort: string
    kwicSortValues: string[]
    noCorporaSelected: boolean
    savedSearches: SavedSearch[]
    updateHitsPerPage: () => void
    updateSort: () => void
}

angular.module("korpApp").component("searchtabs", {
    template: html`
        <div click-cover="$ctrl.noCorporaSelected">
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

            <div
                class="flex items-baseline bg-blue-100 border border-blue-200 shadow-inner"
                id="search_options"
                click-cover="$ctrl.isCompareSelected"
            >
                <div>
                    <span class="inline-block mr-2" style="font-size: .9em;">KWIC: </span
                    ><select
                        ng-change="$ctrl.updateHitsPerPage()"
                        ng-model="$ctrl.hitsPerPage"
                        ng-options="$ctrl.getHppFormat(val) for val in $ctrl.hitsPerPageValues track by val"
                    ></select
                    ><select
                        ng-change="$ctrl.updateSort()"
                        ng-model="$ctrl.kwicSort"
                        ng-options="$ctrl.getSortFormat(val) for val in $ctrl.kwicSortValues track by val"
                    ></select>
                </div>
            </div>
        </div>
    `,
    controller: [
        "$location",
        "$rootScope",
        "compareSearches",
        function ($location: LocationService, $rootScope: RootScope, compareSearches: CompareSearches) {
            const $ctrl = this as SearchtabsController

            $ctrl.parallelMode = !!settings.parallel
            if ($ctrl.parallelMode) {
                // resolve globalFilterDef since globalFilter-directive is not used
                $rootScope.globalFilterDef.resolve()
                const corpusListing = settings.corpusListing as ParallelCorpusListing
                corpusListing.setActiveLangs([settings.start_lang!])
            } else {
                // only used in parallel mode
                $rootScope.langDef.resolve()
            }

            $ctrl.isCompareSelected = false

            $rootScope.$watch(
                () => $location.search().search_tab,
                (val) => ($ctrl.isCompareSelected = val === 3)
            )

            $ctrl.savedSearches = compareSearches.savedSearches

            $rootScope.$on("corpuschooserchange", function (event, selected) {
                $ctrl.noCorporaSelected = !selected.length
            })

            const setupHitsPerPage = function () {
                /** Include the label in the currently selected option */
                $ctrl.getHppFormat = (hpp) =>
                    hpp === $ctrl.hitsPerPage ? loc("hits_per_page", $rootScope.lang) + ": " + hpp : String(hpp)

                $ctrl.hitsPerPageValues = settings.hits_per_page_values
                $ctrl.hitsPerPage = $location.search().hpp || settings.hits_per_page_default

                $rootScope.$watch(
                    () => $location.search().hpp,
                    (val) => ($ctrl.hitsPerPage = val || settings.hits_per_page_default)
                )
            }

            $ctrl.updateHitsPerPage = () => {
                $location.search("hpp", $ctrl.hitsPerPage !== settings.hits_per_page_default ? $ctrl.hitsPerPage : null)
            }

            const setupKwicSort = function () {
                const kwicSortValueMap: Record<SortMethod, string> = {
                    "": "appearance_context",
                    keyword: "word_context",
                    left: "left_context",
                    right: "right_context",
                    random: "random_context",
                }
                $ctrl.kwicSortValues = _.keys(kwicSortValueMap)

                $ctrl.getSortFormat = function (val: SortMethod) {
                    const mappedVal = kwicSortValueMap[val]
                    return val === $ctrl.kwicSort
                        ? loc("sort_default", $rootScope.lang) + ": " + loc(mappedVal, $rootScope.lang)
                        : loc(mappedVal, $rootScope.lang)
                }

                $ctrl.kwicSort = $location.search().sort || ""

                $rootScope.$watch(
                    () => $location.search().sort,
                    (val) => ($ctrl.kwicSort = val || "")
                )
            }

            $ctrl.updateSort = () => {
                $location.search("sort", $ctrl.kwicSort !== "" ? $ctrl.kwicSort : null)
            }

            setupHitsPerPage()
            setupKwicSort()
        },
    ],
})
