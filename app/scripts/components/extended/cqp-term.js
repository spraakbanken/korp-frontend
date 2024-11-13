/** @format */
import angular from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html, valfilter } from "@/util"
const minusImage = require("../../../img/minus.png")
import "@/components/extended/cqp-value"
import "@/services/store"

/**
 * TODO
 * put the components in change of how the CQP is genereated to allow for expressions like:
 * - ambiguity(lemma) = 1 (one value in the set lemma)
 * - (pos = "NN" & deprel = "HD") (one box generates an expression with a boolean operator and two operands)
 * This means that the operator is optional and probably should move to the contents of the extended components
 * that are added by cqp-value
 */

angular.module("korpApp").component("extendedCqpTerm", {
    template: html`
        <div class="or or_arg">
            <div class="left_col">
                <img class="image_button remove_arg" src="${minusImage}" ng-click="$ctrl.removeOr()" />
            </div>
            <div class="pr-1 inline-block align-middle ml-2">
                <div class="arg_selects {{$ctrl.term.type}}">
                    <select
                        class="arg_type"
                        ng-options="$ctrl.valfilter(obj) as obj.label | locObj group by obj.group | loc for obj in $ctrl.types"
                        ng-model="$ctrl.term.type"
                        ng-change="$ctrl.setDefault($ctrl.term)"
                    ></select>

                    <select
                        class="arg_opts"
                        ng-options="pair[1] as pair[0] | loc for pair in $ctrl.opts"
                        ng-model="$ctrl.term.op"
                        ng-change="$ctrl.change()"
                    ></select>
                </div>
                <div class="arg_val_container">
                    <extended-cqp-value
                        ng-if="$ctrl.typeMapping[$ctrl.term.type]"
                        attribute-definition="$ctrl.typeMapping[$ctrl.term.type]"
                        term="$ctrl.term"
                        change="$ctrl.localChange(term)"
                    ></extended-cqp-value>
                </div>
            </div>
        </div>
    `,
    bindings: {
        term: "<",
        parallellLang: "<",
        removeOr: "&",
        change: "&",
    },
    controller: [
        "$location",
        "$rootScope",
        "$timeout",
        "store",
        function ($location, $rootScope, $timeout, store) {
            const ctrl = this

            ctrl.valfilter = valfilter

            ctrl.$onInit = () => {
                if (angular.equals(ctrl.term, {})) {
                    ctrl.term.type = "word"
                    ctrl.term.op = "="
                    ctrl.term.val = ""
                    ctrl.change()
                }
                store.watch("selectedCorpusIds", () => $timeout(() => onCorpusChange(), 0))
                $rootScope.$watch(
                    () => $location.search().parallel_corpora,
                    () => $timeout(() => onCorpusChange())
                )

                onCorpusChange()
            }

            ctrl.localChange = (term) => {
                Object.assign(ctrl.term, term)
                ctrl.change()
            }

            function onCorpusChange() {
                const selected = store.get("selectedCorpusIds")
                // TODO: respect the setting 'wordAttributeSelector' and similar
                if (!(selected && selected.length)) {
                    return
                }
                const allAttrs = settings.corpusListing.getAttributeGroups(ctrl.parallellLang)
                ctrl.types = _.filter(allAttrs, (item) => !item["hide_extended"])
                ctrl.typeMapping = _.fromPairs(
                    _.map(ctrl.types, function (item) {
                        if (item["is_struct_attr"]) {
                            return [`_.${item.value}`, item]
                        } else {
                            return [item.value, item]
                        }
                    })
                )
                ctrl.opts = ctrl.getOpts(ctrl.term.type)
            }

            // returning new array each time kills angular, hence the memoizing
            ctrl.getOpts = _.memoize(function (type) {
                if (!(type in (ctrl.typeMapping || {}))) {
                    return
                }
                let confObj = ctrl.typeMapping && ctrl.typeMapping[type]
                if (!confObj) {
                    console.log("confObj missing", type, ctrl.typeMapping)
                    return
                }

                confObj = _.extend({}, (confObj && confObj.opts) || settings["default_options"])

                if (confObj.type === "set") {
                    confObj.is = "contains"
                }
                return _.toPairs(confObj)
            })

            ctrl.setDefault = function () {
                // assign the first value from the opts
                const opts = ctrl.getOpts(ctrl.term.type)
                ctrl.opts = opts

                if (!opts) {
                    ctrl.term.op = "is"
                } else {
                    ctrl.term.op = _.values(opts)[0][1]
                }

                ctrl.term.val = ""
                ctrl.change()
            }
        },
    ],
})
