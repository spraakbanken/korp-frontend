/** @format */
import angular, { IController, IScope } from "angular"
import _ from "lodash"
import { html } from "@/util"
import "./global-filter-service"
import "./global-filter"
import { RootScope } from "@/root-scope.types"
import { GlobalFilterService } from "./global-filter-service"

type GlobalFiltersScope = IScope & {
    setSelected: (attr: string, selected: string[]) => void
    show: boolean
}

angular.module("korpApp").component("globalFilters", {
    template: html`<div ng-if="show" class="mb-4">
        <span class="font-bold"> {{ 'global_filter' | loc:$root.lang}}:</span>
        <div class="inline-block">
            <span ng-repeat="(attr, filter) in $root.globalFilterData">
                <global-filter
                    attr="attr"
                    attr-def="filter.attribute"
                    attr-value="filter.value"
                    options="filter.options"
                    on-change="setSelected(attr, selected)"
                ></global-filter>
                <span ng-if="!$last">{{"and" | loc:$root.lang}}</span>
            </span>
        </div>
    </div>`,
    bindings: {},
    controller: [
        "$rootScope",
        "$scope",
        "globalFilterService",
        function ($rootScope: RootScope, $scope: GlobalFiltersScope, globalFilterService: GlobalFilterService) {
            const $ctrl = this as IController
            $ctrl.$onInit = () => {
                globalFilterService.initialize()
            }

            $scope.setSelected = (attr, selected) => {
                $rootScope.globalFilterData[attr].value = selected
            }

            $rootScope.$watch(
                "globalFilterData",
                () => {
                    $scope.show = Object.keys($rootScope.globalFilterData).length > 0
                },
                true
            )
        },
    ],
})
