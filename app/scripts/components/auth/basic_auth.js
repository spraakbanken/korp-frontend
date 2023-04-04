/** @format */
import jStorage from "@/../lib/jstorage"

import { loginBoxComponent } from "./login_box"
import { loginStatusComponent } from "./login_status"

const state = {}

const init = () => {
    const creds = jStorage.get("creds")
    if (creds) {
        state.loginObj = creds
    }
    return !_.isEmpty(creds)
}

const initAngular = () => {
    const korpApp = angular.module("korpApp")

    korpApp.component("loginStatus", loginStatusComponent)
    korpApp.component("loginBox", loginBoxComponent)
}

const getAuthorizationHeader = () => {
    if (!_.isEmpty(state.loginObj)) {
        return { Authorization: `Basic ${state.loginObj.auth}` }
    } else {
        return {}
    }
}

function toBase64(str) {
    // copied from https://stackoverflow.com/a/43271130
    function u_btoa(buffer) {
        var binary = []
        var bytes = new Uint8Array(buffer)
        for (var i = 0, il = bytes.byteLength; i < il; i++) {
            binary.push(String.fromCharCode(bytes[i]))
        }
        return window.btoa(binary.join(""))
    }
    return u_btoa(new TextEncoder().encode(str))
}

const login = (usr, pass, saveLogin) => {
    const auth = toBase64(usr + ":" + pass)

    const dfd = $.Deferred()
    $.ajax({
        url: settings["korp_backend_url"] + "/authenticate",
        type: "GET",
        beforeSend(req) {
            return req.setRequestHeader("Authorization", `Basic ${auth}`)
        },
    })
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
                jStorage.set("creds", state.loginObj)
            }
            return dfd.resolve(data)
        })
        .fail(function (xhr, status, error) {
            c.log("auth fail", arguments)
            return dfd.reject()
        })

    return dfd
}

const hasCredential = (corpusId) => {
    if (!state.loginObj?.credentials) {
        return false
    }
    return state.loginObj.credentials.includes(corpusId.toUpperCase())
}

const logout = () => {
    state.loginObj = {}
    jStorage.deleteKey("creds")
}

const getCredentials = () => state.loginObj?.credentials || []

const getUsername = () => state.loginObj.name

const isLoggedIn = () => !_.isEmpty(state.loginObj)

export {
    init,
    initAngular,
    login,
    logout,
    getAuthorizationHeader,
    hasCredential,
    getCredentials,
    getUsername,
    isLoggedIn,
}
