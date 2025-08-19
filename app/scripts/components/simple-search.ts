/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { createCondition, expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html, LocationService, regescape, unregescape } from "@/util"
import { matomoSend } from "@/matomo"
import "@/backend/lexicons"
import "@/services/searches"
import "@/components/autoc"
import "@/components/related-words"
import "@/components/search-submit"
import "@/global-filter/global-filters"
import { SearchesService } from "@/services/searches"
import { Condition, CqpQuery } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"
import { savedSearches } from "@/saved-searches"

type SimpleSearchController = IController & {
    input: string
    isRawInput: boolean
    disableLemgramAutocomplete: boolean
    freeOrder: boolean
    freeOrderEnabled: boolean
    isCaseInsensitive: boolean
    currentText?: string
    lemgram?: string
    updateSearch: () => void
    getCQP: () => string
    onSearchSave: (name: string) => void
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

            <related-words class="ml-auto"></related-words>
        </div>
    `,
    controller: [
        "$location",
        "$scope",
        "$timeout",
        "searches",
        "store",
        function (
            $location: LocationService,
            $scope: SimpleSearchScope,
            $timeout: ITimeoutService,
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

                if (ctrl.currentText) store.search = `word|${ctrl.currentText}`
                else if (ctrl.lemgram) store.search = `lemgram|${ctrl.lemgram}`
                else return
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
                        const condition = createCondition(value)
                        if (ctrl.isCaseInsensitive) condition.flags = { c: true }
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
                savedSearches.push(name, ctrl.getCQP())
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
                const cqp = ctrl.getCQP()
                searches.kwicSearch(cqp)
            }
        },
    ],
})
