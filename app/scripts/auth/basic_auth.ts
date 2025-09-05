import settings from "@/settings"
import { Creds, localStorageGet, localStorageSet } from "@/services/local-storage"
import { loginBoxComponent } from "@/components/auth/basic_login_box"
import { loginStatusComponent } from "@/components/auth/basic_login_status"
import { AuthModule } from "./auth.types"
import { toBase64 } from "@/util"

let creds: Creds | undefined

async function login(name: string, pass: string, saveLogin: boolean): Promise<void> {
    const token = toBase64(name + ":" + pass)
    const url = `${settings.korp_backend_url}/authenticate`
    const headers = { Authorization: `Basic ${token}` }
    const response = await fetch(url, { headers })
    const data = await response.json()

    if (!data.corpora) throw new Error("No corpora in auth response")

    creds = { name, credentials: data.corpora, auth: token }
    if (saveLogin) localStorageSet("creds", creds)
}

const authModule: AuthModule = {
    init: () => {
        creds = localStorageGet("creds")
        return !!creds
    },
    initAngular: (korpApp) => {
        korpApp.component("loginStatus", loginStatusComponent)
        korpApp.component("loginBox", loginBoxComponent)
    },
    login,
    logout: () => {
        creds = undefined
        localStorage.removeItem("creds")
    },
    getAuthorizationHeader: (): Record<string, string> => (creds ? { Authorization: `Basic ${creds.auth}` } : {}),
    hasCredential: (corpusId) => creds?.credentials?.includes(corpusId.toUpperCase()) || false,
    getCredentials: () => creds?.credentials || [],
    getUsername: () => creds!.name,
    isLoggedIn: () => !!creds,
}

export default authModule
