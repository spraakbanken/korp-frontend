/** @format */
import angular from "angular"
import settings from "@/settings"
import { RootScope } from "@/root-scope.types"
import { html } from "@/util"
import { isEnabled } from "@/news-service"
import "@/components/newsdesk"
import "@/components/search-examples"
import { StoreService } from "@/services/store"

export default angular.module("korpApp").component("frontpage", {
    template: html`
        <div ng-if="!$ctrl.hasResult()" class="max-w-screen-md my-10 mx-auto flex gap-8 flex-wrap">
            <div class="w-full flex gap-8 flex-wrap">
                <section ng-if="description || modeDescription" class="w-80 grow text-lg">
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
        "store",
        function ($rootScope: RootScope, $scope, store: StoreService) {
            const $ctrl = this

            $scope.newsdeskIsEnabled = isEnabled()
            $scope.description = settings.description
            $scope.modeDescription = settings.mode_description
            $scope.modeLabel = settings.mode?.label
            $scope.examples = settings.frontpage?.examples

            $ctrl.hasResult = () => store.activeSearch || $rootScope.compareTabs.length
        },
    ],
})
