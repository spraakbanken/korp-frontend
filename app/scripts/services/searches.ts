/** @format */
import { mergeCqpExprs, parse, stringify } from "@/cqp_parser/cqp"
import { RootScope } from "@/root-scope.types"
import { SearchHistoryService } from "@/services/search-history"
import { LocationService } from "@/urlparams"
import angular, { IDeferred, IQService, ITimeoutService } from "angular"
import "@/services/search-history"

export type SearchesService = {
    activeSearch: {
        /** "word", "lemgram" or "cqp" */
        type: string
        val: string
    } | null
    /** is resolved when parallel search controller is loaded */
    langDef: IDeferred<never>
    kwicSearch: (cqp: string) => void
    getCqpExpr: () => string
    triggerSearch: () => void
}

/**
 * This service watches the `search` URL param and tells result controllers to send API requests.
 *
 * It also reads the `cqp` URL param (but doesn't watch it).
 * If the search query has meaningfully changed, the result controllers are notified so they can make their API
 * requests.
 *
 */
angular.module("korpApp").factory("searches", [
    "$location",
    "$q",
    "$rootScope",
    "$timeout",
    "searchHistory",
    function (
        $location: LocationService,
        $q: IQService,
        $rootScope: RootScope,
        $timeout: ITimeoutService,
        searchHistory: SearchHistoryService
    ): SearchesService {
        const searches: SearchesService = {
            activeSearch: null,
            langDef: $q.defer(),

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            kwicSearch(cqp: string) {
                // Wait until next tick in case corpus selection or other search-related parameters are being updated too
                $timeout(() => $rootScope.$emit("make_request", cqp, this.activeSearch))
            },

            getCqpExpr(): string {
                if (!this.activeSearch) return ""
                if (this.activeSearch.type === "word" || this.activeSearch.type === "lemgram")
                    return $rootScope.simpleCQP || ""
                return this.activeSearch.val
            },

            triggerSearch(): void {
                // Unset and set in next tick, to trigger our watcher
                const search = $location.search().search
                $location.search("search", null)
                $timeout(() => $location.search("search", search))
            },
        }

        // Watch the `search` URL param
        $rootScope.$watch(
            () => $location.search().search,
            (searchExpr: string) => {
                if (!searchExpr) return

                // The value is a string like <type>|<expr>
                const [type, ...valueSplit] = searchExpr.split("|")
                let value = valueSplit.join("|")

                // Store new query in search history
                // For Extended search, `value` is empty (then the CQP is instead in the `cqp` URL param)
                if (value) {
                    searchHistory.addItem($location.search())
                }
                $q.all([searches.langDef.promise, $rootScope.globalFilterDef.promise]).then(function () {
                    if (type === "cqp") {
                        if (!value) {
                            value = $location.search().cqp || ""
                        }
                    }
                    // Update stored search query
                    if (["cqp", "word", "lemgram"].includes(type)) {
                        searches.activeSearch = { type, val: value }
                    }

                    // For Extended/Advanced search, merge with global filters and trigger API requests
                    // (For Simple search, the equivalent is handled in the simple-search component)
                    if (type === "cqp") {
                        if ($rootScope.globalFilter) {
                            value = stringify(mergeCqpExprs(parse(value || "[]"), $rootScope.globalFilter))
                        }
                        searches.kwicSearch(value)
                    }
                })
            }
        )

        return searches
    },
])
