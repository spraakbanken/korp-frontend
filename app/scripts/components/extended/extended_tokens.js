/** @format */
let html = String.raw
export const extendedTokensComponent = {
    template: html`
        <div id="query_table">
            <div ui-sortable="{ items: '> .token', delay : 100 }" ng-model="$ctrl.data" scroll-to-start="scrollToStart">
                <div class="token inline-block" ng-repeat="token in $ctrl.data track by $index">
                    <extended-token
                        ng-if="token.and_block"
                        token="token"
                        remove="$ctrl.removeToken($index)()"
                        change="$ctrl.change()"
                        show-close="$ctrl.showCloseButton"
                        parallell-lang="$ctrl.parallellLang"
                        toggle-start="$ctrl.toggleStart($index)()"
                        toggle-end="$ctrl.toggleEnd($index)()"
                    ></extended-token>
                    <extended-struct-token
                        ng-if="!token.and_block"
                        token="token"
                        remove="$ctrl.removeToken($index)()"
                        change="$ctrl.change()"
                    ></extended-struct-token>
                </div>
                <add-box add-token="$ctrl.addToken()" add-struct-token="$ctrl.addStructToken(start)"></add-box>
            </div>
        </div>
    `,
    bindings: {
        cqp: "<",
        parallellLang: "<",
        cqpChange: "&",
        updateRepeatError: "&",
    },
    controller: [
        function () {
            const ctrl = this

            ctrl.repeatError = false

            ctrl.prev = ctrl.cqp
            ctrl.change = () => {
                let repeatError = true
                for (let token of ctrl.data) {
                    if (!token.repeat || token.repeat[0] > 0) {
                        repeatError = false
                        break
                    }
                }
                ctrl.repeatError = repeatError
                ctrl.updateRepeatError({ error: repeatError })

                ctrl.showCloseButton = getTokenBoxes().length > 1

                const cqp = CQP.stringify(ctrl.data)
                if (ctrl.prev != cqp) {
                    ctrl.cqpChange({ cqp })
                }
                ctrl.prev = cqp
            }

            ctrl.$onChanges = (changeObj) => {
                if (changeObj.cqp && ctrl.cqp != ctrl.prev) {
                    ctrl.data = CQP.parse(ctrl.cqp || "[]")
                }
            }
            ctrl.data = CQP.parse(ctrl.cqp || "[]")

            ctrl.addToken = function () {
                const token = { and_block: [[{ type: "word", op: "=", val: "" }]] }
                ctrl.data.push(token)
                ctrl.change()
            }

            function getTokenBoxes() {
                return ctrl.data.filter((box) => box.and_block)
            }

            ctrl.toggleStart = (idx) => () => ctrl.addStructToken(true, idx)
            ctrl.toggleEnd = (idx) => () => ctrl.addStructToken(false, idx + 1)

            ctrl.scrollToStart = false
            ctrl.addStructToken = function (start = true, idx = -1) {
                const token = { struct: null, start }
                if (idx != -1) {
                    ctrl.data.splice(idx, 0, token)
                } else if (start) {
                    ctrl.scrollToStart = true
                    ctrl.data.unshift(token)
                } else {
                    ctrl.data.push(token)
                }
                ctrl.change()
            }

            ctrl.removeToken = (i) => () => {
                if (!ctrl.data[i].struct) {
                    const tokenBoxes = getTokenBoxes()
                    if (!(tokenBoxes.length > 1)) {
                        return
                    }
                }
                ctrl.data.splice(i, 1)
                ctrl.change()
            }
        },
    ],
}
