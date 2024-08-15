/** @format */
import { RootScope } from "@/root-scope.types"
import angular, { IScope } from "angular"

type GraphCtrlScope = IScope & {
    closeTab: (idx: number, e: Event) => void
    loading: boolean
    onProgress: (progress: number) => void
    progress: number
    updateLoading: (loading: boolean) => void
    newDynamicTab: any // TODO Defined in tabHash (services.js)
    closeDynamicTab: any // TODO Defined in tabHash (services.js)
}

angular.module("korpApp").directive("graphCtrl", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope: GraphCtrlScope, $rootScope: RootScope) => {
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
