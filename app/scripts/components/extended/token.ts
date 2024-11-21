/** @format */
import angular, { IController } from "angular"
import { clamp } from "lodash"
import { html } from "@/util"
import "@/components/extended/and-token"
import { CqpToken, Condition } from "@/cqp_parser/cqp.types"

type ExtendedTokenController = IController & {
    showClose: boolean
    token: CqpToken & Required<Pick<CqpToken, "and_block">>
    parallellLang: string
    repeatError: boolean
    remove: () => void
    change: () => void
    toggleStart: () => void
    toggleEnd: () => void
    addAnd: () => void
    removeAnd: (i: number) => () => void
    toggleRepeat: () => void
    repeatChange: (i: 0 | 1) => void
}

const createDefaultCondition = (): Condition => ({ type: "word", op: "=", val: "" })
const MAX = 99

angular.module("korpApp").component("extendedToken", {
    template: html`
        <div class="query_token">
            <div class="token_header">
                <i
                    class="close_btn fa-solid fa-circle-xmark text-gray-600"
                    ng-class="{show: !$ctrl.showClose}"
                    ng-click="$ctrl.remove()"
                ></i>
                <div style="clear:both;"></div>
            </div>

            <div class="args">
                <div class="and query_arg" ng-repeat="and in $ctrl.token.and_block">
                    <extended-and-token
                        and="and"
                        first="$first"
                        remove="$ctrl.removeAnd($index)()"
                        change="$ctrl.change()"
                        parallell-lang="$ctrl.parallellLang"
                    ></extended-and-token>
                </div>
            </div>

            <div class="token_footer">
                <div>
                    <button class="insert_arg btn btn-xs btn-default" ng-click="$ctrl.addAnd()">
                        <i class="fa-solid fa-arrow-down"></i>
                        <span style="margin-left: 1px;position: relative;top: -1px;">{{"and" | loc:$root.lang}}</span>
                    </button>

                    <button
                        uib-popover-template="'tokenOptions.html'"
                        popover-trigger="'outsideClick'"
                        popover-placement="bottom-right"
                        class="btn btn-xs btn-default token-cog-btn flex items-center"
                    >
                        <i class="fa-solid fa-bars mr-1"></i><span>{{'options' | loc:$root.lang}}</span>
                    </button>

                    <script type="text/ng-template" id="tokenOptions.html">
                        <ul>
                            <li>
                                <a ng-click="$ctrl.toggleRepeat()">{{'repeat' | loc:$root.lang}}</a>
                            </li>
                            <li><a ng-click="$ctrl.toggleStart()">{{'sent_start' | loc:$root.lang}}</a></li>
                            <li><a ng-click="$ctrl.toggleEnd()">{{'sent_end' | loc:$root.lang}}</a></li>
                        </ul>
                    </script>

                    <div class="repeat" ng-show="$ctrl.token.repeat">
                        <span>{{'repeat' | loc:$root.lang}}</span>
                        <input
                            type="number"
                            min="0"
                            max="{{ $ctrl.max }}"
                            ng-model="$ctrl.token.repeat[0]"
                            ng-change="$ctrl.onMinChange()"
                            ng-class="{'input-error': $ctrl.repeatError}"
                        />
                        <span>{{'to' | loc:$root.lang}}</span>
                        <input
                            type="number"
                            min="1"
                            max="{{ $ctrl.max }}"
                            ng-model="$ctrl.token.repeat[1]"
                            ng-change="$ctrl.onMaxChange()"
                        />
                        <span>{{'times' | loc:$root.lang}}</span>
                    </div>

                    <div style="clear:both;"></div>
                </div>
            </div>
        </div>
    `,
    bindings: {
        showClose: "=",
        token: "=",
        parallellLang: "<",
        repeatError: "<",
        remove: "&",
        change: "&",
        toggleStart: "&",
        toggleEnd: "&",
    },
    controller: [
        function () {
            const ctrl = this as ExtendedTokenController
            ctrl.max = MAX

            ctrl.addAnd = () => {
                ctrl.token.and_block.push([createDefaultCondition()])
                ctrl.change()
            }

            ctrl.removeAnd = (i) => () => {
                if (ctrl.token.and_block.length == 1) {
                    ctrl.remove()
                } else {
                    ctrl.token.and_block.splice(i, 1)
                    ctrl.change()
                }
            }

            ctrl.toggleRepeat = function () {
                if (!ctrl.token.repeat) {
                    // Default is min 1, max 1
                    ctrl.token.repeat = [1, 1]
                } else {
                    delete ctrl.token.repeat
                }
                ctrl.change()
            }

            ctrl.onMinChange = () => {
                if (!ctrl.token.repeat) return
                // Keep within bounds (null results in 0)
                ctrl.token.repeat[0] = clamp(ctrl.token.repeat[0], 0, MAX)
                // Update max, if set, to be at least min
                if (ctrl.token.repeat[1] && ctrl.token.repeat[1] < ctrl.token.repeat[0])
                    ctrl.token.repeat[1] = ctrl.token.repeat[0]

                ctrl.change()
            }

            ctrl.onMaxChange = () => {
                if (!ctrl.token.repeat) return
                // If input is erased, ng-model sets it to null
                // A max value of null means "repeat exactly min times"
                if (ctrl.token.repeat[1] == null) return
                // Keep within bounds
                ctrl.token.repeat[1] = clamp(ctrl.token.repeat[1], 1, MAX)
                // Update min to be at most min
                ctrl.token.repeat[0] = Math.min(ctrl.token.repeat[0], ctrl.token.repeat[1])

                ctrl.change()
            }
        },
    ],
})
