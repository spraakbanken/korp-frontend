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
    show: boolean
}

angular.module("korpApp").component("globalFilters", {
    template: html`<div ng-if="show" class="mb-4">
        <span class="font-bold"> {{ 'global_filter' | loc:$root.lang}}:</span>
        <div class="inline-block">
            <span ng-repeat="(name, attr) in dataObj.attributes">
                <global-filter
                    attr="filterKey"
                    attr-def="attr"
                    attr-value="dataObj.filterValues[name].value"
                    possible-values="dataObj.filterValues[name].possibleValues"
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
                    attributes: {},
                }
            }

            $scope.update = (dataObj) => {
                $scope.dataObj = dataObj
                $scope.show = Object.keys(dataObj.attributes).length > 0
            }
        },
    ],
})
