/** @format */
import { mergeCqpExprs, parse, stringify } from "@/cqp_parser/cqp"
import { RootScope } from "@/root-scope.types"
import { SearchHistoryService } from "@/services/search-history"
import { LocationService } from "@/urlparams"
import angular, { IDeferred, IQService, ITimeoutService } from "angular"
import "@/services/search-history"

export type SearchesService = {
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
            langDef: $q.defer(),

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            kwicSearch(cqp: string) {
                $rootScope.$emit("make_request", cqp, $rootScope.activeSearch)
            },

            getCqpExpr(): string {
                if (!$rootScope.activeSearch) return ""
                if ($rootScope.activeSearch.type === "word" || $rootScope.activeSearch.type === "lemgram")
                    return $rootScope.simpleCQP || ""
                return $rootScope.activeSearch.val
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
                $q.all([searches.langDef.promise, $rootScope.globalFilterDef.promise]).then(function () {
                    // For Extended search, the CQP is instead in the `cqp` URL param
                    if (type === "cqp" && !value) {
                        value = $location.search().cqp || ""
                        // Merge with global filters
                        // (For Simple search, the equivalent is handled in the simple-search component)
                        if ($rootScope.globalFilter) {
                            value = stringify(mergeCqpExprs(parse(value || "[]"), $rootScope.globalFilter))
                        }
                    }

                    // Store new query in search history
                    if (value) {
                        searchHistory.addItem($location.search())
                    }
                    // TODO Is `value` ever empty? Document and remove this.
                    else {
                        console.warn("searches.ts: value is empty")
                    }

                    // Update stored search query
                    if (["cqp", "word", "lemgram"].includes(type)) {
                        $rootScope.activeSearch = { type, val: value }
                    }
                    // TODO Can `type` be something else? Document and remove this.
                    else {
                        console.warn(`searches.ts: type is ${type}`)
                    }

                    // Trigger API requests
                    // (For Simple search, the equivalent is handled in the simple-search component)
                    if (type === "cqp") {
                        searches.kwicSearch(value)
                    }
                })
            }
        )

        return searches
    },
])
