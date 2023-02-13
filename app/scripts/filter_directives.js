/** @format */
korpApp.directive("globalFilters", [
    "globalFilterService",
    (globalFilterService) => ({
        restrict: "E",
        scope: {
            lang: "=",
        },
        template: `\
<div ng-if="dataObj.showDirective" class="mb-4">
      <span class="font-bold"> {{ 'global_filter' | loc:lang}}:</span>
      <div class="inline-block">
          <span ng-repeat="filterKey in dataObj.defaultFilters">
              <global-filter attr="filterKey"
                             attr-def="dataObj.attributes[filterKey]"
                             attr-value="dataObj.filterValues[filterKey].value",
                             possible-values="dataObj.filterValues[filterKey].possibleValues"
                             lang="lang"></global-filter>
              <span ng-if="!$last">{{"and" | loc:lang}}</span>
           </span>
       </div>
</div>`,
        link(scope) {
            globalFilterService.registerScope(scope)

            scope.dataObj = { showDirective: false }

            scope.update = (dataObj) => (scope.dataObj = dataObj)
        },
    }),
])

korpApp.directive("globalFilter", [
    "globalFilterService",
    (globalFilterService) => ({
        restrict: "E",
        scope: {
            attr: "=",
            attrDef: "=",
            attrValue: "=",
            possibleValues: "=",
            lang: "=",
        },
        template: `
    <span uib-dropdown auto-close="outsideClick" on-toggle="dropdownToggle(open)">
      <button uib-dropdown-toggle class="btn btn-sm btn-default mr-1 align-baseline">
        <span ng-if="attrValue.length == 0">
          <span>{{ "add_filter_value" | loc:lang }}</span>
          <span>{{filterLabel | locObj:lang}}</span>
        </span>
        <span ng-if="attrValue.length != 0">
          <span style="text-transform: capitalize">{{filterLabel | locObj:lang}}:</span>
          <span ng-repeat="selected in attrValue">{{translateAttribute(selected) | replaceEmpty }} </span>
        </span>
      </button>
      <div uib-dropdown-menu class="korp-uib-dropdown-menu p-0 mt-3 ml-2">
        <ul class="p-0 m-0">
          <li ng-repeat="value in possibleValues" ng-class="{'bg-blue-100': isSelected(value[0])}" class="attribute p-1"
              ng-click="toggleSelected(value[0], $event)"
              ng-if="isSelectedList(value[0])">
            <span ng-if="isSelected(value[0])">✔</span>
            <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
            <span class="text-xs">{{value[1]}}</span>
          </li>
          <li ng-repeat="value in possibleValues" ng-class="{'bg-blue-100': isSelected(value[0])}" class="attribute p-1"
              ng-click="toggleSelected(value[0], $event)"
              ng-if="!isSelectedList(value[0]) && value[1] > 0">
            <span ng-if="isSelected(value[0])">✔</span>
            <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
            <span class="text-xs">{{value[1]}}</span>
          </li>
          <li ng-repeat="value in possibleValues" class="attribute disabled opacity-50 p-1"
              ng-if="!isSelectedList(value[0]) && value[1] == 0"
              >
            <span>{{translateAttribute(value[0]) | replaceEmpty }}</span>
            <span class="text-xs">{{value[1]}}</span>
          </li>
        </ul>
      </div>
</span>`,

        link(scope, element, attribute) {
            // if scope.possibleValues.length > 20
            //     # TODO enable autocomplete

            scope.filterLabel = scope.attrDef.settings.label
            scope.selected = _.clone(scope.attrValue)
            scope.dropdownToggle = function (open) {
                if (!open) {
                    scope.selected = []
                    return scope.attrValue.map((value) => scope.selected.push(value))
                }
            }

            scope.toggleSelected = function (value, event) {
                if (scope.isSelected(value)) {
                    _.pull(scope.attrValue, value)
                } else {
                    scope.attrValue.push(value)
                }
                event.stopPropagation()
                globalFilterService.valueChange(scope.attr)
            }

            scope.isSelected = (value) => scope.attrValue.includes(value)

            scope.isSelectedList = (value) => scope.selected.includes(value)

            scope.translateAttribute = (value) => {
                return util.translateAttribute(scope.lang, scope.attrDef.settings.translation, value)
            }
        },
    }),
])

// Data service for the global filter in korp
// Directive is duplicated in simple and extended search
// so this directive holds all state concering the users input
// and what possible filters and values are available

// diretives calls registerScope to register for updates
// service calls scope.update() when changes occur
korpApp.factory("globalFilterService", [
    "$rootScope",
    "$location",
    "$q",
    "structService",
    function ($rootScope, $location, $q, structService) {
        const scopes = []

        const callDirectives = () => listenerDef.promise.then(() => scopes.map((scope) => scope.update(dataObj)))

        // deferred for waiting for all directives to register
        var listenerDef = $q.defer()

        var dataObj = {
            filterValues: {},
            defaultFilters: [],
            attributes: {},
            showDirective: false,
        }

        let currentData = {}

        const initFilters = function () {
            let filter
            const filterValues = dataObj.filterValues || {}

            // delete any filter values that are not in the selected filters
            for (filter in filterValues) {
                const v = filterValues[filter]
                if (!dataObj.defaultFilters.includes(filter)) {
                    delete filterValues[filter]
                }
            }

            // create object for every filter that is selected but not yet created
            for (filter of dataObj.defaultFilters) {
                if (!(filter in filterValues)) {
                    const newFilter = {}
                    newFilter.value = []
                    newFilter.possibleValues = []
                    filterValues[filter] = newFilter
                }
            }

            dataObj.filterValues = filterValues
        }

        const getSupportedCorpora = function () {
            const corporaPerFilter = _.map(dataObj.defaultFilters, (filter) => dataObj.attributes[filter].corpora)
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
                    const newValues = _.filter(allValsForKey, (val) => !_.isEmpty(val) || Number.isInteger(val))
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
            return structService.getStructValues(corpora, dataObj.defaultFilters, opts).then(function (data) {
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
            for (filter of dataObj.defaultFilters) {
                dataObj.filterValues[filter].possibleValues = []
            }

            // recursively decide the counts of all values
            collectAndSum(dataObj.defaultFilters, currentData, true)

            // merge duplicate child values
            for (filter of dataObj.defaultFilters) {
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
                if (dataObj.defaultFilters.includes(attrKey)) {
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
                const filterAttributes = settings.corpusListing.getDefaultFilters()

                if (_.isEmpty(filterAttributes)) {
                    dataObj.showDirective = false
                    $location.search("global_filter", null)
                    $rootScope.globalFilter = null
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
            valueChange() {
                updateLocation()
                updateData()
            },
        }
    },
])
