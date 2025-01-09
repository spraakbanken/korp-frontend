/** @format */
import angular, { IController } from "angular"
import { html } from "@/util"
import "@/components/json_button"
import "@/components/korp-error"
import "@/components/kwic"
import "@/components/loglike-meter"
import "@/components/result-map"
import "@/components/statistics"
import "@/components/sidebar"
import "@/components/tab-preloader"
import "@/components/trend-diagram"
import "@/components/word-picture"
import "@/controllers/comparison_controller"
import "@/controllers/example_controller"
import "@/controllers/kwic_controller"
import "@/controllers/map_controller"
import "@/controllers/statistics_controller"
import "@/controllers/text_reader_controller"
import "@/controllers/trend_diagram_controller"
import "@/controllers/word_picture_controller"
import "@/directives/tab-hash"
import { RootScope } from "@/root-scope.types"

type ResultsController = IController & {
    onSidebarShow: () => void
    onSidebarHide: () => void
    hasResult: () => boolean
}

// This huge component was previously split so that each type of dynamic tabs had its own directive.
// They had to be directives and not components, because components always wrap their template in a tag (e.g. <graph-tabs>...</graph-tabs>), and uib-tabset needs uib-tab as immediate children.
// But we're converting directives to components in preparation for exiting AngularJS.
angular.module("korpApp").component("results", {
    template: html`
        <div ng-show="$ctrl.hasResult()" class="flex" id="results" ng-class="{sidebar_visible : $ctrl.sidebarVisible}">
            <div class="overflow-auto grow" id="left-column">
                <uib-tabset class="tabbable result_tabs" tab-hash="result_tab" active="activeTab">
                    <uib-tab kwic-ctrl index="0" select="onentry()" deselect="onexit()">
                        <uib-tab-heading class="flex gap-2 items-center" ng-class="{loading: loading}">
                            KWIC
                            <tab-preloader
                                ng-if="loading"
                                progress="countCorpora() > 1 ? progress : undefined"
                            ></tab-preloader>
                        </uib-tab-heading>
                        <div class="results-kwic" ng-class="{reading_mode : reading_mode, loading: loading}">
                            <korp-error ng-if="error"></korp-error>
                            <kwic
                                ng-if="!error"
                                aborted="aborted"
                                loading="loading"
                                active="active"
                                hits-in-progress="hitsInProgress"
                                hits="hits"
                                kwic-input="kwic"
                                corpus-hits="corpusHits"
                                is-reading="reading_mode"
                                page="page"
                                page-event="pageChange"
                                context-change-event="toggleReading"
                                hits-per-page="hitsPerPage"
                                prev-params="proxy.prevParams"
                                prev-url="proxy.prevUrl"
                                corpus-order="corpusOrder"
                            ></kwic>
                            <json-button endpoint="'query'" params="proxy.prevParams"></json-button>
                        </div>
                    </uib-tab>

                    <uib-tab stats-result-ctrl ng-if="$root._settings.statistics != false" select="onentry()" index="2">
                        <uib-tab-heading class="flex gap-2 items-center" ng-class="{loading: loading}">
                            {{'statistics' | loc:$root.lang}}
                            <tab-preloader
                                ng-if="loading"
                                progress="countCorpora() > 1 ? progress : undefined"
                            ></tab-preloader>
                        </uib-tab-heading>
                        <korp-error ng-if="error"></korp-error>
                        <statistics
                            aborted="aborted"
                            activate="activate"
                            columns="columns"
                            data="data"
                            error="error"
                            has-result="hasResult"
                            in-order="inOrder"
                            loading="loading"
                            no-hits="no_hits"
                            prev-params="proxy.prevParams"
                            search-params="searchParams"
                            show-statistics="showStatistics"
                        ></statistics>
                        <json-button
                            ng-if="showStatistics && hasResult"
                            endpoint="'count'"
                            params="proxy.prevParams"
                        ></json-button>
                    </uib-tab>

                    <uib-tab ng-if="$root._settings['word_picture'] != false" wordpic-ctrl index="3">
                        <uib-tab-heading class="flex gap-2 items-center" ng-class="{loading: loading}">
                            {{'word_picture' | loc:$root.lang}}
                            <tab-preloader
                                ng-if="loading"
                                progress="countCorpora() > 1 ? progress : undefined"
                            ></tab-preloader>
                        </uib-tab-heading>
                        <div ng-if="!error">
                            <word-picture
                                data="data"
                                word-pic="wordPic"
                                activate="activate"
                                loading="loading"
                                has-data="hasData"
                                aborted="aborted"
                                hit-settings="hitSettings"
                                settings="settings"
                                no-hits="noHits"
                            ></word-picture>
                        </div>
                        <korp-error ng-if="error"></korp-error>
                        <json-button
                            ng-if="wordPic && hasData"
                            endpoint="'relations'"
                            params="proxy.prevParams"
                        ></json-button>
                    </uib-tab>

                    <uib-tab example-ctrl ng-repeat="kwicTab in $root.kwicTabs" select="onentry()" deselect="onexit()">
                        <uib-tab-heading class="flex gap-2 items-center" ng-class="{loading: loading}">
                            KWIC
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i class="fa-solid fa-times-circle cursor-pointer" ng-click="closeTab($index, $event)"></i>
                        </uib-tab-heading>
                        <korp-error ng-if="error"></korp-error>
                        <div
                            class="results-kwic"
                            ng-if="!error"
                            ng-class="{reading_mode: kwicTab.readingMode, loading: loading}"
                        >
                            <kwic
                                aborted="aborted"
                                loading="loading"
                                active="active"
                                hits-in-progress="hitsInProgress"
                                hits="hits"
                                kwic-input="kwic"
                                corpus-hits="corpusHits"
                                is-reading="kwicTab.readingMode"
                                page="page"
                                page-event="pageChange"
                                context-change-event="toggleReading"
                                hits-per-page="hitsPerPage"
                                prev-params="proxy.prevParams"
                                prev-url="proxy.prevUrl"
                                corpus-order="corpusOrder"
                            ></kwic>
                        </div>
                    </uib-tab>

                    <uib-tab ng-repeat="data in $root.graphTabs" graph-ctrl>
                        <uib-tab-heading class="flex gap-2 items-center">
                            {{'graph' | loc:$root.lang}}
                            <tab-preloader ng-if="loading" progress="progress"></tab-preloader>
                            <i class="fa-solid fa-times-circle cursor-pointer" ng-click="closeTab($index, $event)"></i>
                        </uib-tab-heading>
                        <trend-diagram
                            data="data"
                            on-progress="onProgress"
                            update-loading="updateLoading"
                        ></trend-diagram>
                    </uib-tab>

                    <uib-tab ng-repeat="promise in $root.compareTabs" compare-ctrl>
                        <uib-tab-heading class="compare_tab flex gap-2 items-center" ng-class="{loading : loading}">
                            {{'compare_vb' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i class="fa-solid fa-times-circle cursor-pointer" ng-click="closeTab($index, $event)"></i>
                        </uib-tab-heading>
                        <div class="compare_result" ng-class="{loading : loading}">
                            <korp-error ng-if="error"></korp-error>
                            <div class="column column_1" ng-if="!error">
                                <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp1.label}}</em></h2>
                                <ul class="negative">
                                    <li
                                        ng-repeat="row in tables.negative | orderBy:resultOrder:true"
                                        ng-click="rowClick(row, 0)"
                                    >
                                        <loglike-meter
                                            item="row"
                                            max="max"
                                            stringify="stringify"
                                            class="w-full meter"
                                        ></loglike-meter>
                                    </li>
                                </ul>
                            </div>
                            <div class="column column_2">
                                <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp2.label}}</em></h2>
                                <ul class="positive">
                                    <li
                                        ng-repeat="row in tables.positive | orderBy:resultOrder:true"
                                        ng-click="rowClick(row, 1)"
                                    >
                                        <loglike-meter
                                            item="row"
                                            max="max"
                                            stringify="stringify"
                                            class="w-full meter"
                                        ></loglike-meter>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </uib-tab>

                    <uib-tab ng-repeat="promise in $root.mapTabs" map-ctrl select="onentry()">
                        <uib-tab-heading class="map_tab flex gap-2 items-center" ng-class="{loading : loading}">
                            {{ 'map' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i class="fa-solid fa-times-circle cursor-pointer" ng-click="closeTab($index, $event)"></i>
                        </uib-tab-heading>
                        <div class="map_result" ng-class="{loading : loading}">
                            <korp-error ng-if="error"></korp-error>
                            <div ng-if="!loading && numResults != 0">
                                <div class="rickshaw_legend" id="mapHeader">
                                    <div
                                        class="mapgroup"
                                        ng-repeat="(label, group) in markerGroups"
                                        ng-class="group.selected ? '' : 'disabled'"
                                        ng-click="toggleMarkerGroup(label)"
                                    >
                                        <span class="check">✔</span>
                                        <div class="swatch" style="background-color: {{group.color}}"></div>
                                        <span
                                            class="label"
                                            ng-if="label != 'total'"
                                            ng-bind-html="label | trust"
                                        ></span>
                                        <span class="label" ng-if="label == 'total'">Σ</span>
                                    </div>
                                    <div style="float:right;padding-right: 5px;">
                                        <label>
                                            <input
                                                style="vertical-align: top;margin-top: 0px;margin-right: 5px;"
                                                type="checkbox"
                                                ng-model="useClustering"
                                            />
                                            {{'map_cluster' | loc:$root.lang}}
                                        </label>
                                    </div>
                                </div>
                                <result-map
                                    center="center"
                                    markers="markerGroups"
                                    marker-callback="newKWICSearch"
                                    selected-groups="selectedGroups"
                                    rest-color="restColor"
                                    use-clustering="useClustering"
                                ></result-map>
                            </div>
                        </div>
                    </uib-tab>

                    <uib-tab
                        ng-repeat="inData in $root.textTabs"
                        text-reader-ctrl
                        select="onentry()"
                        deselect="onexit()"
                    >
                        <uib-tab-heading class="flex gap-2 items-center" ng-class="{loading : loading}">
                            {{ 'text_tab_header' | loc:$root.lang}}
                            <tab-preloader ng-if="loading"></tab-preloader>
                            <i class="fa-solid fa-times-circle cursor-pointer" ng-click="closeTab($index, $event)"></i>
                        </uib-tab-heading>
                        <div>
                            <korp-error ng-if="error"></korp-error>
                            <div ng-if="!loading" text-reader="text-reader"></div>
                        </div>
                    </uib-tab>
                </uib-tabset>
            </div>

            <sidebar
                class="sidebar shrink-0 ml-2"
                on-show="$ctrl.onSidebarShow()"
                on-hide="$ctrl.onSidebarHide()"
                lang="$root.lang"
            ></sidebar>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as ResultsController
            $ctrl.onSidebarShow = () => ($ctrl.sidebarVisible = true)
            $ctrl.onSidebarHide = () => ($ctrl.sidebarVisible = false)
            $ctrl.hasResult = () => !!$rootScope.activeSearch
        },
    ],
})
