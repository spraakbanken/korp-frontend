/** @format */
import angular from "angular"
import { TabHashScope } from "@/directives/tab-hash"
import { GraphTab, RootScope } from "@/root-scope.types"

type GraphCtrlScope = TabHashScope & {
    closeTab: (idx: number, e: Event) => void
    data: GraphTab
    loading: boolean
    onProgress: (progress: number) => void
    progress: number
    updateLoading: (loading: boolean) => void
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
