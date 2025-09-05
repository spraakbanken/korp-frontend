import { selectController, selectTemplate, Widget } from "./common"

/**
 * Select-element. Gets values from "attr_values"-command.
 * Use the following settings in the corpus:
 * - escape: boolean (true by default), set to false to prevent escaping regexp value
 */
export const structServiceSelect: Widget = {
    template: selectTemplate,
    controller: selectController(false),
}
