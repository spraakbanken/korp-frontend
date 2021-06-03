import { stringifyFunctions } from "custom/stringify_functions.js"

// TODO document and name properly

function stringify(attrName, value) {
    return stringifyFunctions[attrName] ? stringifyFunctions[attrName](value) : value
}

export function stringifyFunc(attrName) {
    return (value) => stringify(attrName, value)
}