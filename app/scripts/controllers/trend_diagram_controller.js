/** @format */

const korpApp = angular.module("korpApp")

korpApp.directive("graphCtrl", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope, $rootScope) => {
            const s = $scope
            const r = $rootScope

            s.newDynamicTab()

            s.closeTab = function (idx, e) {
                e.preventDefault()
                r.graphTabs.splice(idx, 1)
                s.closeDynamicTab()
            }

            s.onProgress = (progress) => (s.progress = progress)

            s.updateLoading = (loading) => {
                s.loading = loading
            }
        },
    ],
}))
