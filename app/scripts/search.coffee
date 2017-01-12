window.view = {}

#**************
# Search view objects
#**************

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

view.initSearchOptions = ->
    selects = $("#search_options > div:first select").customSelect()

    $("#search_options select").each ->
        state = search()[$(this).data("history")]

        if state
            $(this).val(state).change()
        else
            $(this).prop("selectedIndex", 0).change()

    $("#search_options").css("background-color", settings.primaryLight).change (event, isInit) ->
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

class BaseSearch
    constructor: (mainDivId, scope) ->
        @s = scope
        @$main = $(mainDivId)
        @$main.find("#sendBtn:submit").click $.proxy(@onSubmit, this)

    refreshSearch: ->
        search "search", null
        $(window).trigger "hashchange"

    onSubmit: ->
        @refreshSearch()

    enableSubmit: ->
        @$main.find("#sendBtn").attr "disabled", false


class view.SimpleSearch extends BaseSearch
    constructor: (mainDivId, _mainDiv, scope) ->
        super mainDivId, scope
        $("#simple_text").keyup (event) =>
            @s.$apply () =>
                @onSimpleChange(event)
        @savedSelect = null

        @lemgramProxy = new model.LemgramProxy()

        @s.autocSettings = { enableLemgramSuggestion : settings.autocomplete }

        $("#prefixChk, #suffixChk, #caseChk").click =>
            if $("#simple_text").attr("placeholder") and $("#simple_text").text() is ""
                @enableSubmit()
            else
                @onSimpleChange()

    isSearchPrefix: ->
        $("#prefixChk").is ":checked"

    isSearchSuffix: ->
        $("#suffixChk").is ":checked"

    onSubmit: ->
        super()
        wordInput = @getWordInput()
        unless wordInput is ""
            util.searchHash "word", wordInput
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
        util.searchHash "lemgram", lemgram

    getCQP : (word) ->
        currentText = $.trim(word or @getWordInput() or "", '"')
        suffix = (if $("#caseChk").is(":checked") then " %c" else "")
        if util.isLemgramId(currentText) # if the input is a lemgram, do lemgram search.
            val = "[lex contains \"#{currentText}\"]"
        else if @s.placeholder
            lemgram = regescape @s.placeholder
            val = "[lex contains '#{lemgram}'"

            if @isSearchPrefix()
                val += " | prefix contains '#{lemgram}'"
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
                return "[word = \"#{regescape(item)}\"#{suffix}]"
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

    clear: ->
        $("#simple_text").val("").get(0).blur()
        this
