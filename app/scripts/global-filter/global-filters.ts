/** @format */
import angular, { IController, IScope } from "angular"
import _ from "lodash"
import { html } from "@/util"
import "./global-filter-service"
import "./global-filter"
import { GlobalFilterService } from "./global-filter-service"
import { FilterData, StoreService } from "@/services/store"

type GlobalFiltersScope = IScope & {
    globalFilterData: Record<string, FilterData>
    setSelected: (attr: string, selected: string[]) => void
    show: boolean
}

angular.module("korpApp").component("globalFilters", {
    template: html`<div ng-if="show" class="mb-4">
        <span class="font-bold"> {{ 'global_filter' | loc:$root.lang}}:</span>
        <div class="inline-block">
            <span ng-repeat="(attr, filter) in globalFilterData">
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
        "$scope",
        "globalFilterService",
        "store",
        function ($scope: GlobalFiltersScope, globalFilterService: GlobalFilterService, store: StoreService) {
            const $ctrl = this as IController
            $ctrl.$onInit = () => {
                globalFilterService.initialize()
                $scope.globalFilterData = store.globalFilterData
            }

            $scope.setSelected = (attr, selected) => {
                store.globalFilterData[attr].value = selected
            }

            store.watch(
                "globalFilterData",
                () => {
                    $scope.show = Object.keys(store.globalFilterData).length > 0
                },
                true
            )
        },
    ],
})
