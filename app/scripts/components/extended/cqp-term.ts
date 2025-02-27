/** @format */
import angular, { IController, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html, valfilter } from "@/util"
const minusImage = require("../../../img/minus.png")
import "@/components/extended/cqp-value"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { Condition, OperatorKorp } from "@/cqp_parser/cqp.types"
import { AttributeOption } from "@/corpus_listing"
import { getTimeData } from "@/timedata"

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
    parallellLang: string
    removeOr: () => void
    change: () => void
    types: AttributeOption[]
    typeMapping: Record<string, AttributeOption>
    opts: [string, OperatorKorp][] | undefined
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
        "$location",
        "$rootScope",
        "$timeout",
        function ($location: LocationService, $rootScope: RootScope, $timeout: ITimeoutService) {
            const ctrl = this as ExtendedCqpTermController

            ctrl.valfilter = valfilter

            ctrl.$onInit = () => {
                $rootScope.$on("corpuschooserchange", () => $timeout(updateAttributes))
                $rootScope.$watch(
                    () => $location.search().parallel_corpora,
                    () => $timeout(updateAttributes)
                )
                // React on the date interval attribute becoming available
                getTimeData().then(() => $timeout(updateAttributes))

                updateAttributes()
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

                // Get available attribute options
                ctrl.types = settings.corpusListing
                    .getAttributeGroups("union", ctrl.parallellLang)
                    .filter((item) => !item["hide_extended"])

                // Map attribute options by name. Prefix with `_.` for struct attrs for use in CQP.
                ctrl.typeMapping = _.fromPairs(
                    ctrl.types.map((item) => [item["is_struct_attr"] ? `_.${item.value}` : item.value, item])
                )

                // Reset attribute if the selected one is no longer available
                if (!ctrl.typeMapping[ctrl.term.type]) ctrl.term.type = ctrl.types[0].value

                ctrl.opts = getOpts()
            }

            const getOpts = () => getOptsMemo(ctrl.term.type)

            // returning new array each time kills angular, hence the memoizing
            const getOptsMemo = _.memoize((type: string): [string, OperatorKorp][] | undefined => {
                if (!(type in ctrl.typeMapping)) return

                const option = ctrl.typeMapping[type]
                if (!option) {
                    console.error(`Attribute option missing for "${type}"`, ctrl.typeMapping)
                    return
                }

                const ops: Record<string, OperatorKorp> = { ...(option?.opts || settings["default_options"]) }

                // For multi-value attributes, use the "contains" CQP operator for equality
                if (option.type === "set") ops.is = "contains"

                return _.toPairs(ops)
            })

            ctrl.setDefault = function () {
                // assign the first value from the opts
                ctrl.opts = getOpts()

                // TODO Correct? Was "is" before
                ctrl.term.op = ctrl.opts?.[0]?.[1] || "="

                ctrl.term.val = ""
                ctrl.change()
            }
        },
    ],
})
