/** @format */
import { mergeCqpExprs, parse, stringify } from "@/cqp_parser/cqp"
import { updateSearchHistory } from "@/history"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { unregescape } from "@/util"
import angular, { IDeferred, IQService } from "angular"

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
    "$q",
    function ($location: LocationService, $rootScope: RootScope, $q: IQService): SearchesService {
        const searches: SearchesService = {
            activeSearch: null,
            langDef: $q.defer(),

            /** Tell result controllers (kwic/statistics/word picture) to send their requests. */
            kwicSearch(cqp: string) {
                $rootScope.$emit("make_request", cqp, this.activeSearch)
            },

            getCqpExpr(): string {
                if (!this.activeSearch) return null
                if (this.activeSearch.type === "word" || this.activeSearch.type === "lemgram")
                    return $rootScope.simpleCQP
                return this.activeSearch.val
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
                    const historyValue = type === "lemgram" ? unregescape(value) : value
                    updateSearchHistory(historyValue, $location.absUrl())
                }
                $q.all([searches.langDef.promise, $rootScope.globalFilterDef.promise]).then(function () {
                    if (type === "cqp") {
                        if (!value) {
                            value = $location.search().cqp
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
