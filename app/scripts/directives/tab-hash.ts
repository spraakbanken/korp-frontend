/** @format */
import angular, { IScope, ITimeoutService } from "angular"
import { UtilsService } from "@/services/utils"
import { LocationService } from "@/urlparams"
import "@/services/utils"
import zip from "lodash/zip"
import { Tab } from "bootstrap"

export type TabHashScope = IScope & {
    /** Created by <uib-tabset>. */
    activeTab: number
    /** Max tab index. Not necessarily same as tab count, as there may be skipped indices. */
    maxTab: number
    newDynamicTab: () => void
    closeDynamicTab: () => void
}

type TabPair = {
    link: HTMLElement
    pane: HTMLElement
}

angular.module("korpApp").directive("tabHash", [
    "utils",
    "$location",
    "$timeout",
    (utils: UtilsService, $location: LocationService, $timeout: ITimeoutService) => ({
        link(scope: TabHashScope, elem, attr) {
            let tabs: TabPair[] = []

            const getMaxTab = () => Math.max(...tabs.map(({ link }) => Number(link.dataset.tabIndex)))

            // Wait for ng-if etc in the template
            $timeout(function () {
                // Find existing tabs
                const linkEls = elem.find(".nav-tabs .nav-link").toArray()
                const paneEls = elem.find(".tab-content .tab-pane").toArray()
                tabs = zip(linkEls, paneEls).map(([link, pane]) => ({ link: link!, pane: pane! }))

                // Set up interactivity
                tabs.forEach((tab, i) => setupTab(tab, i))

                scope.maxTab = getMaxTab()
                // Get active tab from url, or default to first tab
                scope.activeTab = parseInt($location.search()[attr.tabHash]) || 0
            })

            /** Set up interactivity for a tab */
            function setupTab(tab: TabPair, i: number) {
                const { link, pane } = tab

                // Set `data-tab-index` if not already set
                if (link.dataset.tabIndex == null) link.dataset.tabIndex = String(i)
                pane.dataset.tabIndex = link.dataset.tabIndex

                // Associate link with pane
                link.dataset.bsTrigger = "tab"
                link.dataset.bsTarget = `#${pane.id}`

                const tabTrigger = new Tab(link)
                link.addEventListener("click", (event) => {
                    event.preventDefault()
                    tabTrigger.show()
                })
            }

            // Set up sync between url and scope
            utils.setupHash(scope, {
                key: attr.tabHash,
                scope_name: "activeTab",
                val_in: Number,
                default: "0",
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
