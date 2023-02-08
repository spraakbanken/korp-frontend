/** @format */
import statemachine from "./statemachine"
const korpApp = angular.module("korpApp")

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
