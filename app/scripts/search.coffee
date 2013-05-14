window.view = {}

#**************
# Search view objects
#**************
view.lemgramSort = (first, second) ->
    match1 = util.splitLemgram(first)
    match2 = util.splitLemgram(second)
    return parseInt(match1.index) - parseInt(match2.index)  if match1.form is match2.form
    first.length - second.length

view.saldoSort = (first, second) ->
    match1 = util.splitSaldo(first)
    match2 = util.splitSaldo(second)
    return parseInt(match1[2]) - parseInt(match2[2])  if match1[1] is match2[1]
    first.length - second.length

view.updateSearchHistory = (value) ->
    filterParam = (url) ->
        $.grep($.param.fragment(url).split("&"), (item) ->
            item.split("=")[0] is "search" or item.split("=")[0] is "corpus"
        ).join "&"
    searches = $.jStorage.get("searches") or []
    searchLocations = $.map(searches, (item) ->
        filterParam item.location
    )
    if value? and filterParam(location.href) not in searchLocations
        searches.splice 0, 0,
            label: value
            location: location.href

        $.jStorage.set "searches", searches
    return unless searches.length
    opts = $.map(searches, (item) ->
        output = $("<option />", value: item.location)
        .text(item.label).get(0)
        output
    )
    placeholder = $("<option>").localeKey("search_history").get(0)
    $("#search_history").html [placeholder].concat(opts)

view.enableSearch = (bool) ->
    if bool
        $("#search-tab").tabs("enable").removeClass("ui-state-disabled").uncover()
    else
        $("#search-tab").tabs("disable").addClass("ui-state-disabled").cover()

view.initSearchOptions = ->
    selects = $("#search_options > div:first select").customSelect()
    view.updateReduceSelect()
    $("#search_options select").each ->
        state = $.bbq.getState($(this).data("history"))
        unless not state
            $(this).val(state).change()
        else
            $(this).prop("selectedIndex", 0).change()

    $("#search_options").css("background-color", settings.primaryLight).change (event) ->
        simpleSearch.enableSubmit()
        extendedSearch.enableSubmit()
        advancedSearch.enableSubmit()
        target = $(event.target)
        state = {}
        state[target.data("history")] = target.val()
        unless target.prop("selectedIndex") is 0
            $.bbq.pushState state
        else
            $.bbq.removeState target.data("history")


view.updateContextSelect = (withinOrContext) ->
    intersect = settings.corpusListing.getAttrIntersection(withinOrContext)
    union = settings.corpusListing.getAttrUnion(withinOrContext)
    opts = $(".#{withinOrContext}_select option")
    opts.data("locSuffix", null).attr("disabled", null).removeClass "limited"

    # all support enhanced context
    if union.length > intersect.length

        # partial support for enhanced context
        opts.each ->
            $(this).addClass("limited").data "locSuffix", "asterix"  if $.inArray($(this).attr("value"), intersect) is -1

    else if union.length is 1 and intersect.length is 1

        # no support
        opts.each ->
            unless $.inArray($(this).attr("value"), intersect) is -1
                $(this).attr "disabled", null
            else
                $(this).attr("disabled", "disabled").parent().val("sentence").change()

    $(".#{withinOrContext}_select").localize()

view.updateReduceSelect = ->
    groups = $.extend(
        word:
            word:
                label: "word"

            word_insensitive:
                label: "word_insensitive"
    ,
        word_attr: settings.corpusListing.getCurrentAttributes()
        sentence_attr: $.grepObj(settings.corpusListing.getStructAttrsIntersection(), (val, key) ->
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
    constructor: (mainDivId) ->
        @$main = $(mainDivId)
        @$main.find("#sendBtn:submit").click $.proxy(@onSubmit, this)
        @_enabled = true

    refreshSearch: ->
        $.bbq.removeState "search"
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
    constructor: (mainDivId) ->
        super mainDivId
        $("#similar_lemgrams").css "background-color", settings.primaryColor
        $("#simple_text").keyup $.proxy(@onSimpleChange, this)
        @onSimpleChange()
        $("#similar_lemgrams").hide()
        @savedSelect = null
        textinput = $("#simple_text").bind("keydown.autocomplete", (event) =>
            keyCode = $.ui.keyCode
            return  if not @isVisible() or $("#ui-active-menuitem").length isnt 0
            switch event.keyCode
                when keyCode.ENTER
                    @onSubmit()  unless $("#search-tab").data("cover")?
        )
        if settings.autocomplete
            textinput.korp_autocomplete
                type: "lem"
                select: $.proxy(@selectLemgram, this)
                middleware: (request, idArray) =>
                    dfd = $.Deferred()
                    lemgramProxy.lemgramCount(idArray, @isSearchPrefix(), @isSearchSuffix()).done((freqs) ->
                        delete freqs["time"]

                        if currentMode is "law"
                            idArray = _.filter(idArray, (item) ->
                                item of freqs
                            )
                        has_morphs = settings.corpusListing.getMorphology().split("|").length > 1
                        if has_morphs
                            idArray.sort (a, b) ->
                                first = (if a.split("--").length > 1 then a.split("--")[0] else "saldom")
                                second = (if b.split("--").length > 1 then b.split("--")[0] else "saldom")
                                return (freqs[b] or 0) - (freqs[a] or 0)  if first is second
                                second < first

                        else
                            idArray.sort (first, second) ->
                                (freqs[second] or 0) - (freqs[first] or 0)

                        labelArray = util.sblexArraytoString(idArray, util.lemgramToString)
                        listItems = $.map(idArray, (item, i) ->
                            out =
                                label: labelArray[i]
                                value: item
                                input: request.term
                                enabled: item of freqs

                            out["category"] = (if item.split("--").length > 1 then item.split("--")[0] else "saldom")  if has_morphs
                            out
                        )
                        dfd.resolve listItems
                    ).fail ->
                        c.log "reject"
                        dfd.reject()
                        textinput.preloader "hide"

                    dfd.promise()

                "sw-forms": false

        $("#prefixChk, #suffixChk, #caseChk").click =>
            if $("#simple_text").attr("placeholder") and $("#simple_text").text() is ""
                @enableSubmit()
            else
                @onSimpleChange()

        $("#keyboard").click ->
            c.log "click", arguments
            $("#char_table").toggle "slide",
                direction: "up"
            , "fast"

        $("#char_table td").click ->
            $("#simple_text").val $("#simple_text").val() + $(this).text()


    isSearchPrefix: ->
        $("#prefixChk").is ":checked"

    isSearchSuffix: ->
        $("#suffixChk").is ":checked"

    makeLemgramSelect: (lemgram) ->
        self = this
        promise = $("#simple_text").data("promise") or lemgramProxy.karpSearch(lemgram or $("#simple_text").val(), false)
        promise.done (lemgramArray) =>
            $("#lemgram_select").prev("label").andSelf().remove()
            @savedSelect = null
            return  if lemgramArray.length is 0
            lemgramArray.sort view.lemgramSort
            lemgramArray = $.map(lemgramArray, (item) ->
                label: util.lemgramToString(item, true)
                value: item
            )
            select = @buildLemgramSelect(lemgramArray)
            .appendTo("#korp-simple")
            .addClass("lemgram_select")
            .prepend($("<option>").localeKey("none_selected"))
            .change ->
                unless self.selectedIndex is 0
                    self.savedSelect = lemgramArray
                    self.selectLemgram $(this).val()
                $(this).prev("label").andSelf().remove()

            select.get(0).selectedIndex = 0
            label = $("<label />", for: "lemgram_select")
            .html("<i>#{$("#simple_text").val()}</i> <span rel='localize[autocomplete_header]'>#{util.getLocaleString("autocomplete_header")}</span>")
            .css("margin-right", 8)
            select.before label


    onSubmit: ->
        super()
        $("#simple_text.ui-autocomplete-input").korp_autocomplete "abort"
        unless $("#simple_text").val() is ""
            util.searchHash "word", $("#simple_text").val()
        else @selectLemgram $("#simple_text").data("lemgram")  if $("#simple_text").attr("placeholder")?

    selectLemgram: (lemgram) ->
        return  if $("#search-tab").data("cover")?
        @refreshSearch()
        util.searchHash "lemgram", lemgram

    buildLemgramSelect: (lemgrams) ->
        $("#lemgram_select").prev("label").andSelf().remove()
        optionElems = $.map(lemgrams, (item) ->
            $("<option>",
                value: item.value
            ).html(item.label).get 0
        )
        return $("<select id='lemgram_select' />").html(optionElems).data("dataprovider", lemgrams)

    renderSimilarHeader: (selectedItem, data) ->
        c.log "renderSimilarHeader"
        self = this
        $("#similar_lemgrams").empty().append "<div id='similar_header' />"
        $("<p/>").localeKey("similar_header").css("float", "left").appendTo "#similar_header"
        lemgrams = @savedSelect or $("#simple_text").data("dataArray")
        @savedSelect = null
        if lemgrams? and lemgrams.length
            @buildLemgramSelect(lemgrams).appendTo("#similar_header").css("float", "right").change(->
                self.savedSelect = lemgrams
                self.selectLemgram $(this).val()
            ).val selectedItem
            $("#simple_text").data "dataArray", null
        $("<div name='wrapper' style='clear : both;' />").appendTo "#similar_header"

        # wordlist
        data = $.grep(data, (item) ->
            !!item.rel.length
        )

        # find the first 30 words
        count = 0
        index = 0
        sliced = $.extend(true, [], data)
        isSliced = false
        $.each sliced, (i, item) ->
            index = i
            if count + item.rel.length > 30
                item.rel = item.rel.slice(0, 30 - count)
                isSliced = true
                return false
            count += item.rel.length

        list = $("<ul />").appendTo("#similar_lemgrams")
        $("#similarTmpl").tmpl(sliced.slice(0, index + 1)).appendTo(list).find("a").click ->
            self.selectLemgram $(this).data("lemgram")

        $("#show_more").remove()
        div = $("#similar_lemgrams").show().height("auto").slideUp(0)
        if isSliced
            div.after $("<div id='show_more' />")
            .css("background-color", settings.primaryColor)
            .append($("<a href='javascript:' />").localeKey("show_more"))
            .click ->

                $(this).remove()
                h = $("#similar_lemgrams").outerHeight()
                list.html($("#similarTmpl").tmpl(data)).find("a").click ->
                    self.selectLemgram $(this).data("lemgram")

                $("#similar_lemgrams").height "auto"
                newH = $("#similar_lemgrams").outerHeight()
                $("#similar_lemgrams").height h
                $("#similar_lemgrams").animate
                    height: newH
                , "fast"

        div.slideDown "fast"

    removeSimilarHeader: ->
        $("#similar_lemgrams").slideUp ->
            $(this).empty()


    onSimpleChange: (event) ->
        $("#simple_text").data "promise", null
        if event and event.keyCode is 27 #escape
            c.log "key", event.keyCode
            return
        currentText = $.trim($("#simple_text").val() or "", '"')
        suffix = (if $("#caseChk").is(":checked") then " %c" else "")
        if util.isLemgramId(currentText) # if the input is a lemgram, do semantic search.
            val = $.format("[lex contains \"%s\"]", currentText)
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
        $("#cqp_string").val val
        unless currentText is ""
            @enableSubmit()
        else
            @disableSubmit()

    resetView: ->
        $("#similar_lemgrams").empty().height "auto"
        $("#show_more").remove()
        @setPlaceholder null, null

        this

    setPlaceholder: (str, data) ->
        $("#simple_text").data("lemgram", data).attr("placeholder", str).placeholder()
        this

    clear: ->
        $("#simple_text").val("").get(0).blur()
        @disableSubmit()
        this

class view.ExtendedSearch extends BaseSearch
    constructor: (mainDivId) ->
        super mainDivId
        c.log "extendedsearch constructor"
        $("#korp-extended").keyup (event) =>
            @onSubmit()  if event.keyCode is "13" and $("#search-tab").data("cover")?
            false

        @$main.find("#strict_chk").change ->
            advancedSearch.updateCQP()

        @setupContainer "#query_table"

    setupContainer: (selector) ->
        self = this
        insert_token_button = $('<img src="img/plus.png"/>')
        .addClass("image_button insert_token")
        .click ->
            self.insertToken this

        $(selector).append(insert_token_button).sortable
            items: ".query_token"
            delay: 50
            tolerance: "pointer"

        insert_token_button.click()

    reset: ->

        #$("#search-tab ul li:nth(2)").click()
        @$main.find(".query_token").remove()
        $(".insert_token").click()
        advancedSearch.updateCQP()

    onentry: ->

    onSubmit: ->
        super()
        if @$main.find(".query_token, .or_arg").length > 1
            query = advancedSearch.updateCQP()
            util.searchHash "cqp", query
        else
            $select = @$main.find("select.arg_type")
            switch $select.val()
                when "lex"
                    searchType = (if $select.val() is "lex" then "lemgram" else $select.val())
                    util.searchHash searchType, $select.parent().next().data("value")
                else
                    query = advancedSearch.updateCQP()
                    util.searchHash "cqp", query

    setOneToken: (key, val) ->
        $("#search-tab").find("a[href=#korp-extended]").click().end()
            .find("select.arg_type:first").val(key).next().val val
        advancedSearch.updateCQP()

    insertToken: (button) ->
        # try
        $.tmpl($("#tokenTmpl")).insertBefore(button).extendedToken
            close: ->
                advancedSearch.updateCQP()

            change: =>
                advancedSearch.updateCQP()  if @$main.is(":visible")

        # catch error
            # c.log "error creating extendedToken", error
            # @$main.find("*").remove()
            # $("<div>Extended search is broken on this browser.</div>").prependTo(@$main).nextAll().remove()

        util.localize()

    refreshTokens: ->
        $(".query_token").extendedToken "refresh"

class view.AdvancedSearch extends BaseSearch
    constructor: (mainDivId) ->
        super mainDivId

    setCQP: (query) ->
        c.log "setCQP", query
        $("#cqp_string").val query

    updateCQP: ->
        query = $(".query_token").map(->
            $(this).extendedToken "getCQP", $("#strict_chk").is(":checked")
        ).get().join(" ")
        @setCQP query
        return query

    onSubmit: ->
        super()
        util.searchHash "cqp", $("#cqp_string").val()
