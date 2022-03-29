/** @format */
import statemachine from "./statemachine"
const korpApp = angular.module("korpApp")

window.SearchCtrl = [
    "$scope",
    "$location",
    "$filter",
    "searches",
    function ($scope, $location, $filter, searches) {
        $scope.visibleTabs = [true, true, true, true]
        $scope.extendedTmpl = require("../views/extended_tmpl.pug")
        // for parallel mode
        searches.langDef.resolve()
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
            $scope.showStatistics = true

            $scope.$watch(
                () => $location.search().hide_stats,
                (val) => ($scope.showStatistics = val == null)
            )

            $scope.$watch("showStatistics", function (val) {
                if ($scope.showStatistics) {
                    $location.search("hide_stats", null)
                } else {
                    $location.search("hide_stats", true)
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
            const allAttrs = settings.corpusListing.getStatsAttributeGroups()
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
]

korpApp.controller("SearchCtrl", window.SearchCtrl)

korpApp.controller("ExtendedSearch", function ($scope, $location, $rootScope, searches, compareSearches, $timeout) {
    const s = $scope

    // TODO this is *too* weird
    function triggerSearch() {
        $location.search("search", null)
        $location.search("page", null)
        $location.search("in_order", null)
        $timeout(function () {
            $location.search("search", "cqp")
            if (!_.keys(settings["default_within"]).includes(s.within)) {
                var { within } = s
            }
            $location.search("within", within)
        }, 0)
    }

    statemachine.listen("cqp_search", (event) => {
        $scope.$root.searchtabs()[1].tab.select()
        s.cqp = event.cqp
        triggerSearch()
        // sometimes $scope.$apply is needed and sometimes it throws errors
        // depending on source of the event I guess. $timeout solves it.
        $timeout(() => $scope.$apply())
    })

    s.searches = searches

    s.onSearch = () => {
        triggerSearch()
    }
    
    s.onSearchSave = (name) => {
        compareSearches.saveSearch(name, $rootScope.extendedCQP)
    }

    s.$on("extended_set", ($event, val) => (s.cqp = val))

    if ($location.search().cqp) {
        s.cqp = $location.search().cqp
    }

    s.$watch("repeatError", (repeatError) => (s.searchDisabled = repeatError))

    const updateExtendedCQP = function () {
        let val2 = CQP.expandOperators(s.cqp)
        if ($rootScope.globalFilter) {
            val2 = CQP.stringify(CQP.mergeCqpExprs(CQP.parse(val2 || "[]"), $rootScope.globalFilter))
        }
        $rootScope.extendedCQP = val2
    }

    $rootScope.$watch("globalFilter", function () {
        if ($rootScope.globalFilter) {
            updateExtendedCQP()
        }
    })

    s.$watch("cqp", function (val) {
        if (!val) {
            return
        }
        try {
            updateExtendedCQP()
        } catch (e) {
            c.log("Failed to parse CQP", val)
            c.log("Error", e)
        }
        $location.search("cqp", val)
    })

    s.withins = []

    s.getWithins = function () {
        const union = settings.corpusListing.getWithinKeys()
        const output = _.map(union, (item) => ({ value: item }))
        return output
    }

    return s.$on("corpuschooserchange", function () {
        s.withins = s.getWithins()
        s.within = s.withins[0] && s.withins[0].value
    })
})

korpApp.controller("ExtendedToken", function ($scope, utils) {
    const s = $scope

    s.valfilter = utils.valfilter

    s.setDefault = function (or_obj) {
        // assign the first value from the opts
        const opts = s.getOpts(or_obj.type)

        if (!opts) {
            or_obj.op = "is"
        } else {
            or_obj.op = _.values(opts)[0][1]
        }

        or_obj.val = ""
    }

    // returning new array each time kills angular, hence the memoizing
    s.getOpts = _.memoize(function (type) {
        if (!(type in (s.typeMapping || {}))) {
            return
        }
        let confObj = s.typeMapping && s.typeMapping[type]
        if (!confObj) {
            c.log("confObj missing", type, s.typeMapping)
            return
        }

        confObj = _.extend({}, (confObj && confObj.opts) || settings["default_options"])

        if (confObj.type === "set") {
            confObj.is = "contains"
        }

        return _.toPairs(confObj)
    })

    const onCorpusChange = function (event, selected) {
        // TODO: respect the setting 'wordAttributeSelector' and similar
        if (!(selected && selected.length)) {
            return
        }
        const lang = s.$parent.$parent && s.$parent.$parent.l && s.$parent.$parent.l.lang
        const allAttrs = settings.corpusListing.getAttributeGroups(lang)
        s.types = _.filter(allAttrs, (item) => !item["hide_extended"])
        s.tagTypes = settings.corpusListing.getCommonWithins()
        s.typeMapping = _.fromPairs(
            _.map(s.types, function (item) {
                if (item["is_struct_attr"]) {
                    return [`_.${item.value}`, item]
                } else {
                    return [item.value, item]
                }
            })
        )
    }

    s.$on("corpuschooserchange", onCorpusChange)

    onCorpusChange(null, settings.corpusListing.selected)

    s.removeOr = function (token, and_array, i) {
        if (and_array.length > 1) {
            and_array.splice(i, 1)
        } else if (token.and_block.length > 1) {
            token.and_block.splice(_.indexOf(token.and_block, and_array), 1)
        }
    }

    s.addAnd = (token) => {
        token.and_block.push(s.addOr([]))
    }
})

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
