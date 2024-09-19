/** @format */
import merge from "lodash/merge"
import { autocExtended } from "./autoc-extended"
import { WidgetDefinition } from "./common"
import { datasetSelect } from "./dataset-select"
import { dateInterval } from "./date-interval"
import { defaultWidget } from "./default"
import { singleValue } from "./single-value"
import { structServiceAutocomplete } from "./struct-service-autocomplete"
import { structServiceSelect } from "./struct-service-select"

const customWidgets: Record<string, WidgetDefinition> = {}
try {
    Object.assign(customWidgets, require("custom/extended.js").default)
} catch (error) {
    console.log("No module for extended components available")
}

const coreWidgets: Record<string, WidgetDefinition> = {
    autocExtended,
    datasetSelect,
    dateInterval,
    default: defaultWidget,
    singleValue,
    structServiceSelect,
    structServiceAutocomplete,
}

export default merge(coreWidgets, customWidgets)
