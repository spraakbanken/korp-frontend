import statemachine from "@/statemachine"
import { AuthModule } from "./auth.types"

export let auth: AuthModule
export function setAuthModule(auth_: AuthModule): void {
    if (auth) throw new Error("Cannot reset auth module")
    auth = auth_
}

/** Check initial login state */
export async function initAuth(): Promise<boolean> {
    const loggedIn = await auth.init()
    statemachine.send(loggedIn ? "USER_FOUND" : "USER_NOT_FOUND")
    return loggedIn
}

statemachine.listen("logout", () => auth.logout())
