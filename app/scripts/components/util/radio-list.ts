/** @format */
import angular, { IController, type IScope } from "angular"
import { html } from "@/util"

export default angular.module("korpApp").component("radioList", {
    template: html`
        <span ng-repeat="option in $ctrl.options">
            <span ng-if="!$first" class="text-gray-500 mx-1">|</span>
            <a ng-click="$ctrl.select(option.value)" ng-class="{radioList_selected: option.value == value}">
                {{ option.label | locObj:$root.lang }}
            </a>
        </span>
    `,
    bindings: {
        options: "<",
    },
    require: {
        ngModelCtrl: "^ngModel",
    },
    controller: [
        "$scope",
        function ($scope: RadioListScope) {
            const $ctrl: RadioListController = this
            $scope.value = undefined

            $ctrl.$onInit = () => {
                $ctrl.ngModelCtrl.$render = () => {
                    $scope.value = $ctrl.ngModelCtrl.$viewValue
                }
            }

            $ctrl.select = (value: string) => {
                $scope.value = value
                $ctrl.ngModelCtrl.$setViewValue(value)
                $ctrl.ngModelCtrl.$setTouched()
                $ctrl.ngModelCtrl.$setDirty()
            }
        },
    ],
})

type RadioListScope = IScope & {
    value?: string
}

type RadioListController = IController & {
    options: Option[]
}

export type Option<V = string> = { label: string; value: V }
