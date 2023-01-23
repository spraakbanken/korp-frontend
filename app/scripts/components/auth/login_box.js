/** @format */
import statemachine from "@/statemachine"
import { login } from "./basic_auth"

export const loginBoxComponent = {
    template: `
    <div class="modal-header login-modal-header">
        <span class="login-header">{{'log_in' | loc:lang}}</span>
        <span ng-click="$ctrl.clickX()" class="close-x">×</span>
    </div>
    <div id="login_popup" class="modal-body">
        <div ng-if="$ctrl.loginNeededFor.length" style="font-size: 0.75em">
            <span style="display: inline">{{'login_needed_for_corpora' | loc:lang}}</span>
            <span style="display: inline; margin-right: 2px;" ng-repeat="corpus in $ctrl.loginNeededFor">{{corpus.title | locObj:lang}}</span>
        </div>
        <form ng-submit="$ctrl.loginSubmit()">
            <label for="usrname">{{'username' | loc:lang}}</label>
            <input id="usrname" ng-model="$ctrl.loginUsr" type="text">
            <label for="pass">{{'password' | loc:lang}}</label>
            <input id="pass" ng-model="$ctrl.loginPass" type="password">
            <a class="password-reset" href="https://ws.spraakbanken.gu.se/user/password" target="_blank">{{'forgot_password' | loc:lang}}</a>
            <div style="clear:both"></div>
            <input class="save-login" id="saveLogin" type="checkbox" ng-model="$ctrl.saveLogin">
            <label class="save-login" for="saveLogin">{{'save_login' | loc:lang}}</label>
            <p ng-show="$ctrl.loginErr" class="err_msg">{{'login_fail_msg' | loc:lang}}</p>
            <input class="btn btn-sm bg-blue-500 text-white" type="submit" value="{{'send' | loc:lang}}">
            <div style="clear:both"></div>
        </form>
    </div>
    `,
    bindings: {
        loginNeededFor: "<",
        closeClick: "&",
    },
    controller: [
        "$timeout",
        function ($timeout) {
            const $ctrl = this

            $ctrl.loginSubmit = function () {
                $ctrl.loginErr = false
                login($ctrl.loginUsr, $ctrl.loginPass, $ctrl.saveLogin)
                    .done(function () {
                        // no send to statemachine
                        statemachine.send("LOGIN")
                        $ctrl.closeModals()
                    })
                    .fail(function () {
                        $timeout(() => ($ctrl.loginErr = true))
                    })
            }

            $ctrl.clickX = () => $ctrl.closeModals()

            $ctrl.closeModals = function () {
                $ctrl.loginErr = false
                $ctrl.closeClick()
                // and do what? send to parent?
            }
        },
    ],
}
