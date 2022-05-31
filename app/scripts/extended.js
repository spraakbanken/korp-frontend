/** @format */

let customExtendedTemplates = {}

try {
    customExtendedTemplates = require("custom/extended.js").default
} catch (error) {
    console.log("No module for extended components available")
}

const autocompleteTemplate = `\
<div>
    <input type="text"
            size="37"
            ng-model="input"
            escaper
            typeahead-min-length="0"
            typeahead-input-formatter="typeaheadInputFormatter($model)"            
            uib-typeahead="tuple[0] as tuple[1] for tuple in getRows($viewValue)"></input>
</div>`

const selectTemplate =
    "<select ng-show='!inputOnly' ng-model='input' escaper ng-options='tuple[0] as tuple[1] for tuple in dataset'></select>" +
    "<input ng-show='inputOnly' type='text' ng-model='input'/>"
const localize = ($scope) =>
    function (str) {
        return util.translateAttribute(null, $scope.translation, str)
    }

const selectController = (autocomplete) => [
    "$scope",
    "$rootScope",
    "structService",
    function ($scope, $rootScope, structService) {
        $rootScope.$on("corpuschooserchange", function (event, selected) {
            if (selected.length > 0) {
                reloadValues()
            }
        })

        function reloadValues() {
            // TODO this exploits the API
            const attributeDefinition = $scope.$parent.$ctrl.attributeDefinition
            if (!attributeDefinition) {
                return
            }

            const attribute = attributeDefinition.value
            const selectedCorpora = settings.corpusListing.selected

            // check which corpora support attributes
            const corpora = []
            for (let corpusSettings of selectedCorpora) {
                if (attribute in corpusSettings["struct_attributes"] || attribute in corpusSettings.attributes) {
                    corpora.push(corpusSettings.id)
                }
            }

            $scope.loading = true
            const opts = { count: false, returnByCorpora: false }
            if ($scope.type === "set") {
                opts.split = true
            }
            structService.getStructValues(corpora, [attribute], opts).then(
                function (data) {
                    $scope.loading = false
                    const localizer = localize($scope)

                    const dataset = _.map(_.uniq(data), function (item) {
                        if (item === "") {
                            return [item, util.getLocaleString("empty")]
                        }
                        return [item, localizer(item)]
                    })
                    $scope.dataset = _.sortBy(dataset, (tuple) => tuple[1])
                    if (!autocomplete) {
                        $scope.input = _.includes(data, $scope.input) ? $scope.input : $scope.dataset[0][0]
                    }
                },
                () => c.log("struct_values error")
            )
        }

        // Load values initially
        reloadValues()

        $scope.$watch("orObj.op", (newVal, oldVal) => {
            $scope.inputOnly = !["=", "!=", "contains", "not contains"].includes($scope.orObj.op)
            if (newVal !== oldVal) {
                if (!autocomplete) {
                    $scope.input = "" || $scope.dataset[0][0]
                }
            }
        })

        $scope.getRows = function (input) {
            if (input) {
                return _.filter($scope.dataset, (tuple) => tuple[0].toLowerCase().indexOf(input.toLowerCase()) !== -1)
            } else {
                return $scope.dataset
            }
        }

        $scope.typeaheadInputFormatter = (model) => localize($scope)(model)
    },
]

// Select-element. Use the following settings in the corpus:
// - dataset: an object or an array of values
// - escape: boolean, will be used by the escaper-directive
export default _.merge(
    {
        datasetSelect: {
            template: selectTemplate,
            controller: [
                "$scope",
                "$rootScope",
                function ($scope, $rootScope) {
                    let dataset
                    const original = $scope.dataset

                    $rootScope.$watch("lang", (newVal, oldVal) => {
                        if (newVal != oldVal) {
                            initialize()
                        }
                    })
                    function initialize() {
                        const localizer = localize($scope)
                        if (_.isArray(original)) {
                            dataset = _.map(original, (item) => [item, localizer(item)])
                        } else {
                            dataset = _.map(original, (v, k) => [k, localizer(v)])
                        }
                        $scope.dataset = _.sortBy(dataset, (tuple) => tuple[1])
                        $scope.model = $scope.model || $scope.dataset[0][0]
                    }
                    initialize()
                },
            ],
        },

        // Select-element. Gets values from "struct_values"-command. Use the following settings in the corpus:
        // - escape: boolean, will be used by the escaper-directive
        structServiceSelect: {
            template: selectTemplate,
            controller: selectController(false),
        },

        // Autocomplete. Gets values from "struct_values"-command. Use the following settings in the corpus:
        // - escape: boolean, will be used by the escaper-directive
        structServiceAutocomplete: {
            template: autocompleteTemplate,
            controller: selectController(true),
        },

        // puts the first values from a dataset paramater into model
        singleValue: {
            template: '<input type="hidden">',
            controller: ["$scope", ($scope) => ($scope.model = _.values($scope.dataset)[0])],
        },
        default: {
            template: _.template(`\
            <input ng-model='input' class='arg_value' escaper 
                    ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: "default blur"}'
            <%= maybe_placeholder %>>
            <span ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'
                    class='val_mod' popper> Aa </span>
            <ul class='mod_menu popper_menu dropdown-menu'>
                    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc:$root.lang}}</a></li>
                    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc:$root.lang}}</a></li>
            </ul>
        `),
            controller: [
                "$scope",
                function ($scope) {
                    if ($scope.orObj.flags && $scope.orObj.flags.c) {
                        $scope.case = "insensitive"
                    } else {
                        $scope.case = "sensitive"
                    }

                    $scope.makeSensitive = function () {
                        $scope.case = "sensitive"
                        if ($scope.orObj.flags) {
                            delete $scope.orObj.flags["c"]
                        }
                    }

                    $scope.makeInsensitive = function () {
                        const flags = $scope.orObj.flags || {}
                        flags["c"] = true
                        $scope.orObj.flags = flags

                        $scope.case = "insensitive"
                    }
                },
            ],
        },
        autocExtended: (options) => ({
            template: `
        <autoc 
            input="input"
            is-raw-input="isRawInput"
            type='${options.type || "lemgram"}'
            on-change="onChange(output, isRawOutput)"
            error-on-empty="${options["error_on_empty"]}"
            error-message="choose_value">
        </autoc>`,
            controller: [
                "$scope",
                function ($scope) {
                    if ($scope.model) {
                        $scope.input = unregescape($scope.model)
                        $scope.isRawInput = false
                    }

                    $scope.onChange = (output, isRawOutput) => {
                        if (!isRawOutput) {
                            $scope.model = regescape(output)
                        }
                    }
                },
            ],
        }),
        dateInterval: {
            template: `
            <div class="date_interval_arg_type">
                <h3>{{'simple' | loc:$root.lang}}</h3>
                <form ng-submit="commitDateInput()">
                    <div class="" style="margin-bottom: 1rem;">
                        <span class="" style="display : inline-block; width: 32px; text-transform: capitalize;">{{'from' | loc:$root.lang}}</span> <input type="text" ng-blur="commitDateInput()" ng-model="fromDateString" placeholder="'1945' {{'or' | loc:$root.lang}} '1945-08-06'"/>
                    </div>
                    <div>
                        <span class="" style="display : inline-block; width: 32px; text-transform: capitalize;">{{'to' | loc:$root.lang}}</span> <input type="text" ng-blur="commitDateInput()" ng-model="toDateString" placeholder="'1968' {{'or' | loc:$root.lang}} '1968-04-04'"/>
                    </div>
                    <button type="submit" class="hidden" />
                </form>
                <div class="section mt-4"> 
                    <h3>{{'advanced' | loc:$root.lang}}</h3>
                    <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top"> 
                        <i class="fa fa-calendar"></i> <span style="text-transform: capitalize;">{{'from' | loc:$root.lang}} </span>
                    </button> 
                    {{combined.format("YYYY-MM-DD HH:mm")}} 
                    <time-interval 
                        ng-click="from_click($event)" 
                        class="date_interval popper_menu dropdown-menu" 
                        date-model="from_date" 
                        time-model="from_time" 
                        model="combined" 
                        min-date="minDate" 
                        max-date="maxDate"></time-interval>
                </div>
                    
                <div class="section"> 
                    <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top"> 
                        <i class="fa fa-calendar"></i> <span style="text-transform: capitalize;">{{'to' | loc:$root.lang}} </span>
                    </button> 
                    {{combined2.format("YYYY-MM-DD HH:mm")}} 
                    
                    <time-interval 
                        ng-click="from_click($event)" 
                        class="date_interval popper_menu dropdown-menu" 
                        date-model="to_date" 
                        time-model="to_time" 
                        model="combined2" 
                        my="left top" 
                        at="right top"
                        min-date="minDate"
                        max-date="maxDate"></time-interval>
                </div>
            </div>`,
            controller: [
                "$scope",
                "searches",
                "$timeout",
                function ($scope, searches, $timeout) {
                    let s = $scope
                    let cl = settings.corpusListing

                    let updateIntervals = function () {
                        let moments = cl.getMomentInterval()
                        if (moments.length) {
                            let [fromYear, toYear] = _.invokeMap(moments, "toDate")
                            s.minDate = fromYear
                            s.maxDate = toYear
                        } else {
                            let [from, to] = cl.getTimeInterval()
                            s.minDate = moment(from.toString(), "YYYY").toDate()
                            s.maxDate = moment(to.toString(), "YYYY").toDate()
                        }
                    }
                    s.commitDateInput = () => {
                        if (s.fromDateString) {
                            let simpleFrom = s.fromDateString.length == 4
                            s.from_date = moment(s.fromDateString, simpleFrom ? "YYYY" : "YYYY-MM-DD").toDate()
                        }
                        if (s.toDateString) {
                            let simpleTo = s.toDateString.length == 4
                            if (simpleTo) {
                                var dateString = `${s.toDateString}-12-31`
                            }
                            s.to_date = moment(dateString || s.dateString).toDate()
                            s.to_time = moment("235959", "HHmmss").toDate()
                        }
                    }
                    s.$on("corpuschooserchange", function () {
                        updateIntervals()
                    })

                    updateIntervals()

                    s.from_click = function (event) {
                        event.originalEvent.preventDefault()
                        event.originalEvent.stopPropagation()
                    }

                    let getYear = function (val) {
                        return moment(val.toString(), "YYYYMMDD").toDate()
                    }

                    let getTime = function (val) {
                        return moment(val.toString(), "HHmmss").toDate()
                    }

                    if (!s.model) {
                        s.from_date = s.minDate
                        s.to_date = s.maxDate
                        let [from, to] = _.invokeMap(cl.getMomentInterval(), "toDate")
                        s.from_time = from
                        s.to_time = to
                    } else if (s.model.length === 4) {
                        let [fromYear, toYear] = _.map(s.model.slice(0, 3), getYear)
                        s.from_date = fromYear
                        s.to_date = toYear
                        let [fromTime, toTime] = _.map(s.model.slice(2), getTime)
                        s.from_time = fromTime
                        s.to_time = toTime
                    }
                    s.$watchGroup(["combined", "combined2"], function ([combined, combined2]) {
                        s.model = [
                            moment(s.from_date).format("YYYYMMDD"),
                            moment(s.to_date).format("YYYYMMDD"),
                            moment(s.from_time).format("HHmmss"),
                            moment(s.to_time).format("HHmmss"),
                        ]
                    })
                },
            ],
        },
    },
    customExtendedTemplates
)
