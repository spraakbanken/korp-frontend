/** @format */
import _ from "lodash"
import angular from "angular"
import settings from "@/settings"
import { getStringifier } from "@/stringify"
import { locAttribute } from "@/i18n"
import { CompareTab, RootScope } from "@/root-scope.types"
import { SavedSearch } from "@/local-storage"
import { CompareItem, CompareTables } from "@/backend/backend"
import { TabHashScope } from "@/directives/tab-hash"

type CompareCtrlScope = TabHashScope & {
    closeTab: (index: number, e: Event) => void
    cmp1: SavedSearch
    cmp2: SavedSearch
    error: boolean
    loading: boolean
    max: number
    promise: CompareTab
    resultOrder: (item: CompareItem) => number
    reduce: string[]
    rowClick: (row: CompareItem, cmp_index: number) => void
    stringify: (x: string) => string
    tables: CompareTables
}

angular.module("korpApp").directive("compareCtrl", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope: CompareCtrlScope, $rootScope: RootScope) => {
            const s = $scope
            const r = $rootScope
            s.loading = true
            s.newDynamicTab()

            s.resultOrder = (item) => Math.abs(item.loglike)

            s.closeTab = function (idx, e) {
                e.preventDefault()
                r.compareTabs.splice(idx, 1)
                s.closeDynamicTab()
            }

            return s.promise.then(
                (result) => {
                    const [tables, max, cmp1, cmp2, reduce] = result
                    s.loading = false

                    s.tables = tables
                    s.reduce = reduce

                    let cl = settings.corpusListing.subsetFactory([...cmp1.corpora, ...cmp2.corpora])
                    const attributes = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs())

                    let stringify = (x: string) => x
                    // currently we only support one attribute to reduce/group by, so simplify by only checking first item
                    const reduceAttrName = _.trimStart(reduce[0], "_.")
                    if (attributes[reduceAttrName]) {
                        const attribute = attributes[reduceAttrName]
                        if (attribute.stringify) {
                            stringify = getStringifier(attribute.stringify)
                        } else if (attribute.translation) {
                            stringify = (value) => locAttribute(attribute.translation!, value, $rootScope.lang)
                        }
                    }
                    s.stringify = stringify

                    s.max = max

                    s.cmp1 = cmp1
                    s.cmp2 = cmp2

                    const cmps = [cmp1, cmp2]

                    s.rowClick = function (row, cmp_index) {
                        const cmp = cmps[cmp_index]

                        const splitTokens = _.map(row.elems, (elem) =>
                            _.map(elem.split("/"), (tokens) => tokens.split(" "))
                        )

                        // number of tokens in search
                        const tokenLength = splitTokens[0][0].length

                        // transform result from grouping on attribute to grouping on token place
                        var tokens = _.map(_.range(0, tokenLength), (tokenIdx) =>
                            _.map(reduce, (reduceAttr, attrIdx) =>
                                _.uniq(_.map(splitTokens, (res) => res[attrIdx][tokenIdx]))
                            )
                        )

                        const cqps = _.map(tokens, function (token) {
                            const cqpAnd = _.map(_.range(0, token.length), function (attrI) {
                                let type: string | undefined
                                let val: string
                                let attrKey = reduce[attrI]
                                const attrVal = token[attrI]

                                if (attrKey.includes("_.")) {
                                    console.log("error, attribute key contains _.")
                                }

                                const attribute = attributes[attrKey]
                                if (attribute) {
                                    ;({ type } = attribute)
                                    if (attribute["is_struct_attr"]) {
                                        attrKey = `_.${attrKey}`
                                    }
                                }

                                const op = type === "set" ? "contains" : "="

                                if (type === "set" && attrVal.length > 1) {
                                    const variants: string[][] = []
                                    _.map(attrVal, function (val) {
                                        const parts = val.split(":")
                                        if (variants.length === 0) {
                                            for (let idx of _.range(0, parts.length - 1)) {
                                                variants.push([])
                                            }
                                        }
                                        for (let idx of _.range(1, parts.length)) {
                                            variants[idx - 1].push(parts[idx])
                                        }
                                    })

                                    const key = attrVal[0].split(":")[0]
                                    const variants2 = _.map(variants, (variant) => `:(${variant.join("|")})`)
                                    val = key + variants2.join("")
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

                        cl = settings.corpusListing.subsetFactory(cmp.corpora)

                        const opts = {
                            start: 0,
                            end: 24,
                            ajaxParams: {
                                cqp: cmp.cqp,
                                cqp2: cqp,
                                corpus: cl.stringifySelected(),
                                show_struct: _.keys(cl.getStructAttrs()).join(","),
                                expand_prequeries: false,
                            },
                        }
                        return $rootScope.kwicTabs.push({ queryParams: opts })
                    }
                },
                function () {
                    s.loading = false
                    s.error = true
                }
            )
        },
    ],
}))
