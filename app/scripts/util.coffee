folderImg = require "../img/folder.png"
korpIconImg = require "../img/korp_icon.png"
jRejectBackgroundImg = require "../img/browsers/background_browser.gif"
require "../img/browsers/browser_chrome.gif"
require "../img/browsers/browser_firefox.gif"
require "../img/browsers/browser_safari.gif"
require "../img/browsers/browser_opera.gif"

window.util = {}


class window.CorpusListing
    constructor: (corpora) ->
        @struct = corpora
        @corpora = _.values(corpora)
        @selected = _.filter @corpora, (corp) -> not corp.limitedAccess

    get: (key) ->
        @struct[key]

    list: ->
        @corpora

    map: (func) ->
        _.map @corpora, func

    subsetFactory : (idArray) ->
        #returns a new CorpusListing instance from an id subset.
        idArray = _.invokeMap(idArray, "toLowerCase")
        cl = new CorpusListing _.pick @struct, idArray...
        cl.selected = cl.corpora
        return cl

    # only applicable for parallel corpora
    getReduceLang: ->
        return

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

    getCurrentAttributes: (lang) -> # lang not used here, only in parallel mode
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
            for key, value of corpus.structAttributes
                value["isStructAttr"] = true

            corpus.structAttributes
        )
        @_mapping_intersection attrs


    getStructAttrs: ->
        attrs = @mapSelectedCorpora((corpus) ->
            for key, value of corpus.structAttributes
                value["isStructAttr"] = true

            # if a position attribute is declared as structural, include here
            pos_attrs = _.pickBy corpus.attributes, (val, key) ->
                val.isStructAttr
            _.extend {}, pos_attrs, corpus.structAttributes
        )
        rest = @_invalidateAttrs(attrs)

        # TODO this code merges datasets from attributes with the same name and
        # should be moved to the code for extended controller "datasetSelect"
        withDataset = _.filter(_.toPairs(rest), (item) ->
            item[1].dataset
        )
        $.each withDataset, (i, item) ->
            key = item[0]
            val = item[1]
            $.each attrs, (j, origStruct) ->
                if origStruct[key]?.dataset
                    ds = origStruct[key].dataset
                    ds = _.zipObject(ds, ds) if $.isArray(ds)

                    val.dataset = (_.zipObject val.dataset, val.dataset) if _.isArray val.dataset
                    $.extend val.dataset, ds

        $.extend rest, _.fromPairs withDataset
        # End TODO

    getDefaultFilters: () ->
        return @_getFilters "intersection", "defaultFilters"

    getCurrentFilters: () ->
        return @_getFilters settings.filterSelection, "showFilters"

    _getFilters: (selection, filterType) ->
        attrNames = []
        attrs = {}

        for corpus in @selected
            if filterType of corpus
                for filter in corpus[filterType]
                    if filter not in attrNames
                        attrNames.push filter
                    if filter not of attrs
                        attrs[filter] =
                            settings: corpus.structAttributes[filter]
                            corpora: [corpus.id]
                    else
                        attrs[filter].corpora.push corpus.id


        if selection is "intersection"
            attrNames2 = []
            attrs2 = {}
            corpusCount = @selected.length
            for attr in attrNames
                if attrs[attr].corpora.length is corpusCount
                    attrNames2.push attr
                    attrs2[attr] = attrs[attr]
            attrNames = attrNames2
            attrs = attrs2

        return [attrNames, attrs]

    _invalidateAttrs: (attrs) ->
        union = @_mapping_union(attrs)
        intersection = @_mapping_intersection(attrs)
        $.each union, (key, value) ->
            unless intersection[key]?
                value["disabled"] = true
            else
                delete value["disabled"]

        union

    # returns true if coprus has all attrs, else false
    corpusHasAttrs: (corpus, attrs) ->
        for attr in attrs
            unless attr == "word" or attr of $.extend({}, @struct[corpus].attributes, @struct[corpus].structAttributes)
                return false
        return true

    stringifySelected: ->
        _.map(@selected, "id").map((a) -> a.toUpperCase()).join ","

    stringifyAll: ->
        _.map(@corpora, "id").map((a) -> a.toUpperCase()).join ","

    getWithinKeys: () ->
        struct = _.map(@selected, (corpus) ->
            _.keys corpus.within
        )
        _.union struct...

    getContextQueryString: (prefer, avoid) ->
        output = for corpus in @selected
            contexts = _.keys corpus.context
            if prefer not in contexts
                if contexts.length > 1 and avoid in contexts
                    contexts.splice (contexts.indexOf avoid), 1
                corpus.id.toUpperCase() + ":" + contexts[0]
        return _(output).compact().join()

    getWithinParameters: () ->
        defaultWithin = locationSearch().within or _.keys(settings.defaultWithin)[0]

        output = for corpus in @selected
            withins = _.keys corpus.within
            if defaultWithin not in withins
                corpus.id.toUpperCase() + ":" + withins[0]
        within = _(output).compact().join()
        return { defaultwithin : defaultWithin, within : within }

    getTimeInterval : ->
        all = _(@selected)
            .map("time")
            .filter((item) -> item?)
            .map(_.keys)
            .flatten()
            .map(Number)
            .sort((a, b) ->
                a - b
            ).value()


        return [_.first(all), _.last(all)]


    getMomentInterval : () ->
        toUnix = (item) -> item.unix()

        infoGetter = (prop) =>
            return _(@selected)
            .map("info")
            .map(prop)
            .compact()
            .map((item) -> moment(item))
            .value()



        froms = infoGetter("FirstDate")
        tos = infoGetter("LastDate")

        unless froms.length
            from = null
        else
            from = _.minBy froms, toUnix
        unless tos.length
            to = null
        else
            to = _.maxBy tos, toUnix

        [from, to]


    getNonProtected : () ->
        _.filter @corpora, (item) ->
            not item.limitedAccess

    getTitle : (corpus) ->
        try
            @struct[corpus].title
        catch e
            c.log "gettitle broken", corpus


    getWordGroup : (withCaseInsentive) ->
        word =
            group : "word"
            value : "word"
            label : "word"
        if withCaseInsentive
            wordInsensitive =
                group : "word"
                value : "word_insensitive"
                label : "word_insensitive"
            return [word, wordInsensitive]
        else
            return [word]

    getWordAttributeGroups : (lang, setOperator) ->
        if setOperator == 'union'
            allAttrs = @getCurrentAttributes(lang)
        else
            allAttrs = @getCurrentAttributesIntersection()

        attrs = for key, obj of allAttrs when obj.displayType != "hidden"
                    _.extend({group : "word_attr", value : key}, obj)
        return attrs

    getStructAttributeGroups : (lang, setOperator) ->
        if setOperator == 'union'
            allAttrs = @getStructAttrs(lang)
        else
            allAttrs = @getStructAttrsIntersection(lang)

        common_keys = _.compact _.flatten _.map @selected, (corp) -> _.keys corp.common_attributes
        common = _.pick settings.commonStructTypes, common_keys...

        sentAttrs = for key, obj of (_.extend {}, common, allAttrs) when obj.displayType != "hidden"
                         _.extend({group : "sentence_attr", value : key}, obj)

        sentAttrs = _.sortBy sentAttrs, (item) ->
            util.getLocaleString(item.label)

        return sentAttrs

    getAttributeGroups : (lang) ->
        words = @getWordGroup false
        attrs = @getWordAttributeGroups lang, 'union'
        sentAttrs = @getStructAttributeGroups lang, 'union'
        return words.concat attrs, sentAttrs

    getStatsAttributeGroups : (lang) ->
        words = @getWordGroup true

        wordOp = settings.reduceWordAttributeSelector or "union"
        attrs = @getWordAttributeGroups lang, wordOp

        structOp = settings.reduceStructAttributeSelector or "union"
        sentAttrs = @getStructAttributeGroups lang, structOp

        return words.concat attrs, sentAttrs


class window.ParallelCorpusListing extends CorpusListing
    constructor: (corpora, activeLangs) ->
        super(corpora)
        @setActiveLangs(activeLangs)

    select: (idArray) ->
        @selected = []
        $.each idArray, (i, id) =>
            corp = @struct[id]
            @selected = @selected.concat(@getLinked(corp, true, false))

        @selected = _.uniq @selected

    setActiveLangs : (langlist) ->
        @activeLangs = langlist

    getReduceLang : () ->
        return @activeLangs[0]

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
            $.extend {}, a.structAttributes, b.structAttributes
        , {})
        $.each struct, (key, val) ->
            val["isStructAttr"] = true

        struct

    getStructAttrsIntersection: (lang) ->
        corpora = _.filter(@selected, (item) ->
            item.lang is lang
        )
        attrs = _.map corpora, (corpus) ->
            for key, value of corpus.structAttributes
                value["isStructAttr"] = true

            corpus.structAttributes
        @_mapping_intersection attrs

    getLinked : (corp, andSelf=false, only_selected=true) ->
        target = if only_selected then @selected else @struct
        output = _.filter target, (item) ->
            item.id in (corp.linkedTo or [])
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
                    cps.id in mainCorpus.linkedTo
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


    getWithinParameters : ->
        defaultWithin = locationSearch().within or _.keys(settings.defaultWithin)[0]
        within = @getAttributeQuery("within")
        return {defaultwithin : defaultWithin, within : within}



    stringifySelected : (onlyMain) ->

        struct = @getLinksFromLangs(@activeLangs)
        if onlyMain
            struct = _.map struct, (pair) =>
                _.filter pair, (item) =>
                    item.lang == @activeLangs[0]


            return _.map(_.flatten(struct), "id").map((a) -> a.toUpperCase()).join ","
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

# TODO never use this, remove when sure it is not used
window.search = (obj, val) ->
    window.locationSearch obj, val


window.locationSearch = (obj, val) ->
    s = $("body").scope()

    ret = safeApply s.$root, () ->
        unless obj then return s.$root.locationSearch()
        if _.isObject obj
            obj = _.extend {}, s.$root.locationSearch(), obj
            s.$root.locationSearch(obj)
        else
            s.$root.locationSearch(obj, val)

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

    $.when.apply($, defs).then () ->
        def.resolve loc_data

    return def


window.safeApply = (scope, fn) ->
    if (scope.$$phase || scope.$root.$$phase) then fn(scope) else scope.$apply(fn)

window.util.setLogin = () ->
    for corp in authenticationProxy.loginObj.credentials
        $("#hpcorpus_#{corp.toLowerCase()}")
            .closest(".boxdiv.disabled").removeClass("disabled")
    if window.corpusChooserInstance
        window.corpusChooserInstance.corpusChooser "updateAllStates"
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

util.getLocaleString = (key, lang) ->
    return util.getLocaleStringUndefined(key, lang) or key


util.getLocaleStringUndefined = (key, lang) ->
    unless lang
        lang = window.lang or settings.defaultLanguage or "sv"
    try
        return loc_data[lang][key]
    catch e
        return undefined


util.localize = (root) ->
    root = root or "body"
    $(root).localize()
    return

util.lemgramToString = (lemgram, appendIndex) ->
    lemgram = _.trim(lemgram)
    infixIndex = ""
    concept = lemgram
    infixIndex = ""
    type = ""
    if util.isLemgramId(lemgram)
        match = util.splitLemgram(lemgram)
        infixIndex = $.format("<sup>%s</sup>", match.index) if appendIndex? and match.index isnt "1"
        concept = match.form.replace(/_/g, " ")
        type = match.pos.slice(0, 2)
    return $.format "%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", [
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

util.saldoToPlaceholderString = (saldoId, appendIndex) ->
    match = saldoId.match(util.saldoRegExp)
    infixIndex = ""
    infixIndex = $.format(" (%s)", match[2]) if appendIndex? and match[2] isnt "1"
    $.format "%s%s", [
        match[1].replace(/_/g, " ")
        infixIndex
    ]

util.lemgramRegexp = /\.\.\w+\.\d\d?(\:\d+)?$/
util.isLemgramId = (lemgram) ->
    lemgram.search(util.lemgramRegexp) isnt -1

util.splitLemgram = (lemgram) ->
    unless util.isLemgramId(lemgram)
        throw new Error("Input to util.splitLemgram is not a lemgram: " + lemgram)
    keys = ["morph", "form", "pos", "index", "startIndex"]
    splitArray = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d\d?)(\:\d+)?$/).slice(2)
    _.zipObject keys, splitArray

# Add download links for other formats, defined in
# settings.downloadFormats (Jyrki Niemi <jyrki.niemi@helsinki.fi>
# 2014-02-26/04-30)

util.setDownloadLinks = (xhr_settings, result_data) ->
    # If some of the required parameters are null, return without
    # adding the download links.
    if ! (xhr_settings? and result_data? and
            result_data.corpus_order? and result_data.kwic?)
        c.log 'failed to do setDownloadLinks'
        return

    if result_data.hits == 0
        $('#download-links').hide()
        return

    $('#download-links').show()

    # Get the number (index) of the corpus of the query result hit
    # number hit_num in the corpus order information of the query
    # result.
    get_corpus_num = (hit_num) ->
        result_data.corpus_order.indexOf result_data.kwic[hit_num].corpus

    c.log 'setDownloadLinks data:', result_data
    $('#download-links').empty()
    # Corpora in the query result
    result_corpora = result_data.corpus_order.slice(
        get_corpus_num(0), get_corpus_num(result_data.kwic.length - 1) + 1)
    # Settings of the corpora in the result, to be passed to the
    # download script
    result_corpora_settings = {}
    i = 0
    while i < result_corpora.length
        corpus_ids = result_corpora[i].toLowerCase().split('|')
        j = 0
        while j < corpus_ids.length
            corpus_id = corpus_ids[j]
            result_corpora_settings[corpus_id] = settings.corpora[corpus_id]
            j++
        i++
    $('#download-links').append("<option value='init' rel='localize[download_kwic]'></option>")
    i = 0
    while i < settings.downloadFormats.length
        format = settings.downloadFormats[i]
        # NOTE: Using attribute rel="localize[...]" to localize the
        # title attribute requires a small change to
        # lib/jquery.localize.js. Without that, we could use
        # util.getLocaleString, but it would not change the
        # localizations immediately when switching languages but only
        # after reloading the page.
        # # title = util.getLocaleString('formatdescr_' + format)
        option = $ """
            <option
                value="#{format}"
                title="#{util.getLocaleString('formatdescr_' + format)}"
                class="download_link">#{format.toUpperCase()}</option>
            """

        download_params =
            query_params: JSON.stringify(
                $.deparam.querystring(xhr_settings.url))
            format: format
            korp_url: window.location.href
            korp_server_url: settings.korpBackendURL
            corpus_config: JSON.stringify(result_corpora_settings)
            corpus_config_info_keys: [
                'metadata'
                'licence'
                'homepage'
                'compiler'
            ].join(',')
            urn_resolver: settings.urnResolver
        if 'downloadFormatParams' of settings
            if '*' of settings.downloadFormatParams
                $.extend download_params, settings.downloadFormatParams['*']
            if format of settings.downloadFormatParams
                $.extend download_params, settings.downloadFormatParams[format]
        option.appendTo('#download-links').data("params", download_params)
        i++
    $('#download-links').off "change"
    $('#download-links').localize().click(false).change (event) ->
        params = $(":selected", this).data("params")
        unless params then return
        $.generateFile settings.downloadCgiScript, params
        self = $(this)
        setTimeout( () ->
            self.val("init")
        , 1000)

    return

util.searchHash = (type, value) ->
    locationSearch
        search: type + "|" + value
        page: 0

    return

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

# Helper function to turn "8455999" into "8 455 999"
util.prettyNumbers = (numstring) ->
    regex = /(\d+)(\d{3})/
    outStrNum = numstring.toString()
    outStrNum = outStrNum.replace(regex, "$1" + "<span rel=\"localize[util_numbergroupseparator]\">" + util.getLocaleString("util_numbergroupseparator") + "</span>" + "$2") while regex.test(outStrNum)

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
            baseLang = settings.corpora[corpusID]?.linkedTo
            if baseLang
                lang = " (" + util.getLocaleString(settings.corpora[corpusID].lang) + ")"
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
                <img class="popup_icon" src="#{korpIconImg}" />
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
            output += $("<div>").localeKey("corpselector_limited").html() if corpusObj.limitedAccess
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
            "<b><img src=\"" + folderImg + "\" style=\"margin-right:4px; vertical-align:middle; margin-top:-1px\"/>" + indata.title + "</b><br/><br/>" + maybeInfo + "<b>" + corporaID.length + "</b> " + glueString + ":<br/><br/><b>" + util.prettyNumbers(totalTokens.toString()) + "</b> " + util.getLocaleString("corpselector_tokens") + "<br/><b>" + totalSentencesString + "</b> " + util.getLocaleString("corpselector_sentences")
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

window.unregescape = (s) ->
    s.replace /\\/g, ""

util.formatDecimalString = (x, mode, statsmode, stringOnly) ->
    if _.includes(x, ".")
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

util.browserWarn = ->
    $.reject
        reject:
            msie5: true
            msie6: true
            msie7: true
            msie8: true
            msie9: true

        imagePath: _.split(jRejectBackgroundImg, "/").slice(0,-1).join("/")
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

window.__ = {}
window.__.remove = (arr, elem) ->
    index = arr.indexOf elem
    if index isnt -1
        arr.splice (arr.indexOf elem), 1
