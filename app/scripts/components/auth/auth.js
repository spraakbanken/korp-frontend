/** @format */
import statemachine from "@/statemachine"

let authModule
if (settings["auth_module"] == "federated_auth") {
    authModule = require("./federatedauth/fed_auth.js")
} else if (settings["auth_module"] == "basic_auth" || settings["auth_module"] == undefined) {
    // load the default athentication
    authModule = require("./basic_auth")
} else {
    // must be a custom auth module
    authModule = require("custom/" + settings["auth_module"])
}

const init = async () => {
    const loggedIn = await authModule.init()
    if (loggedIn) {
        statemachine.send("USER_FOUND")
    } else {
        statemachine.send("USER_NOT_FOUND")
    }
    return loggedIn
}

const initAngular = authModule.initAngular
const login = authModule.login
const logout = authModule.logout
const getCredentials = authModule.getCredentials
const isLoggedIn = authModule.isLoggedIn
const getUsername = authModule.getUsername
const getAuthorizationHeader = authModule.getAuthorizationHeader
const hasCredential = authModule.hasCredential

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
