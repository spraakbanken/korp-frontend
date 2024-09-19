/** @format */
import { autocExtended } from "./autoc-extended"
import { datasetSelect } from "./dataset-select"
import { dateInterval } from "./date-interval"
import { defaultWidget } from "./default"
import { singleValue } from "./single-value"
import { structServiceAutocomplete } from "./struct-service-autocomplete"
import { structServiceSelect } from "./struct-service-select"

const customWidgets = {}
try {
    Object.assign(customWidgets, require("custom/extended.js").default)
} catch (error) {
    console.log("No module for extended components available")
}

const coreWidgets = {
    autocExtended,
    datasetSelect,
    dateInterval,
    default: defaultWidget,
    singleValue,
    structServiceSelect,
    structServiceAutocomplete,
}

export default _.merge(coreWidgets, customWidgets)
