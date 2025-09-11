export type Stringifier = <T = any>(input: T) => string

const stringifiers: Record<string, Stringifier> = {}

try {
    const custom = require("custom/stringify.js").default
    Object.assign(stringifiers, custom)
} catch (error) {
    console.log("No module for stringify functions available")
}

export function getStringifier(key?: string): Stringifier {
    return key && stringifiers[key] ? stringifiers[key] : String
}
