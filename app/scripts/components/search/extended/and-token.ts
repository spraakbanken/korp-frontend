/** @format */
import angular, { IController } from "angular"
import { html } from "@/util"
import "./cqp-term"
import { Condition } from "@/cqp_parser/cqp.types"
import { createCondition } from "@/cqp_parser/cqp"

type ExtendedAndTokenController = IController & {
    and: Condition[]
    first: boolean
    parallellLang: string | undefined
    change: () => void
    remove: () => void
    removeOr: (idx: number) => void
    addOr: () => void
}

angular.module("korpApp").component("extendedAndToken", {
    template: html`
        <div>
            <span ng-show="!$ctrl.first">{{'and' | loc:$root.lang}}</span>

            <div>
                <div class="or_arg_outer" ng-repeat="or in $ctrl.and">
                    <extended-cqp-term
                        term="or"
                        remove-or="$ctrl.removeOr($index)"
                        change="$ctrl.change()"
                        parallell-lang="$ctrl.parallellLang"
                    ></extended-cqp-term>
                </div>
            </div>

            <div class="arg_footer">
                <span class="link" ng-click="$ctrl.addOr()">{{'or' | loc:$root.lang}}</span>
                <div style="clear:both;"></div>
            </div>
        </div>
    `,
    bindings: {
        and: "<",
        first: "<",
        parallellLang: "<",
        change: "&",
        remove: "&",
    },
    controller: [
        function () {
            const ctrl = this as ExtendedAndTokenController

            ctrl.removeOr = (idx) => {
                ctrl.and.splice(idx, 1)
                if (!ctrl.and.length) ctrl.remove()
                else ctrl.change()
            }

            ctrl.addOr = () => ctrl.and.push(createCondition())
        },
    ],
})
