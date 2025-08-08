/** @format */
import angular from "angular"
import { HashParams, SearchParams } from "@/urlparams"
import { LocationService } from "@/util"
import { StoreService } from "./store"
import { addToSearchHistory, clearSearchHistory, getSearchHistory } from "@/search-history"

export type SearchHistoryService = {
    getItems: () => SearchParams[]
    addItem: (params: Partial<HashParams>) => void
    clear: () => void
    listen: (listener: Listener) => void
}

export type Listener = () => void

angular.module("korpApp").factory("searchHistory", [
    "$location",
    "store",
    function ($location: LocationService, store: StoreService): SearchHistoryService {
        const listeners: Listener[] = []

        const notify = (): void => listeners.forEach((callback) => callback())

        const service: SearchHistoryService = {
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

        // When a new search is made, capture it from the URL
        store.watch("activeSearch", () => {
            service.addItem($location.search())
        })

        return service
    },
])
