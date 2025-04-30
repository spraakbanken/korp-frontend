/**
 * @format
 */
import angular, { ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { regescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { countAttrValues } from "@/backend/attr-values"
import { RecursiveRecord } from "@/backend/types/attr-values"
import { StoreService } from "@/services/store"
import { Condition } from "@/cqp_parser/cqp.types"

export type GlobalFilterService = {
    initialize: () => void
}

/**
 * "Global filters" are text-level CQP conditions for selected attributes, that are managed separately in the GUI and
 * then merged with the tokens of the query when sending it to the backend. This service manages the state of the
 * filters, which lives in the root scope. The GUI component is duplicated in simple and extended search, and it
 * manages user-selected values.
 */
angular.module("korpApp").factory("globalFilterService", [
    "$rootScope",
    "$timeout",
    "store",
    function ($rootScope: RootScope, $timeout: ITimeoutService, store: StoreService): GlobalFilterService {
        /** Drilldown of values available for each attr. N-dimensional map where N = number of attrs. */
        let currentData: RecursiveRecord<number> = {}

        /** Fetch token counts keyed in multiple dimensions by the values of attributes */
        async function getData(): Promise<void> {
            const corpora = settings.corpusListing.getSelectedCorpora()
            const attrs = Object.keys(store.globalFilterData)
            const multiAttrs = attrs.filter((attr) => store.globalFilterData[attr].attribute.type === "set")
            currentData = corpora.length && attrs.length ? await countAttrValues(corpora, attrs, multiAttrs) : {}
            // Abort if corpus selection has changed since the request was made
            if (!_.isEqual(corpora, settings.corpusListing.getSelectedCorpora())) return
            $timeout(() => {
                updateData()
                // Deselect values that are not in the options
                for (const filter of Object.values(store.globalFilterData)) {
                    filter.value = filter.value.filter((value) => filter.options.some(([v]) => v === value))
                }
            })
        }

        // when user selects an attribute, update all possible filter values and counts
        function updateData() {
            function collectAndSum(
                attrs: string[],
                elements: RecursiveRecord<number>,
                parentSelected: boolean
            ): [number, boolean] {
                const attr = attrs[0]
                const filter = store.globalFilterData[attr]
                let sum = 0
                const values: string[] = []
                let include = false
                for (let value in elements) {
                    var childCount: number
                    const child = elements[value]
                    const selected = !filter.value.length || filter.value.includes(value)

                    // filter of any parent values that do not support the child values
                    include = include || selected

                    if (typeof child == "number") {
                        childCount = child
                        include = true
                    } else {
                        ;[childCount, include] = collectAndSum(_.tail(attrs), child, parentSelected && selected)
                    }

                    const countDisplay = include && parentSelected ? childCount : 0
                    filter.options.push([value, countDisplay])

                    if (selected && include) {
                        sum += childCount
                    }

                    values.push(value)
                }

                return [sum, include]
            }

            // reset all filters
            for (const filter of Object.values(store.globalFilterData)) filter.options = []

            // recursively decide the counts of all values
            collectAndSum(Object.keys(store.globalFilterData), currentData, true)

            // merge duplicate child values
            for (const filter of Object.values(store.globalFilterData)) {
                // Sum the counts of duplicate values
                const options: Record<string, number> = {}
                for (const [value, count] of filter.options) {
                    options[value] ??= 0
                    options[value] += count
                }
                // Cast back to list and sort alphabetically
                filter.options = Object.entries(options).sort((a, b) => a[0].localeCompare(b[0], store.lang))
            }
        }

        /** Build globally available CQP fragment. */
        function updateCqp() {
            // Create a token with an AND of each attribute, and an OR of the selected values of each attribute.
            const and_block = Object.entries(store.globalFilterData)
                .map(([attr, filter]) =>
                    filter.value.map(
                        (value) =>
                            ({
                                type: `_.${attr}`,
                                op: filter.attribute.type === "set" ? "contains" : "=",
                                val: regescape(value),
                            } satisfies Condition)
                    )
                )
                .filter((conds) => conds.length > 0)
            // If nothing is selected, unset globalFilter
            store.globalFilter = and_block.length ? [{ and_block }] : undefined
        }

        function initialize() {
            /** Update available filters when changing corpus selection. */
            store.watch("corpus", () => {
                if (settings.corpusListing.selected.length > 0) {
                    const attrs = settings.corpusListing.getDefaultFilters()

                    // Remove filters that are no more applicable
                    for (const attr in store.globalFilterData) {
                        if (!attrs[attr]) delete store.globalFilterData[attr]
                    }

                    // Add new filters
                    for (const attr in attrs) {
                        store.globalFilterData[attr] ??= {
                            attribute: attrs[attr],
                            value: [], // Selection empty by default
                            options: [], // Filled in updateData
                        }
                    }

                    getData()
                }
            })

            /** Set up sync from url params to local data. */
            store.watch("global_filter", () => {
                // Copy values from param, reset filters not in param
                for (const attr in store.globalFilterData) {
                    store.globalFilterData[attr].value = store.global_filter[attr] || []
                }
            })

            store.watch(
                "globalFilterData",
                (filterData, filterDataOld) => {
                    // Get data (cached) in case the set of available filters have changed
                    getData()
                    // Update the CQP fragment using globalFilterData
                    updateCqp()
                    // Only store actual changes
                    const values = _.mapValues(filterData, (filter) => filter.value)
                    const valuesOld = _.mapValues(filterDataOld, (filter) => filter.value)
                    if (!_.isEqual(values, valuesOld)) {
                        // Skip empty filters for a shorter URL
                        store.global_filter = _.pickBy(values, (vals) => vals.length)
                    }
                },
                true
            )
        }

        return {
            initialize,
        }
    },
])
