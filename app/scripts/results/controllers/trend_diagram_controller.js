/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("graphCtrl", () => ({
    controller($scope) {
        const s = $scope
        s.newDynamicTab()

        s.mode = "line"

        s.isGraph = () => ["line", "bar"].includes(s.mode)
        s.isTable = () => s.mode === "table"

        s.closeTab = function (idx, e) {
            e.preventDefault()
            s.graphTabs.splice(idx, 1)
            s.closeDynamicTab()
        }
    },
}))
