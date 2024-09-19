/** @format */
import { html } from "@/util"
import { selectController } from "./common"

/**
 * Autocomplete. Gets values from "struct_values"-command.
 * Use the following settings in the corpus:
 * - escape: boolean, will be used by the escaper-directive
 */
export const structServiceAutocomplete = {
    template: html`<div>
        <input
            type="text"
            size="37"
            ng-model="input"
            escaper
            typeahead-min-length="0"
            typeahead-input-formatter="typeaheadInputFormatter($model)"
            uib-typeahead="tuple[0] as tuple[1] for tuple in getRows($viewValue)"
        />
        <i ng-if="loading" class="fa-solid fa-spinner fa-pulse w-fit"></i>
    </div>`,
    controller: selectController(true),
}
