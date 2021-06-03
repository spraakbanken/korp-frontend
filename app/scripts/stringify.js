import { stringifyFunctions } from "custom/stringify_functions.js"

// TODO document and name properly

export function stringify(attrName, value) {
    // TODO ideally we should just fetch the attribute
    let attrs = _.extend({}, settings.corpusListing.getCurrentAttributes(), settings.corpusListing.getStructAttrs())
    const key = attrs[attrName].stringify
    return stringifyFunctions[key] ? stringifyFunctions[key](value) : value
}

export function stringifyFunc(attrName) {
    return (value) => stringify(attrName, value)
}