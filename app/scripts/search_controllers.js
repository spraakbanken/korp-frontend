/** @format */
import statemachine from "./statemachine"
const korpApp = angular.module("korpApp")

korpApp.controller("SearchCtrl", [
    "$scope",
    "$location",
    "$filter",
    "searches",
    "$rootScope",
    function ($scope, $location, $filter, searches, $rootScope) {
        if (window.currentModeParallel) {
            // resolve globalFilterDef since globalFilter-directive is not used
            $rootScope.globalFilterDef.resolve()
            $scope.visibleTabs = [false, true, false, false]
            settings.corpusListing.setActiveLangs([settings["start_lang"]])
        } else {
            $scope.visibleTabs = [true, true, true, true]
            // only used in parallel mode
            searches.langDef.resolve()
        }
        $scope.parallelMode = window.currentModeParallel

        $scope.isCompareSelected = false

        $scope.$watch(
            () => $location.search().search_tab,
            (val) => ($scope.isCompareSelected = val === 3)
        )

        const setupWatchWordPic = function () {
            $scope.$watch(
                () => $location.search().word_pic,
                (val) => ($scope.word_pic = Boolean(val))
            )

            $scope.$watch("word_pic", (val) => $location.search("word_pic", Boolean(val) || null))
        }

        const setupWatchStats = function () {
            const defaultVal = settings["statistics_search_default"]
            // incoming values
            const hide = $location.search().hide_stats
            const show = $location.search().show_stats

            if (hide != null) {
                $scope.showStatistics = false
                if(!defaultVal) {
                    $location.search("hide_stats", null)
                }
            } else if (show != null) {
                $scope.showStatistics = true
                if(defaultVal) {
                    $location.search("show_stats", null)
                }
            } else {
                $scope.showStatistics = defaultVal
            }

            if (defaultVal) {
                $scope.$watch(
                    () => $location.search().hide_stats,
                    (val) => ($scope.showStatistics = val == null)
                )
            } else {
                $scope.$watch(
                    () => $location.search().show_stats,
                    (val) => ($scope.showStatistics = val != null)
                )
            }

            $scope.$watch("showStatistics", function (val) {
                if(defaultVal) {
                    $location.search("hide_stats", $scope.showStatistics ? null : true)
                } else {
                    $location.search("show_stats", $scope.showStatistics ? true : null)
                }
            })
        }

        setupWatchWordPic()
        setupWatchStats()

        $scope.settings = settings
        $scope.showStats = () => settings.statistics !== false

        if (!$location.search().stats_reduce && settings.statisticsCaseInsensitiveDefault) {
            $location.search("stats_reduce_insensitive", "word")
        }

        $scope.corpusChangeListener = $scope.$on("corpuschooserchange", function (event, selected) {
            $scope.noCorporaSelected = !selected.length
            const allAttrs = settings.corpusListing.getStatsAttributeGroups(settings.corpusListing.getReduceLang())
            $scope.statCurrentAttrs = _.filter(allAttrs, (item) => !item["hide_statistics"])
            $scope.statSelectedAttrs = ($location.search().stats_reduce || "word").split(",")
            const insensitiveAttrs = $location.search().stats_reduce_insensitive
            if (insensitiveAttrs) {
                $scope.statInsensitiveAttrs = insensitiveAttrs.split(",")
            }
        })

        $scope.$watch(
            "statSelectedAttrs",
            function (selected) {
                if (selected && selected.length > 0) {
                    if (selected.length != 1 || !selected.includes("word")) {
                        $location.search("stats_reduce", $scope.statSelectedAttrs.join(","))
                    } else {
                        $location.search("stats_reduce", null)
                    }
                }
            },
            true
        )

        $scope.$watch(
            "statInsensitiveAttrs",
            function (insensitive) {
                if (insensitive && insensitive.length > 0) {
                    $location.search("stats_reduce_insensitive", $scope.statInsensitiveAttrs.join(","))
                } else if (insensitive) {
                    $location.search("stats_reduce_insensitive", null)
                }
            },
            true
        )

        const setupHitsPerPage = function () {
            $scope.getHppFormat = function (val) {
                if (val === $scope.hitsPerPage) {
                    return $filter("loc")("hits_per_page", $scope.lang) + ": " + val
                } else {
                    return val
                }
            }

            $scope.hitsPerPageValues = settings["hits_per_page_values"]
            $scope.hitsPerPage = $location.search().hpp || settings["hits_per_page_default"]

            $scope.$watch(
                () => $location.search().hpp,
                (val) => ($scope.hitsPerPage = val || settings["hits_per_page_default"])
            )

            return $scope.$watch("hitsPerPage", function (val) {
                if (val === settings["hits_per_page_default"]) {
                    return $location.search("hpp", null)
                } else {
                    return $location.search("hpp", val)
                }
            })
        }

        const setupKwicSort = function () {
            const kwicSortValueMap = {
                "": "appearance_context",
                keyword: "word_context",
                left: "left_context",
                right: "right_context",
                random: "random_context",
            }
            $scope.kwicSortValues = _.keys(kwicSortValueMap)

            $scope.getSortFormat = function (val) {
                const mappedVal = kwicSortValueMap[val]
                if (val === $scope.kwicSort) {
                    return $filter("loc")("sort_default", $scope.lang) + ": " + $filter("loc")(mappedVal, $scope.lang)
                } else {
                    return $filter("loc")(mappedVal, $scope.lang)
                }
            }

            $scope.kwicSort = $location.search().sort || ""

            $scope.$watch(
                () => $location.search().sort,
                (val) => ($scope.kwicSort = val || "")
            )

            return $scope.$watch("kwicSort", function (val) {
                if (val === "") {
                    return $location.search("sort", null)
                } else {
                    return $location.search("sort", val)
                }
            })
        }

        setupHitsPerPage()
        setupKwicSort()
    },
])

korpApp.directive("advancedSearch", () => ({
    controller($scope, compareSearches, $location, $timeout) {
        function updateAdvancedCQP() {
            if ($location.search().search && $location.search().search.split("|")) {
                var [type, ...expr] = $location.search().search.split("|")
                expr = expr.join("|")
            }

            if (type === "cqp") {
                $scope.cqp = expr || "[]"
            } else {
                $scope.cqp = "[]"
            }
        }

        $scope.onSearch = () => {
            $location.search("search", null)
            $location.search("page", null)
            $location.search("within", null)
            $location.search("in_order", null)
            $timeout(() => $location.search("search", `cqp|${$scope.cqp}`), 0)
        }

        $scope.onSearchSave = (name) => {
            compareSearches.saveSearch(name, $scope.cqp)
        }

        // init value
        updateAdvancedCQP()

        // update value
        $scope.$on("updateAdvancedCQP", () => {
            updateAdvancedCQP()
        })
    },
}))

korpApp.filter("mapper", () => (item, f) => f(item))

korpApp.directive("compareSearchCtrl", () => ({
    controller($scope, utils, backend, $rootScope, compareSearches) {
        const s = $scope
        s.valfilter = utils.valfilter

        s.savedSearches = compareSearches.savedSearches
        s.$watch("savedSearches.length", function () {
            s.cmp1 = compareSearches.savedSearches[0]
            s.cmp2 = compareSearches.savedSearches[1]
            if (!s.cmp1 || !s.cmp2) {
                return
            }

            const listing = settings.corpusListing.subsetFactory(_.uniq([].concat(s.cmp1.corpora, s.cmp2.corpora)))
            const allAttrs = listing.getAttributeGroups()
            s.currentAttrs = _.filter(allAttrs, (item) => !item["hide_compare"])
        })

        s.reduce = "word"

        s.sendCompare = () => $rootScope.compareTabs.push(backend.requestCompare(s.cmp1, s.cmp2, [s.reduce]))

        s.deleteCompares = () => compareSearches.flush()
    },
}))

// TODO move these
korpApp.filter("loc", () => util.getLocaleString)
korpApp.filter("locObj", () => util.getLocaleStringObject)
korpApp.filter("replaceEmpty", function () {
    return function (input) {
        if (input === "") {
            return "–"
        } else {
            return input
        }
    }
})
