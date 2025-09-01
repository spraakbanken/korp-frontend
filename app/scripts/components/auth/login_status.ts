/** @format */
import { IComponentOptions, IController, IScope, ui } from "angular"
import statemachine from "@/statemachine"
import { auth } from "./auth"
import { html } from "@/util"

export const loginStatusComponent: IComponentOptions = {
    template: html`
        <div class="link" id="log_out" ng-click="$ctrl.logout()" ng-if="$ctrl.loggedIn">
            <span>{{ 'log_out' | loc:$root.lang }}</span>
            <span>{{ $ctrl.username }}</span>
        </div>
        <div id="login">
            <a ng-click="$ctrl.showLogin()" ng-show="!$ctrl.loggedIn">{{'log_in' | loc:$root.lang}}</a>
        </div>
    `,
    bindings: {},
    controller: [
        "$uibModal",
        "$scope",
        function ($uibModal: ui.bootstrap.IModalService, $scope: LoginStatusScope) {
            const $ctrl: LoginStatusController = this

            $ctrl.loggedIn = auth.isLoggedIn()
            if ($ctrl.loggedIn) {
                $ctrl.username = auth.getUsername()
            }

            $ctrl.logout = function () {
                statemachine.send("LOGOUT")
                $ctrl.loggedIn = false
            }

            statemachine.listen("login", () => {
                $ctrl.loggedIn = true
                $ctrl.username = auth.getUsername()
            })

            statemachine.listen("login_needed", function () {
                $ctrl.showLogin()
            })

            $ctrl.showLogin = () => {
                const modal = $uibModal.open({
                    template: `<login-box on-close="$close()" on-dismiss="$dismiss()"></login-box>`,
                    windowClass: "login",
                })
                // Treat dismissing as a logout action
                modal.result.catch((e) => {
                    statemachine.send("LOGOUT")
                })
            }
        },
    ],
}

type LoginStatusController = IController & {
    loggedIn: boolean
    logout: () => void
    showLogin: () => void
}

type LoginStatusScope = IScope & {
    closeModal: () => void
}
