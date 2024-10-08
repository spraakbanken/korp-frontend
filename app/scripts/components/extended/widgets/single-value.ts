/** @format */

import { html } from "@/util"
import { Widget, WidgetScope } from "./common"

type SingleValueScope = WidgetScope & {
    dataset: Record<string, string>
}

/**
 * Puts the first value from a dataset parameter into model
 */
export const singleValue: Widget = {
    template: html`<input type="hidden" />`,
    controller: [
        "$scope",
        function ($scope: SingleValueScope) {
            $scope.model = Object.values($scope.dataset)[0]
        },
    ],
}
