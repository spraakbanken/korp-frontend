/** @format */

import omit from "lodash/omit"
import { SearchParams } from "./urlparams"

/** Get object from local storage. */
export const localStorageGet = <K extends keyof LocalStorage>(key: K): LocalStorage[K] | undefined => {
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : undefined
}

/** Write object to local storage. To delete, use native `localStorage.removeItem(key)`. */
export const localStorageSet = <K extends keyof LocalStorage>(key: K, value: LocalStorage[K]): void =>
    localStorage.setItem(key, JSON.stringify(value))

/**
 * Convert old jStorage data to native localStorage.
 */
export function convertJstorage(): void {
    const jstorageData = localStorage.getItem("jStorage")
    if (!jstorageData) return

    try {
        const json = jstorageData.replace(/^"(.*)"$/, "$1")
        const data = omit(JSON.parse(json), "__jstorage_meta") as LocalStorage
        console.log("Converting local storage:", data)
        Object.keys(data).forEach((key: keyof LocalStorage) => {
            // Write to new storage if empty
            if (!localStorageGet(key)) localStorageSet(key, data[key])
        })
        localStorage.removeItem("jStorage")
    } catch (error) {
        console.error("Error converting old jStorage data:", error)
    }
}

/** Defines local storage objects used by this app. */
export type LocalStorage = {
    /** Credentials, if authenticated. */
    creds?: Creds
    /** Recent search queries, most recent first */
    searches?: SearchParams[]
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
