/** @format */
import angular from "angular"
import { html } from "@/util"
import "@/components/dynamic_tabs/compare-tabs"
import "@/components/dynamic_tabs/graph-tabs"
import "@/components/dynamic_tabs/kwic-tabs"
import "@/components/dynamic_tabs/map-tabs"
import "@/components/dynamic_tabs/text-tabs"
import "@/components/korp-error"
import "@/components/kwic"
import "@/components/statistics"
import "@/components/sidebar"
import "@/components/word-picture"

angular.module("korpApp").component("results", {
    template: html`
        <div>
            <div id="results-wrapper" ng-show="$ctrl.hasResult()">
                <div class="flex" id="columns" ng-class="{sidebar_visible : $ctrl.sidebarVisible}">
                    <div class="overflow-auto grow" id="left-column">
                        <uib-tabset class="tabbable result_tabs" tab-hash="result_tab" active="activeTab">
                            <uib-tab kwic-ctrl index="0" select="onentry()" deselect="onexit()">
                                <uib-tab-heading ng-class="{not_loading: progress > 99, loading : loading}"
                                    >KWIC<tab-preloader
                                        ng-if="loading"
                                        value="progress"
                                        spinner="countCorpora() < 2"
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
                                        hits="$root.store.hits"
                                        kwic-input="kwic"
                                        corpus-hits="corpusHits"
                                        is-reading="reading_mode"
                                        page="page"
                                        page-event="pageChange"
                                        context-change-event="toggleReading"
                                        hits-per-page="hitsPerPage"
                                        prev-params="proxy.prevParams"
                                        prev-request="proxy.prevRequest"
                                        corpus-order="corpusOrder"
                                    ></kwic>
                                </div>
                            </uib-tab>
                            <uib-tab
                                stats-result-ctrl
                                ng-if="$root._settings.statistics != false"
                                select="onentry()"
                                deselect="onexit()"
                                index="2"
                            >
                                <uib-tab-heading ng-class="{not_loading: progress > 99, loading : loading}"
                                    >{{'statistics' | loc:$root.lang}}
                                    <tab-preloader
                                        ng-if="loading"
                                        value="progress"
                                        spinner="countCorpora() < 2"
                                    ></tab-preloader>
                                </uib-tab-heading>
                                <korp-error ng-if="error"></korp-error>
                                <statistics
                                    aborted="aborted"
                                    activate="activate"
                                    columns="columns"
                                    data="data"
                                    error="error"
                                    grid-data="gridData"
                                    has-result="hasResult"
                                    in-order="inOrder"
                                    loading="loading"
                                    no-hits="no_hits"
                                    prev-params="proxy.prevParams"
                                    search-params="searchParams"
                                    show-statistics="showStatistics"
                                ></statistics>
                            </uib-tab>
                            <uib-tab
                                ng-if="$root._settings['word_picture'] != false"
                                wordpic-ctrl
                                index="3"
                                select="onentry()"
                                deselect="onexit()"
                            >
                                <uib-tab-heading ng-class="{not_loading: progress > 99, loading : loading}">
                                    {{'word_picture' | loc:$root.lang}}
                                    <tab-preloader
                                        ng-if="loading"
                                        value="progress"
                                        spinner="countCorpora() < 2"
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
                            </uib-tab>
                            <kwic-tabs tabs="$root.kwicTabs"></kwic-tabs>
                            <graph-tabs tabs="$root.graphTabs"></graph-tabs>
                            <compare-tabs tabs="$root.compareTabs"></compare-tabs>
                            <map-tabs tabs="$root.mapTabs"></map-tabs>
                            <text-tabs tabs="$root.textTabs"></text-tabs>
                        </uib-tabset>
                        <a id="json-link" ng-href="{{$root.jsonUrl}}" ng-show="$root.jsonUrl" target="_blank">
                            <img src="img/json.png" />
                        </a>
                    </div>
                    <sidebar
                        class="sidebar shrink-0 ml-2"
                        on-show="$ctrl.onSidebarShow()"
                        on-hide="$ctrl.onSidebarHide()"
                        lang="$root.lang"
                    >
                    </sidebar>
                </div>
            </div>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "searches",
        function ($rootScope, searches) {
            const $ctrl = this
            $ctrl.searches = searches
            $ctrl.onSidebarShow = () => ($ctrl.sidebarVisible = true)
            $ctrl.onSidebarHide = () => ($ctrl.sidebarVisible = false)

            $ctrl.hasResult = () =>
                $ctrl.searches.activeSearch ||
                $rootScope.compareTabs.length ||
                $rootScope.graphTabs.length ||
                $rootScope.mapTabs.length
        },
    ],
})
