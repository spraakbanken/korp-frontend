/** @format */
import angular from "angular"
import _ from "lodash"
import { html } from "@/util"
import "@/components/newsdesk"
import "@/components/corpus-updates"
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
                    />
                    <div
                        ng-if="$root._settings['mode_description']"
                        ng-bind-html="$root._settings['mode_description'] | locObj:lang | trust"
                    />
                </section>

                <search-examples class="w-80 grow"></search-examples>
            </div>

            <newsdesk class="w-80 grow"></newsdesk>

            <corpus-updates class="w-80 grow"></corpus-updates>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "searches",
        function ($rootScope, searches) {
            const $ctrl = this
            $ctrl.showDescription = false

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
