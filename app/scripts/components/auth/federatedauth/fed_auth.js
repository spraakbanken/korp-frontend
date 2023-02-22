/** @format */

/*
This is a login module that fetches a JWT from a source to see if the user is already logged in.

If the JWT call fails, it will redirect the user to a login service, a service that will redirect
the user back to Korp. After that the JWT call is expected to return a JWT.
*/
import { loginStatusComponent } from "./login_status"

const state = {
    jwt: null,
    username: null,
}

const init = async () => {
    const response = await fetch(settings["auth_module"]["options"]["jwt_url"], {
        headers: { accept: "text/plain" },
        credentials: "include",
    })

    if (!response.ok) {
        if (response.status == 401) {
            console.log("User not logged in")
        } else {
            console.warn(`An error has occured: ${response.status}`)
        }
        return false
    }

    const jwt = await response.text()
    state.jwt = jwt

    const jwtPayload = JSON.parse(atob(jwt.split(".")[1]))
    state.username = jwtPayload.name || jwtPayload.email
    state.credentials = []

    state.credentials = _.reduce(
        jwtPayload.scope.corpora,
        (acc, val, key) => {
            if (val >= jwtPayload.levels["READ"]) {
                acc.push(key.toUpperCase())
            }
            return acc
        },
        []
    )

    state.otherCredentials = _.reduce(
        jwtPayload.scope.other,
        (acc, val, key) => {
            if (val >= jwtPayload.levels["READ"]) {
                acc.push(key.toUpperCase())
            }
            return acc
        },
        []
    )

    return true
}

const initAngular = () => {
    const korpApp = angular.module("korpApp")
    korpApp.component("loginStatus", loginStatusComponent)
}

const login = () => {
    // TODO try to implement this again
    // if we already tried to login, don't redirect again, to avoid infinite loops
    // if (document.referrer == "") {
    // }
    window.location.href = `${settings["auth_module"]["options"]["login_service"]}?redirect=${window.location.href}`
}

const getAuthorizationHeader = () => {
    if (isLoggedIn()) {
        return { Authorization: `Bearer ${state.jwt}` }
    }
    return {}
}

const hasCredential = (corpusId) => {
    return getCredentials().includes(corpusId)
}

const logout = () => {
    window.location.href = settings["auth_module"]["options"]["logout_service"]
}

const getCredentials = () => {
    return state.credentials || []
}

const getUsername = () => {
    return state.username
}

const isLoggedIn = () => {
    return !_.isEmpty(state.jwt)
}

const getOtherCredentials = () => state.otherCredentials || []

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
    getOtherCredentials,
}
