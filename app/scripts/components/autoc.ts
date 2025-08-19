/** @format */
import _ from "lodash"
import angular, { IController, IPromise } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { getLemgrams, getSenses, LemgramCount } from "@/backend/lexicons"
import "@/directives/typeahead-click-open"
import { Lemgram } from "@/lemgram"
import { Saldo } from "@/saldo"

type AutocController = IController & {
    dir?: string
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
    sensify: (saldo: string) => Saldo | undefined
    placeholderToString: (placeholder: string) => string | undefined
    textInput: () => void
    selectedItem: (item: unknown, selected: LemgramOut | Sense) => void
    getRows: (input: string) => IPromise<LemgramOut[]> | IPromise<Sense[]> | undefined
    getLemgrams: (input: string) => IPromise<LemgramOut[]>
    getSenses: (input: string) => IPromise<Sense[]>
}

type LemgramOut = LemgramCount & { parts: Lemgram; variant: string }
type Sense = { sense: string; parts: Saldo; desc?: Saldo; variant: string }

angular.module("korpApp").component("autoc", {
    template: html`
        <div>
            <script type="text/ng-template" id="lemgramautocomplete.html">
                <a class="!flex items-baseline cursor-pointer" ng-class="{'autocomplete-item-disabled' : match.model.count == 0, '!text-gray-500' : (match.model.variant != 'dalin' && match.model.count == 0)}">
                    <span>
                        <span ng-if="match.model.parts.morphology" class="label lemgram-namespace">{{match.model.parts.morphology | loc}}</span>
                        <span>{{match.model.parts.form}}</span>
                        <sup ng-if="match.model.parts.index != 1">{{match.model.parts.index}}</sup>
                        <span ng-if="match.model.parts.pos">({{match.model.parts.pos}})</span>
                        <span ng-if="match.model.desc" style="color:gray;margin-left:6px">{{match.model.desc.form}}</span>
                        <sup ng-if="match.model.desc && match.model.desc.index != 1" style="color:gray">{{match.model.desc.index}}</sup>
                    </span>
                    <span ng-if="match.model.count > 0" class="ml-auto pl-1 text-sm">
                        {{match.model.count | prettyNumber:$root.lang}}
                    </span>
                </a>
            </script>
            <div ng-show="!$ctrl.disableLemgramAutocomplete">
                <div style="float:left">
                    <input
                        autofocus
                        type="text"
                        dir="{{ $ctrl.dir }}"
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
        function () {
            const ctrl = this as AutocController

            ctrl.dir = settings["dir"]
            ctrl.isError = false

            ctrl.$onChanges = () => {
                ctrl.textInField = ctrl.isRawInput ? ctrl.input : ""
                ctrl.placeholder = ctrl.isRawInput ? "" : ctrl.input
            }

            ctrl.typeaheadClose = function () {
                if (ctrl.errorOnEmpty) {
                    ctrl.isError = !(ctrl.placeholder != null && _.isEmpty(ctrl.textInField))
                }
            }

            ctrl.lemgramify = Lemgram.parse

            ctrl.sensify = Saldo.parse

            ctrl.placeholderToString = _.memoize(function (placeholder: string) {
                if (!placeholder) {
                    return
                }
                if (ctrl.type === "lemgram") {
                    return Lemgram.parse(placeholder)?.toString()
                } else {
                    return Saldo.parse(placeholder)?.toString()
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

            function getMorphologies(): string[] {
                if (ctrl.variant === "dalin") return ["dalinm"]
                const morphologies = settings.corpusListing.getMorphologies()
                return morphologies.length ? morphologies : ["saldom"]
            }

            ctrl.getRows = function (input: string) {
                if (ctrl.type === "lemgram") {
                    return ctrl.getLemgrams(input)
                } else if (ctrl.type === "sense") {
                    return ctrl.getSenses(input)
                }
            }

            ctrl.getLemgrams = async (input: string) => {
                const morphologies = getMorphologies()
                const corpora = settings.corpusListing.getSelectedCorpora()
                const data = await getLemgrams(input, morphologies, corpora)
                const output: LemgramOut[] = data.map((item) => {
                    if (ctrl.variant === "affix") item.count = -1
                    return {
                        ...item,
                        parts: ctrl.lemgramify(item.lemgram)!,
                        variant: ctrl.variant,
                    }
                })
                output.sort((a, b) => b.count - a.count)
                return output
            }

            ctrl.getSenses = async (input: string) => {
                const data = await getSenses(input)
                const output: Sense[] = data.map((item) => {
                    const out = {
                        sense: item.sense,
                        parts: ctrl.sensify(item.sense)!,
                        desc: item.desc ? ctrl.sensify(item.desc) : undefined,
                        variant: ctrl.variant,
                    }
                    return out
                })
                output.sort(function (a, b) {
                    if (a.parts.form === b.parts.form) {
                        // Sort same-form senses by index
                        return a.parts.index - b.parts.index
                    } else {
                        // Sort by length
                        return a.sense.length - b.sense.length
                    }
                })
                return output
            }
        },
    ],
})
