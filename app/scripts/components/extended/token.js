/** @format */
let html = String.raw
export const extendedTokenComponent = {
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
                    <button popper class="btn btn-xs btn-default token-cog-btn flex items-center">
                        <i class="fa-solid fa-bars mr-1"></i><span>{{'options' | loc:$root.lang}}</span>
                    </button>
                    <ul class="popper_menu dropdown-menu">
                        <li>
                            <a ng-click="$ctrl.toggleRepeat()">{{'repeat' | loc:$root.lang}}</a>
                        </li>
                        <li><a ng-click="$ctrl.toggleStart()">{{'sent_start' | loc:$root.lang}}</a></li>
                        <li><a ng-click="$ctrl.toggleEnd()">{{'sent_end' | loc:$root.lang}}</a></li>
                    </ul>

                    <div class="repeat" ng-show="$ctrl.token.repeat">
                        <span>{{'repeat' | loc:$root.lang}}</span>
                        <input
                            type="number"
                            ng-model="$ctrl.token.repeat[0]"
                            ng-change="$ctrl.repeatChange(0)"
                            ng-class="{'input-error': $ctrl.repeatError}"
                        />
                        <span>{{'to' | loc:$root.lang}}</span>
                        <input type="number" ng-model="$ctrl.token.repeat[1]" ng-change="$ctrl.repeatChange(1)" />
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
        remove: "&",
        change: "&",
        toggleStart: "&",
        toggleEnd: "&",
    },
    controller: [
        function () {
            const ctrl = this

            ctrl.addAnd = () => {
                ctrl.token["and_block"].push([{}])
                ctrl.change()
            }

            ctrl.removeAnd = (i) => () => {
                if (ctrl.token["and_block"].length == 1) {
                    ctrl.remove()
                } else {
                    ctrl.token["and_block"].splice(i, 1)
                    ctrl.change()
                }
            }

            ctrl.toggleRepeat = function () {
                if (!ctrl.token.repeat) {
                    ctrl.token.repeat = [1, 1]
                } else {
                    delete ctrl.token.repeat
                }
                ctrl.change()
            }

            ctrl.repeatChange = function (repeatIdx) {
                if (ctrl.token.repeat[repeatIdx] === null) {
                    ctrl.token.repeat[repeatIdx] = token.repeat[repeatIdx === 0 ? 1 : 0]
                } else if (ctrl.token.repeat[repeatIdx] === -1) {
                    ctrl.token.repeat[repeatIdx] = 0
                } else if (ctrl.token.repeat[repeatIdx] < 0) {
                    ctrl.token.repeat[repeatIdx] = 1
                } else if (ctrl.token.repeat[repeatIdx] > 100) {
                    ctrl.token.repeat[repeatIdx] = 100
                }

                if (ctrl.token.repeat[1] < ctrl.token.repeat[0] && repeatIdx === 0) {
                    ctrl.token.repeat[1] = ctrl.token.repeat[0]
                }

                if (ctrl.token.repeat[1] < ctrl.token.repeat[0] && repeatIdx === 1) {
                    ctrl.token.repeat[0] = ctrl.token.repeat[1]
                }

                if (ctrl.token.repeat[1] < 1) {
                    ctrl.token.repeat[1] = 1
                }

                ctrl.change()
            }
        },
    ],
}
