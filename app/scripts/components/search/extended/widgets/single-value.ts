import { html } from "@/util"
import { Widget, WidgetScope } from "./common"
import { ITimeoutService } from "angular"

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
        "$timeout",
        function ($scope: SingleValueScope, $timeout: ITimeoutService) {
            $timeout(() => {
                $scope.model = $scope.attr.dataset ? Object.values($scope.attr.dataset)[0] : "-"
            })
        },
    ],
}
