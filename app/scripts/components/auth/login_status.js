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

            $ctrl.loggedIn = authenticationProxy.isLoggedIn()
            if ($ctrl.loggedIn) {
                $ctrl.username = authenticationProxy.getUsername()
            }

            $ctrl.logout = function () {
                statemachine.send("LOGOUT")
                $ctrl.loggedIn = false
            }

            statemachine.listen("login", () => {
                $ctrl.loggedIn = true
                $ctrl.username = authenticationProxy.getUsername()
            })

            $ctrl.showModal = false

            statemachine.listen("login_needed", function (event) {
                $ctrl.showLogin(event.loginNeededFor)
            })

            $ctrl.showLogin = (loginNeededFor) => {
                const s = $rootScope.$new(true)

                s.closeModal = () => {
                    modal.close()
                }

                s.loginNeededFor = loginNeededFor

                const modal = $uibModal.open({
                    template: `<login-box close-click='closeModal()' login-needed-for="loginNeededFor"></login-box>`,
                    windowClass: "login",
                    scope: s,
                    size: "sm",
                })

                modal.result.then(() => modal.close())
            }
        },
    ],
}
