/** @format */
import angular, { IController, ITimeoutService } from "angular"
import settings from "@/settings"
import { html, valfilter } from "@/util"
const minusImage = require("../../../img/minus.png")
import "@/components/extended/cqp-value"
import { Condition, OperatorKorp } from "@/cqp_parser/cqp.types"
import { AttributeOption } from "@/corpus_listing"
import { getTimeData } from "@/timedata"
import { StoreService } from "@/services/store"

/**
 * TODO
 * put the components in change of how the CQP is genereated to allow for expressions like:
 * - ambiguity(lemma) = 1 (one value in the set lemma)
 * - (pos = "NN" & deprel = "HD") (one box generates an expression with a boolean operator and two operands)
 * This means that the operator is optional and probably should move to the contents of the extended components
 * that are added by cqp-value
 */

type ExtendedCqpTermController = IController & {
    term: Condition
    parallellLang: string | undefined
    removeOr: () => void
    change: () => void
    types: AttributeOption[]
    typeMapping: Record<string, AttributeOption>
    opts: [string, OperatorKorp][]
    valfilter: typeof valfilter
    localChange: (term: Partial<Condition>) => void
    setDefault: () => void
}

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
        "$timeout",
        "store",
        function ($timeout: ITimeoutService, store: StoreService) {
            const ctrl = this as ExtendedCqpTermController

            ctrl.valfilter = valfilter

            ctrl.$onInit = () => {
                store.watch("corpus", () => updateAttributes())
                store.watch("parallel_corpora", () => updateAttributes())
                // React on the date interval attribute becoming available
                getTimeData().then(() => updateAttributes())
            }

            ctrl.localChange = (term) => {
                Object.assign(ctrl.term, term)
                ctrl.change()
            }

            /** Update list of available attributes */
            async function updateAttributes() {
                // TODO: respect the setting 'wordAttributeSelector' and similar
                if (!settings.corpusListing.selected.length) return

                // The date interval attribute is not available until time data is ready
                if (ctrl.term.type == "date_interval") await getTimeData()

                $timeout(() => {
                    // Get available attribute options
                    ctrl.types = settings.corpusListing.getAttributeGroupsExtended(ctrl.parallellLang)

                    // Map attribute options by name. Prefix with `_.` for struct attrs for use in CQP.
                    ctrl.typeMapping = Object.fromEntries(ctrl.types.map((item) => [valfilter(item), item]))

                    // Reset attribute if the selected one is no longer available
                    if (!ctrl.typeMapping[ctrl.term.type]) ctrl.term.type = ctrl.types[0].value

                    ctrl.opts = getOpts()

                    // Reset option if the selected one is no longer available
                    if (!ctrl.opts.find((pair) => pair[1] === ctrl.term.op)) ctrl.setDefault()
                })
            }

            function getOpts(): [string, OperatorKorp][] {
                const option = ctrl.typeMapping[ctrl.term.type]

                if (!option) {
                    console.error(`Attribute option missing for "${ctrl.term.type}"`, ctrl.typeMapping)
                    return Object.entries(settings["default_options"])
                }

                // Clone to avoid modifying original
                const ops = { ...(option.opts || settings["default_options"]) }

                // For multi-value attributes, use the "contains" CQP operators for equality
                if (option.type === "set") {
                    if (ops.is == "=") ops.is = "contains"
                    if (ops.is_not == "!=") ops.is_not = "not contains"
                }

                // Return as tuples
                return Object.entries(ops)
            }

            ctrl.setDefault = function () {
                // assign the first value from the opts
                ctrl.opts = getOpts()
                ctrl.term.op = ctrl.opts[0]?.[1] || "="

                ctrl.term.val = ""
                ctrl.change()
            }
        },
    ],
})
