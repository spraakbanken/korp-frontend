import angular, { IController, IScope, ITimeoutService } from "angular"
import { isEqual } from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { createCondition, expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html, regescape, splitFirst, unregescape } from "@/util"
import { LocationService } from "@/services/types"
import { matomoSend } from "@/services/matomo"
import "@/backend/lexicons"
import "./autoc"
import "./related-words"
import "./search-submit"
import "./global-filters"
import { Condition, CqpQuery } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"
import { savedSearches } from "@/search/saved-searches"

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
        "store",
        function (
            $location: LocationService,
            $scope: SimpleSearchScope,
            $timeout: ITimeoutService,
            store: StoreService,
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

            // Restore search when set via URL
            store.watch("search", () => {
                // For simple, `search` has the format `{word,lemgram}|<value>`
                const [type, val] = splitFirst("|", store.search || "")
                if (type != "word" && type != "lemgram") return

                // Wait for global filters and locale data
                $timeout(() => {
                    // Restore input
                    const isPlain = type == "word"
                    const input = isPlain ? val : unregescape(val)
                    ctrl.onChange(input, isPlain)

                    // Trigger search
                    commitSearch()
                })
            })

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
                }),
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
                commitSearch(true)
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

            function commitSearch(force = false) {
                const cqp = ctrl.getCQP()
                store.simpleCqp = expandOperators(cqp)
                const type = ctrl.isRawInput ? "word" : "lemgram"
                const newSearch = { type, cqp } as const
                if (!isEqual(store.activeSearch, newSearch) || force) {
                    store.activeSearch = newSearch
                }
            }

            ctrl.onChange = (value, isPlain) => {
                // Set input
                ctrl.isRawInput = isPlain
                ctrl.input = ctrl.isRawInput ? value : unregescape(value)
                // Set output
                ctrl.currentText = isPlain ? value : undefined
                ctrl.lemgram = !isPlain ? regescape(value) : undefined
                // Validate
                ctrl.updateFreeOrderEnabled()
            }

            ctrl.updateFreeOrderEnabled = () => {
                const cqpObjs = parse(ctrl.getCQP() || "[]")
                ctrl.freeOrderEnabled = supportsInOrder(cqpObjs)
            }
        },
    ],
})
