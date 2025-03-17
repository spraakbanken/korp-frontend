/**
 * @format
 */
import angular, { ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { regescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { countAttrValues } from "@/backend/attr-values"
import { RecursiveRecord } from "@/backend/types/attr-values"

export type GlobalFilterService = {
    initialize: () => void
}

/** Shape of data stored in URL */
type StoredFilterValues = Record<string, string[]>

/**
 * "Global filters" are text-level CQP conditions for selected attributes, that are managed separately in the GUI and
 * then merged with the tokens of the query when sending it to the backend. This service manages the state of the
 * filters, which lives in the root scope. The GUI component is duplicated in simple and extended search, and it
 * manages user-selected values.
 */
angular.module("korpApp").factory("globalFilterService", [
    "$location",
    "$rootScope",
    "$timeout",
    function ($location: LocationService, $rootScope: RootScope, $timeout: ITimeoutService): GlobalFilterService {
        /** Drilldown of values available for each attr. N-dimensional map where N = number of attrs. */
        let currentData: RecursiveRecord<number> = {}

        /** Fetch token counts keyed in multiple dimensions by the values of attributes */
        async function getData(): Promise<void> {
            const corpora = settings.corpusListing.getSelectedCorpora()
            const attrs = Object.keys($rootScope.globalFilterData)
            const multiAttrs = attrs.filter((attr) => $rootScope.globalFilterData[attr].attribute.type === "set")
            currentData = corpora.length && attrs.length ? await countAttrValues(corpora, attrs, multiAttrs) : {}
            // Abort if corpus selection has changed since the request was made
            if (!_.isEqual(corpora, settings.corpusListing.getSelectedCorpora())) return
            $timeout(() => {
                updateData()
                // Deselect values that are not in the options
                for (const filter of Object.values($rootScope.globalFilterData)) {
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
                const filter = $rootScope.globalFilterData[attr]
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
            for (const filter of Object.values($rootScope.globalFilterData)) filter.options = []

            // recursively decide the counts of all values
            collectAndSum(Object.keys($rootScope.globalFilterData), currentData, true)

            // merge duplicate child values
            for (const filter of Object.values($rootScope.globalFilterData)) {
                // Sum the counts of duplicate values
                const options: Record<string, number> = {}
                for (const [value, count] of filter.options) {
                    options[value] ??= 0
                    options[value] += count
                }
                // Cast back to list and sort alphabetically
                filter.options = Object.entries(options).sort((a, b) => a[0].localeCompare(b[0], $rootScope.lang))
            }
        }

        /** Parse encoded url param value to local data. */
        function setFromLocation(globalFilter?: string) {
            if (!globalFilter) return
            const parsedFilter: StoredFilterValues = JSON.parse(atob(globalFilter))

            // Copy values from param, reset filters not in param
            for (const attr in $rootScope.globalFilterData) {
                $rootScope.globalFilterData[attr].value = parsedFilter[attr] || []
            }
        }

        /** Set url param from local data, as base64-encoded json. */
        function updateLocation() {
            const rep: StoredFilterValues = {}
            Object.entries($rootScope.globalFilterData).forEach(([attr, filter]) => {
                if (filter.value.length) rep[attr] = filter.value
            })
            if (!_.isEmpty(rep)) {
                $location.search("global_filter", btoa(JSON.stringify(rep)))
                // Build a CQP token object of AND-combined conditions from active filters.
                $rootScope.globalFilter = [
                    {
                        and_block: Object.entries($rootScope.globalFilterData).map(([attr, filter]) =>
                            filter.value.map((value) => ({
                                type: `_.${attr}`,
                                op: filter.attribute.type === "set" ? "contains" : "=",
                                val: regescape(value),
                            }))
                        ),
                    },
                ]
            } else {
                $location.search("global_filter", null)
                $rootScope.globalFilter = null
            }
        }

        function initialize() {
            /** Update available filters when changing corpus selection. */
            $rootScope.$on("corpuschooserchange", () => {
                if (settings.corpusListing.selected.length > 0) {
                    const attrs = settings.corpusListing.getDefaultFilters()

                    // Remove filters that are no more applicable
                    for (const attr in $rootScope.globalFilterData) {
                        if (!attrs[attr]) delete $rootScope.globalFilterData[attr]
                    }

                    // Add new filters
                    for (const attr in attrs) {
                        $rootScope.globalFilterData[attr] ??= {
                            attribute: attrs[attr],
                            value: [], // Selection empty by default
                            options: [], // Filled in updateData
                        }
                    }

                    setFromLocation($location.search().global_filter)
                    getData()
                    updateLocation()
                }
                // Flag that the filter feature is ready.
                $rootScope.globalFilterDef.resolve()
            })

            /** Set up sync from url params to local data. */
            $rootScope.$watch(
                () => $location.search().global_filter,
                (filter) => setFromLocation(filter)
            )

            $rootScope.$watch(
                "globalFilterData",
                (filterData: RootScope["globalFilterData"], filterDataOld?: RootScope["globalFilterData"]) => {
                    // Only watch selection changes
                    const values = _.mapValues(filterData, (filter) => filter.value)
                    const valuesOld = _.mapValues(filterDataOld, (filter) => filter.value)
                    if (!_.isEqual(values, valuesOld)) {
                        updateLocation()
                        getData()
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
