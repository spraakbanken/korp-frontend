/** @format */
import statemachine from "./statemachine"

let stringifyFunctions = {}

try {
    stringifyFunctions = require("custom/stringify.js").default
} catch (error) {
    console.log("No module for stringify functions available")
}

export function stringify(key, value) {
    return stringifyFunctions[key] ? stringifyFunctions[key](value) : value
}

export function stringifyFunc(attrName) {
    return (value) => stringify(attrName, value)
}
