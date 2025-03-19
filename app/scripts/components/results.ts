/** @format */
import angular, { IScope } from "angular"
import { html } from "@/util"
import settings from "@/settings"
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
import { RootScope } from "@/root-scope.types"

type ResultsScope = IScope & {
    showSidebar: boolean
    showStatisticsTab: boolean
    showWordpicTab: boolean
    onSidebarShow: () => void
    onSidebarHide: () => void
    hasResult: () => boolean
}

// This huge component was previously split so that each type of dynamic tabs had its own directive.
// They had to be directives and not components, because components always wrap their template in a tag (e.g. <graph-tabs>...</graph-tabs>), and uib-tabset needs uib-tab as immediate children.
// But we're converting directives to components in preparation for exiting AngularJS.
angular.module("korpApp").component("results", {
    template: html`
        <div ng-show="hasResult()" class="flex" id="results" ng-class="{sidebar_visible: showSidebar}">
            <div class="overflow-auto grow" id="left-column">
                <uib-tabset class="tabbable result_tabs" tab-hash="result_tab" active="activeTab">
                    <uib-tab results-tab select="select()" deselect="deselect()" index="0">
                        <uib-tab-heading class="flex gap-2 items-center">
                            KWIC
                            <tab-preloader ng-if="loading" progress="progress"></tab-preloader>
                        </uib-tab-heading>
                        <results-hits is-active="isActive" loading="loading" set-progress="setProgress"></results-hits>
                    </uib-tab>

                    <uib-tab ng-if="showStatisticsTab" results-tab select="select()" deselect="deselect()" index="2">
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{'statistics' | loc:$root.lang}}
                            <tab-preloader ng-if="loading" progress="progress"></tab-preloader>
                        </uib-tab-heading>
                        <results-statistics
                            is-active="isActive"
                            loading="loading"
                            set-progress="setProgress"
                        ></results-statistics>
                    </uib-tab>

                    <uib-tab ng-if="showWordpicTab" results-tab select="select()" deselect="deselect()" index="3">
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{'word_picture' | loc:$root.lang}}
                            <tab-preloader ng-if="loading" progress="progress"></tab-preloader>
                        </uib-tab-heading>
                        <results-word-picture
                            is-active="isActive"
                            loading="loading"
                            set-progress="setProgress"
                        ></results-word-picture>
                    </uib-tab>

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
                            set-progress="setProgress"
                            new-dynamic-tab="newDynamicTab"
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
                        <trend-diagram
                            data="data"
                            loading="loading"
                            new-dynamic-tab="newDynamicTab"
                            set-progress="setProgress"
                        ></trend-diagram>
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
                            new-dynamic-tab="newDynamicTab"
                            promise="promise"
                            set-progress="setProgress"
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
                            new-dynamic-tab="newDynamicTab"
                            promise="promise"
                            set-progress="setProgress"
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
                            new-dynamic-tab="newDynamicTab"
                            set-progress="setProgress"
                        ></results-text>
                    </uib-tab>
                </uib-tabset>
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
        "$scope",
        "$rootScope",
        function ($scope: ResultsScope, $rootScope: RootScope) {
            $scope.showSidebar = false
            $scope.showStatisticsTab = settings["statistics"] != false
            $scope.showWordpicTab = settings["word_picture"] != false

            $scope.onSidebarShow = () => ($scope.showSidebar = true)
            $scope.onSidebarHide = () => ($scope.showSidebar = false)
            $scope.hasResult = () => !!$rootScope.activeSearch || !!$rootScope.compareTabs.length
        },
    ],
})
