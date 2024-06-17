/** @format */
import angular from "angular"
import { createStore } from "./store"

type KwicState = {
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
}

const init = () => ({
    hits: undefined,
    hitsInProgress: undefined,
})

const kwicStore = createStore<KwicState>("kwic", init)
angular.module("korpApp").factory("kwicStore", kwicStore)
