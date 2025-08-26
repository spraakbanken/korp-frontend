/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html, LocationService } from "@/util"
import { matomoSend } from "@/matomo"
import "@/components/extended/tokens"
import "@/components/search-submit"
import "@/global-filter/global-filters"
import { StoreService } from "@/services/store"
import { savedSearches } from "@/saved-searches"

type ExtendedStandardController = IController & {
    cqp: string
    repeatError: boolean
    orderError: boolean
    within: string
    withins: string[]
    onSearch: () => void
    onSearchSave: (name: string) => void
    cqpChange: (cqp: string) => void
    updateRepeatError: (error: boolean) => void
    /** Trigger error if the "free order" option is incompatible with the query */
    validateFreeOrder: () => void
    getWithins: () => { value: string }[]
}

type ExtendedStandardScope = IScope & {
    freeOrder: boolean
}

angular.module("korpApp").component("extendedStandard", {
    template: html`
        <div>
            <global-filters></global-filters>
            <extended-tokens
                cqp="$ctrl.cqp"
                cqp-change="$ctrl.cqpChange(cqp)"
                update-repeat-error="$ctrl.updateRepeatError(error)"
            ></extended-tokens>

            <div ng-show="$ctrl.repeatError" style="color: red; margin-bottom: 10px;">
                {{'repeat_error' | loc:$root.lang}}
            </div>

            <div ng-show="$ctrl.orderError" style="color: red; margin-bottom: 10px;">
                {{'order_error' | loc:$root.lang}}
            </div>

            <search-submit
                pos="right"
                on-search="$ctrl.onSearch()"
                on-search-save="$ctrl.onSearchSave(name)"
                disabled="$ctrl.repeatError || $ctrl.orderError"
            ></search-submit>
            <input id="freeOrderChkExt" type="checkbox" ng-model="freeOrder" />
            <label for="freeOrderChkExt"> {{'free_order_chk' | loc:$root.lang}}</label>
            <span> {{'and' | loc:$root.lang}} </span>
            <span>{{'within' | loc:$root.lang}}</span>
            <select
                class="within_select"
                ng-model="$ctrl.within"
                ng-options="item as ('within_' + item | loc:$root.lang) for item in $ctrl.withins"
            ></select>
        </div>
    `,
    controller: [
        "$location",
        "$scope",
        "$timeout",
        "store",
        function (
            $location: LocationService,
            $scope: ExtendedStandardScope,
            $timeout: ITimeoutService,
            store: StoreService
        ) {
            const ctrl = this as ExtendedStandardController

            ctrl.orderError = false
            ctrl.withins = []

            store.watch("in_order", () => ($scope.freeOrder = !store.in_order))
            store.watch("corpus", () => {
                ctrl.withins = settings.corpusListing.getWithinKeys()
                if (!ctrl.withins.includes(ctrl.within)) {
                    ctrl.within = ctrl.withins[0]
                }
            })
            store.watch("globalFilter", () => updateExtendedCQP())
            store.watch("within", () => (ctrl.within = store.within || ctrl.withins[0]))

            $scope.$watch("freeOrder", () => {
                ctrl.validateFreeOrder()
            })

            statemachine.listen("cqp_search", (event) => {
                $timeout(() => {
                    $location.search("search_tab", 1)
                    ctrl.cqpChange(event.cqp)
                    triggerSearch()
                })
            })

            store.watch("search", restoreSearch)
            store.watch("cqp", restoreSearch)
            function restoreSearch() {
                // For extended, `search` is just "cqp" and the query is in `cqp`
                if (store.search != "cqp" || !store.cqp) return
                ctrl.cqpChange(store.cqp)
                triggerSearch()
            }

            function triggerSearch() {
                store.page = 0
                store.in_order = !$scope.freeOrder
                store.within = ctrl.within
                store.search = "cqp"
                store.cqp = ctrl.cqp

                let cqp = ctrl.cqp
                if (store.globalFilter) {
                    cqp = stringify(mergeCqpExprs(parse(cqp || "[]"), store.globalFilter))
                }

                store.activeSearch = { cqp }
            }

            ctrl.onSearch = () => {
                matomoSend("trackEvent", "Search", "Submit search", "Extended")
                triggerSearch()
            }

            ctrl.onSearchSave = (name: string) => {
                if (!store.extendedCqp) throw new ReferenceError("Extended CQP not set")
                savedSearches.push(name, store.extendedCqp)
            }

            ctrl.cqpChange = (cqp: string) => {
                ctrl.cqp = cqp
                try {
                    updateExtendedCQP()
                } catch (e) {
                    console.log("Failed to parse CQP", ctrl.cqp)
                    console.log("Error", e)
                }

                ctrl.validateFreeOrder()
            }

            ctrl.validateFreeOrder = () => {
                try {
                    const cqpObjs = parse(ctrl.cqp || "[]")
                    // If query doesn't support free word order, and the "free order" checkbox is checked,
                    // then show explanation and let user resolve the conflict
                    ctrl.orderError = !supportsInOrder(cqpObjs) && $scope.freeOrder
                } catch (e) {
                    console.error("Failed to parse CQP", ctrl.cqp)
                    ctrl.orderError = false
                }
            }

            ctrl.cqp = store.cqp

            ctrl.repeatError = false
            ctrl.updateRepeatError = (error) => {
                ctrl.repeatError = error
            }

            const updateExtendedCQP = function () {
                let val2 = expandOperators(ctrl.cqp || "[]")
                if (store.globalFilter) {
                    val2 = stringify(mergeCqpExprs(parse(val2), store.globalFilter))
                }
                store.extendedCqp = val2
            }
        },
    ],
})
