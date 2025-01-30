/**
 * @file "Global filters" are similar to token conditions (like `word = "rock"`), but are managed separately in the GUI
 *   and then merged with the tokens of the query when sending it to the backend.
 * @format
 */
import angular, { ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { regescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { countAttrValues } from "@/backend/attr-values"
import { CqpQuery, Condition } from "@/cqp_parser/cqp.types"
import { RecursiveRecord } from "@/backend/types/attr-values"
import { Attribute } from "@/settings/config.types"

export type GlobalFilterService = {
    valueChange: () => void
}

type StoredFilterValues = Record<string, string[]>

// Data service for the global filter in korp
// Directive is duplicated in simple and extended search
// so this directive holds all state concering the users input
// and what possible filters and values are available

// diretives calls registerScope to register for updates
// service calls scope.update() when changes occur
angular.module("korpApp").factory("globalFilterService", [
    "$location",
    "$rootScope",
    "$timeout",
    function ($location: LocationService, $rootScope: RootScope, $timeout: ITimeoutService): GlobalFilterService {
        /** Drilldown of values available for each attr. N-dimensional map where N = number of attrs. */
        let currentData: RecursiveRecord<number> = {}

        function initFilters(filters: Record<string, Attribute>) {
            // Remove filters that are no more applicable
            for (const attr in $rootScope.globalFilterData) {
                if (!filters[attr]) delete $rootScope.globalFilterData[attr]
            }

            // Add new filters
            for (const attr in filters) {
                $rootScope.globalFilterData[attr] ??= {
                    attribute: filters[attr],
                    value: [], // Selection empty by default
                    options: [], // Filled in updateData
                }
            }
        }

        /** Fetch token counts keyed in multiple dimensions by the values of attributes */
        async function getData(): Promise<void> {
            const corpora = settings.corpusListing.getSelectedCorpora()
            const attrs = Object.keys($rootScope.globalFilterData)
            const multiAttrs = attrs.filter((attr) => $rootScope.globalFilterData[attr].attribute.type === "set")
            currentData = corpora.length && attrs.length ? await countAttrValues(corpora, attrs, multiAttrs) : {}
            $timeout(() => updateData())
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
            if (!globalFilter) {
                return
            }
            const parsedFilter: StoredFilterValues = JSON.parse(atob(globalFilter))

            // Copy values from param, reset filters not in param
            for (const attr in $rootScope.globalFilterData) {
                $rootScope.globalFilterData[attr].value = parsedFilter[attr] || []
            }
        }

        /** Build a CQP token object of AND-combined conditions from active filters. */
        function makeCqp(): CqpQuery {
            const andArray: Condition[][] = Object.entries($rootScope.globalFilterData).map(([attr, filter]) =>
                filter.value.map((value) => ({
                    type: `_.${attr}`,
                    op: filter.attribute.type === "set" ? "contains" : "=",
                    val: regescape(value),
                }))
            )

            return [{ and_block: andArray }]
        }

        /** Set url param from local data, as base64-encoded json. */
        function updateLocation() {
            const rep: StoredFilterValues = {}
            Object.entries($rootScope.globalFilterData).forEach(([attr, filter]) => {
                if (filter.value.length) rep[attr] = filter.value
            })
            if (!_.isEmpty(rep)) {
                $location.search("global_filter", btoa(JSON.stringify(rep)))
                $rootScope.globalFilter = makeCqp()
            } else {
                $location.search("global_filter", null)
                $rootScope.globalFilter = null
            }
        }

        /** Update available filters when changing corpus selection. */
        $rootScope.$on("corpuschooserchange", () => {
            if (settings.corpusListing.selected.length > 0) {
                const filters = settings.corpusListing.getDefaultFilters()
                initFilters(filters)
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

        return {
            valueChange() {
                updateLocation()
                updateData()
            },
        }
    },
])
