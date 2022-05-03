/** @format */
let html = String.raw
export const extendedAndTokenComponent = {
    template: html`
        <div>
            <span ng-show="!$ctrl.first">{{'and' | loc:$root.lang}}</span>

            <div>
                <div class="or_arg_outer" ng-repeat="or in $ctrl.and">
                    <extended-cqp-term
                        term="or"
                        remove-or="$ctrl.removeOr($index)()"
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
            const ctrl = this

            ctrl.removeOr = function (idx) {
                return () => {
                    if (ctrl.and.length == 1) {
                        ctrl.remove()
                    } else {
                        ctrl.and.splice(idx, 1)
                        ctrl.change()
                    }
                }
            }

            ctrl.addOr = function () {
                ctrl.and.push({})
            }
        },
    ],
}
