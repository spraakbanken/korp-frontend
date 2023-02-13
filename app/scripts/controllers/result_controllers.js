/** @format */
const korpApp = angular.module("korpApp")

korpApp.controller("resultContainerCtrl", [
    "$scope",
    "searches",
    ($scope, searches) => {
        $scope.searches = searches
        $scope.onSidebarShow = () => ($scope.sidebarVisible = true)
        $scope.onSidebarHide = () => ($scope.sidebarVisible = false)
    },
])
