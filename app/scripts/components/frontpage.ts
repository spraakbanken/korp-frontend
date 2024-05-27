/** @format */
import angular from "angular"
import { html } from "@/util"
import { isEnabled } from "@/news-service"
import "@/components/corpus-updates"
import "@/components/newsdesk"
import "@/components/search-examples"

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
                    ></div>

                    <div ng-if="$root._settings['mode_description']">
                        <h3 ng-if="$root._settings['mode']['label']" class="font-bold">
                            {{$root._settings['mode']['label'] | locObj:lang}}
                        </h3>
                        <div ng-bind-html="$root._settings['mode_description'] | locObj:lang | trust"></div>
                    </div>
                </section>

                <search-examples ng-if="$root._settings['frontpage']['examples']" class="w-80 grow"></search-examples>
            </div>

            <corpus-updates class="w-80 grow"></corpus-updates>

            <newsdesk ng-if="newsdeskIsEnabled" class="w-80 grow"></newsdesk>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$scope",
        "searches",
        function ($rootScope, $scope, searches) {
            const $ctrl = this
            $ctrl.showDescription = false

            $scope.newsdeskIsEnabled = isEnabled()

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
