/** @format */
import statemachine from "@/statemachine"

export const loginStatusComponent = {
    template: `
    <div class="link" id="log_out" ng-click="$ctrl.logout()" ng-if="$ctrl.loggedIn">
        <span>{{ 'log_out' | loc:lang }}</span>
        <span>{{ $ctrl.username }}</span>
    </div>
    <div id="login">
        <a ng-click="$ctrl.showLogin()" ng-show="!$ctrl.loggedIn">{{'log_in' | loc:lang}}</a>
    </div>
    `,
    bindings: {},
    controller: [
        "$uibModal",
        "$rootScope",
        function ($uibModal, $rootScope) {
            const $ctrl = this

            $ctrl.loggedIn = false

            if (authenticationProxy.loginObj && authenticationProxy.loginObj.name) {
                $ctrl.loggedIn = true
                $ctrl.username = authenticationProxy.loginObj.name
            }

            $ctrl.logout = function () {
                statemachine.send("LOGOUT")
                $ctrl.loggedIn = false
            }

            statemachine.listen("login", () => {
                $ctrl.loggedIn = true
                $ctrl.username = authenticationProxy.loginObj.name
            })

            $ctrl.showModal = false

            $ctrl.showLogin = () => {
                const s = $rootScope.$new(true)

                s.closeModal = () => {
                    modal.close()
                }

                const modal = $uibModal.open({
                    template: "<login-box close-click='closeModal()'></login-box>",
                    windowClass: "login",
                    scope: s,
                    size: "sm",
                })

                modal.result.then(() => modal.close())
            }
        },
    ],
}
