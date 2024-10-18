/** @format */
import angular, { IScope } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import { html } from "@/util"
import settings from "@/settings"
import { SearchExample } from "@/settings/app-settings.types"
import { RootScope } from "@/root-scope.types"
import { HashParams, LocationService } from "@/urlparams"

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
        "$rootScope",
        "$scope",
        "$location",
        function ($rootScope: RootScope, $scope: SearchExamplesScope, $location: LocationService) {
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
                if (params.corpus) {
                    const corpora = params.corpus.split(",")
                    settings.corpusListing.select(corpora)
                    $rootScope.$broadcast("corpuschooserchange", corpora)
                }
                if (params.cqp) {
                    statemachine.send("SEARCH_CQP", { cqp: params.cqp })
                }
                $location.search(params)
            }
        },
    ],
})

type SearchExamplesScope = IScope & {
    examples?: SearchExample[]
}
