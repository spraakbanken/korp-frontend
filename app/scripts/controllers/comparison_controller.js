/** @format */
import { stringifyFunc } from "@/stringify.js"

const korpApp = angular.module("korpApp")

korpApp.directive("compareCtrl", () => ({
    controller: [
        "$scope",
        "$rootScope",
        ($scope, $rootScope) => {
            const s = $scope
            s.loading = true
            s.newDynamicTab()

            s.resultOrder = (item) => Math.abs(item.loglike)

            s.closeTab = function (idx, e) {
                e.preventDefault()
                s.compareTabs.splice(idx, 1)
                s.closeDynamicTab()
            }

            return s.promise.then(
                function (...args) {
                    const [tables, max, cmp1, cmp2, reduce] = args[0]
                    s.loading = false

                    s.tables = tables
                    s.reduce = reduce

                    let cl = settings.corpusListing.subsetFactory([].concat(cmp1.corpora, cmp2.corpora))
                    const attributes = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs())

                    let stringify = angular.identity
                    // currently we only support one attribute to reduce/group by, so simplify by only checking first item
                    const reduceAttrName = _.trimStart(reduce[0], "_.")
                    if (attributes[reduceAttrName]) {
                        if (attributes[reduceAttrName].stringify) {
                            stringify = stringifyFunc(reduceAttrName)
                        } else if (attributes[reduceAttrName].translation) {
                            stringify = (value) =>
                                util.translateAttribute($rootScope.lang, attributes[reduceAttrName].translation, value)
                        }
                    }
                    s.stringify = [stringify]

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
                        var tokens = _.map(_.range(0, tokenLength), function (tokenIdx) {
                            tokens = _.map(reduce, (reduceAttr, attrIdx) =>
                                _.uniq(_.map(splitTokens, (res) => res[attrIdx][tokenIdx]))
                            )
                            return tokens
                        })

                        const cqps = _.map(tokens, function (token) {
                            const cqpAnd = _.map(_.range(0, token.length), function (attrI) {
                                let type, val
                                let attrKey = reduce[attrI]
                                const attrVal = token[attrI]

                                if (attrKey.includes("_.")) {
                                    c.log("error, attribute key contains _.")
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
                                    let variants = []
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
                                    variants = _.map(variants, (variant) => `:(${variant.join("|")})`)
                                    val = key + variants.join("")
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
                                show_struct: _.keys(cl.getStructAttrs()),
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
