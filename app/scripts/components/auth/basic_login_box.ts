/** @format */
import { IComponentOptions, IController, ITimeoutService } from "angular"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { html } from "@/util"
import { auth } from "@/auth/auth"

export type AuthModuleOptions = {
    show_remember?: boolean
    default_value_remember?: boolean
}

// TODO make it not closable when login is NEEDED
export const loginBoxComponent: IComponentOptions = {
    template: html`
        <div class="modal-header login-modal-header">
            <span class="login-header">{{'log_in' | loc:$root.lang}}</span>
            <span ng-click="$ctrl.dismiss()" class="close-x">×</span>
        </div>
        <div id="login_popup" class="modal-body">
            <p>{{ "login_help" | loc:$root.lang }}</p>
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
        onClose: "&",
        onDismiss: "&",
    },
    controller: [
        "$timeout",
        function ($timeout: ITimeoutService) {
            const $ctrl: LoginBoxController = this

            const options: AuthModuleOptions =
                typeof settings.auth_module == "object" ? settings.auth_module.options : {}

            // default value of show_remember is true
            $ctrl.showSave = options.show_remember == undefined ? true : options.show_remember
            // default value of default_value_remember is false
            $ctrl.saveLogin = $ctrl.showSave ? Boolean(options.default_value_remember) : true

            $ctrl.loading = false

            $ctrl.loginSubmit = async () => {
                $ctrl.loginErr = false
                $ctrl.loading = true

                try {
                    await auth.login($ctrl.loginUsr, $ctrl.loginPass, $ctrl.saveLogin)
                    // no send to statemachine
                    statemachine.send("LOGIN")
                    $ctrl.close()
                } catch (error) {
                    console.error("Auth fail", error)
                    $timeout(() => {
                        $ctrl.loginErr = true
                        $ctrl.loading = false
                    })
                }
            }

            $ctrl.close = function () {
                $ctrl.loginErr = false
                $ctrl.onClose()
            }

            $ctrl.dismiss = () => {
                $ctrl.loginErr = false
                $ctrl.onDismiss()
            }
        },
    ],
}

type LoginBoxController = IController & {
    showSave: boolean
    saveLogin: boolean
    loading: boolean
    loginSubmit: () => void
    close: () => void
}
