import { html } from "@/util"
import { selectController, Widget } from "./common"

/**
 * Autocomplete. Gets values from "attr_values"-command.
 * Use the following settings in the corpus:
 * - escape: boolean (true by default), set to false to prevent escaping regexp value
 */
export const structServiceAutocomplete: Widget = {
    template: html`<div>
        <input
            type="text"
            size="37"
            ng-model="input"
            typeahead-min-length="0"
            typeahead-input-formatter="typeaheadInputFormatter($model)"
            uib-typeahead="tuple[0] as tuple[1] for tuple in getRows($viewValue)"
        />
        <i ng-if="loading" class="fa-solid fa-spinner fa-pulse w-fit"></i>
    </div>`,
    controller: selectController(true),
}
