/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import { html } from "@/util"
import settings from "@/settings"
import { getStringifier } from "@/stringify"
import { locAttribute } from "@/i18n"
import { CompareTab, RootScope } from "@/root-scope.types"
import { SavedSearch } from "@/local-storage"
import { CompareItem, CompareResult, CompareTables } from "@/backend/backend"
import { TabHashScope } from "@/directives/tab-hash"
import { Attribute } from "@/settings/config.types"

type CompareCtrlController = IController & {
    loading: boolean
    newDynamicTab: () => void
    promise: CompareTab
    setProgress: (loading: boolean, progress: number) => void
}

type CompareCtrlScope = TabHashScope & {
    attributes: Record<string, Attribute>
    cmp1: SavedSearch
    cmp2: SavedSearch
    error?: string
    max: number
    resultOrder: (item: CompareItem) => number
    reduce: string[]
    rowClick: (row: CompareItem, cmp_index: number) => void
    stringify: (x: string) => string
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
        newDynamicTab: "<",
        promise: "<",
        setProgress: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        function ($rootScope: RootScope, $scope: CompareCtrlScope) {
            const $ctrl = this as CompareCtrlController

            $ctrl.$onInit = () => {
                $ctrl.setProgress(true, 0)
                $ctrl.newDynamicTab()
                $ctrl.promise.then(render).catch((error) => {
                    $ctrl.setProgress(false, 0)
                    $scope.error = error
                    $scope.$digest()
                })
            }

            $scope.resultOrder = (item) => Math.abs(item.loglike)

            function render(result: CompareResult) {
                const [tables, max, cmp1, cmp2, reduce] = result
                $ctrl.setProgress(false, 100)

                $scope.tables = tables
                $scope.reduce = reduce

                const cl = settings.corpusListing.subsetFactory([...cmp1.corpora, ...cmp2.corpora])
                $scope.attributes = { ...cl.getCurrentAttributes(), ...cl.getStructAttrs() }

                let stringify = (x: string) => x
                // currently we only support one attribute to reduce/group by, so simplify by only checking first item
                const reduceAttrName = _.trimStart(reduce[0], "_.")
                if ($scope.attributes[reduceAttrName]) {
                    const attribute = $scope.attributes[reduceAttrName]
                    if (attribute.stringify) {
                        stringify = getStringifier(attribute.stringify)
                    } else if (attribute.translation) {
                        stringify = (value) => locAttribute(attribute.translation!, value, $rootScope.lang)
                    }
                }
                $scope.stringify = stringify

                $scope.max = max

                $scope.cmp1 = cmp1
                $scope.cmp2 = cmp2
            }

            $scope.rowClick = (row, cmp_index) => {
                const cmps = [$scope.cmp1, $scope.cmp2]
                const cmp = cmps[cmp_index]

                const splitTokens = _.map(row.elems, (elem) => _.map(elem.split("/"), (tokens) => tokens.split(" ")))

                // number of tokens in search
                const tokenLength = splitTokens[0][0].length

                // transform result from grouping on attribute to grouping on token place
                var tokens = _.map(_.range(0, tokenLength), (tokenIdx) =>
                    _.map($scope.reduce, (reduceAttr, attrIdx) =>
                        _.uniq(_.map(splitTokens, (res) => res[attrIdx][tokenIdx]))
                    )
                )

                const cqps = _.map(tokens, function (token) {
                    const cqpAnd = _.map(_.range(0, token.length), function (attrI) {
                        let type: string | undefined
                        let val: string
                        let attrKey = $scope.reduce[attrI]
                        const attrVal = token[attrI]

                        if (attrKey.includes("_.")) {
                            console.log("error, attribute key contains _.")
                        }

                        const attribute = $scope.attributes[attrKey]
                        if (attribute) {
                            ;({ type } = attribute)
                            if (attribute["is_struct_attr"]) {
                                attrKey = `_.${attrKey}`
                            }
                        }

                        const op = type === "set" ? "contains" : "="

                        if (type === "set" && attrVal.length > 1) {
                            // Assemble variants for each position in the token
                            const transpose = <T>(matrix: T[][]) => _.zip(...matrix) as T[][]
                            const variantsByValue = attrVal.map((val) => val.split(":").slice(1))
                            const variantsByPosition = transpose(variantsByValue).map(_.uniq)
                            const variantsStrs = variantsByPosition.map((variants) => `:(${variants.join("|")})`)
                            const key = attrVal[0].split(":")[0]
                            val = key + variantsStrs.join("")
                        } else {
                            val = attrVal[0]
                        }

                        if (type === "set" && (val === "|" || val === "")) {
                            return `ambiguity(${attrKey}) = 0`
                        } else {
                            return `${attrKey} ${op} "${val}"`
                        }
                    })

                    return `[${cqpAnd.join(" & ")}]`
                })

                const cqp = cqps.join(" ")

                const cl = settings.corpusListing.subsetFactory(cmp.corpora)

                return $rootScope.kwicTabs.push({
                    queryParams: {
                        cqp: cmp.cqp,
                        cqp2: cqp,
                        corpus: cl.stringifySelected(),
                        show_struct: _.keys(cl.getStructAttrs()).join(","),
                        expand_prequeries: false,
                    },
                })
            }
        },
    ],
})
