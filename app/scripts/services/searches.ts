/** @format */
import { mergeCqpExprs, parse, stringify } from "@/cqp_parser/cqp"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import angular from "angular"
import "@/services/search-history"
import { splitFirst } from "@/util"
import { StoreService } from "./store"

/**
 * This service provides a routine for activating a new search.
 *
 * If the search query has meaningfully changed, the result controllers are notified so they can make their API
 * requests.
 */
export type SearchesService = {
    /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
    kwicSearch: (cqp: string) => void
    /**
     * Read the `search` and `cqp` URL params and set `store.activeSearch`.
     * For extended search: also merge with global filters.
     * For extended/advanced search: also trigger API requests.
     */
    doSearch: () => void
}

angular.module("korpApp").factory("searches", [
    "$location",
    "$rootScope",
    "store",
    function ($location: LocationService, $rootScope: RootScope, store: StoreService): SearchesService {
        const searches: SearchesService = {
            kwicSearch(cqp: string) {
                $rootScope.$emit("make_request", cqp)
            },

            doSearch() {
                const searchExpr = $location.search().search
                if (!searchExpr) return

                // The value is a string like <type>|<expr>
                let [type, value] = splitFirst("|", searchExpr)

                // For Extended search, the CQP is instead in state prop `cqp`
                if (type === "cqp" && !value) {
                    value = store.cqp
                    // Merge with global filters
                    // (For Simple search, the equivalent is handled in the simple-search component)
                    if (store.globalFilter) {
                        value = stringify(mergeCqpExprs(parse(value || "[]"), store.globalFilter))
                    }
                }

                // Update stored search query
                $rootScope.$applyAsync(() => {
                    store.activeSearch = { type, val: value }
                })

                // Trigger API requests
                // (For Simple search, the equivalent is handled in the simple-search component)
                if (type === "cqp") {
                    searches.kwicSearch(value)
                }
            },
        }

        // On page load, check for and perform an initial search from URL params.
        // Wait a tick for initialization of parallel search and global filters.
        setTimeout(() => searches.doSearch())

        return searches
    },
])
