/** @format */
import { html, regescape, unregescape } from "@/util"
import "@/components/autoc"

export const autocExtended = (options) => ({
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
        function ($scope) {
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
