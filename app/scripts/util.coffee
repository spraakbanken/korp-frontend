window.util = {}


class window.CorpusListing
    constructor: (corpora) ->
        @struct = corpora
        @corpora = _.values(corpora)
        @selected = _.filter @corpora, (corp) -> not corp.limited_access

    get: (key) ->
        @struct[key]

    list: ->
        @corpora

    map: (func) ->
        _.map @corpora, func

    subsetFactory : (idArray) ->
        #returns a new CorpusListing instance from an id subset.
        idArray = _.invoke(idArray, "toLowerCase")
        cl = new CorpusListing _.pick @struct, idArray...
        cl.selected = cl.corpora
        return cl


    # Returns an array of all the selected corpora's IDs in uppercase
    getSelectedCorpora: ->
        corpusChooserInstance.corpusChooser "selectedItems"

    select: (idArray) ->
        @selected = _.values(_.pick.apply(this, [@struct].concat(idArray)))

    mapSelectedCorpora: (f) ->
        _.map @selected, f


    # takes an array of mapping objs and returns their intersection
    _mapping_intersection: (mappingArray) ->

        _.reduce mappingArray, ((a, b) ->
            keys_intersect = _.intersection (_.keys a), (_.keys b)
            to_mergea = _.pick a, keys_intersect...
            to_mergeb = _.pick b, keys_intersect...
            _.merge {}, to_mergea, to_mergeb
        ) or {}

    _mapping_union: (mappingArray) ->
        _.reduce mappingArray, ((a, b) ->
            _.merge a, b
        ), {}

    getCurrentAttributes: ->
        attrs = @mapSelectedCorpora((corpus) ->
            corpus.attributes
        )
        @_invalidateAttrs attrs

    getCurrentAttributesIntersection : () ->
        attrs = @mapSelectedCorpora((corpus) ->
            corpus.attributes
        )

        @_mapping_intersection attrs

    getStructAttrsIntersection: () ->
        attrs = @mapSelectedCorpora((corpus) ->
            for key, value of corpus.struct_attributes
                value["isStructAttr"] = true

            corpus.struct_attributes
        )
        @_mapping_intersection attrs

    
    getStructAttrs: ->
        attrs = @mapSelectedCorpora((corpus) ->
            for key, value of corpus.struct_attributes
                value["isStructAttr"] = true

            corpus.struct_attributes
        )
        rest = @_invalidateAttrs(attrs)

        # fix for combining dataset values
        withDataset = _.filter(_.pairs(rest), (item) ->
            item[1].dataset
        )
        $.each withDataset, (i, item) ->
            key = item[0]
            val = item[1]
            $.each attrs, (j, origStruct) ->
                if origStruct[key]?.dataset
                    ds = origStruct[key].dataset
                    ds = _.object(ds, ds) if $.isArray(ds)
                    $.extend val.dataset, ds


        $.extend rest, _.object(withDataset)

    _invalidateAttrs: (attrs) ->
        union = @_mapping_union(attrs)
        intersection = @_mapping_intersection(attrs)
        $.each union, (key, value) ->
            unless intersection[key]?
                value["disabled"] = true
            else
                delete value["disabled"]

        union

    corpusHasAttr: (corpus, attr) ->
        attr of $.extend({}, @struct[corpus].attributes, @struct[corpus].struct_attributes)

    stringifySelected: ->
        _(@selected).pluck("id").invoke("toUpperCase").join ","

    stringifyAll: ->
        _(@corpora).pluck("id").invoke("toUpperCase").join ","

    getAttrIntersection: (attr) ->
        struct = _.map(@selected, (corpus) ->
            _.keys corpus[attr]
        )
        _.intersection.apply null, struct

    getAttrUnion: (attr) ->
        struct = _.map(@selected, (corpus) ->
            _.keys corpus[attr]
        )
        _.union struct...

    getContextQueryString: (prefer) ->
        output = for corpus in @selected
            contexts = _.keys(corpus.context)

            # if prefer in contexts and prefer not of settings.defaultContext
            #     corpus.id.toUpperCase() + ":" + prefer

            for context in contexts
                if context and context not of settings.defaultContext
                    corpus.id.toUpperCase() + ":" + context
                else
                    false

        _(output).flatten().compact().join()



    getWithinQueryString: ->
        output = for corpus in @selected
            withins = _.keys(corpus.within)
            for within in withins
                if within and within not of settings.defaultWithin
                    corpus.id.toUpperCase() + ":" + within
                else
                    false

        _(output).flatten().compact().join()

    getMorphology: ->
        _(@selected).map((corpus) ->
            morf = corpus.morf or "saldom"
            morf.split "|"
        ).flatten().unique().join "|"

    getTimeInterval : ->
        all = _(@selected)
            .pluck("time")
            .filter((item) -> item?)
            .map(_.keys)
            .flatten()
            .map(Number)
            .sort((a, b) ->
                a - b
            ).value()


        return [_.first(all), _.last(all)]

    getNonProtected : () ->
        _.filter @corpora, (item) ->
            not item.limited_access

    getTitle : (corpus) ->
        try
            @struct[corpus].title
        catch e
            c.log "gettitle broken", corpus 
        


    getAttributeGroups : (lang) ->
        word =
            group : "word"
            value : "word"
            label : "word"
        
        attrs = for key, obj of @getCurrentAttributes(lang) when obj.displayType != "hidden"
            _.extend({group : "word_attr", value : key}, obj)

        common_keys = _.compact _.flatten _.map @selected, (corp) -> _.keys corp.common_attributes
        common = _.pick settings.common_struct_types, common_keys...

        sent_attrs = for key, obj of (_.extend {}, common, @getStructAttrs(lang)) when obj.displayType != "hidden"
            _.extend({group : "sentence_attr", value : key}, obj)

        sent_attrs = _.sortBy sent_attrs, (item) ->
            util.getLocaleString(item.label)

        return [word].concat(attrs, sent_attrs)



class window.ParallelCorpusListing extends CorpusListing
    constructor: (corpora) ->
        super(corpora)

    select: (idArray) ->
        @selected = []
        $.each idArray, (i, id) =>
            corp = @struct[id]
            @selected = @selected.concat(@getLinked(corp, true, false))

        @selected = _.unique @selected

    setActiveLangs : (langlist) ->
        @activeLangs = langlist


    getCurrentAttributes: (lang) ->
        corpora = _.filter(@selected, (item) ->
            item.lang is lang
        )
        struct = _.reduce(corpora, (a, b) ->
            $.extend {}, a.attributes, b.attributes
        , {})
        struct

    getStructAttrs: (lang) ->
        corpora = _.filter(@selected, (item) ->
            item.lang is lang
        )
        struct = _.reduce(corpora, (a, b) ->
            $.extend {}, a.struct_attributes, b.struct_attributes
        , {})
        $.each struct, (key, val) ->
            val["isStructAttr"] = true

        struct

    getLinked : (corp, andSelf=false, only_selected=true) ->
        target = if only_selected then @selected else @struct
        output = _.filter target, (item) ->
            item.id in (corp.linked_to or [])
        output = [corp].concat output if andSelf
        output

    getEnabledByLang : (lang, andSelf=false, flatten=true) ->
        corps = _.filter @selected, (item) ->
            item["lang"] == lang
        output = _(corps).map((item) =>
            @getLinked item, andSelf
        ).value()

        if flatten then (_.flatten output) else output


    getLinksFromLangs : (activeLangs) ->
        if activeLangs.length == 1
            return @getEnabledByLang(activeLangs[0], true, false)
        # get the languages that are enabled given a list of active languages
        main = _.filter @selected, (corp) ->
            corp.lang == activeLangs[0]

        output = []
        for lang in activeLangs[1..]
            other = _.filter @selected, (corp) ->
                corp.lang == lang

            for cps in other
                linked = _(main).filter((mainCorpus) ->
                    cps.id in mainCorpus.linked_to
                ).value()

                output = output.concat _.map linked, (item) -> [item, cps]

        output


    getAttributeQuery : (attr) ->
      
      #gets the within and context queries

      struct = @getLinksFromLangs(@activeLangs)
      output = []
      $.each struct, (i, corps) ->

        mainId = corps[0].id.toUpperCase()
        mainIsPivot = !!corps[0].pivot

        other = corps.slice(1)

        pair = _.map(other, (corp) ->
            if mainIsPivot
                a = _.keys(corp[attr])[0]
            else
                a = _.keys(corps[0][attr])[0]
            mainId + "|" + corp.id.toUpperCase() + ":" + a
        )
        output.push pair

      output.join ","

    getContextQueryString: ->
        @getAttributeQuery("context")

    getWithinQueryString: ->
        @getAttributeQuery("within")


    stringifySelected : (onlyMain) ->

        struct = @getLinksFromLangs(@activeLangs)
        if onlyMain
            struct = _.map struct, (pair) =>
                _.filter pair, (item) =>
                    c.log "item.lang", item.lang
                    item.lang == @activeLangs[0]


            return _(struct).flatten().pluck("id").invoke("toUpperCase").join ","
        c.log("struct", struct)

        output = []
        # $.each(struct, function(i, item) {
        for item, i in struct
            main = item[0]

            pair = _.map item.slice(1), (corp) ->
                main.id.toUpperCase() + "|" + corp.id.toUpperCase()

            output.push(pair)
        return output.join(",")


    getTitle : (corpus) ->
        @struct[corpus.split("|")[1]].title



settings.corpusListing = new CorpusListing(settings.corpora)



window.applyTo = (ctrl, f) ->
    s = getScope(ctrl)
    s.$apply f(s)

window.search = (obj, val) ->
    s = $("body").scope()

    # ret = s.$root.$apply () ->
    ret = safeApply s.$root, () ->
        unless obj then return s.$root.search()
        if _.isObject obj
            obj = _.extend {}, s.$root.search(), obj
            s.$root.search(obj)
        else
            s.$root.search(obj, val)

    onHashChange() if val == null
    return ret



window.initLocales = () ->
    packages = ["locale", "corpora"]
    prefix = "translations"
    defs = []
    window.loc_data = {}
    def = $.Deferred()
    for lang in settings.languages
        loc_data[lang] = {}
        for pkg in packages
            do (lang, pkg) ->
                file = pkg + "-" + lang + '.json'
                file = prefix + "/" + file
                defs.push $.ajax
                    url : file,
                    dataType : "json",
                    cache : false,
                    success : (data) -> 
                        _.extend loc_data[lang], data
                        # $.localize.data[lang][pkg] = data;
                        # $.extend($.localize.data[lang]["_all"], data);

    $.when.apply($, defs).then () ->
        def.resolve loc_data

    return def


window.safeApply = (scope, fn) ->
    if (scope.$$phase || scope.$root.$$phase) then fn(scope) else scope.$apply(fn)

window.util.setLogin = () ->
    $("body").toggleClass("logged_in not_logged_in")
    
    # $.each authenticationProxy.loginObj.credentials, (i, item) ->
    for corp in authenticationProxy.loginObj.credentials
        $("#hpcorpus_#{corp.toLowerCase()}")
            .closest(".boxdiv.disabled").removeClass("disabled")
    if window.corpusChooserInstance
        window.corpusChooserInstance.corpusChooser "updateAllStates"

    $("#log_out .usrname").text(authenticationProxy.loginObj.name)
    $(".err_msg", self).hide()



util.SelectionManager = ->
    @selected = $()
    @aux = $()
    return

util.SelectionManager::select = (word, aux) ->
    return if not word? or not word.length
    if @selected.length
        @selected.removeClass "word_selected token_selected"
        @aux.removeClass "word_selected aux_selected"
    @selected = word
    @aux = aux or $()
    @aux.addClass "word_selected aux_selected"
    word.addClass "word_selected token_selected"

util.SelectionManager::deselect = ->
    return unless @selected.length
    @selected.removeClass "word_selected token_selected"
    @selected = $()
    @aux.removeClass "word_selected aux_selected"
    @aux = $()
    return

util.SelectionManager::hasSelected = ->
    @selected.length > 0

util.getLocaleString = (key) ->
    # lang = (if $("body").scope() then $("body").scope().lang or "sv" else "sv")
    lang = search().lang or settings.defaultLanguage or "sv"
    output = loc_data[lang][key] if loc_data and loc_data[lang]
    return key if not output? and key?
    output


util.localize = (root) ->
    root = root or "body"
    $(root).localize()
    return

util.lemgramToString = (lemgram, appendIndex) ->
    lemgram = _.str.trim(lemgram)
    infixIndex = ""
    if util.isLemgramId(lemgram)
        match = util.splitLemgram(lemgram)
        infixIndex = $.format("<sup>%s</sup>", match.index) if appendIndex? and match.index isnt "1"
        concept = match.form.replace(/_/g, " ")
        type = match.pos.slice(0, 2)
    else # missing from saldo, and has the form word_NN instead.
        concept = ""
        type = ""
        try
            concept = lemgram.split("_")[0]
            type = lemgram.split("_")[1].toLowerCase()
        catch e
            c.log "lemgramToString broken for ", lemgram
    $.format "%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", [
        concept
        infixIndex
        type
        util.getLocaleString(type)
    ]

util.saldoRegExp = /(.*?)\.\.(\d\d?)(\:\d+)?$/
util.saldoToString = (saldoId, appendIndex) ->
    match = saldoId.match(util.saldoRegExp)
    infixIndex = ""
    infixIndex = $.format("<sup>%s</sup>", match[2]) if appendIndex? and match[2] isnt "1"
    $.format "%s%s", [
        match[1].replace(/_/g, " ")
        infixIndex
    ]

util.sblexArraytoString = (idArray, labelFunction) ->
    labelFunction = labelFunction or util.lemgramToString
    return _.map idArray, (lemgram) -> labelFunction lemgram, true

    # TODO: remove this if all is well with the lemgram dropdown
    # tempArray = $.map(idArray, (lemgram) ->
    #     labelFunction lemgram, false
    # )
    # out = $.map idArray, (lemgram) ->
    #     isAmbigous = $.grep(tempArray, (tempLemgram) ->
    #         tempLemgram is labelFunction(lemgram, false)
    #     ).length > 1
    #     labelFunction lemgram, isAmbigous
    # return out


util.lemgramRegexp = /\.\.\w+\.\d\d?(\:\d+)?$/
util.isLemgramId = (lemgram) ->
    lemgram.search(util.lemgramRegexp) isnt -1

util.splitLemgram = (lemgram) ->
    unless util.isLemgramId(lemgram)
        throw new Error("Input to util.splitLemgram is not a lemgram: " + lemgram)
    keys = ["morph", "form", "pos", "index", "startIndex"]
    splitArray = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d\d?)(\:\d+)?$/).slice(2)
    _.object keys, splitArray

util.splitSaldo = (saldo) ->
    saldo.match util.saldoRegExp

util.setJsonLink = (settings) ->
    unless settings?
        c.log "failed to update json link"
        return
    $("#json-link").attr "href", settings.url
    $("#json-link").show()
    return

util.searchHash = (type, value) ->
    search
        search: type + "|" + value
        page: 0

    return

# $(window).trigger("hashchange")
added_corpora_ids = []
util.loadCorporaFolderRecursive = (first_level, folder) ->
    outHTML = undefined
    if first_level
        outHTML = "<ul>"
    else
        outHTML = "<ul title=\"" + folder.title + "\" description=\"" + escape(folder.description) + "\">"
    if folder #This check makes the code work even if there isn't a ___settings.corporafolders = {};___ in config.js
        # Folders
        $.each folder, (fol, folVal) ->
            outHTML += "<li>" + util.loadCorporaFolderRecursive(false, folVal) + "</li>" if fol isnt "contents" and fol isnt "title" and fol isnt "description"
            return
        
        # Corpora
        if folder["contents"] and folder["contents"].length > 0
            $.each folder.contents, (key, value) ->
                outHTML += "<li id=\"" + value + "\">" + settings.corpora[value]["title"] + "</li>"
                added_corpora_ids.push value
                return

    if first_level
        
        # Add all corpora which have not been added to a corpus
        for val of settings.corpora
            cont = false
            for usedid of added_corpora_ids
                if added_corpora_ids[usedid] is val or settings.corpora[val].hide
                    cont = true
            continue if cont
            
            # Add it anyway:
            outHTML += "<li id='#{val}'>#{settings.corpora[val].title}</li>"
    outHTML += "</ul>"
    outHTML

# Helper function to turn 1.2345 into 1,2345 (locale dependent)
# Use "," instead of "." if Swedish, if mode is
# Split the string into two parts

#return x.replace(".",'<span rel="localize[util_decimalseparator]">' + decimalSeparator + '</span>');

#return x.replace(".", decimalSeparator);

# Helper function to turn "8455999" into "8 455 999" 
util.prettyNumbers = (numstring) ->
    regex = /(\d+)(\d{3})/
    outStrNum = numstring.toString()
    outStrNum = outStrNum.replace(regex, "$1" + "<span rel=\"localize[util_numbergroupseparator]\">" + util.getLocaleString("util_numbergroupseparator") + "</span>" + "$2")  while regex.test(outStrNum)
    outStrNum

util.suffixedNumbers = (num) ->
    out = ""
    if num < 1000 # 232
        out = num.toString()
    else if 1000 <= num < 1e6 # 232,21K
        out = (num/1000).toFixed(2).toString() + "K"
    else if 1e6 <= num < 1e9 # 232,21M
        out = (num/1e6).toFixed(2).toString() + "M"
    else if 1e9 <= num < 1e12 # 232,21G
        out = (num/1e9).toFixed(2).toString() + "G"
    else if 1e12 <= num # 232,21T
        out = (num/1e12).toFixed(2).toString() + "T"
    return out.replace(".","<span rel=\"localize[util_decimalseparator]\">" + util.getLocaleString("util_decimalseparator") + "</span>")

# Goes through the settings.corporafolders and recursively adds the settings.corpora hierarchically to the corpus chooser widget 
util.loadCorpora = ->
    added_corpora_ids = []
    outStr = util.loadCorporaFolderRecursive(true, settings.corporafolders)
    window.corpusChooserInstance = $("#corpusbox").corpusChooser(
        template: outStr
        infoPopup: (corpusID) ->
            corpusObj = settings.corpora[corpusID]
            maybeInfo = ""
            maybeInfo = "<br/><br/>" + corpusObj.description if corpusObj.description
            numTokens = corpusObj.info.Size
            baseLang = settings.corpora[corpusID]?.linked_to
            if baseLang
                lang = " (" + util.getLocaleString(settings.corpora[corpusID].lang) + ")"
                #baseLangTag = " (" + settings.corpora[baseLang].lang + ")"
                baseLangTokenHTML = """#{util.getLocaleString("corpselector_numberoftokens")}: <b>#{util.prettyNumbers(settings.corpora[baseLang].info.Size)}
                </b> (#{util.getLocaleString(settings.corpora[baseLang].lang)})<br/>
                """
                baseLangSentenceHTML = """#{util.getLocaleString("corpselector_numberofsentences")}: <b>#{util.prettyNumbers(settings.corpora[baseLang].info.Sentences)}
                </b> (#{util.getLocaleString(settings.corpora[baseLang].lang)})<br/>
                """
            else
                lang = ""
                baseLangTokenHTML = ""
                baseLangSentenceHTML = ""

            numSentences = corpusObj["info"]["Sentences"]
            lastUpdate = corpusObj["info"]["Updated"]
            lastUpdate = "?" unless lastUpdate
            sentenceString = "-"
            sentenceString = util.prettyNumbers(numSentences.toString()) if numSentences
            
            output = """
            <b>
                <img class="popup_icon" src="img/korp_icon.png" />
                #{corpusObj.title}
            </b>
            #{maybeInfo}
            <br/><br/>#{baseLangTokenHTML}
            #{util.getLocaleString("corpselector_numberoftokens")}:
            <b>#{util.prettyNumbers(numTokens)}</b>#{lang}
            <br/>#{baseLangSentenceHTML}
            #{util.getLocaleString("corpselector_numberofsentences")}: 
            <b>#{sentenceString}</b>#{lang}
            <br/>
            #{util.getLocaleString("corpselector_lastupdate")}: 
            <b>#{lastUpdate}</b>
            <br/><br/>"""
            
            supportsContext = _.keys(corpusObj.context).length > 1
            output += $("<div>").localeKey("corpselector_supports").html() + "<br>" if supportsContext
            output += $("<div>").localeKey("corpselector_limited").html() if corpusObj.limited_access
            output

        infoPopupFolder: (indata) ->
            corporaID = indata.corporaID
            desc = indata.description
            totalTokens = 0
            totalSentences = 0
            missingSentenceData = false
            $(corporaID).each (key, oneID) ->
                totalTokens += parseInt(settings.corpora[oneID]["info"]["Size"])
                oneCorpusSentences = settings.corpora[oneID]["info"]["Sentences"]
                if oneCorpusSentences
                    totalSentences += parseInt(oneCorpusSentences)
                else
                    missingSentenceData = true
                return

            totalSentencesString = util.prettyNumbers(totalSentences.toString())
            totalSentencesString += "+" if missingSentenceData
            maybeInfo = ""
            maybeInfo = desc + "<br/><br/>" if desc and desc isnt ""
            glueString = ""
            if corporaID.length is 1
                glueString = util.getLocaleString("corpselector_corporawith_sing")
            else
                glueString = util.getLocaleString("corpselector_corporawith_plur")
            "<b><img src=\"img/folder.png\" style=\"margin-right:4px; vertical-align:middle; margin-top:-1px\"/>" + indata.title + "</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + util.prettyNumbers(totalTokens.toString()) + "</b> " + util.getLocaleString("corpselector_tokens") + "<br/><b>" + totalSentencesString + "</b> " + util.getLocaleString("corpselector_sentences")
    ).bind("corpuschooserchange", (evt, corpora) ->
        c.log "corpuschooserchange", corpora
        
        # c.log("corpus changed", corpora);
        safeApply $("body").scope(), (scope) ->
            scope.$broadcast "corpuschooserchange", corpora
            return

        return
    )
    selected = corpusChooserInstance.corpusChooser("selectedItems")
    settings.corpusListing.select selected
    return

window.regescape = (s) ->
    s.replace /[\.|\?|\+|\*|\|\'|\"\(\)\^\$]/g, "\\$&"

util.localizeFloat = (float, nDec) ->
    lang = $("#languages").radioList("getSelected").data("lang")
    sep = null
    nDec = nDec or float.toString().split(".")[1].length
    if lang is "sv"
        sep = ","
    else sep = "." if lang is "en"
    $.format("%." + nDec + "f", float).replace ".", sep

util.formatDecimalString = (x, mode, statsmode, stringOnly) ->
    if _.contains(x, ".")
        parts = x.split(".")
        decimalSeparator = util.getLocaleString("util_decimalseparator")
        return parts[0] + decimalSeparator + parts[1] if stringOnly
        if mode
            util.prettyNumbers(parts[0]) + "<span rel=\"localize[util_decimalseparator]\">" + decimalSeparator + "</span>" + parts[1]
        else
            util.prettyNumbers(parts[0]) + decimalSeparator + parts[1]
    else
        if statsmode
            x
        else
            util.prettyNumbers x

util.makeAttrSelect = (groups) ->
    arg_select = $("<select/>")
    $.each groups, (lbl, group) ->
        return if $.isEmptyObject(group)
        optgroup = $("<optgroup/>",
            label: util.getLocaleString(lbl).toLowerCase()
            rel: $.format("localize[%s]", lbl)
        ).appendTo(arg_select)
        $.each group, (key, val) ->
            return if val.displayType is "hidden"
            $("<option/>",
                rel: $.format("localize[%s]", val.label)
            ).val(key).text(util.getLocaleString(val.label) or "").appendTo(optgroup).data "dataProvider", val
            return

        return

    arg_select

util.browserWarn = ->
    $.reject
        reject:
            
            # all : false,
            msie5: true
            msie6: true
            msie7: true
            msie8: true
            msie9: true

        imagePath: "img/browsers/"
        display: [
            "firefox"
            "chrome"
            "safari"
            "opera"
        ]
        browserInfo: # Settings for which browsers to display
            firefox:
                text: "Firefox" # Text below the icon
                url: "http://www.mozilla.com/firefox/" # URL For icon/text link

            safari:
                text: "Safari"
                url: "http://www.apple.com/safari/download/"

            opera:
                text: "Opera"
                url: "http://www.opera.com/download/"

            chrome:
                text: "Chrome"
                url: "http://www.google.com/chrome/"

            msie:
                text: "Internet Explorer"
                url: "http://www.microsoft.com/windows/Internet-explorer/"

        header: "Du använder en omodern webbläsare" # Header of pop-up window
        paragraph1: "Korp använder sig av moderna webbteknologier som inte stödjs av din webbläsare. En lista på de mest populära moderna alternativen visas nedan. Firefox rekommenderas varmt." # Paragraph 1
        paragraph2: "" # Paragraph 2
        closeMessage: "Du kan fortsätta ändå – all funktionalitet är densamma – men så fort du önskar att Korp vore snyggare och snabbare är det bara att installera Firefox, det tar bara en minut." # Message displayed below closing link
        closeLink: "Stäng varningen" # Text for closing link
        #   header: 'Did you know that your Internet Browser is out of date?', // Header of pop-up window
        #     paragraph1: 'Your browser is out of date, and may not be compatible with our website. A list of the most popular web browsers can be found below.', // Paragraph 1
        #     paragraph2: 'Just click on the icons to get to the download page', // Paragraph 2
        #     closeMessage: 'By closing this window you acknowledge that your experience on this website may be degraded', // Message displayed below closing link
        #     closeLink: 'Close This Window', // Text for closing link
        closeCookie: true # If cookies should be used to remmember if the window was closed (see cookieSettings for more options)
        # Cookie settings are only used if closeCookie is true
        cookieSettings:
            path: "/" # Path for the cookie to be saved on (should be root domain in most cases)
            expires: 100000 # Expiration Date (in seconds), 0 (default) means it ends with the current session

    return

util.convertLMFFeatsToObjects = (structure, key) ->
    
    # Recursively traverse a tree, expanding each "feat" array into a real object, with the key "feat-[att]":
    if structure?
        output = null
        theType = util.findoutType(structure)
        if theType is "object"
            output = {}
            $.each structure, (inkey, inval) ->
                if inkey is "feat"
                    innerType = util.findoutType(inval)
                    if innerType is "array"
                        $.each inval, (fkey, fval) ->
                            keyName = "feat_" + fval["att"]
                            if not output[keyName]?
                                output[keyName] = fval["val"]
                            else
                                if $.isArray(output[keyName])
                                    output[keyName].push fval["val"]
                                else
                                    output[keyName] = [output[keyName], fval["val"]]
                            return

                    else
                        keyName = "feat_" + inval["att"]
                        if not output[keyName]?
                            output[keyName] = inval["val"]
                        else
                            if $.isArray(output[keyName])
                                output[keyName].push inval["val"]
                            else
                                output[keyName] = [output[keyName], inval["val"]]
                else
                    output[inkey] = util.convertLMFFeatsToObjects(inval)
                return

        else if theType is "array"
            dArr = new Array()
            $.each structure, (inkey, inval) ->
                dArr.push util.convertLMFFeatsToObjects(inval)
                return

            output = dArr
        else
            output = structure
        output
    else
        null

util.findoutType = (variable) ->
    if $.isArray(variable)
        "array"
    else
        typeof (variable)


