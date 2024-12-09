/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import { html } from "@/util"
import "./global-filter-service"
import { DataObject, UpdateScope } from "./types"
import "./global-filter"

type GlobalFiltersController = IController & {
    lang: string
}

type GlobalFiltersScope = UpdateScope & {
    dataObj: DataObject
}

angular.module("korpApp").component("globalFilters", {
    template: html`<div ng-if="dataObj.showDirective" class="mb-4">
        <span class="font-bold"> {{ 'global_filter' | loc:$root.lang}}:</span>
        <div class="inline-block">
            <span ng-repeat="filterKey in dataObj.defaultFilters">
                <global-filter
                    attr="filterKey"
                    attr-def="dataObj.attributes[filterKey]"
                    attr-value="dataObj.filterValues[filterKey].value"
                    possible-values="dataObj.filterValues[filterKey].possibleValues"
                ></global-filter>
                <span ng-if="!$last">{{"and" | loc:$root.lang}}</span>
            </span>
        </div>
    </div>`,
    bindings: {},
    controller: [
        "$scope",
        "globalFilterService",
        function ($scope: GlobalFiltersScope, globalFilterService) {
            const $ctrl = this as GlobalFiltersController

            $ctrl.$onInit = () => {
                globalFilterService.registerScope($scope)
                $scope.dataObj = {
                    filterValues: {},
                    defaultFilters: [],
                    attributes: {},
                    showDirective: false,
                }
            }

            $scope.update = (dataObj) => ($scope.dataObj = dataObj)
        },
    ],
})
