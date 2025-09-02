/** @format */
import angular, { IScope } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { StoreService } from "@/services/store"
import { getRecentCorpusUpdates } from "@/data_init"

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
                        <button class="btn btn-xs btn-default" ng-click="selectCorpus(corpus.id)">
                            {{"toggle_select" | loc:$root.lang}}
                        </button>
                    </div>
                </article>

                <div ng-if="recentUpdates.length > LIMIT">
                    <a ng-if="!expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-down"></i>
                        {{"show_more_n" | loc:$root.lang}}
                    </a>
                    <a ng-if="expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-up"></i>
                        {{"show_less_n" | loc:$root.lang}}
                    </a>
                </div>
            </div>
        </section>
    `,
    bindings: {},
    controller: [
        "$scope",
        "store",
        function ($scope: CorpusUpdatesScope, store: StoreService) {
            const $ctrl = this

            $scope.LIMIT = 5
            $scope.recentUpdates = null
            $scope.recentUpdatesFiltered = null
            $scope.expanded = false

            $ctrl.$onInit = () => {
                if (settings.frontpage?.corpus_updates) {
                    $scope.recentUpdates = getRecentCorpusUpdates()
                    $scope.toggleExpanded(false)
                }
            }

            $scope.toggleExpanded = (to?: boolean) => {
                $scope.expanded = to !== undefined ? to : !$scope.expanded
                $scope.recentUpdatesFiltered = $scope.expanded
                    ? $scope.recentUpdates
                    : $scope.recentUpdates!.slice(0, $scope.LIMIT)
            }

            $scope.selectCorpus = (corpusId: string) => {
                store.corpus = [corpusId]
            }
        },
    ],
})

type CorpusUpdatesScope = IScope & {
    LIMIT: number
    recentUpdates: CorpusTransformed[] | null
    recentUpdatesFiltered: CorpusTransformed[] | null
    expanded: boolean
    toggleExpanded: (to?: boolean) => void
    selectCorpus: (corpusId: string) => void
}
