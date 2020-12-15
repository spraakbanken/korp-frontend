/** @format */
const korpApp = angular.module("korpApp")

// Data service for the global filter in korp
// Directive is duplicated in simple and extended search
// so this directive holds all state concering the users input
// and what possible filters and values are available

// diretives calls registerScope to register for updates
// service calls scope.update() when changes occur
korpApp.factory("globalFilterService", function ($rootScope, $location, $q, structService) {
    const scopes = []

    const callDirectives = () =>
        listenerDef.promise.then(() => scopes.map((scope) => scope.update(dataObj)))

    // deferred for waiting for all directives to register
    var listenerDef = $q.defer()

    var dataObj = {
        selectedFilters: [],
        filterValues: {},
        defaultFilters: [],
        optionalFilters: [],
        attributes: {},
        mode: "simple",
        showDirective: false,
    }

    let currentData = {}

    const initFilters = function () {
        let filter
        const filterValues = dataObj.filterValues || {}

        // delete any filter values that are not in the selected filters
        for (filter in filterValues) {
            const v = filterValues[filter]
            if (!dataObj.selectedFilters.includes(filter)) {
                delete filterValues[filter]
            }
        }

        // create object for every filter that is selected but not yet created
        for (filter of dataObj.selectedFilters) {
            if (!(filter in filterValues)) {
                const newFilter = {}
                newFilter.value = []
                newFilter.possibleValues = []
                filterValues[filter] = newFilter
            }
        }

        dataObj.filterValues = filterValues
    }

    // only send corpora that supports all selected filters (if filterSelection is "union")
    const getSupportedCorpora = function () {
        const corporaPerFilter = _.map(
            dataObj.selectedFilters,
            (filter) => dataObj.attributes[filter].corpora
        )
        return _.intersection(...(corporaPerFilter || []))
    }

    var mergeObjects = function (...values) {
        if (_.every(values, (val) => Array.isArray(val))) {
            return _.union(...(values || []))
        } else if (_.every(values, (val) => !Array.isArray(val) && typeof val === "object")) {
            const newObj = {}
            const allKeys = _.union(...(_.map(values, (val) => _.keys(val)) || []))
            for (let k of allKeys) {
                const allValsForKey = _.map(values, (val) => val[k])
                const newValues = _.filter(
                    allValsForKey,
                    (val) => !_.isEmpty(val) || Number.isInteger(val)
                )
                newObj[k] = mergeObjects(...(newValues || []))
            }
            return newObj
        } else if (_.every(values, (val) => Number.isInteger(val))) {
            return _.reduce(values, (a, b) => a + b, 0)
        } else {
            c.error("Cannot merge objects a and b")
        }
    }

    // get data for selected attributes from backend, merges values from different corpora
    // and flattens data structure?
    const getData = function () {
        const corpora = getSupportedCorpora()

        const opts = {}
        if (dataObj.attributes[_.last(dataObj.defaultFilters)].settings.type === "set") {
            opts.split = true
        }
        return structService
            .getStructValues(corpora, dataObj.selectedFilters, opts)
            .then(function (data) {
                currentData = {}
                for (let corpus of corpora) {
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
                updateData()
            })
    }

    // when user selects an attribute, update all possible filter values and counts
    var updateData = function () {
        let filter
        var collectAndSum = function (filters, elements, parentSelected) {
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
                const selected = currentValues.includes(value) || _.isEmpty(currentValues)

                // filter of any parent values that do not support the child values
                include = include || selected

                if (Number.isInteger(child)) {
                    childCount = child
                    include = true
                } else {
                    ;[childCount, include] = collectAndSum(
                        _.tail(filters),
                        child,
                        parentSelected && selected
                    )
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
        for (filter of dataObj.selectedFilters) {
            dataObj.filterValues[filter].possibleValues = []
        }

        // recursively decide the counts of all values
        collectAndSum(dataObj.selectedFilters, currentData, true)

        // merge duplicate child values
        for (filter of dataObj.selectedFilters) {
            const possibleValuesTmp = {}
            for (let [value, count] of dataObj.filterValues[filter].possibleValues) {
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

            dataObj.filterValues[filter].possibleValues.sort(function (a, b) {
                if (a[0] < b[0]) {
                    return -1
                } else if (a[0] > b[0]) {
                    return 1
                } else {
                    return 0
                }
            })
        }
    }

    const addNewFilter = function (filter, update) {
        dataObj.selectedFilters.push(filter)
        initFilters()
        if (update) {
            return getData()
        }
    }

    const setFromLocation = function (globalFilter) {
        let attrKey
        if (!globalFilter) {
            return
        }
        if (!dataObj.filterValues) {
            return
        }
        const parsedFilter = JSON.parse(atob(globalFilter))
        for (attrKey in parsedFilter) {
            const attrValues = parsedFilter[attrKey]
            if (!(attrKey in dataObj.filterValues) && dataObj.optionalFilters.includes(attrKey)) {
                addNewFilter(attrKey, false)
                dataObj.filterValues[attrKey] = {}
            }

            if (dataObj.selectedFilters.includes(attrKey)) {
                dataObj.filterValues[attrKey].value = attrValues
            }
        }

        for (attrKey in dataObj.filterValues) {
            if (!(attrKey in parsedFilter)) {
                dataObj.filterValues[attrKey].value = []
            }
        }
    }

    const makeCqp = function () {
        const exprs = []
        const andArray = []
        for (var attrKey in dataObj.filterValues) {
            const attrValues = dataObj.filterValues[attrKey]
            const attrType = dataObj.attributes[attrKey].settings.type
            var op = attrType === "set" ? "contains" : "="
            andArray.push(
                attrValues.value.map((attrValue) => ({
                    type: `_.${attrKey}`,
                    op,
                    val: regescape(attrValue),
                }))
            )
        }

        return [{ and_block: andArray }]
    }

    const updateLocation = function () {
        const rep = {}
        for (let attrKey in dataObj.filterValues) {
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

    $rootScope.$on("corpuschooserchange", function () {
        if (settings.corpusListing.selected.length === 0) {
            dataObj.showDirective = false
        } else {
            const [newDefaultFilters, defAttributes] = settings.corpusListing.getDefaultFilters()
            const [newOptionalFilters, possAttributes] = settings.corpusListing.getCurrentFilters()

            if (_.isEmpty(newDefaultFilters) && _.isEmpty(newOptionalFilters)) {
                dataObj.showDirective = false
                $location.search("global_filter", null)
                for (let filter of dataObj.selectedFilters) {
                    dataObj.filterValues[filter].value = []
                }
            } else {
                dataObj.showDirective = true
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
        $rootScope.globalFilterDef.resolve()
    })

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
        removeFilter(filter) {
            _.remove(dataObj.selectedFilters, filter)
            initFilters()
            getData()
            updateLocation()
        },
        addNewFilter,
        valueChange(filter) {
            updateLocation()
            updateData()
        },
    }
})

korpApp.factory("structService", ($http, $q) => ({
    getStructValues(corpora, attributes, { count, returnByCorpora, split }) {
        const def = $q.defer()

        const structValue = attributes.join(">")
        if (count == null) {
            count = true
        }
        if (returnByCorpora == null) {
            returnByCorpora = true
        }

        const params = {
            corpus: corpora.join(","),
            struct: structValue,
            count,
        }

        if (split) {
            params.split = _.last(attributes)
        }

        const conf = {
            url: settings.korpBackendURL + "/struct_values",
            params,
            method: "GET",
            headers: {},
        }

        _.extend(conf.headers, model.getAuthorizationHeader())

        $http(conf).then(function ({ data }) {
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
                def.resolve(result)
            } else {
                result = []
                for (corpora in data.corpora) {
                    values = data.corpora[corpora]
                    result = result.concat(values[structValue])
                }
                def.resolve(result)
            }
        })

        return def.promise
    },
}))
