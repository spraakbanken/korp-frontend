/** @format */

export const componentName = "autoc"
export const component = {
    template: `
    <div>
        <script type="text/ng-template" id="lemgramautocomplete.html">
            <a style="cursor:pointer">
                <span ng-class="{'autocomplete-item-disabled' : match.model.count == 0, 'none-to-find' : (match.model.variant != 'dalin' && match.model.count == 0)}">
                    <span ng-if="match.model.parts.namespace" class="label lemgram-namespace">{{match.model.parts.namespace | loc}}</span>
                    <span>{{match.model.parts.main}}</span>
                    <sup ng-if="match.model.parts.index != 1">{{match.model.parts.index}}</sup>
                    <span ng-if="match.model.parts.pos">({{match.model.parts.pos}})</span>
                    <span ng-if="match.model.desc" style="color:gray;margin-left:6px">{{match.model.desc.main}}</span>
                    <sup ng-if="match.model.desc && match.model.desc.index != 1" style="color:gray">{{match.model.desc.index}}</sup>
                    <span class="num-to-find" ng-if="match.model.count && match.model.count > 0">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{match.model.count}}
                    </span>
                </span>
            </a>
        </script>
        <div ng-show="!$ctrl.disableLemgramAutocomplete">
            <div style="float:left"><input
                autofocus
                type="text"
                ng-model="$ctrl.textInField"
                ng-change="$ctrl.textInput()"
                uib-typeahead="row for row in $ctrl.getRows($viewValue)"
                typeahead-wait-ms="500"
                typeahead-template-url="lemgramautocomplete.html"
                typeahead-loading="$ctrl.isLoading"
                typeahead-on-select="$ctrl.selectedItem($item, $model, $label)"
                placeholder="{{$ctrl.placeholderToString($ctrl.placeholder)}}"
                typeahead-click-open
                typeahead-is-open="$ctrl.typeaheadIsOpen"
                ng-blur="$ctrl.typeaheadClose()"></div>
            <div style="margin-left:-20px;margin-top:6px;float:left" ng-if="$ctrl.isLoading"><i class="fa-solid fa-spinner fa-pulse"></i></div>
        </div>
        <div ng-show="$ctrl.disableLemgramAutocomplete">
            <div style="float:left">
                <input autofocus type="text" ng-model="$ctrl.textInField" ng-change="$ctrl.textInput()">
            </div>
        </div>
        <span ng-if='$ctrl.isError' style='color: red; position: relative; top: 3px; margin-left: 6px'>{{$ctrl.errorMessage | loc:lang}}</span>
    </div>    
    `,
    bindings: {
        input: "<",
        isRawInput: "<",
        type: "@",
        variant: "@",
        disableLemgramAutocomplete: "<",
        errorMessage: "@",
        errorOnEmpty: "<",
        onChange: "&",
    },
    controller: [
        "$q",
        "lexicons",
        function ($q, lexicons) {
            const ctrl = this

            ctrl.isError = false

            ctrl.$onChanges = () => {
                if (ctrl.isRawInput) {
                    ctrl.textInField = ctrl.input
                } else {
                    ctrl.placeholder = ctrl.input
                }
            }

            ctrl.typeaheadClose = function () {
                if (ctrl.errorOnEmpty) {
                    ctrl.isError = !(ctrl.placeholder != null && _.isEmpty(ctrl.textInField))
                }
            }

            ctrl.lemgramify = function (lemgram) {
                const lemgramRegExp = /([^_.-]*--)?(.*)\.\.(\w+)\.(\d\d?)/
                const match = lemgram.match(lemgramRegExp)
                if (!match) {
                    return false
                }
                return {
                    main: match[2].replace(/_/g, " "),
                    pos: util.getLocaleString(match[3].slice(0, 2)),
                    index: match[4],
                    namespace: match[1] ? match[1].slice(0, -2) : "",
                }
            }

            ctrl.sensify = function (sense) {
                const senseParts = sense.split("..")
                return {
                    main: senseParts[0].replace(/_/g, " "),
                    index: senseParts[1],
                }
            }

            ctrl.placeholderToString = _.memoize(function (placeholder) {
                if (!placeholder) {
                    return
                }
                if (ctrl.type === "lemgram") {
                    return util.lemgramToPlainString(placeholder)
                } else {
                    return util.saldoToPlaceholderString(placeholder, true)
                }
            })

            ctrl.textInput = () => ctrl.onChange({ output: ctrl.textInField, isRawOutput: true })

            ctrl.selectedItem = function (item, selected) {
                if (ctrl.type === "lemgram") {
                    ctrl.placeholder = selected.lemgram
                } else {
                    ctrl.placeholder = selected.sense
                }
                ctrl.textInField = ""
                ctrl.onChange({ output: ctrl.placeholder, isRawOutput: false })
                ctrl.typeaheadClose()
            }

            ctrl.getMorphologies = function (corporaIDs) {
                const morphologies = []
                if (ctrl.variant === "dalin") {
                    morphologies.push("dalinm")
                } else {
                    for (let corporaID of corporaIDs) {
                        const morfs = settings.corpora[corporaID].morphology || ""
                        for (let morf of morfs.split("|")) {
                            if (morf !== "" && !morphologies.includes(morf)) {
                                morphologies.push(morf)
                            }
                        }
                    }
                    if (morphologies.length === 0) {
                        morphologies.push("saldom")
                    }
                }
                return morphologies
            }

            ctrl.getRows = function (input) {
                const corporaIDs = _.map(settings.corpusListing.selected, "id")
                const morphologies = ctrl.getMorphologies(corporaIDs)
                if (ctrl.type === "lemgram") {
                    return ctrl.getLemgrams(input, morphologies, corporaIDs)
                } else if (ctrl.type === "sense") {
                    return ctrl.getSenses(input, morphologies, corporaIDs)
                }
            }

            ctrl.getLemgrams = function (input, morphologies, corporaIDs) {
                const deferred = $q.defer()
                const http = lexicons.getLemgrams(input, morphologies, corporaIDs, ctrl.variant === "affix")
                http.then(function (data) {
                    data.forEach(function (item) {
                        if (ctrl.variant === "affix") {
                            item.count = -1
                        }
                        item.parts = ctrl.lemgramify(item.lemgram)
                        item.variant = ctrl.variant
                    })
                    data.sort((a, b) => b.count - a.count)
                    return deferred.resolve(data)
                })
                return deferred.promise
            }

            ctrl.getSenses = function (input, morphologies, corporaIDs) {
                const deferred = $q.defer()
                const http = lexicons.getSenses(input, morphologies.join("|"), corporaIDs)
                http.then(function (data) {
                    data.forEach(function (item) {
                        item.parts = ctrl.sensify(item.sense)
                        if (item.desc) {
                            item.desc = ctrl.sensify(item.desc)
                        }
                        item.variant = ctrl.variant
                    })
                    data.sort(function (a, b) {
                        if (a.parts.main === b.parts.main) {
                            return b.parts.index < a.parts.index
                        } else {
                            return a.sense.length - b.sense.length
                        }
                    })
                    return deferred.resolve(data)
                })
                return deferred.promise
            }
        },
    ],
}
