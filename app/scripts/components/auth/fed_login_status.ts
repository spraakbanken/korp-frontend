import { IComponentOptions, IController, ITimeoutService } from "angular"
import statemachine from "@/statemachine"
import { html } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { auth } from "@/auth/auth"

export const loginStatusComponent: IComponentOptions = {
    template: html`
        <div class="link" id="log_out" ng-click="$ctrl.logout()" ng-if="$ctrl.loggedIn">
            <span>{{ 'log_out' | loc:$root.lang }}</span>
            <span>{{ $ctrl.username }}</span>
        </div>
        <div id="login">
            <a ng-click="$ctrl.doLogin()" ng-show="!$ctrl.loggedIn">{{'log_in' | loc:$root.lang}}</a>
        </div>
    `,
    bindings: {},
    controller: [
        "$timeout",
        function ($timeout: ITimeoutService) {
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
                $timeout(() => {
                    $ctrl.loggedIn = true
                    $ctrl.username = auth.getUsername()
                })
            })

            statemachine.listen("login_needed", function (event) {
                $ctrl.doLogin(event.loginNeededFor)
            })

            $ctrl.doLogin = (loginNeededFor: CorpusTransformed[]) => {
                // TODO here we must get the URL so that the state can be restored that way
                auth.login()
            }
        },
    ],
}

type LoginStatusController = IController & {
    loggedIn: boolean
    username: string
    logout: () => void
    doLogin: (loginNeededFor: CorpusTransformed[]) => void
}
