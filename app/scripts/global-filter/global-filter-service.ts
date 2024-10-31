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
import { RecursiveRecord, StructService, StructServiceOptions } from "@/backend/struct-service"
import { DataObject, GlobalFilterService, UpdateScope } from "./types"
import { CqpQuery, Condition } from "@/cqp_parser/cqp.types"

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
    "structService",
    function (
        $rootScope: RootScope,
        $location: LocationService,
        $q: IQService,
        structService: StructService
    ): GlobalFilterService {
        const scopes: UpdateScope[] = []

        const notify = () => listenerDef.promise.then(() => scopes.map((scope) => scope.update(dataObj)))

        // deferred for waiting for all directives to register
        var listenerDef = $q.defer<never>()

        /** Model of filter data. */
        const dataObj: DataObject = {
            filterValues: {},
            defaultFilters: [],
            attributes: {},
            showDirective: false,
        }

        /** Drilldown of values available for each attr. N-dimensional map where N = number of attrs. */
        let currentData: RecursiveRecord<Record<string, number>> = {}

        /** Populate `filterValues` from `defaultFilters`. */
        function initFilters() {
            // delete any filter values that are not in the selected filters
            for (const filter in dataObj.filterValues) {
                if (!dataObj.defaultFilters.includes(filter)) {
                    delete dataObj.filterValues[filter]
                }
            }

            // create object for every filter that is selected but not yet created
            for (const filter of dataObj.defaultFilters) {
                if (!(filter in dataObj.filterValues)) {
                    dataObj.filterValues[filter] = { value: [], possibleValues: [] }
                }
            }
        }

        function getSupportedCorpora() {
            const corporaPerFilter = _.map(dataObj.defaultFilters, (filter) => dataObj.attributes[filter].corpora)
            return _.intersection(...(corporaPerFilter || []))
        }

        /** Merge values of some attribute from different corpora */
        function mergeObjects(...values: any[] | object[] | number[]): any[] | object | number | undefined {
            if (_.every(values, (val) => Array.isArray(val))) {
                return _.union(...(values || []))
            } else if (_.every(values, (val) => !Array.isArray(val) && typeof val === "object")) {
                const newObj = {}
                const allKeys = _.union(...(_.map(values, (val) => _.keys(val)) || []))
                for (let k of allKeys) {
                    const allValsForKey = _.map(values, (val) => val[k])
                    const newValues = _.filter(allValsForKey, (val) => !_.isEmpty(val) || Number.isInteger(val))
                    newObj[k] = mergeObjects(...(newValues || []))
                }
                return newObj
            } else if (_.every(values, (val) => Number.isInteger(val))) {
                return _.reduce(values, (a, b) => a + b, 0)
            } else {
                console.error("Cannot merge objects a and b")
            }
        }

        // get data for selected attributes from backend, merges values from different corpora
        // and flattens data structure?
        async function getData(): Promise<void> {
            const corpora = getSupportedCorpora()

            const opts: StructServiceOptions = {}
            opts.split = dataObj.defaultFilters.filter((name) => dataObj.attributes[name].settings.type === "set")

            type R = Record<string, RecursiveRecord<Record<string, number>>>
            const data = (await structService.getStructValues(corpora, dataObj.defaultFilters, opts)) as R

            currentData = {}
            for (let corpus of corpora) {
                const object = data[corpus.toUpperCase()]
                for (let k in object) {
                    const v = object[k]
                    if (!(k in currentData)) {
                        currentData[k] = v
                    } else {
                        currentData[k] = mergeObjects(currentData[k], v) as any
                    }
                }
            }
            updateData()
        }

        // when user selects an attribute, update all possible filter values and counts
        function updateData() {
            function collectAndSum(
                filters: string[],
                elements: RecursiveRecord<Record<string, number>>,
                parentSelected: boolean
            ): [number, boolean] {
                const filter = filters[0]
                const { possibleValues } = dataObj.filterValues[filter]
                const currentValues = dataObj.filterValues[filter].value
                let sum = 0
                const values: string[] = []
                let include = false
                for (let value in elements) {
                    var childCount: number
                    const child = elements[value]
                    const selected = currentValues.includes(value) || _.isEmpty(currentValues)

                    // filter of any parent values that do not support the child values
                    include = include || selected

                    if (typeof child == "number") {
                        childCount = child
                        include = true
                    } else {
                        ;[childCount, include] = collectAndSum(_.tail(filters), child, parentSelected && selected)
                    }

                    if (include && parentSelected) {
                        possibleValues.push([value, childCount])
                    } else {
                        possibleValues.push([value, 0])
                    }
                    if (selected && include) {
                        sum += childCount
                    }

                    values.push(value)
                }

                return [sum, include]
            }

            // reset all filters
            for (const filter of dataObj.defaultFilters) {
                dataObj.filterValues[filter].possibleValues = []
            }

            // recursively decide the counts of all values
            collectAndSum(dataObj.defaultFilters, currentData, true)

            // merge duplicate child values
            for (const filter of dataObj.defaultFilters) {
                const possibleValuesTmp: Record<string, number> = {}
                for (const [value, count] of dataObj.filterValues[filter].possibleValues) {
                    if (!(value in possibleValuesTmp)) {
                        possibleValuesTmp[value] = 0
                    }
                    possibleValuesTmp[value] += count
                }
                dataObj.filterValues[filter].possibleValues = []
                for (let k in possibleValuesTmp) {
                    const v = possibleValuesTmp[k]
                    dataObj.filterValues[filter].possibleValues.push([k, v])
                }

                dataObj.filterValues[filter].possibleValues.sort((a, b) => a[0].localeCompare(b[0], $rootScope.lang))
            }
        }

        /** Parse encoded url param value to local data. */
        function setFromLocation(globalFilter?: string) {
            if (!globalFilter) {
                return
            }
            if (!dataObj.filterValues) {
                return
            }
            const parsedFilter: StoredFilterValues = JSON.parse(atob(globalFilter))

            // Set values from param, if corresponding filter is available.
            for (const attrKey in parsedFilter) {
                const attrValues = parsedFilter[attrKey]
                if (dataObj.defaultFilters.includes(attrKey)) {
                    dataObj.filterValues[attrKey].value = attrValues
                }
            }

            // Set other available filters to empty.
            for (const attrKey in dataObj.filterValues) {
                if (!(attrKey in parsedFilter)) {
                    dataObj.filterValues[attrKey].value = []
                }
            }
        }

        /** Build a CQP token object of AND-combined conditions from active filters. */
        function makeCqp(): CqpQuery {
            const andArray: Condition[][] = []
            for (const attrKey in dataObj.filterValues) {
                const attrValues = dataObj.filterValues[attrKey]
                const attrType = dataObj.attributes[attrKey].settings.type
                andArray.push(
                    attrValues.value.map((attrValue) => ({
                        type: `_.${attrKey}`,
                        op: attrType === "set" ? "contains" : "=",
                        val: regescape(attrValue),
                    }))
                )
            }

            return [{ and_block: andArray }]
        }

        /** Set url param from local data, as base64-encoded json. */
        function updateLocation() {
            const rep: StoredFilterValues = {}
            for (const attrKey in dataObj.filterValues) {
                const attrValues = dataObj.filterValues[attrKey]
                if (!_.isEmpty(attrValues.value)) {
                    rep[attrKey] = attrValues.value
                }
            }
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
            if (settings.corpusListing.selected.length === 0) {
                dataObj.showDirective = false
            } else {
                const filterAttributes = settings.corpusListing.getDefaultFilters()

                // Disable the filters feature if none are applicable to all selected corpora.
                if (_.isEmpty(filterAttributes)) {
                    dataObj.showDirective = false
                    $location.search("global_filter", null)
                    $rootScope.globalFilter = null
                    // Unset any active filters.
                    for (let filter of dataObj.defaultFilters) {
                        dataObj.filterValues[filter].value = []
                    }
                } else {
                    dataObj.showDirective = true
                    dataObj.defaultFilters = Object.keys(filterAttributes)
                    dataObj.attributes = filterAttributes

                    initFilters()

                    setFromLocation($location.search().global_filter)
                    getData()
                    updateLocation()
                    notify()
                }
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
