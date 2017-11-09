var statisticsFormattingModule = function() {
    getCqp = function(hitValues, ignoreCase) {
        var asdf = [];
        for(var i = 0; i < hitValues.length; i++) {
            var token = hitValues[i];
            var qwerty = [];
            for (var attribute in token) {
                if (token.hasOwnProperty(attribute)) {
                    var values = token[attribute];
                    qwerty.push(reduceCqp(attribute, values, ignoreCase));
                }
            }
            asdf.push("[" + qwerty.join(" & ") + "]")
        }
        return asdf.join(" ")
    }

    reduceCqp = function(type, tokens, ignoreCase) {
        switch(type) {
            case "saldo":
            case "prefix":
            case "suffix":
            case "lex":
            case "lemma":
            case "sense":
                // TODO: remove the "|" case when backend is updated to return "" instead of "|"
                if(tokens[0] === "" || tokens[0] === "|")
                    return "ambiguity(" + type + ") = 0";
                else
                    var res;
                    if(tokens.length > 1) {
                        var key = tokens[0].split(":")[0];
                        
                        var variants = []
                        _.map(tokens, function(val) {
                            parts = val.split(":")
                            if(variants.length == 0) {
                                for(var idx = 0; idx < parts.length - 1; idx++)
                                    variants.push([]);
                            }
                            for(var idx = 1; idx < parts.length; idx++)
                                variants[idx - 1].push(parts[idx]);
                        });

                        variants = _.map(variants, function(variant) {
                            return ":(" + variant.join("|") + ")"
                        });
                        
                        res = key + variants.join("")
                    }
                    else {
                        res = tokens[0];
                    }
                    return type + " contains '" + res + "'";
            case "word":
                s = 'word="'+ regescape(tokens[0]) + '"';
                if(ignoreCase)
                    s = s + ' %c'
                return s
            case "pos":
            case "deprel":
            case "msd":
                return $.format('%s="%s"', [type, tokens[0]]);
            default:
                if(type == "text_blingbring" || type == "text_swefn") {
                    return $.format('_.%s contains "%s"', [type, tokens[0]]);
                } else {
                    return $.format('_.%s="%s"', [type, tokens[0]]);
                }
        }
    };

    // Get the html (no linking) representation of the result for the statistics table
    reduceStringify = function(type, values, structAttributes) {
        switch(type) {
            case "word":
            case "msd":
                return values.join(" ");
            case "pos":
                var output =  _.map(values, function(token) {
                    return $("<span>")
                    .localeKey("pos_" + token)
                    .outerHTML()
                }).join(" ");
                return output;
            case "saldo":
            case "prefix":
            case "suffix":
            case "lex":
            case "lemma":
            case "sense":
                if(type == "saldo" || type == "sense")
                    stringify = util.saldoToString
                else if(type == "lemma")
                    stringify = function(lemma) {return lemma.replace(/_/g, " ")}
                else
                    stringify = util.lemgramToString

                var html = _.map(values, function(token) {
                    // TODO: remove the "|" case when backend is updated to return "" instead of "|"
                    if(token === "" || token === "|")
                        return "–";
                    return stringify(token.replace(/:.*/g, ""), true);
                });

                return html.join(" ")

            case "deprel":
                var output =  _.map(values, function(token) {
                    return $("<span>")
                    .localeKey("deprel_" + token)
                    .outerHTML()
                }).join(" ");
                return output;
            default: // structural attributes
                var prefix = ""
                if(structAttributes.translationKey)
                    prefix = structAttributes.translationKey
                var mapped = _.map(values, function (value) {
                    // TODO: remove the "|" case when backend is updated to return "" instead of "|"
                    if (structAttributes["set"] && (value === "" || value === "|")) {
                        return "–"; 
                    } else if(value === "") {
                        return "-";
                    } else if(loc_data["en"][prefix + value]) {
                        return util.getLocaleString(prefix + value);
                    } else {
                        return value;
                    }
                });
                return mapped.join(" ");
        }
    }
    
    return {
        getCqp: getCqp,
        reduceStringify: reduceStringify
    }
};

statisticsFormatting = statisticsFormattingModule();
