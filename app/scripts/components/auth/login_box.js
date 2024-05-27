/** @format */

import statemachine from "@/statemachine"
import settings from "@/settings"
import { html } from "@/util"
import { login } from "./basic_auth"

// TODO make it not closable when login is NEEDED
export const loginBoxComponent = {
    template: html`
        <div class="modal-header login-modal-header">
            <span class="login-header">{{'log_in' | loc:$root.lang}}</span>
            <span ng-click="$ctrl.clickX()" class="close-x">×</span>
        </div>
        <div id="login_popup" class="modal-body">
            <form ng-submit="$ctrl.loginSubmit()">
                <label for="usrname">{{'username' | loc:$root.lang}}</label>
                <input id="usrname" ng-model="$ctrl.loginUsr" type="text" />
                <label for="pass">{{'password' | loc:$root.lang}}</label>
                <input id="pass" ng-model="$ctrl.loginPass" type="password" />
                <a class="password-reset" href="https://ws.spraakbanken.gu.se/user/password" target="_blank"
                    >{{'forgot_password' | loc:$root.lang}}</a
                >
                <div style="clear:both"></div>
                <input
                    ng-if="$ctrl.showSave"
                    class="save-login"
                    id="saveLogin"
                    type="checkbox"
                    ng-model="$ctrl.saveLogin"
                />
                <label ng-if="$ctrl.showSave" class="save-login" for="saveLogin"
                    >{{'save_login' | loc:$root.lang}}</label
                >
                <p ng-show="$ctrl.loginErr" class="err_msg">{{'login_fail_msg' | loc:$root.lang}}</p>
                <input class="btn btn-sm bg-blue-500 text-white" type="submit" value="{{'send' | loc:$root.lang}}" />
                <div ng-if="$ctrl.loading" style="float: right; margin-top: 11px; margin-right: 9px;">
                    <i class="fa-solid fa-spinner fa-pulse w-fit"></i>
                </div>
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

            $ctrl.loading = false

            $ctrl.loginSubmit = function () {
                $ctrl.loginErr = false
                $ctrl.loading = true
                login($ctrl.loginUsr, $ctrl.loginPass, $ctrl.saveLogin)
                    .done(function () {
                        // no send to statemachine
                        statemachine.send("LOGIN")
                        $ctrl.closeModals()
                    })
                    .fail(function () {
                        $timeout(() => {
                            $ctrl.loginErr = true
                            $ctrl.loading = false
                        })
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
