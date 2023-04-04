/** @format */
let html = String.raw
export const searchtabsComponent = {
    template: html`
        <div click-cover="$ctrl.noCorporaSelected">
            <uib-tabset class="tabbable search_tabs" tab-hash="search_tab" active="activeTab">
                <uib-tab heading='{{"simple" | loc:$root.lang}}' ng-if="$ctrl.visibleTabs[0]">
                    <simple-search></simple-search>
                </uib-tab>
                <uib-tab class="extended" heading='{{"detailed" | loc:$root.lang}}' ng-if="$ctrl.visibleTabs[1]">
                    <div>
                        <extended-standard ng-if="!$ctrl.parallelMode"></extended-standard>
                        <extended-parallel ng-if="$ctrl.parallelMode"></extended-parallel>
                    </div>
                </uib-tab>
                <uib-tab heading='{{"advanced" | loc:$root.lang}}' ng-if="$ctrl.visibleTabs[2]">
                    <advanced-search></advanced-search>
                </uib-tab>
                <uib-tab ng-if="$ctrl.visibleTabs[3]">
                    <uib-tab-heading>
                        {{'compare' | loc:$root.lang}}
                        <span class="badge" ng-if="$ctrl.savedSearches.length">{{$ctrl.savedSearches.length}}</span>
                    </uib-tab-heading>
                    <compare-search></compare-search>
                </uib-tab>
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
                <div class="flex items-center" ng-show="$ctrl.showStats()">
                    <span>{{'statistics' | loc:$root.lang}}:</span>
                    <reduce-select
                        class="ml-2 relative -top-px"
                        reduce-items="$ctrl.statCurrentAttrs"
                        reduce-selected="$ctrl.statSelectedAttrs"
                        reduce-insensitive="$ctrl.statInsensitiveAttrs"
                        reduce-lang="lang"
                        style="width: 200px"
                        on-change="$ctrl.reduceOnChange"
                    ></reduce-select>
                </div>
                <div ng-show="$ctrl.settings.statistics !== false">
                    <input
                        id="show_stats"
                        type="checkbox"
                        ng-model="$ctrl.showStatistics"
                        ng-change="$ctrl.showStatisticsChange()"
                        class="mr-1"
                        ng-disabled="!$ctrl.inOrder"
                    /><label for="show_stats">{{'show_stats' | loc:$root.lang}}</label>
                </div>
                <div ng-show="$ctrl.settings['word_picture'] !== false">
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
        "$filter",
        "searches",
        "$rootScope",
        "compareSearches",
        function ($location, $filter, searches, $rootScope, compareSearches) {
            const $ctrl = this

            if (window.currentModeParallel) {
                // resolve globalFilterDef since globalFilter-directive is not used
                $rootScope.globalFilterDef.resolve()
                $ctrl.visibleTabs = [false, true, false, false]
                settings.corpusListing.setActiveLangs([settings["start_lang"]])
            } else {
                $ctrl.visibleTabs = [true, true, true, true]
                // only used in parallel mode
                searches.langDef.resolve()
            }
            $ctrl.parallelMode = window.currentModeParallel

            $ctrl.isCompareSelected = false

            $rootScope.$watch(
                () => $location.search().search_tab,
                (val) => ($ctrl.isCompareSelected = val === 3)
            )

            $ctrl.inOrder = true
            $rootScope.$watch(
                () => $location.search().in_order,
                (val) => ($ctrl.inOrder = val == undefined)
            )

            $ctrl.savedSearches = compareSearches.savedSearches

            const setupWatchWordPic = function () {
                $rootScope.$watch(
                    () => $location.search().word_pic,
                    (val) => ($ctrl.word_pic = Boolean(val))
                )
                $ctrl.wordPicChange = () => $location.search("word_pic", Boolean($ctrl.word_pic) || null)
            }

            const setupWatchStats = function () {
                const defaultVal = settings["statistics_search_default"]
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

            $ctrl.settings = settings
            $ctrl.showStats = () => settings.statistics !== false

            if (!$location.search().stats_reduce && settings.statisticsCaseInsensitiveDefault) {
                $location.search("stats_reduce_insensitive", "word")
            }

            $rootScope.$on("corpuschooserchange", function (event, selected) {
                $ctrl.noCorporaSelected = !selected.length
                const allAttrs = settings.corpusListing.getStatsAttributeGroups(settings.corpusListing.getReduceLang())
                $ctrl.statCurrentAttrs = _.filter(allAttrs, (item) => !item["hide_statistics"])
                $ctrl.statSelectedAttrs = ($location.search().stats_reduce || "word").split(",")
                const insensitiveAttrs = $location.search().stats_reduce_insensitive
                if (insensitiveAttrs) {
                    $ctrl.statInsensitiveAttrs = insensitiveAttrs.split(",")
                }
            })

            $ctrl.reduceOnChange = () => {
                if ($ctrl.statSelectedAttrs && $ctrl.statSelectedAttrs.length > 0) {
                    if ($ctrl.statSelectedAttrs.length != 1 || !$ctrl.statSelectedAttrs.includes("word")) {
                        $location.search("stats_reduce", $ctrl.statSelectedAttrs.join(","))
                    } else {
                        $location.search("stats_reduce", null)
                    }
                }

                if ($ctrl.statInsensitiveAttrs && $ctrl.statInsensitiveAttrs.length > 0) {
                    $location.search("stats_reduce_insensitive", $ctrl.statInsensitiveAttrs.join(","))
                } else if ($ctrl.statInsensitiveAttrs) {
                    $location.search("stats_reduce_insensitive", null)
                }
            }

            const setupHitsPerPage = function () {
                $ctrl.getHppFormat = function (val) {
                    if (val === $ctrl.hitsPerPage) {
                        return $filter("loc")("hits_per_page", $rootScope.lang) + ": " + val
                    } else {
                        return val
                    }
                }

                $ctrl.hitsPerPageValues = settings["hits_per_page_values"]
                $ctrl.hitsPerPage = $location.search().hpp || settings["hits_per_page_default"]

                $rootScope.$watch(
                    () => $location.search().hpp,
                    (val) => ($ctrl.hitsPerPage = val || settings["hits_per_page_default"])
                )
            }

            $ctrl.updateHitsPerPage = () => {
                if ($ctrl.hitsPerPage === settings["hits_per_page_default"]) {
                    $location.search("hpp", null)
                } else {
                    $location.search("hpp", $ctrl.hitsPerPage)
                }
            }

            const setupKwicSort = function () {
                const kwicSortValueMap = {
                    "": "appearance_context",
                    keyword: "word_context",
                    left: "left_context",
                    right: "right_context",
                    random: "random_context",
                }
                $ctrl.kwicSortValues = _.keys(kwicSortValueMap)

                $ctrl.getSortFormat = function (val) {
                    const mappedVal = kwicSortValueMap[val]
                    if (val === $ctrl.kwicSort) {
                        return (
                            $filter("loc")("sort_default", $rootScope.lang) +
                            ": " +
                            $filter("loc")(mappedVal, $rootScope.lang)
                        )
                    } else {
                        return $filter("loc")(mappedVal, $rootScope.lang)
                    }
                }

                $ctrl.kwicSort = $location.search().sort || ""

                $rootScope.$watch(
                    () => $location.search().sort,
                    (val) => ($ctrl.kwicSort = val || "")
                )
            }

            $ctrl.updateSort = () => {
                if ($ctrl.kwicSort === "") {
                    $location.search("sort", null)
                } else {
                    $location.search("sort", $ctrl.kwicSort)
                }
            }

            setupHitsPerPage()
            setupKwicSort()
        },
    ],
}
