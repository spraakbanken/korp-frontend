var statisticsFormatting = {}

statisticsFormatting.getCqp = function(types, hitValue, ignoreCase) {
    var tokenLists = statisticsFormatting.splitHitValue(hitValue);

    var totalQuery = []

    // create one query part for each token
    for(var tokenIdx = 0; tokenIdx < tokenLists[0][0].length; tokenIdx++) {

        var andParts = []
        // for each reduce attribute: create a query part and then join all with &
        for(var typeIdx = 0; typeIdx < types.length; typeIdx++) {
            var type = types[typeIdx];
            var elems = _.map(tokenLists, function(tokenList) {
                return tokenList[typeIdx][tokenIdx];
            });
            andParts.push(statisticsFormatting.reduceCqp(type, _.unique(elems), ignoreCase));
        }
        totalQuery.push("[" + andParts.join(" & ") + "]");
    }
    return totalQuery.join(" ");
}

// Get the cqp (part of) expression for linking in the statistics table
// input type [{type:?,value:? }]
statisticsFormatting.reduceCqp = function(type, tokens, ignoreCase) {

    if(!tokens) {
        return "";
    }
    switch(type) {
        case "saldo":
        case "prefix":
        case "suffix":
        case "lex":
        case "lemma":
        case "sense":
            if(tokens[0] == "|")
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
        default: // structural attributes
            return $.format('_.%s="%s"', [type, tokens[0]]);
    }
};

statisticsFormatting.reduceStatisticsPieChart = function(row, cell, value, columnDef, dataContext) {
    if(value != "&Sigma;") {
        value = value[0].replace(/(:.+?)(\/|$| )/g, "$2");
    }
    return $.format('<img id="circlediagrambutton__%s" src="img/stats2.png" class="arcDiagramPicture"/>', value);
};

statisticsFormatting.splitHitValue = function(hitValue) {
    return _.map(hitValue, function(val) {
        return _.map(val.split('/'), function(as) {
            return as.split(" ");
        });
    });
};

statisticsFormatting.reduceStatistics = function(types, ignoreCase, corpora) {

    return function(row, cell, value, columnDef, dataContext) {

        if(value == "&Sigma;")
            return "&Sigma;";

        var tokenLists = statisticsFormatting.splitHitValue(value);

        var typeIdx = types.indexOf(columnDef.id);
        var linkInnerHTML = statisticsFormatting.reduceStringify(columnDef.id, tokenLists[0][typeIdx], corpora);

        var output = $("<span>",
            {
            "class": "statistics-link",
            "data-row": '' + row
            }).html(linkInnerHTML).outerHTML();

        return output;
    }
};

statisticsFormatting.getTexts = function(reduceVals, hitValue, corpora) {
    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
    
    var tokenLists = statisticsFormatting.splitHitValue(hitValue);
    return _.map(reduceVals, function (reduceVal, typeIdx) {
        return htmlToPlaintext(statisticsFormatting.reduceStringify(reduceVal, tokenLists[0][typeIdx], corpora))
    });
}


// Get the html (no linking) representation of the result for the statistics table
statisticsFormatting.reduceStringify = function(type, values, corpora) {
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
                if(token == "|")
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
            var cl = settings.corpusListing.subsetFactory(corpora)
            var attrObj = cl.getStructAttrs()[type]
            var prefix = ""
            if(!_.isUndefined(attrObj) && attrObj.translationKey )
                prefix = attrObj.translationKey
            var mapped = _.map(values, function (value) {
                if(value === "") {
                    return "-";
                } else if(loc_data["en"][prefix + value]) {
                    return util.getLocaleString(prefix + value);
                } else {
                    return value;
                }
            });
            return mapped.join(" ");
    }

};


