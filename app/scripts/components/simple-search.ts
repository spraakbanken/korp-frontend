/** @format */
import angular, { IController, IScope, ITimeoutService, ui } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html, regescape, saldoToHtml, unregescape } from "@/util"
import { matomoSend } from "@/matomo"
import "@/services/compare-searches"
import "@/backend/lexicons"
import "@/services/searches"
import "@/components/autoc"
import "@/components/search-submit"
import "@/global-filter/global-filters"
import { HashParams, LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { CompareSearches } from "@/services/compare-searches"
import { LexiconsRelatedWords, relatedWordSearch } from "@/backend/lexicons"
import { SearchesService } from "@/services/searches"
import { CqpSearchEvent } from "@/statemachine/types"
import { Condition, CqpQuery } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"

type SimpleSearchController = IController & {
    input: string
    isRawInput: boolean
    disableLemgramAutocomplete: boolean
    freeOrder: boolean
    freeOrderEnabled: boolean
    isCaseInsensitive: boolean
    currentText?: string
    lemgram?: string
    relatedObj?: { data: LexiconsRelatedWords[]; attribute: string }
    relatedDefault: number
    updateSearch: () => void
    getCQP: () => string
    onSearchSave: (name: string) => void
    stringifyRelated: (wd: string) => string
    showAllRelated: () => void
    updateFreeOrderEnabled: () => void
    doSearch: () => void
    onChange: (value: string, isPlain: boolean) => void
}

type SimpleSearchScope = IScope & {
    prefix: boolean
    midfix: boolean
    suffix: boolean
    onMidfixChange: () => void
}

angular.module("korpApp").component("simpleSearch", {
    template: html`
        <div id="korp-simple" class="flex flex-wrap items-center gap-4">
            <div>
                <global-filters lang="lang"></global-filters>
                <div class="flex flex-wrap items-center gap-4">
                    <form class="shrink-0">
                        <autoc
                            id="simple_text"
                            input="$ctrl.input"
                            is-raw-input="$ctrl.isRawInput"
                            type="lemgram"
                            disable-lemgram-autocomplete="$ctrl.disableLemgramAutocomplete"
                            on-change="$ctrl.onChange(output, isRawOutput)"
                        ></autoc>
                        <search-submit
                            on-search="$ctrl.updateSearch()"
                            on-search-save="$ctrl.onSearchSave(name)"
                        ></search-submit>
                    </form>
                    <div class="flex gap-4">
                        <div class="flex flex-col gap-1">
                            <label>
                                <input type="checkbox" ng-model="prefix" />
                                {{'prefix_chk' | loc:$root.lang}}
                                <i
                                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                    uib-tooltip="{{'prefix_chk_help' | loc:$root.lang}}"
                                ></i>
                            </label>
                            <label>
                                <input type="checkbox" ng-model="midfix" ng-change="onMidfixChange()" />
                                {{'midfix_chk' | loc:$root.lang}}
                                <i
                                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                    uib-tooltip="{{'midfix_chk_help' | loc:$root.lang}}"
                                ></i>
                            </label>
                            <label>
                                <input type="checkbox" ng-model="suffix" />
                                {{'suffix_chk' | loc:$root.lang}}
                                <i
                                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                    uib-tooltip="{{'suffix_chk_help' | loc:$root.lang}}"
                                ></i>
                            </label>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label>
                                <input
                                    type="checkbox"
                                    ng-model="$ctrl.freeOrder"
                                    ng-disabled="!$ctrl.freeOrderEnabled"
                                />
                                {{'free_order_chk' | loc:$root.lang}}
                                <i
                                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                    uib-tooltip="{{'free_order_chk_help' | loc:$root.lang}}"
                                ></i>
                            </label>
                            <label>
                                <input type="checkbox" ng-model="$ctrl.isCaseInsensitive" />
                                {{'case_insensitive' | loc:$root.lang}}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div ng-show="$ctrl.relatedObj" class="ml-auto">
                <button
                    class="btn btn-sm btn-default"
                    ng-click="$ctrl.showAllRelated()"
                    ng-if="$ctrl.relatedObj.data.length != 0"
                >
                    <span class="text-base">{{ 'similar_header' | loc:$root.lang }} (SweFN)</span><br /><span
                        ng-repeat="wd in $ctrl.relatedObj.data[0].words | limitTo:$ctrl.relatedDefault"
                    >
                        {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                    ><br /><span
                        ng-repeat="wd in $ctrl.relatedObj.data[0].words.slice($ctrl.relatedDefault) | limitTo:$ctrl.relatedDefault"
                    >
                        {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                    ><span
                        ng-if="$ctrl.relatedObj.data[0].words.length > $ctrl.relatedDefault || $ctrl.relatedObj.data.length > 1"
                    >
                        ...</span
                    >
                </button>
                <div class="btn btn-sm btn-default" ng-if="$ctrl.relatedObj.data.length == 0">
                    <span class="text-base">{{ 'similar_header' | loc:$root.lang }} (SWE-FN)</span><br /><span
                        >{{'no_related_words' | loc:$root.lang}}</span
                    >
                </div>
            </div>
        </div>
    `,
    controller: [
        "$location",
        "$rootScope",
        "$scope",
        "$timeout",
        "$uibModal",
        "compareSearches",
        "searches",
        "store",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: SimpleSearchScope,
            $timeout: ITimeoutService,
            $uibModal: ui.bootstrap.IModalService,
            compareSearches: CompareSearches,
            searches: SearchesService,
            store: StoreService
        ) {
            const ctrl = this as SimpleSearchController
            ctrl.disableLemgramAutocomplete = !settings.autocomplete
            /** Whether tokens should be matched in arbitrary order. */
            ctrl.freeOrder = false
            /** Whether the "free order" option is applicable. */
            ctrl.freeOrderEnabled = false

            store.watch("in_order", () => (ctrl.freeOrder = !store.in_order))
            store.watch("isCaseInsensitive", () => (ctrl.isCaseInsensitive = store.isCaseInsensitive))
            store.watch("prefix", () => ($scope.prefix = store.prefix))
            store.watch("suffix", () => ($scope.suffix = store.suffix))

            // Sync between word part inputs
            $scope.$watch("prefix", () => ($scope.midfix = $scope.prefix && $scope.suffix))
            $scope.$watch("suffix", () => ($scope.midfix = $scope.prefix && $scope.suffix))
            $scope.onMidfixChange = () => {
                $scope.prefix = $scope.midfix
                $scope.suffix = $scope.midfix
            }

            statemachine.listen("lemgram_search", (event) =>
                $timeout(() => {
                    $location.search("search_tab", null)
                    ctrl.onChange(event.value, false)
                    ctrl.updateSearch()
                })
            )

            ctrl.updateSearch = function () {
                store.in_order = !ctrl.freeOrderEnabled || !ctrl.freeOrder
                store.isCaseInsensitive = ctrl.isCaseInsensitive
                store.prefix = $scope.prefix
                store.suffix = $scope.suffix
                store.within = undefined
                $location.replace()

                if (ctrl.currentText) $location.search("search", `word|${ctrl.currentText}`)
                else if (ctrl.lemgram) $location.search("search", `lemgram|${ctrl.lemgram}`)
                store.page = 0

                matomoSend("trackEvent", "Search", "Submit search", "Simple")
                searches.doSearch()
            }

            ctrl.getCQP = function () {
                const query: CqpQuery = []
                const currentText = (ctrl.currentText || "").trim()

                if (currentText) {
                    currentText.split(/\s+/).forEach((word) => {
                        let value = regescape(word)
                        if ($scope.prefix) value = `${value}.*`
                        if ($scope.suffix) value = `.*${value}`
                        const condition: Condition = {
                            type: "word",
                            op: "=",
                            val: value,
                            flags: ctrl.isCaseInsensitive ? { c: true } : {},
                        }
                        query.push({ and_block: [[condition]] })
                    })
                } else if (ctrl.lemgram) {
                    const conditions: Condition[] = [{ type: "lex", op: "contains", val: ctrl.lemgram }]
                    // The complemgram attribute is a set of strings like: <part1>+<part2>+<...>:<probability>
                    if ($scope.prefix) {
                        conditions.push({ type: "complemgram", op: "contains", val: `${ctrl.lemgram}\\+.*` })
                    }
                    if ($scope.suffix) {
                        conditions.push({ type: "complemgram", op: "contains", val: `.*\\+${ctrl.lemgram}:.*` })
                    }
                    query.push({ and_block: [conditions] })
                }

                if (store.globalFilter) mergeCqpExprs(query, store.globalFilter)
                return stringify(query)
            }

            ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, ctrl.getCQP())
            }

            ctrl.stringifyRelated = (wd) => saldoToHtml(wd)

            ctrl.relatedDefault = 3

            ctrl.showAllRelated = () => {
                type ShowAllRelatedScope = IScope & {
                    stringifyRelatedHeader: (wd: string) => string
                    clickX: () => void
                    stringifyRelated: (wd: string) => string
                    relatedObj: any
                    clickRelated: (wd: string, attribute: string) => void
                }
                const scope = $rootScope.$new() as ShowAllRelatedScope
                scope.stringifyRelatedHeader = (wd) => wd.replace(/_/g, " ")
                scope.clickX = () => modalInstance.dismiss()
                scope.stringifyRelated = ctrl.stringifyRelated
                scope.relatedObj = ctrl.relatedObj
                scope.clickRelated = function (wd, attribute) {
                    if (modalInstance != null) {
                        modalInstance.close()
                    }
                    const cqp =
                        attribute === "saldo"
                            ? `[saldo contains \"${regescape(wd)}\"]`
                            : `[sense rank_contains \"${regescape(wd)}\"]`

                    statemachine.send("SEARCH_CQP", { cqp } as CqpSearchEvent)
                }
                const modalInstance = $uibModal.open({
                    template: `\
                        <div class="modal-header">
                            <h3 class="modal-title">{{'similar_header' | loc:$root.lang}} (SWE-FN)</h3>
                            <span ng-click="clickX()" class="close-x">×</span>
                        </div>
                        <div class="modal-body">
                            <div ng-repeat="obj in relatedObj.data" class="col"><a target="_blank" ng-href="https://spraakbanken.gu.se/karp/#?mode=swefn&lexicon=swefn&amp;search=extended||and|sense|equals|swefn--{{obj.label}}" class="header">{{stringifyRelatedHeader(obj.label)}}</a>
                              <div class="list_wrapper">
                                  <ul>
                                    <li ng-repeat="wd in obj.words"> <a ng-click="clickRelated(wd, relatedObj.attribute)" class="link">{{stringifyRelated(wd) + " "}}</a></li>
                                  </ul>
                              </div>
                            </div>
                        </div>\
                        `,
                    scope,
                    size: "lg",
                    windowClass: "related",
                })
                // Ignore rejection from dismissing the modal
                modalInstance.result.catch(() => {})
            }

            store.watch("activeSearch", () => {
                const search = store.activeSearch
                if (!search) return

                if (search.type === "word" || search.type === "lemgram") {
                    if (search.type === "word") {
                        ctrl.input = search.val
                        ctrl.isRawInput = true
                        ctrl.onChange(search.val, true)
                    } else {
                        ctrl.input = unregescape(search.val)
                        ctrl.isRawInput = false
                        ctrl.onChange(ctrl.input, false)
                    }
                    store.simpleCqp = expandOperators(ctrl.getCQP())
                    ctrl.updateFreeOrderEnabled()
                    ctrl.doSearch()
                }
            })

            ctrl.onChange = (value, isPlain) => {
                ctrl.currentText = isPlain ? value : undefined
                ctrl.lemgram = !isPlain ? regescape(value) : undefined
                ctrl.updateFreeOrderEnabled()
            }

            ctrl.updateFreeOrderEnabled = () => {
                const cqpObjs = parse(ctrl.getCQP() || "[]")
                ctrl.freeOrderEnabled = supportsInOrder(cqpObjs)
            }

            ctrl.doSearch = function () {
                const search = store.activeSearch
                ctrl.relatedObj = undefined
                const cqp = ctrl.getCQP()
                searches.kwicSearch(cqp)

                if (search?.type === "lemgram") {
                    const attrExists = (name: string) =>
                        settings.corpusListing.selected.some((corpus) => name in corpus.attributes)
                    const sense = attrExists("sense")
                    const saldo = attrExists("saldo")

                    if (sense || saldo) {
                        relatedWordSearch(unregescape(search.val)).then((data) => {
                            // Lower some nasty words
                            if (data.length >= 2 && data[0].label == "Excreting") {
                                // Swap the first two elements
                                const [first, second, ...rest] = data
                                data = [second, first, ...rest]
                            }
                            $timeout(() => (ctrl.relatedObj = { data, attribute: sense ? "sense" : "saldo" }))
                        })
                    }
                }
            }
        },
    ],
})
