import angular, { IController, IScope } from "angular"
import { loc } from "@/i18n"
import { html } from "@/util"
import { CompareItem } from "@/task/compare-task"

type MeterController = IController & {
    item: CompareItem
    max: number
    stringify: (x: string) => string
}

type MeterScope = IScope & {
    display: string
    abs: number
    tooltipHtml: string
    barWidth: string
}

angular.module("korpApp").component("loglikeMeter", {
    template: html`<div>
        <div class="background p-1" ng-style="{ width: barWidth }" ng-bind-html="display | trust"></div>
        <div class="abs badge absolute right-1 top-2 px-1.5" uib-tooltip-html="tooltipHtml | trust">{{abs}}</div>
    </div>`,
    bindings: {
        item: "<",
        max: "<",
        stringify: "<",
    },
    controller: [
        "$scope",
        function ($scope: MeterScope) {
            const $ctrl = this as MeterController
            const stringify = (token: string): string => (token === "|" || token === "" ? "–" : $ctrl.stringify(token))

            $ctrl.$onInit = () => {
                $scope.display = $ctrl.item.tokenLists.map((tokens) => tokens.map(stringify).join(" ")).join(";")
                $scope.abs = $ctrl.item.abs
                $scope.tooltipHtml = html`${loc("statstable_absfreq")}: ${$ctrl.item.abs} <br />
                    loglike: ${Math.abs($ctrl.item.loglike)}`

                const ratio = Math.abs($ctrl.item.loglike / $ctrl.max)
                $scope.barWidth = `${ratio * 100}%`
            }
        },
    ],
})
