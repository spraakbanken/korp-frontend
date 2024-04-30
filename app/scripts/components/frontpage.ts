/** @format */
import angular from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import { html } from "@/util"
import "@/components/newsdesk"
import "@/components/corpus-updates"

export default angular.module("korpApp").component("frontpage", {
    template: html`
        <div ng-if="!$ctrl.hasResult()" class="max-w-screen-md my-10 mx-auto flex gap-8 flex-wrap">
            <div class="w-full flex gap-8 flex-wrap">
                <section
                    ng-if="$ctrl.showDescription && ($root._settings['description'] || $root._settings['mode_description'])"
                    class="w-80 grow text-lg"
                >
                    <div
                        ng-if="$root._settings['description']"
                        ng-bind-html="$root._settings['description'] | locObj:lang | trust"
                    />
                    <div
                        ng-if="$root._settings['mode_description']"
                        ng-bind-html="$root._settings['mode_description'] | locObj:lang | trust"
                    />
                </section>

                <section ng-if="$ctrl.examples" class="w-80 grow">
                    <h2 class="text-xl font-bold">{{"example_queries" | loc:$root.lang}}</h2>
                    <ul class="my-2 list-disc">
                        <li ng-repeat="example in $ctrl.examples" class="ml-6 mt-2 first_mt-0">
                            <a ng-click="$ctrl.setSearch(example.params)"> {{example.label | locObj:$root.lang}} </a>
                            <span ng-if="example.hint" class="italic">
                                – <span ng-bind-html="example.hint | locObj:$root.lang | trust" />
                            </span>
                        </li>
                    </ul>
                </section>
            </div>

            <newsdesk class="w-80 grow"></newsdesk>

            <corpus-updates class="w-80 grow"></corpus-updates>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$location",
        "searches",
        function ($rootScope, $location, searches) {
            const $ctrl = this
            $ctrl.showDescription = false
            $ctrl.examples = undefined

            $ctrl.hasResult = () =>
                searches.activeSearch ||
                $rootScope.compareTabs.length ||
                $rootScope.graphTabs.length ||
                $rootScope.mapTabs.length

            // Don't show the mode description until the initial corpora have been selected, to avoid text behind any modals
            $rootScope.$on("initialcorpuschooserchange", () => ($ctrl.showDescription = true))

            $ctrl.$onInit = () => {
                // Find search query examples
                const examples = $rootScope._settings.frontpage?.examples
                if (examples) {
                    // Pick three random examples
                    $ctrl.examples = _.shuffle(examples).slice(0, 3)
                }
            }

            $ctrl.setSearch = (params: Record<string, any>) => {
                if (params.corpus) {
                    const corpora = params.corpus.split(",")
                    $rootScope._settings.corpusListing.select(corpora)
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
