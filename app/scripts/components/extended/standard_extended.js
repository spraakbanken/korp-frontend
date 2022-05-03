/** @format */
import statemachine from "@/statemachine"

let html = String.raw
export const extendedStandardComponent = {
    template: html`
        <div>
            <global-filters lang="$ctrl.lang"></global-filters>
            <extended-tokens
                cqp="$ctrl.cqp"
                lang="$ctrl.lang"
                cqp-change="$ctrl.cqpChange(cqp)"
                update-repeat-error="$ctrl.updateRepeatError(error)"
            ></extended-tokens>
            <div ng-show="$ctrl.repeatError" style="color: red; margin-bottom: 10px;">
                {{'repeat_error' | loc:$root.lang}}
            </div>
            <search-submit
                pos="right"
                on-search="$ctrl.onSearch()"
                on-search-save="$ctrl.onSearchSave(name)"
                disabled="$ctrl.repeatError"
            ></search-submit>
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
        "compareSearches",
        "$timeout",
        function ($location, $rootScope, compareSearches, $timeout) {
            const ctrl = this

            ctrl.lang = $rootScope.lang

            // TODO this is *too* weird
            function triggerSearch() {
                $location.search("search", null)
                $location.search("page", null)
                $location.search("in_order", null)
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
                    c.log("Failed to parse CQP", ctrl.cqp)
                    c.log("Error", e)
                }
                $location.search("cqp", cqp)
            }

            ctrl.cqp = $location.search().cqp

            ctrl.repeatError = false
            ctrl.updateRepeatError = (error) => {
                ctrl.repeatError = error
            }

            const updateExtendedCQP = function () {
                let val2 = CQP.expandOperators(ctrl.cqp)
                if ($rootScope.globalFilter) {
                    val2 = CQP.stringify(CQP.mergeCqpExprs(CQP.parse(val2 || "[]"), $rootScope.globalFilter))
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

            $rootScope.$on("corpuschooserchange", function () {
                ctrl.withins = ctrl.getWithins()
                ctrl.within = ctrl.withins[0] && ctrl.withins[0].value
            })
        },
    ],
}
