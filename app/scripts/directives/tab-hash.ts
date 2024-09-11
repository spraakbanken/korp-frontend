/** @format */
import _ from "lodash"
import angular, { IScope, ITimeoutService } from "angular"
import { UtilsService } from "@/services/utils"
import { LocationService } from "@/urlparams"
import "@/services/utils"

type TabHashScope = IScope & {
    activeTab: number
    fixedTabs: Record<number, any>
    maxTab: number
    setSelected: (index: number, ignoreCheck?: boolean) => void
    newDynamicTab: () => void
    closeDynamicTab: () => void
}

angular.module("korpApp").directive("tabHash", [
    "utils",
    "$location",
    "$timeout",
    (utils: UtilsService, $location: LocationService, $timeout: ITimeoutService) => ({
        link(scope, elem, attr) {
            const s = scope as TabHashScope
            const contentScope = elem.find(".tab-content").scope() as any

            const watchHash = () =>
                utils.setupHash(s, {
                    expr: "activeTab",
                    val_in(val) {
                        s.setSelected(Number(val))
                        return s.activeTab
                    },
                    key: attr.tabHash,
                    default: "0",
                })

            s.setSelected = function (index, ignoreCheck) {
                if (!ignoreCheck && !(index in s.fixedTabs)) {
                    index = s.maxTab
                }
                s.activeTab = index
            }

            const initTab = parseInt($location.search()[attr.tabHash]) || 0
            $timeout(function () {
                s.fixedTabs = {}
                s.maxTab = -1
                for (let tab of contentScope.tabset.tabs) {
                    s.fixedTabs[tab.index] = tab
                    if (tab.index > s.maxTab) {
                        s.maxTab = tab.index
                    }
                }
                s.setSelected(initTab)
                watchHash()
            }, 0)

            s.newDynamicTab = function () {
                $timeout(function () {
                    s.setSelected(s.maxTab + 1, true)
                    s.maxTab += 1
                }, 0)
            }

            s.closeDynamicTab = function () {
                $timeout(function () {
                    s.maxTab = -1
                    for (let tab of contentScope.tabset.tabs) {
                        if (tab.index > s.maxTab) {
                            s.maxTab = tab.index
                        }
                    }
                }, 0)
            }
        },
    }),
])
