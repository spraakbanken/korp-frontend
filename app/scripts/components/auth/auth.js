/** @format */
import statemachine from "@/statemachine"

let authModule
let authModuleName = settings["auth_module"]?.["module"] || settings["auth_module"]
if (authModuleName == "federated_auth") {
    authModule = require("./federatedauth/fed_auth.js")
} else if (authModuleName == "basic_auth" || authModuleName == undefined) {
    // load the default athentication
    authModule = require("./basic_auth")
} else {
    // must be a custom auth module
    authModule = require("custom/" + authModuleName)
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
