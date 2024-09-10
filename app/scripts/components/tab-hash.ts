/** @format */
import _ from "lodash"
import angular, { IController, IRootElementService, IScope, ITimeoutService } from "angular"
import { UtilsService } from "@/services/utils"
import "@/services/utils"
import { html } from "@/util"

type TabHashController = IController & {
    key: "search_tab" | "result_tab"
}

type TabHashScope = IScope & {
    fixedTabs: Record<number, any>
    maxTab: number
    setSelected: (index: number, ignoreCheck?: boolean) => void
    newDynamicTab: () => void
    closeDynamicTab: () => void
}

/** Surround a `<uib-tabset>` element with this to sync selected tab number to url parameter `key`. */
angular.module("korpApp").component("tabHash", {
    template: html`<div ng-transclude></div>`,
    transclude: true,
    bindings: {
        key: "@",
    },
    controller: [
        "utils",
        "$element",
        "$scope",
        "$timeout",
        function (utils: UtilsService, $element: IRootElementService, $scope: TabHashScope, $timeout: ITimeoutService) {
            const $ctrl = this as TabHashController

            let tabsetScope
            let contentScope

            $ctrl.$onInit = () => {
                // Timeout needed to find elements created by uib-tabset
                $timeout(function () {
                    tabsetScope = $element.find(".tabbable").scope() as any
                    contentScope = $element.find(".tab-content").scope() as any

                    $scope.fixedTabs = {}
                    $scope.maxTab = -1
                    for (let tab of contentScope.tabset.tabs) {
                        $scope.fixedTabs[tab.index] = tab
                        if (tab.index > $scope.maxTab) {
                            $scope.maxTab = tab.index
                        }
                    }
                    watchHash()
                }, 0)
            }

            const watchHash = () =>
                utils.setupHash($scope, {
                    expr: () => tabsetScope.activeTab,
                    val_in(val) {
                        $scope.setSelected(Number(val))
                        return tabsetScope.activeTab
                    },
                    key: $ctrl.key,
                    default: "0",
                })

            $scope.setSelected = function (index, ignoreCheck) {
                if (!ignoreCheck && !(index in $scope.fixedTabs)) {
                    index = $scope.maxTab
                }
                tabsetScope.activeTab = index
            }

            $scope.newDynamicTab = function () {
                $timeout(function () {
                    $scope.setSelected($scope.maxTab + 1, true)
                    $scope.maxTab += 1
                }, 0)
            }

            $scope.closeDynamicTab = function () {
                $timeout(function () {
                    $scope.maxTab = -1
                    for (let tab of contentScope.tabset.tabs) {
                        if (tab.index > $scope.maxTab) {
                            $scope.maxTab = tab.index
                        }
                    }
                }, 0)
            }
        },
    ],
})
