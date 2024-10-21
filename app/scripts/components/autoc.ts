/** @format */
import _ from "lodash"
import angular, { IController, IPromise, IQService } from "angular"
import settings from "@/settings"
import { html, lemgramToString, saldoToString } from "@/util"
import { loc } from "@/i18n"
import { LemgramCount, LexiconsService } from "@/backend/lexicons"
import "@/directives/typeahead-click-open"

type AutocController = IController & {
    input: string
    isRawInput: boolean
    type: "lemgram" | "sense"
    variant: string
    disableLemgramAutocomplete: boolean
    errorMessage: string
    errorOnEmpty: boolean
    onChange: (change: { output?: string; isRawOutput: boolean }) => void
    isError: boolean
    textInField: string
    placeholder: string
    typeaheadClose: () => void
    lemgramify: (lemgram: string) => Lemgram | undefined
    sensify: (saldo: string) => Saldo
    placeholderToString: (placeholder: string) => string | undefined
    textInput: () => void
    selectedItem: (item: unknown, selected: LemgramOut | Sense) => void
    getMorphologies: (corpora: string[]) => string[]
    getRows: (input: string) => IPromise<LemgramOut[]> | IPromise<Sense[]> | undefined
    getLemgrams: (input: string, morphologies: string[], corpora: string[]) => IPromise<LemgramOut[]>
    getSenses: (input: string) => IPromise<Sense[]>
}

type Lemgram = { main: string; index: string; pos: string; namespace?: string }
type LemgramOut = LemgramCount & { parts: Lemgram | undefined; variant: string }
type Saldo = { main: string; index: string }
type Sense = { sense: string; parts: Saldo; desc?: Saldo; variant: string }

angular.module("korpApp").component("autoc", {
    template: html`
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
                <div style="float:left">
                    <input
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
                        ng-blur="$ctrl.typeaheadClose()"
                    />
                </div>
                <div style="margin-left:-20px;margin-top:6px;float:left" ng-if="$ctrl.isLoading">
                    <i class="fa-solid fa-spinner fa-pulse"></i>
                </div>
            </div>
            <div ng-show="$ctrl.disableLemgramAutocomplete">
                <div style="float:left">
                    <input autofocus type="text" ng-model="$ctrl.textInField" ng-change="$ctrl.textInput()" />
                </div>
            </div>
            <span ng-if="$ctrl.isError" style="color: red; position: relative; top: 3px; margin-left: 6px"
                >{{$ctrl.errorMessage | loc:$root.lang}}</span
            >
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
        function ($q: IQService, lexicons: LexiconsService) {
            const ctrl = this as AutocController

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

            // TODO Check compatibility and merge with splitLemgram in @/util
            ctrl.lemgramify = function (lemgram: string) {
                const lemgramRegExp = /([^_.-]*--)?(.*)\.\.(\w+)\.(\d\d?)/
                const match = lemgram.match(lemgramRegExp)
                if (!match) {
                    return
                }
                return {
                    main: match[2].replace(/_/g, " "),
                    pos: loc(match[3].slice(0, 2)),
                    index: match[4],
                    namespace: match[1] ? match[1].slice(0, -2) : "",
                }
            }

            // TODO Check compatibility and use saldoRegexp in @/util
            ctrl.sensify = function (sense: string) {
                const senseParts = sense.split("..")
                return {
                    main: senseParts[0].replace(/_/g, " "),
                    index: senseParts[1],
                }
            }

            ctrl.placeholderToString = _.memoize(function (placeholder: string) {
                if (!placeholder) {
                    return
                }
                if (ctrl.type === "lemgram") {
                    return lemgramToString(placeholder)
                } else {
                    return saldoToString(placeholder)
                }
            })

            ctrl.textInput = () => ctrl.onChange({ output: ctrl.textInField, isRawOutput: true })

            ctrl.selectedItem = function (item, selected) {
                if (ctrl.type === "lemgram") {
                    ctrl.placeholder = (selected as LemgramOut).lemgram
                } else {
                    ctrl.placeholder = (selected as Sense).sense
                }
                ctrl.textInField = ""
                ctrl.onChange({ output: ctrl.placeholder, isRawOutput: false })
                ctrl.typeaheadClose()
            }

            ctrl.getMorphologies = function (corpora: string[]) {
                const morphologies: string[] = []
                if (ctrl.variant === "dalin") {
                    morphologies.push("dalinm")
                } else {
                    for (let id of corpora) {
                        const morfs = settings.corpora[id].morphology || ""
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

            ctrl.getRows = function (input: string) {
                const corporaIDs = _.map(settings.corpusListing.selected, "id")
                const morphologies = ctrl.getMorphologies(corporaIDs)
                if (ctrl.type === "lemgram") {
                    return ctrl.getLemgrams(input, morphologies, corporaIDs)
                } else if (ctrl.type === "sense") {
                    return ctrl.getSenses(input)
                }
            }

            ctrl.getLemgrams = function (input: string, morphologies: string[], corpora: string[]) {
                const deferred = $q.defer<LemgramOut[]>()
                const http = lexicons.getLemgrams(input, morphologies, corpora)
                http.then(function (data) {
                    const output: LemgramOut[] = data.map((item) => {
                        if (ctrl.variant === "affix") item.count = -1
                        return {
                            ...item,
                            parts: ctrl.lemgramify(item.lemgram),
                            variant: ctrl.variant,
                        }
                    })
                    output.sort((a, b) => b.count - a.count)
                    return deferred.resolve(output)
                })
                return deferred.promise
            }

            ctrl.getSenses = function (input: string) {
                const deferred = $q.defer<Sense[]>()
                const http = lexicons.getSenses(input)
                http.then(function (data) {
                    const output: Sense[] = data.map((item) => {
                        const out = {
                            sense: item.sense,
                            parts: ctrl.sensify(item.sense),
                            desc: item.desc ? ctrl.sensify(item.desc) : undefined,
                            variant: ctrl.variant,
                        }
                        return out
                    })
                    output.sort(function (a, b) {
                        if (a.parts.main === b.parts.main) {
                            return b.parts.index.localeCompare(a.parts.index)
                        } else {
                            return a.sense.length - b.sense.length
                        }
                    })
                    return deferred.resolve(output)
                })
                return deferred.promise
            }
        },
    ],
})
