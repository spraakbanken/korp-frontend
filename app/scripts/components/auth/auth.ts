/** @format */
import statemachine from "@/statemachine"
import settings from "@/settings"
import { AuthModule } from "./auth.types"

function findAuthModule(): AuthModule | undefined {
    const name = typeof settings.auth_module == "object" ? settings.auth_module.module : settings.auth_module

    if (name == "federated_auth") {
        return require("./federatedauth/fed_auth")
    }

    if (name == "basic_auth" || !name) {
        // load the default athentication
        return require("./basic_auth")
    }

    // must be a custom auth module
    try {
        return require("custom/" + name)
    } catch (error) {
        console.error("Auth module not available: ", authModule)
    }
}

// TODO Provide dummy auth module if not found? Or produce visible crash because it's a config error.
const authModule = findAuthModule()!

export async function init(): Promise<boolean> {
    const loggedIn = await authModule.init()
    statemachine.send(loggedIn ? "USER_FOUND" : "USER_NOT_FOUND")
    return loggedIn
}

export const initAngular = authModule.initAngular
export const login = authModule.login
export const logout = authModule.logout
export const getCredentials = authModule.getCredentials
export const isLoggedIn = authModule.isLoggedIn
export const getUsername = authModule.getUsername
export const getAuthorizationHeader = authModule.getAuthorizationHeader
export const hasCredential = authModule.hasCredential
