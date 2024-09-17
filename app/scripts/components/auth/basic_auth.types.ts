/** @format */
import { Creds } from "@/local-storage"

export type AuthState = {
    loginObj?: Creds
}

export type LoginResponseData = {
    corpora: string[]
}

export type AuthModuleOptions = {
    show_remember?: boolean
    default_value_remember?: boolean
}
