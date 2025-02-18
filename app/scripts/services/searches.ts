/** @format */
import angular from "angular"
import { mergeCqpExprs, parse, stringify } from "@/cqp_parser/cqp"
import { RootScope } from "@/root-scope.types"
import { SearchHistoryService } from "@/services/search-history"
import { LocationService } from "@/urlparams"
import "@/services/search-history"

export type SearchesService = {
    load: () => void
    start: (cqp: string) => void
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
    "$rootScope",
    "searchHistory",
    function ($location: LocationService, $rootScope: RootScope, searchHistory: SearchHistoryService): SearchesService {
        const service = {
            /** Perform search defined in URL param */
            async load(): Promise<void> {
                const searchExpr = $location.search().search
                if (!searchExpr) return
                // The value is a string like <type>|<expr>
                const [type, ...valueSplit] = searchExpr.split("|")
                let value = valueSplit.join("|")

                // Let some initialization steps finish
                await Promise.all([$rootScope.langDef.promise, $rootScope.globalFilterDef.promise])

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
                searchHistory.addItem($location.search())

                // Update stored search query
                $rootScope.activeSearch = { type, val: value }

                // Trigger API requests
                // (For Simple search, the equivalent is handled in the simple-search component)
                if (type === "cqp") service.start(value)
            },

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            start(cqp: string) {
                $rootScope.$emit("make_request", cqp)
            },
        }

        // Watch the `search` URL param
        $rootScope.$watch(
            () => $location.search().search,
            () => service.load()
        )

        return service
    },
])
