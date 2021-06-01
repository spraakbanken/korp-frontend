/** @format */
let getCqp = function(hitValues, ignoreCase) {
    var tokens = []
    for (var i = 0; i < hitValues.length; i++) {
        var token = hitValues[i]
        var andExpr = []
        for (var attribute in token) {
            if (token.hasOwnProperty(attribute)) {
                var values = token[attribute]
                andExpr.push(reduceCqp(attribute, values, ignoreCase))
            }
        }
        tokens.push("[" + andExpr.join(" & ") + "]")
    }
    return "(" + tokens.join(" ") + ")"
}

let reduceCqp = function(type, tokens, ignoreCase) {
    let attrs = settings.corpusListing.getCurrentAttributes()
    if (attrs[type] && attrs[type].stats_cqp) {
        return attrs[type].stats_cqp(tokens, ignoreCase)
    }
    switch (type) {
        case "saldo":
        case "prefix":
        case "suffix":
        case "lex":
        case "lemma":
        case "sense":
            if (tokens[0] === "") return "ambiguity(" + type + ") = 0"
            else var res
            if (tokens.length > 1) {
                var key = tokens[0].split(":")[0]

                var variants = []
                _.map(tokens, function(val) {
                    parts = val.split(":")
                    if (variants.length == 0) {
                        for (var idx = 0; idx < parts.length - 1; idx++) variants.push([])
                    }
                    for (var idx = 1; idx < parts.length; idx++) variants[idx - 1].push(parts[idx])
                })

                variants = _.map(variants, function(variant) {
                    return ":(" + variant.join("|") + ")"
                })

                res = key + variants.join("")
            } else {
                res = tokens[0]
            }
            return type + " contains '" + res + "'"
        case "word":
            let s = 'word="' + regescape(tokens[0]) + '"'
            if (ignoreCase) s = s + " %c"
            return s
        case "pos":
        case "deprel":
        case "msd":
            return $.format('%s="%s"', [type, tokens[0]])
        case "text_blingbring":
        case "text_swefn":
            return $.format('_.%s contains "%s"', [type, tokens[0]])
        default:
            // assume structural attribute
            return $.format('_.%s="%s"', [type, tokens[0]])
    }
}

// Get the html (no linking) representation of the result for the statistics table
let reduceStringify = function(type, values, structAttributes) {
    let attrs = settings.corpusListing.getCurrentAttributes()
    if (attrs[type] && attrs[type].stats_stringify) {
        return attrs[type].stats_stringify(values)
    }

    switch (type) {
        case "word":
        case "msd":
            return values.join(" ")
        case "pos":
            var output = _.map(values, function(token) {
                return util.translateAttribute(null, attrs["pos"].translation, token)
            }).join(" ")
            return output
        case "saldo":
        case "prefix":
        case "suffix":
        case "lex":
        case "lemma":
        case "sense":
            if (type == "saldo" || type == "sense") {
                var stringify = util.saldoToString
            } else if (type == "lemma") {
                stringify = lemma => lemma.replace(/_/g, " ")
            } else {
                stringify = util.lemgramToString
            }

            var html = _.map(values, function(token) {
                if (token === "") return "–"
                return stringify(token.replace(/:.*/g, ""), true)
            })

            return html.join(" ")

        case "deprel":
            var output = _.map(values, function(token) {
                return $("<span>")
                    .localeKey("deprel_" + token)
                    .outerHTML()
            }).join(" ")
            return output
        case "msd_orig": // TODO: OMG this is corpus specific, move out to config ASAP (ASU corpus)
            var output = _.map(values, function(token) {
                return $("<span>")
                    .text(token)
                    .outerHTML()
            }).join(" ")
            return output
        default:
            // structural attributes            
            var mapped = _.map(values, function(value) {
                if (structAttributes["set"] && value === "") {
                    return "–"
                } else if (value === "") {
                    return "-"
                } else if (structAttributes.translation) {
                    return util.translateAttribute(null, structAttributes.translation, value)
                } else {
                    return value
                }
            })
            return mapped.join(" ")
    }
}

export default {
    getCqp,
    reduceStringify
}
