/** @format */
import { SearchParams } from "@/urlparams"
import { toJson } from "angular"

/** Get object from local storage. */
export const localStorageGet = <K extends keyof LocalStorage>(key: K): LocalStorage[K] | undefined => {
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : undefined
}

/** Write object to local storage. To delete, use native `localStorage.removeItem(key)`. */
export const localStorageSet = <K extends keyof LocalStorage>(key: K, value: LocalStorage[K]): void =>
    localStorage.setItem(key, toJson(value))

/** Defines local storage objects used by this app. */
export type LocalStorage = {
    /** Credentials, if authenticated. */
    creds?: Creds
    /** Recent search queries, most recent first */
    searches?: {
        [mode: string]: SearchParams[]
    }
    /** Search queries saved for comparison in the default Korp mode. */
    saved_searches?: SavedSearch[]
    /** Search queries saved for comparison in the given Korp mode. */
    [saved_searches_mode: `saved_searches_${string}`]: SavedSearch[]
}

export type Creds = {
    /** Username */
    name: string
    /** Accessible corpora */
    credentials: string[]
    /** Basic auth token */
    auth: string
}

export type RecentSearch = {
    /** A label to help identify this query in a list */
    label: string
    /** Deeplink url to the search */
    location: string
}

export type SavedSearch = {
    label: string
    cqp: string
    corpora: string[]
}
