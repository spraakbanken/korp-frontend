/** @format */
import angular, { IScope } from "angular"

export type ResultsTabScope = IScope & {
    isActive: boolean
    loading: boolean
    progress?: number
    select: () => void
    deselect: () => void
    setProgress: (loading: boolean, progress: number) => void
}

angular.module("korpApp").directive("resultsTab", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope: ResultsTabScope) => {
            $scope.isActive = false
            $scope.loading = false
            $scope.progress = 0

            $scope.select = () => ($scope.isActive = true)
            $scope.deselect = () => ($scope.isActive = false)

            $scope.setProgress = (loading: boolean, progress: number) => {
                $scope.loading = loading
                $scope.progress = progress
            }
        },
    ],
}))
