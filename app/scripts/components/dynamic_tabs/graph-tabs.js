/** @format */
import angular from "angular"
import { html } from "@/util"
import "@/components/trend-diagram"
import "@/directives/tab-spinner"

angular.module("korpApp").directive("graphTabs", () => ({
    replace: true,
    template: html`
        <uib-tab ng-repeat="data in $ctrl.tabs" graph-ctrl="graph-ctrl">
            <uib-tab-heading ng-class="{not_loading: progress > 99}"
                >{{'graph' | loc:$root.lang}}
                <div class="tab_progress" style="width:{{progress || 0}}%" ng-show="loading"></div>
                <span ng-click="closeTab($index, $event)" tab-spinner="tab-spinner"></span>
            </uib-tab-heading>
            <trend-diagram data="data" on-progress="onProgress" update-loading="updateLoading"></trend-diagram>
        </uib-tab>
    `,
    bindToController: {
        tabs: "<",
    },
    scope: {},
    controllerAs: "$ctrl",
    controller: [() => {}],
}))
