/** @format */

let stringifyFunctions = {}

try {
    stringifyFunctions = require("custom/stringify.js").default
} catch (error) {
    console.log("No module for stringify functions available")
}

export function stringify(attrName, value) {
    // TODO ideally we should just fetch the attribute
    let attrs = _.extend({}, settings.corpusListing.getCurrentAttributes(), settings.corpusListing.getStructAttrs())
    const key = attrs[attrName].stringify
    return stringifyFunctions[key] ? stringifyFunctions[key](value) : value
}

export function stringifyFunc(attrName) {
    return (value) => stringify(attrName, value)
}
