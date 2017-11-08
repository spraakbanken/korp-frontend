korpApp = angular.module "korpApp"

# Data service for the global filter in korp
# Directive is duplicated in simple and extended search
# so this directive holds all state concering the users input
# and what possible filters and values are available

# diretives calls registerScope to register for updates
# service calls scope.update() when changes occur
korpApp.factory "globalFilterService", ($rootScope, $location, $q, structService) ->

    scopes = []
    
    callDirectives = () ->
        listenerDef.promise.then () ->
            for scope in scopes
                scope.update(dataObj)

    # deferred for waiting for all directives to register
    listenerDef = $q.defer()

    dataObj =
        selectedFilters: []
        filterValues: {}
        defaultFilters: []
        optionalFilters: []
        attributes: {}
        mode: "simple"
        showDirective: false

    currentData = {}

    initFilters = () ->
        filterValues = dataObj.filterValues or {}
        
        # delete any filter values that are not in the selected filters
        for filter, v of filterValues
            if filter not in dataObj.selectedFilters
                delete filterValues[filter]

        # create object for every filter that is selected but not yet created
        for filter in dataObj.selectedFilters
            if filter not of filterValues
                newFilter = {}
                newFilter.value = []
                newFilter.possibleValues = []
                filterValues[filter] = newFilter
        
        dataObj.filterValues = filterValues

    # only send corpora that supports all selected filters (if filterSelection is "union")
    getSupportedCorpora = () ->
        corporaPerFilter = _.map dataObj.selectedFilters, (filter) -> dataObj.attributes[filter].corpora
        return _.intersection corporaPerFilter...

    mergeObjects = (values...) ->
        if _.all values, ((val) -> Array.isArray val)
            return _.union values...
        else if _.all values, ((val) -> (not (Array.isArray val)) and (typeof val is "object"))
            newObj = {}
            allKeys = _.union (_.map values, (val) -> _.keys val)...
            for k in allKeys
                allValsForKey = _.map values, (val) -> val[k]
                newValues = _.filter allValsForKey, (val) -> return (not _.isEmpty val) or (Number.isInteger val)
                newObj[k] = mergeObjects newValues...
            return newObj
        else if _.all values, ((val) -> Number.isInteger(val))
            return _.reduce values, ((a,b) -> return a + b), 0
        else
            c.error "Cannot merge objects a and b"


    # get data for selected attributes from backend, merges values from different corpora
    # and flattens data structure?
    getData = () ->
        corpora = getSupportedCorpora()
        structService.getStructValues(corpora, dataObj.selectedFilters, {}).then (data) ->
            currentData = {}
            for corpus in corpora
                for k, v of data[corpus.toUpperCase()]
                    if k not of currentData
                        currentData[k] = v
                    else
                        currentData[k] = mergeObjects(currentData[k], v)
            updateData()

    # when user selects an attribute, update all possible filter values and counts
    updateData = () ->

        collectAndSum = (filters, elements, parentSelected) ->
            filter = filters[0]
            children = []
            possibleValues = dataObj.filterValues[filter].possibleValues
            currentValues = dataObj.filterValues[filter].value
            sum = 0
            values = []
            include = false
            for value, child of elements
                if value is ""
                    value = "-"
                selected = (value in currentValues) or (_.isEmpty currentValues)
                
                # filter of any parent values that do not support the child values
                include = include or selected

                if Number.isInteger child
                    childCount = child
                    include = true
                else
                    [childCount, include] = collectAndSum _.tail(filters), child, parentSelected and selected

                if include and parentSelected
                    possibleValues.push [value, childCount]
                else
                    possibleValues.push [value, 0]
                if selected and include
                    sum += childCount

                values.push value

            return [sum, include]

        # reset all filters
        for filter in dataObj.selectedFilters
            dataObj.filterValues[filter].possibleValues = []

        # recursively decide the counts of all values
        collectAndSum dataObj.selectedFilters, currentData, true

        # merge duplicate child values
        for filter in dataObj.selectedFilters
            possibleValuesTmp = {}
            for [value, count] in dataObj.filterValues[filter].possibleValues
                if value not of possibleValuesTmp
                    possibleValuesTmp[value] = 0
                possibleValuesTmp[value] += count
            dataObj.filterValues[filter].possibleValues = []
            for k, v of possibleValuesTmp
                dataObj.filterValues[filter].possibleValues.push [k,v]

            dataObj.filterValues[filter].possibleValues.sort (a, b) ->
                if a[0] < b[0]
                    return -1
                else if a[0] > b[0]
                    return 1
                else
                    return 0

    addNewFilter = (filter, update) ->
        dataObj.selectedFilters.push filter
        initFilters()
        if update
            getData()

    setFromLocation = (globalFilter) ->
        unless globalFilter then return
        unless dataObj.filterValues then return
        parsedFilter = JSON.parse atob globalFilter
        for attrKey, attrValues of parsedFilter
            if attrKey not of dataObj.filterValues and attrKey in dataObj.optionalFilters
                addNewFilter attrKey, false
                dataObj.filterValues[attrKey] = {}

            if attrKey in dataObj.selectedFilters
                dataObj.filterValues[attrKey].value = attrValues

        for attrKey, _ of dataObj.filterValues
            if attrKey not of parsedFilter
                dataObj.filterValues[attrKey].value = []

    makeCqp = () ->
        exprs = []
        andArray = for attrKey, attrValues of dataObj.filterValues
            for attrValue in attrValues.value
                { type: "_." + attrKey, op: "=", val: attrValue }

        return [{ and_block: andArray }]

    updateLocation = () ->
        rep = {}
        for attrKey, attrValues of dataObj.filterValues
            if not _.isEmpty attrValues.value
                rep[attrKey] = attrValues.value
        if not _.isEmpty rep
            $location.search("global_filter", btoa JSON.stringify rep)
            $rootScope.globalFilter = makeCqp()
        else
            $location.search("global_filter", null)
            $rootScope.globalFilter = null

    $rootScope.$on "corpuschooserchange", () ->
        if settings.corpusListing.selected.length is 0
            dataObj.showDirective = false
        else
            [newDefaultFilters, defAttributes] = settings.corpusListing.getDefaultFilters()
            [newOptionalFilters, possAttributes] = settings.corpusListing.getCurrentFilters()

            if (_.isEmpty newDefaultFilters) and (_.isEmpty newOptionalFilters)
                dataObj.showDirective = false
            else
                dataObj.showDirective = true
                if not (_.isEqual newDefaultFilters, dataObj.defaultFilters) and (_.isEqual newOptionalFilters, dataObj.optionalFilters)
                    dataObj.defaultFilters = newDefaultFilters
                    dataObj.optionalFilters = newOptionalFilters
                    dataObj.attributes = _.extend {}, defAttributes, possAttributes

                    dataObj.selectedFilters = newDefaultFilters.slice()

                    initFilters()

                    setFromLocation $location.search().global_filter
                    getData()
                    updateLocation()
                    callDirectives()
        $rootScope.globalFilterDef.resolve()
        return
    
    $rootScope.$watch (() -> $location.search().global_filter), (filter) ->
        setFromLocation filter

    return {
        registerScope: (scope) ->
            scopes.push scope
            # TODO this will not work with parallel mode since only one directive is used :(
            if scopes.length is 2
                listenerDef.resolve()
        removeFilter: (filter) ->
            __.remove dataObj.selectedFilters, filter
            initFilters()
            getData()
            updateLocation()
        addNewFilter: addNewFilter
        valueChange: (filter) ->
            updateLocation()
            updateData()
    }

korpApp.factory "structService",  ($http, $q) ->

    getStructValues: (corpora, attributes, { count, returnByCorpora }) ->

        def = $q.defer()

        structValue = attributes.join ">"
        count ?= true
        returnByCorpora ?= true

        params =
            corpus: corpora.join ","
            struct: structValue
            count: count

        conf =
            url: settings.korpBackendURL + "/struct_values"
            params: params
            method: "GET"
            headers: {}

        _.extend conf.headers, model.getAuthorizationHeader()

        $http(conf).then ({ data }) ->
            if data.ERROR
                def.reject()
                return
            
            if returnByCorpora
                result = {}
                for corpora, values of data.corpora
                    result[corpora] = values[structValue]
                def.resolve result
            else
                result = []
                for corpora, values of data.corpora
                    result = result.concat values[structValue]
                def.resolve result

        return def.promise
