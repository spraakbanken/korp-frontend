import angular, { type IComponentController } from "angular"
import { html } from "@/util"

/**
 * A checkbox whose `indeterminate` state can be controlled via attribute.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/:indeterminate
 */
angular.module("korpApp").component("checkboxTernary", {
    template: html`<input type="checkbox" ng-checked="$ctrl.state != 'unchecked'" />`,
    bindings: {
        state: "<",
    },
    controller: [
        "$element",
        function ($element: JQuery) {
            const $ctrl = this as CheckboxTernaryController

            $ctrl.$onChanges = () => {
                $element.find("input").prop("indeterminate", $ctrl.state == "indeterminate")
            }
        },
    ],
})

type CheckboxTernaryController = IComponentController & {
    state: "checked" | "unchecked" | "indeterminate"
}
