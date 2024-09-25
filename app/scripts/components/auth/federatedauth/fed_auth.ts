/**
 * @format
 * @file This is a login module that fetches a JWT from a source to see if the user is already logged in.
 *   If the JWT call fails, it will redirect the user to a login service, a service that will redirect
 *   the user back to Korp. After that the JWT call is expected to return a JWT.
 */
import _ from "lodash"
import { loginStatusComponent } from "./login_status"
import settings from "@/settings"
import { IModule } from "angular"

export type AuthModuleOptions = {
    jwt_url: string
    login_service: string
    logout_service: string
}

type State = {
    credentials?: string[]
    otherCredentials?: string[]
    jwt?: string
    username?: string
}

type JwtPayload = {
    name?: string
    email: string
    scope: {
        corpora?: Record<string, number>
        other?: Record<string, number>
    }
    levels: Record<"READ" | "WRITE" | "ADMIN", number>
}

const state: State = {
    jwt: undefined,
    username: undefined,
}

const authModule = settings.auth_module as { module: string; options: AuthModuleOptions }

export const init = async () => {
    const response = await fetch(authModule.options.jwt_url, {
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

    const jwtPayload: JwtPayload = JSON.parse(atob(jwt.split(".")[1]))
    const { name, email, scope, levels } = jwtPayload
    state.username = name || email

    state.credentials = Object.keys(scope.corpora || {})
        .filter((id) => (scope.corpora?.[id] || 0) > levels["READ"])
        .map((id) => id.toUpperCase())

    state.otherCredentials = Object.keys(scope.other || {})
        .filter((id) => (scope.other?.[id] || 0) > levels["READ"])
        .map((id) => id.toUpperCase())

    return true
}

export const initAngular = (korpApp: IModule) => {
    korpApp.component("loginStatus", loginStatusComponent)
}

export const login = () => {
    // TODO try to implement this again
    // if we already tried to login, don't redirect again, to avoid infinite loops
    // if (document.referrer == "") {
    // }
    window.location.href = `${authModule.options.login_service}?redirect=${window.location.href}`
}

export const getAuthorizationHeader = () => (isLoggedIn() ? { Authorization: `Bearer ${state.jwt}` } : {})

export const hasCredential = (corpusId) => getCredentials().includes(corpusId)

export const logout = () => (window.location.href = authModule.options.logout_service)

export const getCredentials = () => state.credentials || []

export const getUsername = () => state.username

export const isLoggedIn = () => !_.isEmpty(state.jwt)

export const getOtherCredentials = () => state.otherCredentials || []
