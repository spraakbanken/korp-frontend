/** @format */
import angular from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html } from "@/util"
import { matomoSend } from "@/matomo"
import "@/services/compare-searches"
import "@/services/store"
import "@/components/extended/tokens"
import "@/components/search-submit"
import "@/global-filter/global-filters"

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
                ng-options="item.value as ('within_' + item.value | loc:$root.lang) for item in $ctrl.withins"
            ></select>
        </div>
    `,
    controller: [
        "$location",
        "$rootScope",
        "$scope",
        "$timeout",
        "compareSearches",
        "store",
        function ($location, $rootScope, $scope, $timeout, compareSearches, store) {
            const ctrl = this

            $scope.freeOrder = $location.search().in_order != null
            ctrl.orderError = false

            // TODO this is *too* weird
            function triggerSearch() {
                // Unset and set query in next time step in order to trigger changes correctly in `searches`.
                $location.search("search", null)
                $location.search("page", null)
                $location.search("in_order", $scope.freeOrder ? false : null)
                $timeout(function () {
                    $location.search("search", "cqp")
                    if (!_.keys(settings["default_within"]).includes(ctrl.within)) {
                        var within = ctrl.within
                    }
                    $location.search("within", within)
                }, 0)
            }

            statemachine.listen("cqp_search", (event) => {
                $rootScope.searchtabs()[1].tab.select()
                ctrl.cqp = event.cqp
                // sometimes $scope.$apply is needed and sometimes it throws errors
                // depending on source of the event I guess. $timeout solves it.
                $timeout(() => {
                    $rootScope.$apply()
                    triggerSearch()
                })
            })

            ctrl.onSearch = () => {
                matomoSend("trackEvent", "Search", "Submit search", "Extended")
                triggerSearch()
            }

            ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, $rootScope.extendedCQP)
            }

            ctrl.cqpChange = (cqp) => {
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

            /** Trigger error if the "free order" option is incompatible with the query */
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

            ctrl.cqp = $location.search().cqp

            ctrl.repeatError = false
            ctrl.updateRepeatError = (error) => {
                ctrl.repeatError = error
            }

            const updateExtendedCQP = function () {
                let val2 = expandOperators(ctrl.cqp)
                if ($rootScope.globalFilter) {
                    val2 = stringify(mergeCqpExprs(parse(val2 || "[]"), $rootScope.globalFilter))
                }
                $rootScope.extendedCQP = val2
            }

            $rootScope.$watch("globalFilter", function () {
                if ($rootScope.globalFilter) {
                    updateExtendedCQP()
                }
            })

            ctrl.withins = []

            ctrl.getWithins = function () {
                const union = settings.corpusListing.getWithinKeys()
                const output = _.map(union, (item) => ({ value: item }))
                return output
            }

            store.watch("selectedCorpusIds", () => {
                ctrl.withins = ctrl.getWithins()
                ctrl.within = ctrl.withins[0] && ctrl.withins[0].value
            })
        },
    ],
})
