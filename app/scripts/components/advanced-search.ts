/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import { html } from "@/util"
import { matomoSend } from "@/matomo"
import "@/services/compare-searches"
import "@/components/search-submit"
import { LocationService } from "@/urlparams"
import { CompareSearches } from "@/services/compare-searches"
import { SearchesService } from "@/services/searches"

type AdvancedSearchController = IController & {
    cqp: string
    freeOrder: boolean
    onSearch: () => void
    onSearchSave: (name: string) => void
}

type AdvancedSearchScope = IScope & {}

angular.module("korpApp").component("advancedSearch", {
    template: html` <div>
        <div class="well well-small">
            {{'active_cqp_simple' | loc:$root.lang}}:
            <pre>{{$root.simpleCQP}}</pre>
        </div>
        <div class="well well-small">
            {{'active_cqp_extended' | loc:$root.lang}}:
            <pre>{{$root.extendedCQP}}</pre>
        </div>
        <div class="well well-small">
            {{'cqp_query' | loc:$root.lang}}:
            <textarea class="w-full font-mono" ng-model="$ctrl.cqp"></textarea>
            <div>
                {{'cqp_docs' | loc:$root.lang}}
                <a
                    href="https://www.gu.se/sites/default/files/2021-03/Att%20so%CC%88ka%20i%20Korp%20med%20CQP%20och%20Regexp.pdf"
                    target="_blank"
                >
                    <i class="fa fa-file"></i>
                    {{'cqp_docs_guide' | loc:$root.lang}}
                </a>
                {{'or' | loc:$root.lang}}
                <a href="https://cwb.sourceforge.io/files/CQP_Manual.pdf" target="_blank">
                    <i class="fa fa-file"></i>
                    {{'cqp_docs_manual' | loc:$root.lang}}
                </a>
            </div>
        </div>
        <search-submit
            pos="right"
            on-search="$ctrl.onSearch()"
            on-search-save="$ctrl.onSearchSave(name)"
        ></search-submit>
        <input id="freeOrderChkAdv" type="checkbox" ng-model="$ctrl.freeOrder" />
        <label for="freeOrderChkAdv">
            {{'free_order_chk' | loc:$root.lang}}
            <i
                class="fa fa-info-circle text-gray-400"
                uib-tooltip="{{'order_help' | loc:$root.lang}}"
                tooltip-placement="right"
            ></i>
        </label>
    </div>`,
    bindings: {},
    controller: [
        "$location",
        "$scope",
        "compareSearches",
        "searches",
        function (
            $location: LocationService,
            $scope: AdvancedSearchScope,
            compareSearches: CompareSearches,
            searches: SearchesService
        ) {
            const $ctrl = this as AdvancedSearchController

            $ctrl.cqp = "[]"
            $ctrl.freeOrder = $location.search().in_order != null

            /** Read advanced CQP from `search` URL param. */
            function readSearchParam(): void {
                const search = $location.search().search
                if (search?.slice(0, 4) == "cqp|") {
                    $ctrl.cqp = search.slice(4)
                }
            }

            // Sync CQP from URL to component.
            $scope.$watch(
                () => $location.search().search,
                () => readSearchParam()
            )

            $ctrl.onSearch = () => {
                $location.search("page", null)
                $location.search("within", null)
                $location.search("in_order", $ctrl.freeOrder ? false : null)
                $location.search("search", `cqp|${$ctrl.cqp}`)
                matomoSend("trackEvent", "Search", "Submit search", "Advanced")
                searches.doSearch()
            }

            $ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, $ctrl.cqp)
            }
        },
    ],
})
