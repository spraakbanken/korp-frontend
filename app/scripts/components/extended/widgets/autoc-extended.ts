/** @format */
import { html, regescape, unregescape } from "@/util"
import { WidgetScope, WidgetWithOptions } from "./common"
import "@/components/autoc"

export type AutocExtendedOptions = {
    type?: string
    error_on_empty?: boolean
}

type AutocExtendedScope = WidgetScope & {
    isRawInput: boolean
    onChange: (output: string, isRawOutput: boolean) => void
}

export const autocExtended: WidgetWithOptions<AutocExtendedOptions> = (options) => ({
    template: html`<autoc
        input="input"
        is-raw-input="isRawInput"
        type="${options.type || "lemgram"}"
        on-change="onChange(output, isRawOutput)"
        error-on-empty="${options["error_on_empty"]}"
        error-message="choose_value"
    ></autoc>`,
    controller: [
        "$scope",
        function ($scope: AutocExtendedScope) {
            if ($scope.model) {
                $scope.input = unregescape($scope.model)
                $scope.isRawInput = false
            }

            $scope.onChange = (output, isRawOutput) => {
                if (!isRawOutput) {
                    $scope.model = regescape(output)
                }
            }
        },
    ],
})
