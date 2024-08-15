/** @format */
import _ from "lodash"
import angular from "angular"
import { localStorageGet, localStorageSet, SavedSearch } from "@/local-storage"
import currentMode from "@/mode"
import settings from "@/settings"

export class CompareSearches {
    key: "saved_searches" | `saved_searches_${string}`
    savedSearches: SavedSearch[]

    constructor() {
        this.key = currentMode !== "default" ? `saved_searches_${currentMode}` : "saved_searches"
        this.savedSearches = localStorageGet(this.key) || []
    }

    saveSearch(name: string, cqp: string): void {
        const searchObj = {
            label: name || cqp,
            cqp,
            corpora: settings.corpusListing.getSelectedCorpora(),
        }
        this.savedSearches.push(searchObj)
        localStorageSet(this.key, this.savedSearches)
    }

    flush(): void {
        this.savedSearches = []
        localStorageSet(this.key, this.savedSearches)
    }
}

angular.module("korpApp").service("compareSearches", CompareSearches)
