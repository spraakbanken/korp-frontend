/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const korpApp = angular.module("korpApp")

// Data service for the global filter in korp
// Directive is duplicated in simple and extended search
// so this directive holds all state concering the users input
// and what possible filters and values are available

// diretives calls registerScope to register for updates
// service calls scope.update() when changes occur
korpApp.factory("globalFilterService", function($rootScope, $location, $q, structService) {

    const scopes = []
    
    const callDirectives = () =>
        listenerDef.promise.then(() =>
            Array.from(scopes).map((scope) =>
                scope.update(dataObj))
        )
    

    // deferred for waiting for all directives to register
    var listenerDef = $q.defer()

    var dataObj = {
        selectedFilters: [],
        filterValues: {},
        defaultFilters: [],
        optionalFilters: [],
        attributes: {},
        mode: "simple",
        showDirective: false
    }

    let currentData = {}

    const initFilters = function() {
        let filter
        const filterValues = dataObj.filterValues || {}
        
        // delete any filter values that are not in the selected filters
        for (filter in filterValues) {
            const v = filterValues[filter]
            if (!Array.from(dataObj.selectedFilters).includes(filter)) {
                delete filterValues[filter]
            }
        }

        // create object for every filter that is selected but not yet created
        for (filter of Array.from(dataObj.selectedFilters)) {
            if (!(filter in filterValues)) {
                const newFilter = {}
                newFilter.value = []
                newFilter.possibleValues = []
                filterValues[filter] = newFilter
            }
        }
        
        return dataObj.filterValues = filterValues
    }

    // only send corpora that supports all selected filters (if filterSelection is "union")
    const getSupportedCorpora = function() {
        const corporaPerFilter = _.map(dataObj.selectedFilters, filter => dataObj.attributes[filter].corpora)
        return _.intersection(...Array.from(corporaPerFilter || []))
    }

    var mergeObjects = function(...values) {
        if (_.every(values, val => Array.isArray(val))) {
            return _.union(...Array.from(values || []))
        } else if (_.every(values, val => (!(Array.isArray(val))) && (typeof val === "object"))) {
            const newObj = {}
            const allKeys = _.union(...Array.from((_.map(values, val => _.keys(val))) || []))
            for (var k of Array.from(allKeys)) {
                const allValsForKey = _.map(values, val => val[k])
                const newValues = _.filter(allValsForKey, val => (!_.isEmpty(val)) || (Number.isInteger(val)))
                newObj[k] = mergeObjects(...Array.from(newValues || []))
            }
            return newObj
        } else if (_.every(values, val => Number.isInteger(val))) {
            return _.reduce(values, (a,b) => a + b, 0)
        } else {
            return c.error("Cannot merge objects a and b")
        }
    }


    // get data for selected attributes from backend, merges values from different corpora
    // and flattens data structure?
    const getData = function() {
        const corpora = getSupportedCorpora()

        const opts = {}
        if (dataObj.attributes[_.last(dataObj.defaultFilters)].settings.type === "set") {
            opts.split = true
        }
        return structService.getStructValues(corpora, dataObj.selectedFilters, opts).then(function(data) {
            currentData = {}
            for (let corpus of Array.from(corpora)) {
                const object = data[corpus.toUpperCase()]
                for (let k in object) {
                    const v = object[k]
                    if (!(k in currentData)) {
                        currentData[k] = v
                    } else {
                        currentData[k] = mergeObjects(currentData[k], v)
                    }
                }
            }
            return updateData()
        })
    }

    // when user selects an attribute, update all possible filter values and counts
    var updateData = function() {

        let filter
        var collectAndSum = function(filters, elements, parentSelected) {
            const filter = filters[0]
            const children = []
            const { possibleValues } = dataObj.filterValues[filter]
            const currentValues = dataObj.filterValues[filter].value
            let sum = 0
            const values = []
            let include = false
            for (let value in elements) {
                var childCount
                const child = elements[value]
                if (value === "") {
                    value = "-"
                }
                const selected = (Array.from(currentValues).includes(value)) || (_.isEmpty(currentValues))
                
                // filter of any parent values that do not support the child values
                include = include || selected

                if (Number.isInteger(child)) {
                    childCount = child
                    include = true
                } else {
                    [childCount, include] = Array.from(collectAndSum(_.tail(filters), child, parentSelected && selected))
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
        for (filter of Array.from(dataObj.selectedFilters)) {
            dataObj.filterValues[filter].possibleValues = []
        }

        // recursively decide the counts of all values
        collectAndSum(dataObj.selectedFilters, currentData, true)

        // merge duplicate child values
        return (() => {
            const result = []
            for (filter of Array.from(dataObj.selectedFilters)) {
                const possibleValuesTmp = {}
                for (let [value, count] of Array.from(dataObj.filterValues[filter].possibleValues)) {
                    if (!(value in possibleValuesTmp)) {
                        possibleValuesTmp[value] = 0
                    }
                    possibleValuesTmp[value] += count
                }
                dataObj.filterValues[filter].possibleValues = []
                for (let k in possibleValuesTmp) {
                    const v = possibleValuesTmp[k]
                    dataObj.filterValues[filter].possibleValues.push([k,v])
                }

                result.push(dataObj.filterValues[filter].possibleValues.sort(function(a, b) {
                    if (a[0] < b[0]) {
                        return -1
                    } else if (a[0] > b[0]) {
                        return 1
                    } else {
                        return 0
                    }
                }))
            }
            return result
        })()
    }

    const addNewFilter = function(filter, update) {
        dataObj.selectedFilters.push(filter)
        initFilters()
        if (update) {
            return getData()
        }
    }

    const setFromLocation = function(globalFilter) {
        let attrKey
        if (!globalFilter) { return }
        if (!dataObj.filterValues) { return }
        const parsedFilter = JSON.parse(atob(globalFilter))
        for (attrKey in parsedFilter) {
            const attrValues = parsedFilter[attrKey]
            if (!(attrKey in dataObj.filterValues) && Array.from(dataObj.optionalFilters).includes(attrKey)) {
                addNewFilter(attrKey, false)
                dataObj.filterValues[attrKey] = {}
            }

            if (Array.from(dataObj.selectedFilters).includes(attrKey)) {
                dataObj.filterValues[attrKey].value = attrValues
            }
        }

        return (() => {
            const result = []
            for (attrKey in dataObj.filterValues) {
                const _ = dataObj.filterValues[attrKey]
                if (!(attrKey in parsedFilter)) {
                    result.push(dataObj.filterValues[attrKey].value = [])
                } else {
                    result.push(undefined)
                }
            }
            return result
        })()
    }

    const makeCqp = function() {
        const exprs = []
        const andArray = (() => {
            const result = []
            for (var attrKey in dataObj.filterValues) {
                const attrValues = dataObj.filterValues[attrKey]
                const attrType = dataObj.attributes[attrKey].settings.type
                var op = attrType === "set" ? "contains" : "="
                result.push(Array.from(attrValues.value).map((attrValue) => (
                    { type: `_.${attrKey}`, op, val: attrValue })))
            }
            return result
        })()

        return [{ and_block: andArray }]
    }

    const updateLocation = function() {
        const rep = {}
        for (let attrKey in dataObj.filterValues) {
            const attrValues = dataObj.filterValues[attrKey]
            if (!_.isEmpty(attrValues.value)) {
                rep[attrKey] = attrValues.value
            }
        }
        if (!_.isEmpty(rep)) {
            $location.search("global_filter", btoa(JSON.stringify(rep)))
            return $rootScope.globalFilter = makeCqp()
        } else {
            $location.search("global_filter", null)
            return $rootScope.globalFilter = null
        }
    }

    $rootScope.$on("corpuschooserchange", function() {
        if (settings.corpusListing.selected.length === 0) {
            dataObj.showDirective = false
        } else {
            const [newDefaultFilters, defAttributes] = Array.from(settings.corpusListing.getDefaultFilters())
            const [newOptionalFilters, possAttributes] = Array.from(settings.corpusListing.getCurrentFilters())

            if ((_.isEmpty(newDefaultFilters)) && (_.isEmpty(newOptionalFilters))) {
                dataObj.showDirective = false
                $location.search("global_filter", null)            
                for (let filter of Array.from(dataObj.selectedFilters)) {
                    dataObj.filterValues[filter].value = []
                }
                
            } else {
                dataObj.showDirective = true
                if (!(_.isEqual(newDefaultFilters, dataObj.defaultFilters)) && (_.isEqual(newOptionalFilters, dataObj.optionalFilters))) {
                    dataObj.defaultFilters = newDefaultFilters
                    dataObj.optionalFilters = newOptionalFilters
                    dataObj.attributes = _.extend({}, defAttributes, possAttributes)

                    dataObj.selectedFilters = newDefaultFilters.slice()

                    initFilters()

                    setFromLocation($location.search().global_filter)
                    getData()
                    updateLocation()
                    callDirectives()
                }
            }
        }
        $rootScope.globalFilterDef.resolve()
    })
    
    $rootScope.$watch(() => $location.search().global_filter, filter => setFromLocation(filter))

    return {
        registerScope(scope) {
            scopes.push(scope)
            // TODO this will not work with parallel mode since only one directive is used :(
            if (scopes.length === 2) {
                return listenerDef.resolve()
            }
        },
        removeFilter(filter) {
            __.remove(dataObj.selectedFilters, filter)
            initFilters()
            getData()
            return updateLocation()
        },
        addNewFilter,
        valueChange(filter) {
            updateLocation()
            return updateData()
        }
    }
})

korpApp.factory("structService",  ($http, $q) =>

    ({
        getStructValues(corpora, attributes, { count, returnByCorpora, split }) {

            const def = $q.defer()

            const structValue = attributes.join(">")
            if (count == null) { count = true }
            if (returnByCorpora == null) { returnByCorpora = true }

            const params = {
                corpus: corpora.join(","),
                struct: structValue,
                count
            }

            if (split) {
                params.split = (_.last(attributes))
            }

            const conf = {
                url: settings.korpBackendURL + "/struct_values",
                params,
                method: "GET",
                headers: {}
            }

            _.extend(conf.headers, model.getAuthorizationHeader())

            $http(conf).then(function({ data }) {
                let result, values
                if (data.ERROR) {
                    def.reject()
                    return
                }
            
                if (returnByCorpora) {
                    result = {}
                    for (corpora in data.corpora) {
                        values = data.corpora[corpora]
                        result[corpora] = values[structValue]
                    }
                    return def.resolve(result)
                } else {
                    result = []
                    for (corpora in data.corpora) {
                        values = data.corpora[corpora]
                        result = result.concat(values[structValue])
                    }
                    return def.resolve(result)
                }
            })

            return def.promise
        }
    })
)
