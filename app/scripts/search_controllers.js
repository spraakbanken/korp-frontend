/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("compareSearchCtrl", () => ({
    controller: [
        "$scope",
        "utils",
        "backend",
        "$rootScope",
        "compareSearches",
        ($scope, utils, backend, $rootScope, compareSearches) => {
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
    ],
}))
