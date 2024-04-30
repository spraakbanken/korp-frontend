/** @format */
import angular from "angular"
import _ from "lodash"
import moment from "moment"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { html } from "@/util"
import "@/components/newsdesk"

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

            <section ng-if="$ctrl.recentUpdates && $ctrl.recentUpdates.length" class="w-80 grow">
                <h2 class="text-xl font-bold">{{"front_corpus_updates" | loc:$root.lang}}</h2>
                <div class="my-2 flex flex-col gap-2">
                    <article ng-repeat="corpus in $ctrl.recentUpdatesFiltered">
                        <time datetime="{{::corpus.info.Updated}}" class="opacity-75 float-right">
                            {{::corpus.info.Updated}}
                        </time>
                        <div>
                            <strong>{{corpus.title | locObj:$root.lang}}</strong>
                            {{"front_corpus_updated" | loc:$root.lang}}.
                        </div>
                    </article>

                    <div ng-if="$ctrl.recentUpdates.length > $ctrl.RECENT_UPDATES_LIMIT">
                        <a ng-if="!$ctrl.recentUpdatesExpanded" ng-click="$ctrl.toggleRecentUpdatesExpanded()">
                            <i class="fa fa-angle-double-down"></i>
                            {{"show_more" | loc:$root.lang}}
                        </a>
                        <a ng-if="$ctrl.recentUpdatesExpanded" ng-click="$ctrl.toggleRecentUpdatesExpanded()">
                            <i class="fa fa-angle-double-up"></i>
                            {{"show_less" | loc:$root.lang}}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$location",
        "searches",
        function ($rootScope, $location, searches) {
            const $ctrl = this
            $ctrl.RECENT_UPDATES_LIMIT = 5
            $ctrl.showDescription = false
            $ctrl.examples = undefined
            $ctrl.recentUpdates = null
            $ctrl.recentUpdatesExpanded = false
            $ctrl.recentUpdatesFiltered = null

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

                if ($rootScope._settings.frontpage?.corpus_updates) {
                    const limitDate = moment().subtract(6, "months")
                    // Find most recently updated corpora
                    $ctrl.recentUpdates = settings.corpusListing.corpora
                        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
                        .sort((a, b) => b.info.Updated.localeCompare(a.info.Updated))
                    $ctrl.toggleRecentUpdatesExpanded(false)
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

            $ctrl.toggleRecentUpdatesExpanded = (to?: boolean) => {
                $ctrl.recentUpdatesExpanded = to !== undefined ? to : !$ctrl.recentUpdatesExpanded
                $ctrl.recentUpdatesFiltered = $ctrl.recentUpdatesExpanded
                    ? $ctrl.recentUpdates
                    : $ctrl.recentUpdates.slice(0, $ctrl.RECENT_UPDATES_LIMIT)
            }
        },
    ],
})
