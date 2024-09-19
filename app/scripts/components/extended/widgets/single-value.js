/** @format */

import { html } from "@/util"

/**
 * Puts the first value from a dataset parameter into model
 */
export const singleValue = {
    template: html`<input type="hidden" />`,
    controller: [
        "$scope",
        function ($scope) {
            $scope.model = Object.values($scope.dataset)[0]
        },
    ],
}
