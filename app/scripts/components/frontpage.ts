/** @format */
import angular from "angular"
import moment from "moment"
import settings from "@/settings"

export default angular.module("korpApp").component("frontpage", {
    template: /* HTML */ `
        <div ng-if="!$ctrl.hasResult()" class="max-w-screen-md my-4 mx-auto flex gap-4 flex-wrap">
            <section ng-if="$ctrl.showDescription && ($root._settings['description'] || $root._settings['mode_description'])" class="text-lg">
                <div ng-if="$root._settings['description']" ng-bind-html="$root._settings['description'] | locObj:lang | trust"></div>
                <div ng-if="$root._settings['mode_description']" ng-bind-html="$root._settings['mode_description'] | locObj:lang | trust"></div>
            </section>

            <section ng-if="$ctrl.recentUpdates && $ctrl.recentUpdates.length" class="w-80 grow">
                <h2 class="text-xl font-bold">{{"front_corpus_updates" | loc:$root.lang}}</h2>
                <div class="my-2 flex flex-col gap-2">
                    <article ng-repeat="corpus in $ctrl.recentUpdatesFiltered" class="flex-1">
                        <strong>{{::corpus.info.Updated}}</strong>
                        <em>{{corpus.title | locObj:$root.lang}}</em>
                        {{"front_corpus_updated" | loc:$root.lang}}.
                    </article>

                    <div ng-if="$ctrl.recentUpdates.length > $ctrl.RECENT_UPDATES_LIMIT">
                        <a ng-if="!$ctrl.recentUpdatesExpanded" ng-click="$ctrl.toggleRecentUpdatesExpanded()">
                                <i class="fa fa-angle-double-down"></i>
                                {{"show_more" | loc:$root.lang}}
                            </a>
                        </span>
                        <a ng-if="$ctrl.recentUpdatesExpanded" ng-click="$ctrl.toggleRecentUpdatesExpanded()">
                                <i class="fa fa-angle-double-up"></i>
                                {{"show_less" | loc:$root.lang}}
                            </a>
                        </span>
                    </div>
                </div>
            </section>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "searches",
        function ($rootScope, searches) {
            const $ctrl = this
            $ctrl.RECENT_UPDATES_LIMIT = 5
            $ctrl.showDescription = false
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
                if ($rootScope._settings.frontpage?.corpus_updates) {
                    const limitDate = moment().subtract(6, "months")
                    // Find most recently updated corpora
                    $ctrl.recentUpdates = settings.corpusListing.corpora
                        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
                        .sort((a, b) => b.info.Updated.localeCompare(a.info.Updated))
                    $ctrl.toggleRecentUpdatesExpanded(false)
                }
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
