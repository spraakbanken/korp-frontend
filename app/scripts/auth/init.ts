import settings from "@/settings"
import { AuthModule } from "./auth.types"

export function findAuthModule(): AuthModule {
    const name = typeof settings.auth_module == "object" ? settings.auth_module.module : settings.auth_module

    // No auth, all is open
    if (!name) return dummyAuth

    if (name == "federated_auth") {
        return require("./fed_auth").default
    }

    if (name == "basic_auth" || !name) {
        // load the default athentication
        return require("./basic_auth").default
    }

    // must be a custom auth module
    try {
        return require("custom/" + name).default
    } catch {
        throw new Error(`Could not load custom auth module ${name}`)
    }
}

const dummyAuth: AuthModule = {
    init: () => false,
    initAngular: () => {},
    login: () => {},
    logout: () => {},
    getAuthorizationHeader: () => ({}),
    hasCredential: () => false,
    getCredentials: () => [],
    getUsername: () => "",
    isLoggedIn: () => false,
}
