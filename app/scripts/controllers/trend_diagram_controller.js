/** @format */

const korpApp = angular.module("korpApp")

korpApp.directive("graphCtrl", () => ({
    controller: [
        "$scope",
        ($scope) => {
            const s = $scope

            s.newDynamicTab()

            s.closeTab = function (idx, e) {
                e.preventDefault()
                s.graphTabs.splice(idx, 1)
                s.closeDynamicTab()
            }

            s.onProgress = (progress) => (s.progress = progress)

            s.updateLoading = (loading) => {
                s.loading = loading
            }
        },
    ],
}))
