/** @format */
import _ from "lodash"
import { IModule } from "angular"
import settings from "@/settings"
import { localStorageGet, localStorageSet } from "@/local-storage"
import { loginBoxComponent } from "./login_box"
import { loginStatusComponent } from "./login_status"
import { AuthState, LoginResponseData } from "./basic_auth.types"

const state: AuthState = {}

export const init = () => {
    const creds = localStorageGet("creds")
    if (creds) {
        state.loginObj = creds
    }
    return !_.isEmpty(creds)
}

export const initAngular = (korpApp: IModule) => {
    korpApp.component("loginStatus", loginStatusComponent)
    korpApp.component("loginBox", loginBoxComponent)
}

export const getAuthorizationHeader = () =>
    !_.isEmpty(state.loginObj) ? { Authorization: `Basic ${state.loginObj.auth}` } : {}

function toBase64(str: string) {
    // copied from https://stackoverflow.com/a/43271130
    function u_btoa(buffer: Uint8Array | Buffer) {
        const binary: string[] = []
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < bytes.byteLength; i++) {
            binary.push(String.fromCharCode(bytes[i]))
        }
        return window.btoa(binary.join(""))
    }
    return u_btoa(new TextEncoder().encode(str))
}

export const login = (usr: string, pass: string, saveLogin: boolean): JQueryDeferred<LoginResponseData> => {
    const auth = toBase64(usr + ":" + pass)

    const dfd = $.Deferred()

    const ajaxSettings: JQuery.AjaxSettings = {
        url: settings["korp_backend_url"] + "/authenticate",
        type: "GET",
        beforeSend(req) {
            return req.setRequestHeader("Authorization", `Basic ${auth}`)
        },
    }

    ;($.ajax(ajaxSettings) as JQuery.jqXHR<LoginResponseData>)
        .done(function (data, status, xhr) {
            if (!data.corpora) {
                dfd.reject()
                return
            }
            state.loginObj = {
                name: usr,
                credentials: data.corpora,
                auth,
            }
            if (saveLogin) {
                localStorageSet("creds", state.loginObj)
            }
            return dfd.resolve(data)
        })
        .fail(function (xhr, status, error) {
            console.log("auth fail", arguments)
            return dfd.reject()
        })

    return dfd
}

export const hasCredential = (corpusId: string): boolean =>
    state.loginObj?.credentials?.includes(corpusId.toUpperCase()) || false

export const logout = (): void => {
    state.loginObj = undefined
    localStorage.removeItem("creds")
}

export const getCredentials = (): string[] => state.loginObj?.credentials || []

export const getUsername = () => state.loginObj?.name

export const isLoggedIn = () => !_.isEmpty(state.loginObj)
