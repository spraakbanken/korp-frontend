/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html } from "@/util"
import { loc } from "@/i18n"
import "@/services/compare-searches"
import "@/services/searches"
import "@/components/simple-search"
import "@/components/extended/extended-standard"
import "@/components/extended/extended-parallel"
import "@/components/advanced-search"
import "@/components/compare-search"
import "@/components/search-history"
import "@/components/reduce-select"
import "@/directives/click-cover"
import "@/directives/tab-hash"
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { CompareSearches } from "@/services/compare-searches"
import { RootScope } from "@/root-scope.types"
import { SearchesService } from "@/services/searches"
import { LocationService, SortMethod } from "@/urlparams"
import { SavedSearch } from "@/local-storage"
import { AttributeOption } from "@/corpus_listing"

type SearchtabsController = IController & {
    parallelMode: boolean
    getHppFormat: (val: number) => string
    getSortFormat: (val: string) => string
    hitsPerPage: number
    isCompareSelected: boolean
    isStatisticsAvailable: boolean
    isWordPictureAvailable: boolean
    kwicSort: string
    kwicSortValues: string[]
    noCorporaSelected: boolean
    savedSearches: SavedSearch[]
    word_pic: boolean
    reduceOnChange: (data: { selected: string[]; insensitive: string[] }) => void
    showStatistics: boolean
    showStatisticsChange: () => void
    statCurrentAttrs: AttributeOption[]
    statSelectedAttrs: string[]
    statInsensitiveAttrs: string[]
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
                <div class="flex items-center" ng-show="$ctrl.isStatisticsAvailable">
                    <span>{{'statistics' | loc:$root.lang}}:</span>
                    <reduce-select
                        class="ml-2 relative -top-px"
                        items="$ctrl.statCurrentAttrs"
                        selected="$ctrl.statSelectedAttrs"
                        insensitive="$ctrl.statInsensitiveAttrs"
                        on-change="$ctrl.reduceOnChange"
                    ></reduce-select>
                </div>
                <div ng-show="$ctrl.isStatisticsAvailable">
                    <input
                        id="show_stats"
                        type="checkbox"
                        ng-model="$ctrl.showStatistics"
                        ng-change="$ctrl.showStatisticsChange()"
                        class="mr-1"
                    /><label for="show_stats">{{'show_stats' | loc:$root.lang}}</label>
                </div>
                <div ng-show="$ctrl.isWordPictureAvailable">
                    <input
                        id="word_pic"
                        type="checkbox"
                        ng-model="$ctrl.word_pic"
                        ng-change="$ctrl.wordPicChange()"
                        class="mr-1"
                    /><label for="word_pic">{{'show_word_pic' | loc:$root.lang}}</label>
                </div>
            </div>
        </div>
    `,
    controller: [
        "$location",
        "searches",
        "$rootScope",
        "compareSearches",
        function (
            $location: LocationService,
            searches: SearchesService,
            $rootScope: RootScope,
            compareSearches: CompareSearches
        ) {
            const $ctrl = this as SearchtabsController

            $ctrl.parallelMode = !!settings.parallel
            if ($ctrl.parallelMode) {
                // resolve globalFilterDef since globalFilter-directive is not used
                $rootScope.globalFilterDef.resolve()
                const corpusListing = settings.corpusListing as ParallelCorpusListing
                corpusListing.setActiveLangs([settings.start_lang!])
            } else {
                // only used in parallel mode
                searches.langDef.resolve()
            }

            $ctrl.isCompareSelected = false

            $rootScope.$watch(
                () => $location.search().search_tab,
                (val) => ($ctrl.isCompareSelected = val === 3)
            )

            $ctrl.savedSearches = compareSearches.savedSearches

            function setupWatchWordPic() {
                $rootScope.$watch(
                    () => $location.search().word_pic,
                    (val) => ($ctrl.word_pic = !!val)
                )
                $ctrl.wordPicChange = () => $location.search("word_pic", $ctrl.word_pic || null)
            }

            function setupWatchStats() {
                const defaultVal = settings.statistics_search_default
                // incoming values
                const hide = $location.search().hide_stats
                const show = $location.search().show_stats

                if (hide != null) {
                    $ctrl.showStatistics = false
                    if (!defaultVal) {
                        $location.search("hide_stats", null)
                    }
                } else if (show != null) {
                    $ctrl.showStatistics = true
                    if (defaultVal) {
                        $location.search("show_stats", null)
                    }
                } else {
                    $ctrl.showStatistics = defaultVal
                }

                if (defaultVal) {
                    $rootScope.$watch(
                        () => $location.search().hide_stats,
                        (val) => ($ctrl.showStatistics = val == null)
                    )
                } else {
                    $rootScope.$watch(
                        () => $location.search().show_stats,
                        (val) => ($ctrl.showStatistics = val != null)
                    )
                }

                $ctrl.showStatisticsChange = () => {
                    if (defaultVal) {
                        $location.search("hide_stats", $ctrl.showStatistics ? null : true)
                    } else {
                        $location.search("show_stats", $ctrl.showStatistics ? true : null)
                    }
                }
            }

            setupWatchWordPic()
            setupWatchStats()

            $ctrl.isWordPictureAvailable = settings.word_picture !== false
            $ctrl.isStatisticsAvailable = settings.statistics !== false

            if (!$location.search().stats_reduce && settings.statistics_case_insensitive_default) {
                $location.search("stats_reduce_insensitive", "word")
            }

            $rootScope.$on("corpuschooserchange", function (event, selected) {
                $ctrl.noCorporaSelected = !selected.length
                const allAttrs = settings.corpusListing.getStatsAttributeGroups(settings.corpusListing.getReduceLang())
                $ctrl.statCurrentAttrs = _.filter(allAttrs, (item) => !item["hide_statistics"])
                $ctrl.statSelectedAttrs = ($location.search().stats_reduce || "word").split(",")
                const insensitiveAttrs = $location.search().stats_reduce_insensitive
                $ctrl.statInsensitiveAttrs = insensitiveAttrs?.split(",") || []
            })

            $ctrl.reduceOnChange = ({ selected, insensitive }) => {
                if (selected) $ctrl.statSelectedAttrs = selected
                if (insensitive) $ctrl.statInsensitiveAttrs = insensitive

                if ($ctrl.statSelectedAttrs && $ctrl.statSelectedAttrs.length > 0) {
                    const isModified = $ctrl.statSelectedAttrs.length != 1 || !$ctrl.statSelectedAttrs.includes("word")
                    $location.search("stats_reduce", isModified ? $ctrl.statSelectedAttrs.join(",") : null)
                }

                if ($ctrl.statInsensitiveAttrs && $ctrl.statInsensitiveAttrs.length > 0) {
                    $location.search("stats_reduce_insensitive", $ctrl.statInsensitiveAttrs.join(","))
                } else if ($ctrl.statInsensitiveAttrs) {
                    $location.search("stats_reduce_insensitive", null)
                }
            }

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
