/** @format */
const minusImage = require("../../../img/minus.png")

/**
 * TODO
 * put the components in change of how the CQP is genereated to allow for expressions like:
 * - ambiguity(lemma) = 1 (one value in the set lemma)
 * - (pos = "NN" & deprel = "HD") (one box generates an expression with a boolean operator and two operands)
 * This means that the operator is optional and probably should move to the contents of the extended components
 * that are added by cqp-value
 */
let html = String.raw
export const extendedCQPTermComponent = {
    template: html`
        <div class="or or_arg">
            <div class="left_col">
                <img class="image_button remove_arg" src="${minusImage}" ng-click="$ctrl.removeOr()" />
            </div>
            <div class="pr-1 inline-block align-middle ml-2">
                <div class="arg_selects {{$ctrl.term.type}}">
                    <select
                        class="arg_type"
                        ng-options="obj | mapper:$ctrl.valfilter as obj.label | locObj group by obj.group | loc for obj in $ctrl.types"
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
        "$rootScope",
        "$timeout",
        "utils",
        function ($rootScope, $timeout, utils) {
            const ctrl = this

            ctrl.valfilter = utils.valfilter

            ctrl.$onInit = () => {
                if (angular.equals(ctrl.term, {})) {
                    ctrl.term.type = "word"
                    ctrl.term.op = "="
                    ctrl.term.val = ""
                    ctrl.change()
                }
                $rootScope.$on("corpuschooserchange", (e, selected) => $timeout(() => onCorpusChange(e, selected), 0))

                onCorpusChange(null, settings.corpusListing.selected)
            }

            ctrl.localChange = (term) => {
                Object.assign(ctrl.term, term)
                ctrl.change()
            }

            const onCorpusChange = function (event, selected) {
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
                    c.log("confObj missing", type, ctrl.typeMapping)
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
}
