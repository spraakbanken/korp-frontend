/** @format */
import angular, { IController, IScope } from "angular"
import _ from "lodash"
import { locAttribute } from "@/i18n"
import { html } from "@/util"
import "./global-filter-service"
import { LangString } from "@/i18n/types"
import { RootScope } from "@/root-scope.types"
import { Attribute } from "@/settings/config.types"
import { GlobalFilterService } from "./global-filter-service"

type GlobalFilterController = IController & {
    attr: string
    attrDef: Attribute
    attrValue: string[]
    options: [string, number][]
}

type GlobalFilterScope = IScope & {
    filterLabel: LangString
    selected: string[]
    dropdownToggle: (open?: boolean) => void
    toggleSelected: (value: string, event: Event) => void
    isSelected: (value: string) => boolean
    isSelectedList: (value: string) => boolean
    translateAttribute: (value: string) => string
}

angular.module("korpApp").component("globalFilter", {
    template: html` <span uib-dropdown auto-close="outsideClick" on-toggle="dropdownToggle(open)">
        <button uib-dropdown-toggle class="btn btn-sm btn-default mr-1 align-baseline">
            <span ng-if="$ctrl.attrValue.length == 0">
                <span>{{ "add_filter_value" | loc:$root.lang }}</span>
                <span>{{filterLabel | locObj:$root.lang}}</span>
            </span>
            <span ng-if="$ctrl.attrValue.length != 0">
                <span style="text-transform: capitalize">{{filterLabel | locObj:$root.lang}}:</span>
                <span ng-repeat="selected in $ctrl.attrValue">{{translateAttribute(selected) | replaceEmpty }} </span>
            </span>
        </button>
        <div uib-dropdown-menu class="korp-uib-dropdown-menu p-0 mt-3 ml-2">
            <ul class="p-0 m-0">
                <!-- Selected values -->
                <li
                    ng-repeat="value in $ctrl.options"
                    ng-class="{'bg-blue-100': isSelected(value[0])}"
                    class="attribute p-1"
                    ng-click="toggleSelected(value[0], $event)"
                    ng-if="isSelectedList(value[0])"
                >
                    <span ng-if="isSelected(value[0])">✔</span>
                    <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
                    <span class="text-xs">{{value[1]}}</span>
                </li>

                <!-- Unselected values -->
                <li
                    ng-repeat="value in $ctrl.options"
                    ng-class="{'bg-blue-100': isSelected(value[0])}"
                    class="attribute p-1"
                    ng-click="toggleSelected(value[0], $event)"
                    ng-if="!isSelectedList(value[0]) && value[1] > 0"
                >
                    <span ng-if="isSelected(value[0])">✔</span>
                    <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
                    <span class="text-xs">{{value[1]}}</span>
                </li>

                <!-- Values with 0 hits, disabled -->
                <li
                    ng-repeat="value in $ctrl.options"
                    class="attribute disabled opacity-50 p-1"
                    ng-if="!isSelectedList(value[0]) && value[1] == 0"
                >
                    <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
                    <span class="text-xs">{{value[1]}}</span>
                </li>
            </ul>
        </div>
    </span>`,
    bindings: {
        attr: "<",
        attrDef: "<",
        attrValue: "<",
        options: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "globalFilterService",
        function ($rootScope: RootScope, $scope: GlobalFilterScope, globalFilterService: GlobalFilterService) {
            const $ctrl = this as GlobalFilterController
            // if scope.options.length > 20
            //     # TODO enable autocomplete

            $ctrl.$onInit = () => {
                $scope.filterLabel = $ctrl.attrDef.label
                $scope.selected = _.clone($ctrl.attrValue)
            }

            $scope.dropdownToggle = (open?: boolean) => {
                if (!open) {
                    $scope.selected = []
                    return $ctrl.attrValue.map((value) => $scope.selected.push(value))
                }
            }

            $scope.toggleSelected = function (value, event) {
                if ($scope.isSelected(value)) {
                    _.pull($ctrl.attrValue, value)
                } else {
                    $ctrl.attrValue.push(value)
                }
                event.stopPropagation()
                globalFilterService.valueChange()
            }

            $scope.isSelected = (value: string) => $ctrl.attrValue.includes(value)

            $scope.isSelectedList = (value: string) => $scope.selected.includes(value)

            $scope.translateAttribute = (value: string) =>
                locAttribute($ctrl.attrDef.translation, value, $rootScope.lang)
        },
    ],
})
