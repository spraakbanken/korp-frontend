/** @format */
import { pick } from "lodash"
import { localStorageGet, localStorageSet } from "@/services/local-storage"
import { getSearchParamNames, HashParams, SearchParams } from "@/urlparams"
import { paramsString, splitFirst, unregescape } from "@/util"

/** A string identifying the Korp instance within the origin */
const APP_PATH = location.pathname + location.search

export function getSearchHistory(appPath: string = APP_PATH): SearchParams[] {
    const searchesAll = localStorageGet("searches") || {}
    return searchesAll[appPath] || []
}

/** Get, modify and store search history, if the search is unique */
export function addToSearchHistory(params: Partial<HashParams>, appPath: string = APP_PATH): void {
    const searchesAll = localStorageGet("searches") || {}
    addNewSearch(searchesAll, appPath, params)
    localStorageSet("searches", searchesAll)
}

/** Extract search-related params and add the object to the list in-place, if not already present. */
function addNewSearch(searches: Record<string, SearchParams[]>, appPath: string, params: Partial<HashParams>): void {
    searches[appPath] ??= []
    const searchParams = pick(params, getSearchParamNames())
    // Add to start of list, unless already in list
    const isNew = searches[appPath].every((item) => paramsString(item) != paramsString(searchParams))
    if (isNew) searches[appPath].unshift(searchParams)
}

export function clearSearchHistory(): void {
    localStorage.removeItem("searches")
}

export type Option = { id: string; label: string }
export type SearchOption = Option & { params: SearchParams }

export const isSearchOption = (option: Option): option is SearchOption => "params" in option

export const createSearchOption = (params: SearchParams): SearchOption => ({
    id: JSON.stringify(params),
    label: getLabel(params),
    params,
})

function getLabel(params: SearchParams): string {
    if (!params.search) return "–"
    if (params.search == "cqp") return params.cqp || "–"
    const [type, value] = splitFirst("|", params.search)
    return type === "lemgram" ? unregescape(value) : value
}
