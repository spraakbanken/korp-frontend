/** @format */

import statemachine from "@/statemachine"
import { login } from "./basic_auth"

// TODO make it not closable when login is NEEDED
export const loginBoxComponent = {
    template: `
    <div class="modal-header login-modal-header">
        <span class="login-header">{{'log_in' | loc:lang}}</span>
        <span ng-click="$ctrl.clickX()" class="close-x">×</span>
    </div>
    <div id="login_popup" class="modal-body">
        <form ng-submit="$ctrl.loginSubmit()">
            <label for="usrname">{{'username' | loc:lang}}</label>
            <input id="usrname" ng-model="$ctrl.loginUsr" type="text">
            <label for="pass">{{'password' | loc:lang}}</label>
            <input id="pass" ng-model="$ctrl.loginPass" type="password">
            <a class="password-reset" href="https://ws.spraakbanken.gu.se/user/password" target="_blank">{{'forgot_password' | loc:lang}}</a>
            <div style="clear:both"></div>
            <input ng-if="$ctrl.showSave" class="save-login" id="saveLogin" type="checkbox" ng-model="$ctrl.saveLogin">
            <label ng-if="$ctrl.showSave" class="save-login" for="saveLogin">{{'save_login' | loc:lang}}</label>
            <p ng-show="$ctrl.loginErr" class="err_msg">{{'login_fail_msg' | loc:lang}}</p>
            <input class="btn btn-sm bg-blue-500 text-white" type="submit" value="{{'send' | loc:lang}}">
            <div style="clear:both"></div>
        </form>
    </div>
    `,
    bindings: {
        closeClick: "&",
    },
    controller: [
        "$timeout",
        function ($timeout) {
            const $ctrl = this

            const options = settings["auth_module"]?.["options"] || {}

            // default value of show_remember is true
            $ctrl.showSave = options["show_remember"] == undefined ? true : options["show_remember"]
            // default value of default_value_remember is false
            $ctrl.saveLogin = $ctrl.showSave ? Boolean(options["default_value_remember"]) : true

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
