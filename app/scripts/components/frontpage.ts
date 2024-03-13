/** @format */
import angular from "angular"

export default angular.module("korpApp").component("frontpage", {
    template: /* HTML */ `
        <div ng-if="!$ctrl.hasResult()" class="my-4 flex justify-center">
            <div ng-if="$ctrl.showDescription" class="max-w-screen-md text-lg">
                <div
                    ng-if="$root._settings['description']"
                    ng-bind-html="$root._settings['description'] | locObj:lang | trust"
                ></div>
                <div ng-if="!$root._settings['description']">Default description</div>
            </div>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "searches",
        function ($rootScope, searches) {
            const $ctrl = this

            $ctrl.hasResult = () =>
                searches.activeSearch ||
                $rootScope.compareTabs.length ||
                $rootScope.graphTabs.length ||
                $rootScope.mapTabs.length

            $ctrl.showDescription = false

            // Don't show the mode description until the inital corpora have been selected, to avoid text behind any modals
            $rootScope.$on("initialcorpuschooserchange", () => ($ctrl.showDescription = true))
        },
    ],
})
