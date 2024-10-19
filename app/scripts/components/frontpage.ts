/** @format */
import angular from "angular"
import settings from "@/settings"
import { RootScope } from "@/root-scope.types"
import { SearchesService } from "@/services/searches"
import { html } from "@/util"
import { isEnabled } from "@/news-service"
import "@/services/searches"
import "@/components/newsdesk"
import "@/components/search-examples"

export default angular.module("korpApp").component("frontpage", {
    template: html`
        <div ng-if="!$ctrl.hasResult()" class="max-w-screen-md my-10 mx-auto flex gap-8 flex-wrap">
            <div class="w-full flex gap-8 flex-wrap">
                <section ng-if="$ctrl.showDescription && (description || modeDescription)" class="w-80 grow text-lg">
                    <div ng-if="description" ng-bind-html="description | locObj:$root.lang | trust"></div>

                    <div ng-if="modeDescription">
                        <h3 ng-if="modeLabel" class="font-bold">{{modeLabel | locObj:$root.lang}}</h3>
                        <div ng-bind-html="modeDescription | locObj:$root.lang | trust"></div>
                    </div>
                </section>

                <search-examples ng-if="examples" class="w-80 grow"></search-examples>
            </div>

            <div class="w-80 grow">
                <corpus-updates></corpus-updates>
            </div>

            <newsdesk ng-if="newsdeskIsEnabled" class="w-80 grow"></newsdesk>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$scope",
        "searches",
        function ($rootScope: RootScope, $scope, searches: SearchesService) {
            const $ctrl = this
            $ctrl.showDescription = false

            $scope.newsdeskIsEnabled = isEnabled()
            $scope.description = settings.description
            $scope.modeDescription = settings.mode_description
            $scope.modeLabel = settings.mode?.label
            $scope.examples = settings.frontpage?.examples

            $ctrl.hasResult = () =>
                searches.activeSearch ||
                $rootScope.compareTabs.length ||
                $rootScope.graphTabs.length ||
                $rootScope.mapTabs.length

            // Don't show the mode description until the initial corpora have been selected, to avoid text behind any modals
            $rootScope.$on("initialcorpuschooserchange", () => ($ctrl.showDescription = true))
        },
    ],
})
