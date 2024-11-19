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

/** A string identifying the Korp instance within the origin */
const APP_PATH = location.pathname + location.search

function getSearchHistory(appPath: string = APP_PATH): SearchParams[] {
    // TODO This was added in November 2024, remove after a few months?
    convertSearchHistoryStorage()
    const searchesAll = localStorageGet("searches") || {}
    return searchesAll[appPath] || []
}

/** Get, modify and store search history, if the search is unique */
function addToSearchHistory(params: Partial<HashParams>, appPath: string = APP_PATH): void {
    const searchesAll = localStorageGet("searches") || {}
    addNewSearch(searchesAll, appPath, params)
    localStorageSet("searches", searchesAll)
}

/** Extract search-related params and add the object to the list in-place, if not already present. */
function addNewSearch(searches: Record<string, SearchParams[]>, appPath: string, params: Partial<HashParams>): void {
    searches[appPath] ??= []
    const searchParams = pick(params, getSearchParamNames())
    // Add to start of list, unless already in list
    if (searches[appPath].every((item) => !isEqual(item, searchParams))) searches[appPath].unshift(searchParams)
}

function clearSearchHistory(): void {
    localStorage.removeItem("searches")
}

/** Convert old format, a list of {label, location} objects */
function convertSearchHistoryStorage(): void {
    try {
        const searches = localStorageGet("searches") as any[] | undefined
        // Exit if it doesn't match old format
        if (typeof searches?.[0] != "object" || !searches[0]["location"]) return
        // Clear and re-add
        clearSearchHistory()
        const searchesNew: Record<string, SearchParams[]> = {}
        searches.forEach((search) => {
            // Get app path and params from stored location
            const url = new URL(search.location)
            const appPath = url.pathname + url.search
            const params = Object.fromEntries(new URLSearchParams(url.hash.slice(1)))
            // Add to new storage
            addNewSearch(searchesNew, appPath, params)
        })
        // Store new format
        localStorageSet("searches", searchesNew)
    } catch (error) {
        console.error("Could not convert old search history, discarding. Error was:")
        console.error(error)
        clearSearchHistory()
    }
}
