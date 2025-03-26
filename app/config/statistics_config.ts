/** @format */
import _ from "lodash"
import settings from "@/settings"
import { lemgramToHtml, regescape, saldoToHtml } from "@/util"
import { locAttribute } from "@/i18n"
import { CorpusListing } from "@/corpus_listing"

type Stringifier = (tokens: string[], ignoreCase?: boolean) => string

let customFunctions: Record<string, Stringifier> = {}

try {
    customFunctions = require("custom/statistics.js").default
} catch (error) {
    console.log("No module for statistics functions available")
}

export function getCqp(hitValues: Record<string, string[]>[], ignoreCase: boolean): string {
    const positionalAttributes = ["word", ...Object.keys(settings.corpusListing.getCurrentAttributes())]
    let hasPositionalAttributes = false

    var tokens: string[] = []
    for (var i = 0; i < hitValues.length; i++) {
        var token = hitValues[i]
        var andExpr: string[] = []
        for (var attribute in token) {
            if (token.hasOwnProperty(attribute)) {
                var values = token[attribute]
                andExpr.push(reduceCqp(attribute, values, ignoreCase))
            }

            // Flag if any of the attributes is positional
            if (positionalAttributes.includes(attribute)) hasPositionalAttributes = true
        }
        tokens.push("[" + andExpr.join(" & ") + "]")
    }

    // If reducing by structural attributes only, then `hitValues` has only the first match token,
    // so allow any number of subsequent tokens in the match.
    if (!hasPositionalAttributes) tokens.push("[]{0,}")

    return `<match> ${tokens.join(" ")} </match>`
}

function reduceCqp(type: string, tokens: string[], ignoreCase: boolean): string {
    let attrs = settings.corpusListing.getCurrentAttributes()
    if (attrs[type] && attrs[type].stats_cqp) {
        // A stats_cqp function should call regescape for the value as appropriate
        return customFunctions[attrs[type].stats_cqp!](tokens, ignoreCase)
    }
    tokens = _.map(tokens, (val) => regescape(val))
    switch (type) {
        case "saldo":
        case "prefix":
        case "suffix":
        case "lex":
        case "lemma":
        case "sense":
        case "transformer-neighbour":
            if (tokens[0] === "") return "ambiguity(" + type + ") = 0"
            let res: string
            if (tokens.length > 1) {
                var key = tokens[0].split(":")[0]

                const variants: string[][] = []
                _.map(tokens, function (val) {
                    const parts = val.split(":")
                    if (variants.length == 0) {
                        for (var idx = 0; idx < parts.length - 1; idx++) variants.push([])
                    }
                    for (var idx = 1; idx < parts.length; idx++) variants[idx - 1].push(parts[idx])
                })

                const variantsJoined = variants.map((variant) => ":(" + variant.join("|") + ")")
                res = key + variantsJoined.join("")
            } else {
                res = tokens[0]
            }
            return `${type} contains '${res}'`
        case "word":
            let s = 'word="' + tokens[0] + '"'
            if (ignoreCase) s = s + " %c"
            return s
        case "pos":
        case "deprel":
        case "msd":
            return `${type}="${tokens[0]}"`
        case "text_blingbring":
        case "text_swefn":
            return `_.${type} contains "${tokens[0]}"`
        default:
            if (attrs[type]) {
                // word attributes
                const op = attrs[type]["type"] === "set" ? " contains " : "="
                return `${type}${op}"${tokens[0]}"`
            } else {
                // structural attributes
                return `_.${type}="${tokens[0]}"`
            }
    }
}

// Get the html (no linking) representation of the result for the statistics table
export function reduceStringify(name: string, cl?: CorpusListing): (values: string[]) => string {
    cl ??= settings.corpusListing
    const attrs = cl.getCurrentAttributes()
    const structAttrs = cl.getStructAttrs()
    const attr = attrs[name] || structAttrs[name]

    // Use named stringifier from custom config code
    if (attr?.stats_stringify) return customFunctions[attr.stats_stringify]

    const transforms: ((token: string) => string)[] = []

    if (attr?.ranked) transforms.push((token) => token.replace(/:.*/g, ""))
    if (attr?.translation) transforms.push((token) => locAttribute(attr.translation, token))

    if (["prefix", "suffix", "lex"].includes(name)) transforms.push((token) => lemgramToHtml(token, true))
    else if (name == "saldo" || name == "sense") transforms.push((token) => saldoToHtml(token, true))
    else if (name == "lemma") transforms.push((lemma) => lemma.replace(/_/g, " "))

    // TODO This is specific to ASU corpus, move out to config
    if (name == "msd_orig") transforms.push((token) => ($("<span>").text(token) as any).outerHTML())

    const transform = (value: string) => transforms.reduce((acc, f) => f(acc), value)
    // Join with spaces and then squash redundant and surrounding space.
    return (values) => values.map(transform).join(" ").trim().replace(/\s+/g, " ")
}
