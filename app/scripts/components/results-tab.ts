/** @format */
import angular from "angular"
import { DynamicTabs, RootScope } from "@/root-scope.types"
import { TabHashScope } from "@/directives/tab-hash"

export type ResultsTabScope = TabHashScope & {
    isActive: boolean
    loading: boolean
    progress?: number
    select: () => void
    deselect: () => void
    setProgress: (loading: boolean, progress: number) => void
    closeTab: (tabType: keyof DynamicTabs, i: number, event: Event) => void
}

angular.module("korpApp").directive("resultsTab", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope: ResultsTabScope, $rootScope: RootScope) => {
            $scope.isActive = false
            $scope.loading = false
            $scope.progress = 0

            $scope.select = () => ($scope.isActive = true)
            $scope.deselect = () => ($scope.isActive = false)

            $scope.setProgress = (loading: boolean, progress: number) => {
                $scope.$applyAsync(() => {
                    $scope.loading = loading
                    $scope.progress = progress
                })
            }

            // The dynamic tabs use ng-repeat, which provides `$index` etc in the scope.
            const isDynamicTab = "$index" in $scope
            if (isDynamicTab) {
                $scope.newDynamicTab()

                $scope.closeTab = (tabType, i, event) => {
                    event.preventDefault()
                    $rootScope[tabType].splice(i, 1)
                    $scope.closeDynamicTab()
                }
            }
        },
    ],
}))
