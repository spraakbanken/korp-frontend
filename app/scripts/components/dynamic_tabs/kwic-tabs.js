/** @format */
import angular from "angular"
import { html } from "@/util"
import "@/components/korp-error"
import "@/components/kwic"
import "@/directives/tab-spinner"

// This is a directives because it needs `replace: true`, which is not supported in component
angular.module("korpApp").directive("kwicTabs", () => ({
    replace: true,
    template: html`
        <uib-tab example-ctrl="example-ctrl" ng-repeat="kwicTab in $ctrl.tabs" select="onentry()" deselect="onexit()">
            <uib-tab-heading ng-class="{not_loading: progress == 100, loading : loading}"
                >KWIC<span ng-click="closeTab($index, $event)" tab-spinner="tab-spinner"></span
            ></uib-tab-heading>
            <korp-error ng-if="error"></korp-error>
            <div
                class="results-kwic"
                ng-if="!error"
                ng-class="{reading_mode : kwicTab.readingMode, not_loading: !loading, loading : loading}"
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
                    prev-request="proxy.prevRequest"
                    corpus-order="corpusOrder"
                ></kwic>
            </div>
        </uib-tab>
    `,
    bindToController: {
        tabs: "<",
    },
    scope: {},
    controllerAs: "$ctrl",
    controller: [() => {}],
}))
