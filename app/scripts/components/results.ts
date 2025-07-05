/** @format */
import angular, { IScope, isNumber, ITimeoutService } from "angular"
import { html } from "@/util"
import settings from "@/settings"
import statemachine from "@/statemachine"
import "@/components/results-comparison"
import "@/components/results-examples"
import "@/components/results-hits"
import "@/components/results-map"
import "@/components/results-statistics"
import "@/components/results-tab"
import "@/components/results-text"
import "@/components/results-trend-diagram"
import "@/components/results-word-picture"
import "@/components/sidebar"
import "@/components/tab-preloader"
import "@/directives/tab-hash"
import { DynamicTabName, RootScope } from "@/root-scope.types"
import { StoreService } from "@/services/store"
import { Tab } from "bootstrap"
import { UtilsService } from "@/services/utils"

type ResultsScope = IScope & {
    /** Which of the permanent result tabs is selected */
    activeTab: number
    /** Which of all result tabs is selected (including example, map etc) */
    activeTabId: string
    tabProgress: TabProgress[]
    tabProgressDynamic: Record<DynamicTabName, TabProgress[]>
    showSidebar: boolean
    showStatisticsTab: boolean
    showWordpicTab: boolean
    closeTab: (type: DynamicTabName, index: number, event: Event) => void
    onSidebarShow: () => void
    onSidebarHide: () => void
    hasResult: () => boolean
    setProgress: (index: number, loading: boolean, progress: number) => void
    setProgressDynamic: (type: DynamicTabName, index: number, loading: boolean, progress: number) => void
    /** Set `activeTab` and `activeTabId` */
    setTab: (index: number) => void
    /** Set `activeTabId` */
    setTabId: (id: string) => void
}

type TabProgress = {
    loading: boolean
    /** Loading progress (percent, 0 <= x <= 100) */
    progress: number
}

const dynamicTabNames: DynamicTabName[] = ["compareTabs", "graphTabs", "kwicTabs", "mapTabs", "textTabs"]

angular.module("korpApp").component("results", {
    template: html`
        <div ng-show="hasResult()" class="flex" id="results" ng-class="{sidebar_visible: showSidebar}">
            <div class="overflow-auto grow" id="left-column">
                <ul id="resulttabs" class="nav nav-tabs items-baseline" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button
                            class="nav-link"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target="#resulttab-kwic"
                            ng-on-show.bs.tab="setTab(0)"
                        >
                            KWIC
                            <tab-preloader
                                ng-if="tabProgress[0].loading"
                                progress="tabProgress[0].progress"
                            ></tab-preloader>
                        </button>
                    </li>

                    <li ng-if="showStatisticsTab" class="nav-item" role="presentation">
                        <button
                            class="nav-link"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target="#resulttab-statistics"
                            data-tab-index="2"
                            ng-on-show.bs.tab="setTab(2)"
                        >
                            {{ 'statistics' | loc:$root.lang }}
                            <tab-preloader
                                ng-if="tabProgress[2].loading"
                                progress="tabProgress[2].progress"
                            ></tab-preloader>
                        </button>
                    </li>

                    <li ng-if="showWordpicTab" class="nav-item" role="presentation">
                        <button
                            class="nav-link"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target="#resulttab-wordpic"
                            ddata-tab-index="3"
                            ng-on-show.bs.tab="setTab(3)"
                        >
                            {{'word_picture' | loc:$root.lang}}
                            <tab-preloader
                                ng-if="tabProgress[3].loading"
                                progress="tabProgress[3].progress"
                            ></tab-preloader>
                        </button>
                    </li>

                    <li ng-repeat="kwicTab in $root.kwicTabs" class="nav-item" role="presentation">
                        <button
                            class="nav-link"
                            role="tab"
                            data-bs-toggle="tab"
                            data-bs-target="#resulttab-kwicTabs-{{$index}}"
                            ng-on-show.bs.tab="setTabId('kwicTabs-' + $index)"
                        >
                            KWIC
                            <tab-preloader ng-if="tabProgressDynamic.kwicTabs[$index].loading"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('kwicTabs', $index)"
                            ></i>
                        </button>
                    </li>
                </ul>

                <div class="tab-content p-4 border border-t-0">
                    <div class="tab-pane" role="tabpanel" tabindex="0" id="resulttab-kwic">
                        <results-hits
                            is-active="activeTabId == '0'"
                            loading="tabProgress[0].loading"
                            set-progress="setProgress(0, loading, progress)"
                        ></results-hits>
                    </div>

                    <div class="tab-pane" role="tabpanel" tabindex="0" id="resulttab-statistics">
                        <results-statistics
                            is-active="activeTabId == '2'"
                            loading="tabProgress[2].loading"
                            set-progress="setProgress(2, loading, progress)"
                        ></results-statistics>
                    </div>

                    <div class="tab-pane" role="tabpanel" tabindex="0" id="resulttab-wordpic">
                        <results-word-picture
                            is-active="activeTabId == '3'"
                            loading="tabProgress[3].loading"
                            set-progress="setProgress(3, loading, progress)"
                        ></results-word-picture>
                    </div>

                    <div
                        ng-repeat="kwicTab in $root.kwicTabs"
                        class="tab-pane"
                        role="tabpanel"
                        tabindex="0"
                        id="resulttab-kwicTabs-{{$index}}"
                    >
                        <results-examples
                            is-active="activeTabId == 'kwicTabs-' + $index"
                            loading="tabProgressDynamic['kwicTabs'][$index].loading"
                            set-progress="setProgressDynamic('kwicTabs', $index, loading, progress)"
                            is-reading="kwicTab.readingMode"
                            query-params="kwicTab.queryParams"
                        ></results-examples>
                    </div>
                </div>

                <!--
                <uib-tabset class="tabbable result_tabs" tab-hash="result_tab" active="activeTab">
                    <uib-tab results-tab ng-repeat="kwicTab in $root.kwicTabs" select="select()" deselect="deselect()">
                        <uib-tab-heading class="flex gap-2 items-center">
                            KWIC
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('kwicTabs', $index, $event)"
                            ></i>
                        </uib-tab-heading>
                        <results-examples
                            is-active="isActive"
                            loading="loading"
                            dset-progress="setProgress"
                            is-reading="kwicTab.readingMode"
                            query-params="kwicTab.queryParams"
                        ></results-examples>
                    </uib-tab>

                    <uib-tab results-tab ng-repeat="data in $root.graphTabs" select="select()" deselect="deselect()">
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{'graph' | loc:$root.lang}}
                            <tab-preloader ng-if="loading" progress="progress"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('graphTabs', $index, $event)"
                            ></i>
                        </uib-tab-heading>
                        <results-trend-diagram
                            data="data"
                            loading="loading"
                            dset-progress="setProgress"
                        ></results-trend-diagram>
                    </uib-tab>

                    <uib-tab
                        results-tab
                        ng-repeat="promise in $root.compareTabs"
                        select="select()"
                        deselect="deselect()"
                    >
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{'compare_vb' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('compareTabs', $index, $event)"
                            ></i>
                        </uib-tab-heading>
                        <results-comparison
                            loading="loading"
                            promise="promise"
                            dset-progress="setProgress"
                        ></results-comparison>
                    </uib-tab>

                    <uib-tab results-tab ng-repeat="promise in $root.mapTabs" select="select()" deselect="deselect()">
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{ 'map' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('mapTabs', $index, $event)"
                            ></i>
                        </uib-tab-heading>
                        <results-map
                            active="isActive"
                            loading="loading"
                            promise="promise"
                            dset-progress="setProgress"
                        ></results-map>
                    </uib-tab>

                    <uib-tab results-tab ng-repeat="inData in $root.textTabs" select="select()" deselect="deselect()">
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{ 'text_tab_header' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i
                                class="fa-solid fa-times-circle cursor-pointer"
                                ng-click="closeTab('textTabs', $index, $event)"
                            ></i>
                        </uib-tab-heading>
                        <results-text
                            active="isActive"
                            in-data="inData"
                            loading="loading"
                            dset-progress="setProgress"
                        ></results-text>
                    </uib-tab>
                </uib-tabset>
                -->
            </div>

            <sidebar
                class="sidebar shrink-0 ml-2"
                on-show="onSidebarShow()"
                on-hide="onSidebarHide()"
                lang="$root.lang"
            ></sidebar>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$scope",
        "$timeout",
        "store",
        "utils",
        function (
            $rootScope: RootScope,
            $scope: ResultsScope,
            $timeout: ITimeoutService,
            store: StoreService,
            utils: UtilsService
        ) {
            const $ctrl = this

            $scope.activeTab = 0
            $scope.activeTabId = ""
            $scope.tabProgress = []
            $scope.tabProgressDynamic = {
                compareTabs: [],
                graphTabs: [],
                kwicTabs: [],
                mapTabs: [],
                textTabs: [],
            }
            $scope.showSidebar = false
            $scope.showStatisticsTab = settings["statistics"] != false
            $scope.showWordpicTab = settings["word_picture"] != false

            /** Bootstrap tab triggers */
            const tabs: Record<string, Tab> = {}

            $ctrl.$onInit = () => {
                // Set up sync between url and scope
                utils.setupHash($scope, {
                    key: "result_tab",
                    scope_name: "activeTab",
                    val_in: Number,
                    default: 0,
                })

                // Postpone until ng-if's have resolved
                $timeout(() => {
                    let index = 0
                    // Create triggers for each tab
                    document.querySelectorAll("#resulttabs .nav-link").forEach((linkEl: HTMLElement) => {
                        // Let each tab index be 1 + the last index, unless it is set manually with `data-tab-index`
                        // TODO Too much magic? Use data-tab-index on all tabs instead?
                        index = linkEl.dataset.tabIndex ? Number(linkEl.dataset.tabIndex) : index
                        tabs[index] = new Tab(linkEl)
                        $scope.tabProgress[index] = { loading: false, progress: 0 }
                        index += 1
                    })
                    syncActiveTab()
                })
            }

            $scope.$watch("activeTab", () => ($scope.activeTabId = String($scope.activeTab)))
            $scope.$watch("activeTabId", syncActiveTab)
            dynamicTabNames.forEach((type) => {
                $rootScope.$watch<any[]>(
                    type,
                    (items, itemsOld) => {
                        // New tab added
                        if (items?.length > itemsOld?.length) {
                            // Add progress item
                            $scope.tabProgressDynamic[type].push({ loading: false, progress: 0 })
                            // Wait for markup
                            $timeout(() => {
                                // Create trigger
                                const id = `${type}-${items.length - 1}`
                                const linkEl = document.querySelector(
                                    `#resulttabs .nav-link[data-bs-target="#resulttab-${id}"]`
                                )
                                tabs[id] = new Tab(linkEl!)
                                // Select new tab
                                $scope.setTabId(`${type}-${items.length - 1}`)
                            })
                        }
                    },
                    true
                )
            })

            $scope.closeTab = (type, index, event) => {
                // Remove the tab model
                // Note that this will update $index in later tab elements of same type
                $rootScope[type].splice(index, 1)

                // Update local tab tracking
                $scope.tabProgressDynamic[type].splice(index, 1)
                const id = `${type}-${index}`
                delete tabs[id]

                // Select last-selected permanent tab
                // TODO Only if it's the current tab being closed
                //   - but currently, clicking the close button first selects the tab, so we need to fix that too
                // TODO Select next tab instead, i.e. the one replacing the closed one in the list
                $scope.setTabId(String($scope.activeTab))
            }
            $scope.setProgress = (index, loading, progress) => ($scope.tabProgress[index] = { loading, progress })
            $scope.setProgressDynamic = (type, index, loading, progress) =>
                ($scope.tabProgressDynamic[type][index] = { loading, progress })

            $scope.setTab = (index) => {
                $scope.activeTab = index
                $scope.activeTabId = String(index)
            }
            $scope.setTabId = (id) => {
                if (isNumber(id) && $scope.activeTab != Number(id)) $scope.activeTab = Number(id)
                $scope.activeTabId = id
            }
            $scope.onSidebarShow = () => ($scope.showSidebar = true)
            $scope.onSidebarHide = () => ($scope.showSidebar = false)
            $scope.hasResult = () => !!store.activeSearch || !!$rootScope.compareTabs.length

            function syncActiveTab() {
                tabs[$scope.activeTabId]?.show()
            }

            const showMainTab = () => ($scope.activeTab = 0)

            statemachine.listen("cqp_search", showMainTab)
            statemachine.listen("lemgram_search", showMainTab)
        },
    ],
})
