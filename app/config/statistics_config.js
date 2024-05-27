/** @format */
import _ from "lodash"
import settings from "@/settings"
import { lemgramToHtml, regescape, saldoToHtml } from "@/util"
import { locAttribute } from "@/i18n"

let customFunctions = {}

try {
    customFunctions = require("custom/statistics.js").default
} catch (error) {
    console.log("No module for statistics functions available")
}

export function getCqp(hitValues, ignoreCase) {
    const positionalAttributes = ["word", ...Object.keys(settings.corpusListing.getCurrentAttributes())]
    let hasPositionalAttributes = false

    var tokens = []
    for (var i = 0; i < hitValues.length; i++) {
        var token = hitValues[i]
        var andExpr = []
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

function reduceCqp(type, tokens, ignoreCase) {
    let attrs = settings.corpusListing.getCurrentAttributes()
    if (attrs[type] && attrs[type].stats_cqp) {
        // A stats_cqp function should call regescape for the value as appropriate
        return customFunctions[attrs[type].stats_cqp](tokens, ignoreCase)
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
            else var res
            if (tokens.length > 1) {
                var key = tokens[0].split(":")[0]

                var variants = []
                _.map(tokens, function (val) {
                    const parts = val.split(":")
                    if (variants.length == 0) {
                        for (var idx = 0; idx < parts.length - 1; idx++) variants.push([])
                    }
                    for (var idx = 1; idx < parts.length; idx++) variants[idx - 1].push(parts[idx])
                })

                variants = _.map(variants, function (variant) {
                    return ":(" + variant.join("|") + ")"
                })

                res = key + variants.join("")
            } else {
                res = tokens[0]
            }
            return type + " contains '" + res + "'"
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
export function reduceStringify(type, values, structAttributes) {
    let attrs = settings.corpusListing.getCurrentAttributes()

    if (attrs[type] && attrs[type].stats_stringify) {
        return customFunctions[attrs[type].stats_stringify](values)
    }

    switch (type) {
        case "word":
        case "msd":
            return values.join(" ")
        case "pos":
            var output = _.map(values, function (token) {
                return locAttribute(attrs["pos"].translation, token)
            }).join(" ")
            return output
        case "saldo":
        case "prefix":
        case "suffix":
        case "lex":
        case "lemma":
        case "sense":
            if (type == "saldo" || type == "sense") {
                var stringify = saldoToHtml
            } else if (type == "lemma") {
                stringify = (lemma) => lemma.replace(/_/g, " ")
            } else {
                stringify = lemgramToHtml
            }

            var html = _.map(values, function (token) {
                if (token === "") return "–"
                return stringify(token.replace(/:.*/g, ""), true)
            })

            return html.join(" ")

        case "transformer-neighbour":
            return values.map((value) => value.replace(/:.*/g, "")).join(" ")

        case "deprel":
            var output = _.map(values, function (token) {
                return locAttribute(attrs["deprel"].translation, token)
            }).join(" ")
            return output
        case "msd_orig": // TODO: OMG this is corpus specific, move out to config ASAP (ASU corpus)
            var output = _.map(values, function (token) {
                return $("<span>").text(token).outerHTML()
            }).join(" ")
            return output
        default:
            if (attrs[type]) {
                // word attributes
                return values.join(" ")
            } else {
                // structural attributes
                var mapped = _.map(values, function (value) {
                    if (structAttributes["set"] && value === "") {
                        return "–"
                    } else if (value === "") {
                        return "-"
                    } else if (structAttributes.translation) {
                        return locAttribute(structAttributes.translation, value)
                    } else {
                        return value
                    }
                })
                return mapped.join(" ")
            }
    }
}
