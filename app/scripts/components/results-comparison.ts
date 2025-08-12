/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import { html } from "@/util"
import settings from "@/settings"
import { getStringifier, Stringifier } from "@/stringify"
import { locAttribute } from "@/i18n"
import { CompareTab, RootScope } from "@/root-scope.types"
import { SavedSearch } from "@/local-storage"
import { buildItemCqp, CompareItem, CompareResult, CompareTables } from "@/backend/compare"
import { TabHashScope } from "@/directives/tab-hash"
import { Attribute } from "@/settings/config.types"
import "@/components/korp-error"
import "@/components/loglike-meter"
import { StoreService } from "@/services/store"
import { ExampleTask } from "@/backend/example-task"

type ResultsComparisonController = IController & {
    loading: boolean
    promise: CompareTab
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsComparisonScope = TabHashScope & {
    attributes: Record<string, Attribute>
    cmp1: SavedSearch
    cmp2: SavedSearch
    error?: string
    max: number
    resultOrder: (item: CompareItem) => number
    reduce: string[]
    rowClick: (row: CompareItem, cmp_index: number) => void
    stringify: Stringifier
    tables: CompareTables
}

angular.module("korpApp").component("resultsComparison", {
    template: html`
        <div class="compare_result" ng-class="{loading: $ctrl.loading}">
            <korp-error ng-if="error" message="{{error}}"></korp-error>
            <div class="column column_1" ng-if="!error">
                <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp1.label}}</em></h2>
                <ul class="negative">
                    <li ng-repeat="row in tables.negative | orderBy:resultOrder:true" ng-click="rowClick(row, 0)">
                        <loglike-meter item="row" max="max" stringify="stringify" class="w-full meter"></loglike-meter>
                    </li>
                </ul>
            </div>
            <div class="column column_2">
                <h2>{{'compare_distinctive' | loc:$root.lang}} <em>{{cmp2.label}}</em></h2>
                <ul class="positive">
                    <li ng-repeat="row in tables.positive | orderBy:resultOrder:true" ng-click="rowClick(row, 1)">
                        <loglike-meter item="row" max="max" stringify="stringify" class="w-full meter"></loglike-meter>
                    </li>
                </ul>
            </div>
        </div>
    `,
    bindings: {
        loading: "<",
        promise: "<",
        setProgress: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "store",
        function ($rootScope: RootScope, $scope: ResultsComparisonScope, store: StoreService) {
            const $ctrl = this as ResultsComparisonController

            $ctrl.$onInit = () => {
                $ctrl.setProgress(true, 0)
                $ctrl.promise.then(render).catch((error) => {
                    $ctrl.setProgress(false, 0)
                    $scope.error = error
                    $scope.$digest()
                })
            }

            $scope.resultOrder = (item) => Math.abs(item.loglike)

            function render(result: CompareResult) {
                $ctrl.setProgress(false, 100)
                const { tables, max, cmp1, cmp2, reduce } = result
                $scope.tables = tables
                $scope.max = max
                $scope.cmp1 = cmp1
                $scope.cmp2 = cmp2
                $scope.reduce = reduce

                const cl = settings.corpusListing.subsetFactory([...cmp1.corpora, ...cmp2.corpora])
                $scope.attributes = { ...cl.getCurrentAttributes(), ...cl.getStructAttrs() }
            }

            $scope.rowClick = (row, cmp_index) => {
                const attrs = $scope.reduce.map((name) => $scope.attributes[name])
                const cqp = buildItemCqp(row, attrs)

                const cmps = [$scope.cmp1, $scope.cmp2]
                const cmp = cmps[cmp_index]
                const cl = settings.corpusListing.subsetFactory(cmp.corpora)

                $rootScope.kwicTabs.push(
                    new ExampleTask({
                        cqp: cmp.cqp,
                        cqp2: cqp,
                        corpus: cl.stringifySelected(),
                        show_struct: _.keys(cl.getStructAttrs()).join(","),
                        expand_prequeries: false,
                    })
                )
            }

            $scope.stringify = (value) => {
                const attr = $scope.attributes[$scope.reduce[0]]
                if (attr?.stringify) return getStringifier(attr.stringify)(value)
                if (attr?.translation) return locAttribute(attr.translation, String(value), store.lang)
                return String(value)
            }
        },
    ],
})
