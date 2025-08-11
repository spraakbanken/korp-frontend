/** @format */
import { localStorageGet, localStorageSet, SavedSearch } from "@/local-storage"
import currentMode from "@/mode"
import settings from "@/settings"
import { Observable } from "./util"

type Key = "saved_searches" | `saved_searches_${string}`
const KEY: Key = currentMode !== "default" ? `saved_searches_${currentMode}` : "saved_searches"

class SavedSearchManager extends Observable {
    list(): SavedSearch[] {
        return localStorageGet(KEY) || []
    }

    push(name: string, cqp: string): void {
        const corpora = settings.corpusListing.getSelectedCorpora()
        const searchObj = { label: name || cqp, cqp, corpora }
        localStorageSet(KEY, [...this.list(), searchObj])
        this.notify()
    }

    clear(): void {
        localStorageSet(KEY, [])
        this.notify()
    }
}

const savedSearches = new SavedSearchManager()
export { savedSearches }
