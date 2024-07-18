/** @format */

import { IModule } from "angular"

export type AuthModule = {
    /**
     * Check if logged in.
     * This is called before Angular app is initialized.
     */
    init: () => boolean | Promise<boolean>
    /** Initialize in Angular context (add login form components etc) */
    initAngular: (korpApp: IModule) => void
    /** Trigger interactive authentication workflow */
    login: Function
    /** Trigger logout */
    logout: () => void
    /** Get headers to include in API requests */
    getAuthorizationHeader: () => Record<string, string>
    /** Check if user has access to a given corpus */
    hasCredential: (corpusId: string) => boolean
    /** Get corpus ids the user has access to */
    getCredentials: () => string[]
    getUsername: () => string
    isLoggedIn: () => boolean
}
