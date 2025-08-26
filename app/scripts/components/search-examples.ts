/** @format */
import angular, { IScope } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import { html } from "@/util"
import { LocationService } from "@/angular-util"
import settings from "@/settings"
import { SearchExample } from "@/settings/app-settings.types"
import { HashParams } from "@/urlparams"
import { CqpSearchEvent } from "@/statemachine/types"

export default angular.module("korpApp").component("searchExamples", {
    template: html`
        <section ng-if="examples">
            <h2 class="text-xl font-bold">{{"example_queries" | loc:$root.lang}}</h2>
            <ul class="my-2 list-disc">
                <li ng-repeat="example in examples" class="ml-6 mt-2 first:mt-0">
                    <a ng-click="$ctrl.setSearch(example.params)"> {{example.label | locObj:$root.lang}} </a>
                    <span ng-if="example.hint" class="italic">
                        – <span ng-bind-html="example.hint | locObj:$root.lang | trust" />
                    </span>
                </li>
            </ul>
        </section>
    `,
    bindings: {},
    controller: [
        "$scope",
        "$location",
        function ($scope: SearchExamplesScope, $location: LocationService) {
            const $ctrl = this

            $scope.examples = undefined

            $ctrl.$onInit = () => {
                // Find search query examples
                const examples = settings.frontpage?.examples
                if (examples) {
                    // Pick three random examples
                    $scope.examples = _.shuffle(examples).slice(0, 3)
                }
            }

            $ctrl.setSearch = (params: HashParams) => {
                if (params.cqp) {
                    statemachine.send("SEARCH_CQP", { cqp: params.cqp } as CqpSearchEvent)
                }
                // Do not use `$location.search(params)` because it will remove existing params (like `corpus`)
                Object.keys(params).forEach((key: keyof HashParams) => $location.search(key, params[key]))
            }
        },
    ],
})

type SearchExamplesScope = IScope & {
    examples?: SearchExample[]
}
