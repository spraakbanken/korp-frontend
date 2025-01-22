/** @format */
import _ from "lodash"
import angular, { IScope, ITimeoutService } from "angular"
import { UtilsService } from "@/services/utils"
import { LocationService } from "@/urlparams"
import "@/services/utils"

type UiBootstrapTabsetScope = IScope & {
    tabset: {
        tabs: { index: number }[]
    }
}

export type TabHashScope = IScope & {
    /** Created by <uib-tabset>. */
    activeTab: number
    /** Max tab index. Not necessarily same as tab count, as there may be skipped indices. */
    maxTab: number
    newDynamicTab: () => void
    closeDynamicTab: () => void
}

angular.module("korpApp").directive("tabHash", [
    "utils",
    "$location",
    "$timeout",
    (utils: UtilsService, $location: LocationService, $timeout: ITimeoutService) => ({
        link(scope: TabHashScope, elem, attr) {
            const tabset = (elem.find(".tab-content").scope() as UiBootstrapTabsetScope).tabset

            const getMaxTab = () => Math.max(...tabset.tabs.map((tab) => tab.index))

            $timeout(function () {
                scope.maxTab = getMaxTab()
                // Get active tab from url, or default to first tab
                scope.activeTab = parseInt($location.search()[attr.tabHash]) || 0
            })

            // Set up sync between url and scope
            utils.setupHash(scope, {
                key: attr.tabHash,
                scope_name: "activeTab",
                val_in: Number,
                default: 0,
            })

            /** Increment max tab index and select last. */
            scope.newDynamicTab = function () {
                $timeout(function () {
                    scope.maxTab += 1
                    scope.activeTab = scope.maxTab
                })
            }

            /** Recalculate max tab index. */
            scope.closeDynamicTab = function () {
                $timeout(function () {
                    scope.maxTab = getMaxTab()
                })
            }
        },
    }),
])
