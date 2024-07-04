/** @format */
import angular, { IScope } from "angular"
import moment from "moment"
import settings from "@/settings"
import { html } from "@/util"
import { LangMap } from "@/i18n/types"

export default angular.module("korpApp").component("corpusUpdates", {
    template: html`
        <section ng-if="recentUpdates && recentUpdates.length">
            <h2 class="text-xl font-bold">{{"front_corpus_updates" | loc:$root.lang}}</h2>
            <div class="my-2 flex flex-col gap-2">
                <article ng-repeat="corpus in recentUpdatesFiltered">
                    <time datetime="{{::corpus.info.Updated}}" class="opacity-75 float-right">
                        {{::corpus.info.Updated}}
                    </time>
                    <div>
                        <strong>{{corpus.title | locObj:$root.lang}}</strong>
                        {{"front_corpus_updated" | loc:$root.lang}}.
                    </div>
                </article>

                <div ng-if="recentUpdates.length > LIMIT">
                    <a ng-if="!expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-down"></i>
                        {{"show_more" | loc:$root.lang}}
                    </a>
                    <a ng-if="expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-up"></i>
                        {{"show_less" | loc:$root.lang}}
                    </a>
                </div>
            </div>
        </section>
    `,
    bindings: {},
    controller: [
        "$scope",
        function ($scope: CorpusUpdatesScope) {
            const $ctrl = this

            $scope.LIMIT = 5
            $scope.recentUpdates = null
            $scope.recentUpdatesFiltered = null
            $scope.expanded = false

            $ctrl.$onInit = () => {
                if (settings.frontpage?.corpus_updates) {
                    const limitDate = moment().subtract(6, "months")
                    // Find most recently updated corpora
                    $scope.recentUpdates = settings.corpusListing.corpora
                        .filter((corpus) => corpus.info.Updated && moment(corpus.info.Updated).isSameOrAfter(limitDate))
                        .sort((a, b) => b.info.Updated.localeCompare(a.info.Updated))
                    $scope.toggleExpanded(false)
                }
            }

            $scope.toggleExpanded = (to?: boolean) => {
                $scope.expanded = to !== undefined ? to : !$scope.expanded
                $scope.recentUpdatesFiltered = $scope.expanded
                    ? $scope.recentUpdates
                    : $scope.recentUpdates.slice(0, $scope.LIMIT)
            }
        },
    ],
})

type CorpusUpdatesScope = IScope & {
    LIMIT: number
    recentUpdates: Corpus[] | null
    recentUpdatesFiltered: Corpus[] | null
    expanded: boolean
    toggleExpanded: (to?: boolean) => void
}

type Corpus = {
    info: { Updated: string }
    title: LangMap | string
}
