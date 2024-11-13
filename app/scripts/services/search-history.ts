/** @format */
import angular from "angular"
import { isEqual, pick } from "lodash"
import { localStorageGet, localStorageSet } from "@/local-storage"
import { getSearchParamNames, HashParams, SearchParams } from "@/urlparams"

export type SearchHistoryService = {
    getItems: () => SearchParams[]
    addItem: (params: Partial<HashParams>) => void
    clear: () => void
    listen: (listener: Listener) => void
}

export type Listener = () => void

angular.module("korpApp").factory("searchHistory", [
    function (): SearchHistoryService {
        const listeners: Listener[] = []

        const notify = (): void => listeners.forEach((callback) => callback())

        return {
            getItems: getSearchHistory,
            addItem: (params) => {
                addToSearchHistory(params)
                notify()
            },
            clear: () => {
                clearSearchHistory()
                notify()
            },
            listen: (listener) => listeners.push(listener),
        }
    },
])

function getSearchHistory(): SearchParams[] {
    // TODO This was added in November 2024, remove after a few months?
    convertSearchHistoryStorage()
    return localStorageGet("searches") || []
}

function addToSearchHistory(params: Partial<HashParams>): void {
    const searchParams = pick(params, getSearchParamNames())
    const searches = localStorageGet("searches") || []
    // Exit early if this search already exists
    if (searches.some((item) => isEqual(item, searchParams))) return
    // Add new search to start of list
    searches.unshift(searchParams)
    localStorageSet("searches", searches)
}

function clearSearchHistory(): void {
    localStorage.removeItem("searches")
}

/** Convert old format, a list of {label, location} objects */
function convertSearchHistoryStorage(): void {
    try {
        const searches = localStorageGet("searches") as any[] | undefined
        if (typeof searches?.[0] == "object" && searches[0]["location"]) {
            // Clear and re-add
            clearSearchHistory()
            searches.forEach((search) => {
                const querystring = search.location.split("?")[1]
                const params = Object.fromEntries(new URLSearchParams(querystring))
                addToSearchHistory(params)
            })
        }
    } catch (error) {
        console.error("Could not convert old search history, discarding. Error was:")
        console.error(error)
        clearSearchHistory()
    }
}
