/**
 * @file "Global filters" are similar to token conditions (like `word = "rock"`), but are managed separately in the GUI
 *   and then merged with the tokens of the query when sending it to the backend.
 * @format
 */
import angular, { IQService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { regescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { countAttrValues } from "@/backend/attr-values"
import { DataObject, GlobalFilterService, UpdateScope } from "./types"
import { CqpQuery, Condition } from "@/cqp_parser/cqp.types"
import { RecursiveRecord } from "@/backend/types/attr-values"
import { Filter } from "@/corpus_listing"

type StoredFilterValues = Record<string, string[]>

// Data service for the global filter in korp
// Directive is duplicated in simple and extended search
// so this directive holds all state concering the users input
// and what possible filters and values are available

// diretives calls registerScope to register for updates
// service calls scope.update() when changes occur
angular.module("korpApp").factory("globalFilterService", [
    "$rootScope",
    "$location",
    "$q",
    function ($rootScope: RootScope, $location: LocationService, $q: IQService): GlobalFilterService {
        const scopes: UpdateScope[] = []

        const notify = () => listenerDef.promise.then(() => scopes.map((scope) => scope.update(dataObj)))

        // deferred for waiting for all directives to register
        var listenerDef = $q.defer<never>()

        /** Model of filter data. */
        const dataObj: DataObject = {}

        /** Drilldown of values available for each attr. N-dimensional map where N = number of attrs. */
        let currentData: RecursiveRecord<number> = {}

        function initFilters(filters: Record<string, Filter>) {
            // Remove filters that are no more applicable
            for (const attr in dataObj) {
                if (!filters[attr]) {
                    delete dataObj[attr]
                }
            }

            for (const attr in filters) {
                // Replace settings of existing filters but keep their values
                if (dataObj[attr]) Object.assign(dataObj[attr], filters)
                else {
                    // Add new filters
                    dataObj[attr] = {
                        value: [], // Selection empty by default
                        possibleValues: [], // Filled in updateData
                        ...filters[attr],
                    }
                }
            }
        }

        function getSupportedCorpora() {
            const corporaPerFilter = Object.values(dataObj).map((filter) => filter.corpora)
            return _.intersection(...(corporaPerFilter || []))
        }

        /** Fetch token counts keyed in multiple dimensions by the values of attributes */
        async function getData(): Promise<void> {
            const corpora = getSupportedCorpora()
            const attrs = Object.keys(dataObj)
            const multiAttrs = attrs.filter((attr) => dataObj[attr].settings.type === "set")
            currentData = corpora.length && attrs.length ? await countAttrValues(corpora, attrs, multiAttrs) : {}
            updateData()
        }

        // when user selects an attribute, update all possible filter values and counts
        function updateData() {
            function collectAndSum(
                filters: string[],
                elements: RecursiveRecord<number>,
                parentSelected: boolean
            ): [number, boolean] {
                const filter = filters[0]
                let sum = 0
                const values: string[] = []
                let include = false
                for (let value in elements) {
                    var childCount: number
                    const child = elements[value]
                    const selected = !dataObj[filter].value.length || dataObj[filter].value.includes(value)

                    // filter of any parent values that do not support the child values
                    include = include || selected

                    if (typeof child == "number") {
                        childCount = child
                        include = true
                    } else {
                        ;[childCount, include] = collectAndSum(_.tail(filters), child, parentSelected && selected)
                    }

                    const countDisplay = include && parentSelected ? childCount : 0
                    dataObj[filter].possibleValues.push([value, countDisplay])

                    if (selected && include) {
                        sum += childCount
                    }

                    values.push(value)
                }

                return [sum, include]
            }

            // reset all filters
            for (const attr in dataObj) dataObj[attr].possibleValues = []

            // recursively decide the counts of all values
            collectAndSum(Object.keys(dataObj), currentData, true)

            // merge duplicate child values
            for (const attr in dataObj) {
                // Sum the counts of duplicate values
                const options: Record<string, number> = {}
                for (const [value, count] of dataObj[attr].possibleValues) {
                    options[value] ??= 0
                    options[value] += count
                }
                // Cast back to list and sort alphabetically
                dataObj[attr].possibleValues = Object.entries(options).sort((a, b) =>
                    a[0].localeCompare(b[0], $rootScope.lang)
                )
            }
        }

        /** Parse encoded url param value to local data. */
        function setFromLocation(globalFilter?: string) {
            if (!globalFilter) {
                return
            }
            const parsedFilter: StoredFilterValues = JSON.parse(atob(globalFilter))

            // Copy values from param, reset filters not in param
            for (const attr in dataObj) {
                dataObj[attr].value = parsedFilter[attr] || []
            }
        }

        /** Build a CQP token object of AND-combined conditions from active filters. */
        function makeCqp(): CqpQuery {
            const andArray: Condition[][] = Object.entries(dataObj).map(([attr, filter]) =>
                filter.value.map((value) => ({
                    type: `_.${attr}`,
                    op: filter.settings.type === "set" ? "contains" : "=",
                    val: regescape(value),
                }))
            )

            return [{ and_block: andArray }]
        }

        /** Set url param from local data, as base64-encoded json. */
        function updateLocation() {
            const rep: StoredFilterValues = {}
            Object.entries(dataObj).forEach(([attr, filter]) => {
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
                notify()
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
            registerScope(scope) {
                scopes.push(scope)
                // TODO this will not work with parallel mode since only one directive is used :(
                if (scopes.length === 2) {
                    listenerDef.resolve()
                }
            },
            valueChange() {
                updateLocation()
                updateData()
            },
        }
    },
])
