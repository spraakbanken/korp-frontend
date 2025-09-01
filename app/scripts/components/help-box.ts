/** @format */
import { html } from "@/util"
import angular, { IScope } from "angular"

type HelpBoxScope = IScope & {
    extended: boolean
    toggleExtended: () => void
}

angular.module("korpApp").component("helpBox", {
    template: html`
        <div class="bs-callout bs-callout-info max-w-screen-sm">
            <div ng-transclude></div>
            <div ng-if="$ctrl.extendedText && extended" class="mt-2">{{$ctrl.extendedText}}</div>
            <div>
                <button ng-if="$ctrl.extendedText" class="btn btn-default btn-xs" ng-click="toggleExtended()">
                    <span ng-if="!extended">{{'show_more' | loc:$root.lang}}</span>
                    <span ng-if="extended">{{'show_less' | loc:$root.lang}}</span>
                </button>
            </div>
        </div>
    `,
    bindings: {
        extendedText: "<",
    },
    transclude: true,
    controller: [
        "$scope",
        function ($scope: HelpBoxScope) {
            $scope.extended = false

            $scope.toggleExtended = () => {
                $scope.extended = !$scope.extended
            }
        },
    ],
})
