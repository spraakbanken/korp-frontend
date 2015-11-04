window.view = {}

#**************
# Search view objects
#**************
view.lemgramSort = (first, second) ->
    match1 = util.splitLemgram(first)
    match2 = util.splitLemgram(second)
    return parseInt(match1.index) - parseInt(match2.index) if match1.form is match2.form
    first.length - second.length

view.saldoSort = (first, second) ->
    match1 = util.splitSaldo(first)
    match2 = util.splitSaldo(second)
    return parseInt(match1[2]) - parseInt(match2[2]) if match1[1] is match2[1]
    first.length - second.length

view.updateSearchHistory = (value, href) ->
    filterParam = (url) ->
        $.grep($.param.fragment(url).split("&"), (item) ->
            item.split("=")[0] is "search" or item.split("=")[0] is "corpus"
        ).join "&"
    $("#search_history").empty()
    searches = $.jStorage.get("searches") or []
    searchLocations = $.map(searches, (item) ->
        filterParam item.location
    )
    if value? and filterParam(href) not in searchLocations
        searches.splice 0, 0,
            label: value
            location: href

        $.jStorage.set "searches", searches
    return unless searches.length
    opts = $.map(searches, (item) ->
        output = $("<option />", value: item.location)
        .text(item.label).get(0)
        output
    )
    placeholder = $("<option>").localeKey("search_history").get(0)
    clear = $("<option class='clear'>").localeKey("search_history_clear")

    $("#search_history").html(opts)
        .prepend(clear)
        .prepend(placeholder)


view.enableSearch = (bool) ->
    # TODO: revive this
    # if bool
    #     $("#search-tab").tabs("enable").removeClass("ui-state-disabled").uncover()
    # else
    #     $("#search-tab").tabs("disable").addClass("ui-state-disabled").cover()

view.initSearchOptions = ->
    selects = $("#search_options > div:first select").customSelect()
    # c.log "selects", selects
    view.updateReduceSelect()
    $("#search_options select").each ->
        state = search()[$(this).data("history")]

        if state
            $(this).val(state).change()
        else
            $(this).prop("selectedIndex", 0).change()

    $("#search_options").css("background-color", settings.primaryLight).change (event, isInit) ->
        # simpleSearch.enableSubmit()
        target = $(event.target)
        unless target.data("history") then return 
        state = {}
        state[target.data("history")] = target.val()
        unless target.prop("selectedIndex") is 0
            search state
        else
            if search()[target.data("history")]
                search target.data("history"), null

        if isInit is true
            search("search", null)


view.updateReduceSelect = ->
    cl = settings.corpusListing
    if (settings.reduce_word_attribute_selector or "union") == "union"
        word_attr = cl.getCurrentAttributes()
    else if settings.reduce_word_attribute_selector == "intersection"
        word_attr = cl.getCurrentAttributesIntersection()
    
    if (settings.reduce_struct_attribute_selector or "union") == "union"
        sentence_attr = cl.getStructAttrs()
    else if settings.reduce_struct_attribute_selector == "intersection"
        sentence_attr = cl.getStructAttrsIntersection()

    groups = $.extend(
        word:
            word:
                label: "word"

            word_insensitive:
                label: "word_insensitive"
    ,
        word_attr: word_attr
        sentence_attr: $.grepObj(sentence_attr, (val, key) ->
            #TODO: do i need this anymore?
            return false if val.displayType is "date_interval"
            return true
            # val.disabled isnt true
        )
    )
    prevVal = $("#reduceSelect select").val()
    select = util.makeAttrSelect(groups)
    $("#reduceSelect").html select
    c.log "updateReduceSelect", groups, select
    select.attr("data-history", "stats_reduce").attr("data-prefix", "reduce_text").customSelect()
    if prevVal
        select.val prevVal
        select.trigger "change"
    select

class BaseSearch
    constructor: (mainDivId, scope) ->
        @s = scope
        @$main = $(mainDivId)
        @$main.find("#sendBtn:submit").click $.proxy(@onSubmit, this)
        @_enabled = true

    refreshSearch: ->
        # $.bbq.removeState "search"
        search "search", null
        # search "page", null
        $(window).trigger "hashchange"

    onSubmit: ->
        @refreshSearch()

    isVisible: ->
        @$main.is ":visible"

    isEnabled: ->
        @_enabled

    enableSubmit: ->
        @_enabled = true
        @$main.find("#sendBtn").attr "disabled", false

    disableSubmit: ->
        @_enabled = false
        @$main.find("#sendBtn").attr "disabled", "disabled"


class view.SimpleSearch extends BaseSearch
    constructor: (mainDivId, _mainDiv, scope) ->
        super mainDivId, scope
        $("#similar_lemgrams").css "background-color", settings.primaryColor
        # $("#simple_text").keyup $.proxy(@onSimpleChange, this)
        $("#simple_text").keyup (event) =>
            @s.$apply () =>
                @onSimpleChange(event)
        # @onSimpleChange()
        $("#similar_lemgrams").hide()
        @savedSelect = null

        @lemgramProxy = new model.LemgramProxy()

        # [type, val] = search().search.split("|")

        # if type == "word"
            # TODO: bring back word to input field
            # input_field = val

        @s.autocSettings = { enableLemgramSuggestion : settings.autocomplete }

        $("#prefixChk, #suffixChk, #caseChk").click =>
            if $("#simple_text").attr("placeholder") and $("#simple_text").text() is ""
                @enableSubmit()
            else
                @onSimpleChange()

        # $("#keyboard").click ->
        #     c.log "click", arguments
        #     $("#char_table").toggle "slide",
        #         direction: "up"
        #     , "fast"

        # $("#char_table td").click ->
        #     $("#simple_text").val $("#simple_text").val() + $(this).text()


    isSearchPrefix: ->
        $("#prefixChk").is ":checked"

    isSearchSuffix: ->
        $("#suffixChk").is ":checked"

    #makeLemgramSelect: (lemgram) ->
    #    self = this
    #    promise = $("#simple_text").data("promise") or @lemgramProxy.karpSearch(lemgram or $("#simple_text").val(), false)
    #    promise.done (lemgramArray) =>
    #        $("#lemgram_select").prev("label").andSelf().remove()
    #        @savedSelect = null
    #        return if lemgramArray.length is 0
    #        lemgramArray.sort view.lemgramSort
    #        lemgramArray = $.map(lemgramArray, (item) ->
    #            label: util.lemgramToString(item, true)
    #            value: item
    #        )
    #        select = @buildLemgramSelect(lemgramArray)
    #        .appendTo("#korp-simple")
    #        .addClass("lemgram_select")
    #        .prepend($("<option>").localeKey("none_selected"))
    #        .change ->
    #            unless self.selectedIndex is 0
    #                self.savedSelect = lemgramArray
    #                self.selectLemgram $(this).val()
    #            $(this).prev("label").andSelf().remove()
    #
    #        # select.get(0).selectedIndex = 0
    #        label = $("<label />", for: "lemgram_select")
    #        .html("<i>#{$("#simple_text").val()}</i> <span rel='localize[autocomplete_header]'>#{util.getLocaleString("autocomplete_header")}</span>")
    #        .css("margin-right", 8)
    #        select.before label


    onSubmit: ->
        super()
        wordInput = @getWordInput()
        unless wordInput is ""
            util.searchHash "word", wordInput
            #console.log "modily", @s.model
        else
            if @s.model
                @selectLemgram @s.model 
    
    getWordInput: () ->
        if settings.autocomplete
            return $("#simple_text > div > div > .autocomplete_searchbox").val()
        else
            return $("#simple_text > div > div > .standard_searchbox").val()

    selectLemgram: (lemgram) ->
        return if $("#search-tab").data("cover")?
        @refreshSearch()
        # if @isSearchSuffix() or @isSearchPrefix()
        #     c.log "suffix or prefix"
        #     util.searchHash "cqp", @getCQP()
        # else
        util.searchHash "lemgram", lemgram

    buildLemgramSelect: (lemgrams) ->
        $("#lemgram_select").prev("label").andSelf().remove()
        optionElems = $.map(lemgrams, (item) ->
            $("<option>",
                value: item.value
            ).html(item.label).get 0
        )
        return $("<select id='lemgram_select' />").html(optionElems).data("dataprovider", lemgrams)

    getCQP : (word) ->
        # c.log "getCQP", word
        currentText = $.trim(word or @getWordInput() or "", '"')
        suffix = (if $("#caseChk").is(":checked") then " %c" else "")
        if util.isLemgramId(currentText) # if the input is a lemgram, do lemgram search.
            val = "[lex contains \"#{currentText}\"]"
        else if @s.placeholder
            lemgram = regescape @s.placeholder
            val = "[lex contains '#{lemgram}'"

            if @isSearchPrefix()
                val += " | prefix contains '#{lemgram}' "
            if @isSearchSuffix()
                val += " | suffix contains '#{lemgram}'"

            val += "]"

        else if @isSearchPrefix() or @isSearchSuffix()
            query = []
            @isSearchPrefix() and query.push("%s.*")
            @isSearchSuffix() and query.push(".*%s")
            val = $.map(currentText.split(" "), (wd) ->
                "[" + $.map(query, (q) ->
                    q = $.format(q, wd)
                    $.format "word = \"%s\"%s", [q, suffix]
                ).join(" | ") + "]"
            ).join(" ")
        else
            wordArray = currentText.split(" ")
            cqp = $.map(wordArray, (item, i) ->
                $.format "[word = \"%s\"%s]", [regescape(item), suffix]
            )
            val = cqp.join(" ")

        return val

    onSimpleChange: (event) ->
        $("#simple_text").data "promise", null
        if event and event.keyCode is 27 #escape
            c.log "key", event.keyCode
            return
        
        if event and event.keyCode != 13   
           @s.placeholder = null
        # val = @getCQP()
        # @s.$root.extendedCQP = val

    resetView: ->
        $("#similar_lemgrams").empty().height "auto"
        $("#show_more").remove()
        # @setPlaceholder null, null
        @s.placeholder = null

        this

    clear: ->
        $("#simple_text").val("").get(0).blur()
        # @disableSubmit()
        this
