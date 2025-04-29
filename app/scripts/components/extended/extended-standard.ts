/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html } from "@/util"
import { matomoSend } from "@/matomo"
import "@/services/compare-searches"
import "@/components/extended/tokens"
import "@/components/search-submit"
import "@/global-filter/global-filters"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { CompareSearches } from "@/services/compare-searches"
import { SearchesService } from "@/services/searches"
import { StoreService } from "@/services/store"

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
        "$rootScope",
        "$scope",
        "$timeout",
        "compareSearches",
        "searches",
        "store",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: ExtendedStandardScope,
            $timeout: ITimeoutService,
            compareSearches: CompareSearches,
            searches: SearchesService,
            store: StoreService
        ) {
            const ctrl = this as ExtendedStandardController

            $scope.freeOrder = $location.search().in_order != null
            ctrl.orderError = false
            ctrl.withins = []
            const defaultWithin = Object.keys(settings.default_within || {})[0]
            ctrl.within = $location.search().within || defaultWithin

            // TODO this is *too* weird
            function triggerSearch() {
                $location.search("page", null)
                $location.search("in_order", $scope.freeOrder ? false : null)
                $location.search("within", ctrl.within != defaultWithin ? ctrl.within : undefined)
                $location.search("search", "cqp")
                searches.doSearch()
            }

            statemachine.listen("cqp_search", (event) => {
                $timeout(() => {
                    $location.search("search_tab", 1)
                    ctrl.cqpChange(event.cqp)
                    triggerSearch()
                })
            })

            ctrl.onSearch = () => {
                matomoSend("trackEvent", "Search", "Submit search", "Extended")
                triggerSearch()
            }

            ctrl.onSearchSave = (name: string) => {
                if (!store.extendedCqp) throw new ReferenceError("Extended CQP not set")
                compareSearches.saveSearch(name, store.extendedCqp)
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

                $location.search("cqp", cqp)
            }

            $scope.$watch("freeOrder", () => {
                ctrl.validateFreeOrder()
            })

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

            ctrl.cqp = $location.search().cqp || ""

            ctrl.repeatError = false
            ctrl.updateRepeatError = (error) => {
                ctrl.repeatError = error
            }

            const updateExtendedCQP = function () {
                let val2 = expandOperators(ctrl.cqp || "[]")
                if ($rootScope.globalFilter) {
                    val2 = stringify(mergeCqpExprs(parse(val2), $rootScope.globalFilter))
                }
                store.extendedCqp = val2
            }

            $rootScope.$watch("globalFilter", function () {
                if ($rootScope.globalFilter) {
                    updateExtendedCQP()
                }
            })

            store.watch("corpus", () => {
                ctrl.withins = settings.corpusListing.getWithinKeys()
                if (!ctrl.withins.includes(ctrl.within)) {
                    ctrl.within = ctrl.withins[0]
                }
            })
        },
    ],
})
