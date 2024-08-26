/** @format */
import angular from "angular"
import { html } from "@/util"
import "@/components/korp-error"
import "@/controllers/comparison_controller"
import "@/directives/meter"

angular.module("korpApp").directive("compareTabs", () => ({
    replace: true,
    template: html`
        <uib-tab ng-repeat="promise in $ctrl.tabs" compare-ctrl="compare-ctrl">
            <uib-tab-heading class="compare_tab" ng-class="{loading : loading}"
                >{{'compare_vb' | loc:$root.lang}}<span
                    tab-spinner="tab-spinner"
                    ng-click="closeTab($index, $event)"
                ></span
            ></uib-tab-heading>
            <div class="compare_result" ng-class="{loading : loading}">
                <korp-error ng-if="error"></korp-error>
                <div class="column column_1" ng-if="!error">
                    <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp1.label}}</em></h2>
                    <ul class="negative">
                        <li ng-repeat="row in tables.negative | orderBy:resultOrder:true" ng-click="rowClick(row, 0)">
                            <div class="meter" meter="row" max="max" stringify="stringify"></div>
                        </li>
                    </ul>
                </div>
                <div class="column column_2">
                    <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp2.label}}</em></h2>
                    <ul class="positive">
                        <li ng-repeat="row in tables.positive | orderBy:resultOrder:true" ng-click="rowClick(row, 1)">
                            <div class="meter" meter="row" max="max" stringify="stringify"></div>
                        </li>
                    </ul>
                </div>
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
