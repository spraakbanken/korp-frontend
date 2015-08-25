class BaseResults
    constructor: (resultSelector, tabSelector, scope) ->
        @s = scope
        # @s.instance = this
        @$tab = $(tabSelector)
        @$result = $(resultSelector)
        @optionWidget = $("#search_options")
        # @num_result = @$result.find(".num-result")
        @$result.add(@$tab).addClass "not_loading"

        @injector = $("body").injector()

        def = @injector.get("$q").defer()
        @firstResultDef = def


    onProgress: (progressObj) ->
        safeApply @s, () =>
            @s.$parent.progress = Math.round(progressObj["stats"])
            @s.hits_display = util.prettyNumbers(progressObj["total_results"])



    abort : () ->
        @ignoreAbort = false
        @proxy.abort()

    getSearchTabs : () ->
        $(".search_tabs > ul").scope().tabs

    getResultTabs : () ->
        $(".result_tabs > ul").scope().tabs

    renderResult: (data) ->
        #       this.resetView();
        @$result.find(".error_msg").remove()
        # util.setJsonLink @proxy.prevRequest if @$result.is(":visible")
        if data.ERROR
            safeApply @s, () =>
                @firstResultDef.reject()
            
            @resultError data
            return false
        else
            safeApply @s, () =>
                c.log "firstResultDef.resolve"
                @firstResultDef.resolve()
                @hasData = true

    resultError: (data) ->
        c.error "json fetch error: ", data
        @hidePreloader()
        @resetView()
        $('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">')
            .append("<img class='korp_fail' src='img/korp_fail.svg'>")
            .add($("<div class='fail_text' />")
            .localeKey("fail_text"))
            .addClass("inline_block")
            .prependTo(@$result)
            .wrapAll "<div class='error_msg'>"
        # util.setJsonLink @proxy.prevRequest

    showPreloader : () ->
        @s.$parent.loading = true
    
    hidePreloader : () ->
        @s.$parent.loading = false

    resetView: ->
        @hasData = false
        @$result.find(".error_msg").remove()

    countCorpora : () ->
        @proxy.prevParams?.corpus.split(",").length

    onentry : () ->
        @s.$root.jsonUrl = null
        @firstResultDef.promise.then () =>
            c.log "firstResultDef.then", @isActive()
            if @isActive() 
                @s.$root.jsonUrl = @proxy?.prevUrl
    onexit : () ->
        @s.$root.jsonUrl = null

    isActive : () ->
        !!@getResultTabs()[@tabindex]?.active


class view.KWICResults extends BaseResults
    constructor : (tabSelector, resultSelector, scope) ->
        self = this
        @prevCQP = null
        super tabSelector, resultSelector, scope
        # @s.$parent.loading = false
        # @initHTML = @$result.html()
        window.kwicProxy = new model.KWICProxy()
        @proxy = kwicProxy
        @readingProxy = new model.KWICProxy()
        @current_page = search().page or 0
        @tabindex = 0

        @s = scope
        
        @selectionManager = scope.selectionManager
        @setupReadingHash()
        @$result.click =>
            return unless @selectionManager.hasSelected()
            @selectionManager.deselect()
            safeApply @s.$root, (s) ->
                s.$root.word_selected = null

        $(document).keydown $.proxy(@onKeydown, this)

        @$result.on "click", ".word", (event) => @onWordClick(event)


        # @$result.addClass "reading_mode" if $.bbq.getState("reading_mode")

    setupReadingHash : () ->
        @s.setupReadingHash()

    onWordClick : (event) ->
        c.log "wordclick", @tabindex, @s
        if @isActive()
            @s.$root.sidebar_visible = true
        # c.log "click", obj, event
        # c.log "word click", $(this).scope().wd, event.currentTarget
        scope = $(event.currentTarget).scope()
        obj = scope.wd
        sent = scope.sentence
        event.stopPropagation()
        word = $(event.target)
        # $.sm.send("word.select")
        if $("#sidebar").data().korpSidebar?
            $("#sidebar").sidebar "updateContent", sent.structs, obj, sent.corpus.toLowerCase(), sent.tokens
        
        @selectWord word, scope, sent



    selectWord : (word, scope) ->
        obj = scope.wd
        if not obj.dephead?
            scope.selectionManager.select word, null
            safeApply @s.$root, (s) ->
                s.$root.word_selected = word
            return

        i = Number(obj.dephead)

        paragraph = word.closest(".sentence").find(".word")
        sent_start = 0
        querySentStart = ".open_sentence"
        if word.is(querySentStart)
            sent_start = paragraph.index(word)
        else

            l = paragraph.filter((__, item) ->
                $(item).is(word) or $(item).is(querySentStart)
            )
            sent_start = paragraph.index(l.eq(l.index(word) - 1))
            c.log "i", l.index(word), i, sent_start
        aux = $(paragraph.get(sent_start + i - 1))
        scope.selectionManager.select word, aux
        safeApply @s.$root, (s) ->
            s.$root.word_selected = word
        


    resetView: ->
        super()

    getProxy: ->
        # return @readingProxy if @isReadingMode()
        @proxy

    isReadingMode : () ->
        @s.reading_mode

    onentry: ->
        super()
        c.log "onentry kwic"
        @s.$root.sidebar_visible = true

        @$result.find(".token_selected").click()
        _.defer () => @centerScrollbar()
        # @centerScrollbar()
        # $(document).keydown $.proxy(@onKeydown, this)
        return

    onexit: ->
        super()
        c.log "onexit kwic"
        @s.$root.sidebar_visible = false
        # $(document).unbind "keydown", @onKeydown
        return

    onKeydown: (event) ->
        isSpecialKeyDown = event.shiftKey or event.ctrlKey or event.metaKey
        return if isSpecialKeyDown or $("input, textarea, select").is(":focus") or
            not @$result.is(":visible")

        switch event.which
            when 78 # n
                safeApply @s, =>
                    @s.$parent.page++
                    @s.$parent.pageObj.pager = @s.$parent.page + 1
                return false
            when 70 # f
                safeApply @s, =>
                    @s.$parent.page--
                    @s.$parent.pageObj.pager = @s.$parent.page + 1
                return false
        return unless @selectionManager.hasSelected()
        switch event.which
            when 38 #up
                next = @selectUp()
            when 39 # right
                next = @selectNext()
            when 37 #left
                next = @selectPrev()
            when 40 # down
                next = @selectDown()
        @scrollToShowWord($(next)) if next
        return false


    getPageInterval: (page) ->
        items_per_page = Number(@s.$root._searchOpts.hits_per_page) or settings.hits_per_page_default
        page = Number(page)
        output = {}
        output.start = (page or 0) * items_per_page
        output.end = (output.start + items_per_page) - 1
        output

    renderCompleteResult: (data) ->
        c.log "renderCompleteResult", data
        @current_page = search().page or 0
        safeApply @s, () =>
            @hidePreloader()
            @s.hits = data.hits
            @s.hits_display  = util.prettyNumbers(data.hits)
        unless data.hits
            c.log "no kwic results"
            @showNoResults()
            return
        # @s.$parent.loading = false
        @$result.removeClass "zero_results"
        # @$result.find(".num-result").html util.prettyNumbers(data.hits)
        @renderHitsPicture data




    renderResult: (data) ->
        c.log "data", data, @proxy.prevUrl
        resultError = super(data)
        return if resultError is false
        unless data.kwic then data.kwic = []
        c.log "corpus_results"
        isReading = @isReadingMode()



        if @isActive()
            @s.$root.jsonUrl = @proxy.prevUrl

        # applyTo "kwicCtrl", ($scope) ->
        @s.$apply ($scope) =>
            c.log "apply kwic search data", data
            if isReading
                $scope.setContextData(data)
                @selectionManager.deselect()
                @s.$root.word_selected = null
            else
                $scope.setKwicData(data)

            setTimeout(() =>
                safeApply @s, () =>
                    @s.gotFirstKwic = true
                
            , 0)
            # @hidePreloader()    

        if currentMode == "parallel" and not isReading
            scrollLeft = $(".table_scrollarea", @$result).scrollLeft() or 0
            for linked in $(".table_scrollarea > .kwic .linked_sentence")
                mainrow = $(linked).prev()
                unless mainrow.length then continue
                firstWord = mainrow.find(".left .word:first")
                if not firstWord.length then firstWord = mainrow.find(".match .word:first")
                offset = (firstWord.position().left + scrollLeft) - 25
                $(linked).find(".lnk").css("padding-left", Math.round(offset))

        @$result.localize()
        @centerScrollbar()
        if not @selectionManager.hasSelected() and not isReading
            @$result.find(".match").children().first().click()

    showNoResults: ->
        # @$result.find(".results_table").empty()
        # @$result.find(".pager-wrapper").empty()
        @hidePreloader()
        # @$result.find(".num-result").html 0
        @$result.addClass("zero_results").click()

        #   this.$result.find(".sort_select").hide();
        @$result.find(".hits_picture").html ""

    renderHitsPicture: (data) ->
        items = _.map data.corpus_order, (obj) ->
            {"rid" : obj,
            "rtitle" : settings.corpusListing.getTitle(obj.toLowerCase()),
            "relative" : data.corpus_hits[obj] / data.hits,
            "abs" : data.corpus_hits[obj]}
        items = _.filter items, (item) -> item.abs > 0
        # calculate which is the first page of hits for each item
        index = 0
        _.each items, (obj) =>
            obj.page = Math.floor(index / @proxy.prevMisc.hitsPerPage )
            index += obj.abs

        @s.$apply ($scope) ->
            $scope.hitsPictureData = items

    scrollToShowWord: (word) ->
        unless word.length then return
        offset = 200
        wordTop = word.offset().top
        newY = window.scrollY
        if wordTop > $(window).height() + window.scrollY
            newY += offset
        else newY -= offset if wordTop < window.scrollY
        $("html, body").stop(true, true).animate scrollTop: newY
        wordLeft = word.offset().left
        area = @$result.find(".table_scrollarea")
        newX = Number(area.scrollLeft())
        if wordLeft > (area.offset().left + area.width())
            newX += offset
        else newX -= offset if wordLeft < area.offset().left
        area.stop(true, true).animate scrollLeft: newX


    buildQueryOptions: (cqp, isPaging) ->
        c.log "buildQueryOptions", cqp
        opts = {}
        getSortParams = () -> 
            sort = search().sort
            unless sort then return {}
            if sort == "random"
                if search().random_seed
                    rnd = search().random_seed
                else
                    rnd = Math.ceil(Math.random() * 10000000)
                    search random_seed: rnd

                return {
                    sort : sort
                    random_seed : rnd
                }
            return {sort : sort}

        opts.ajaxParams = {
            command : "query"
            corpus : settings.corpusListing.stringifySelected()
            cqp : cqp or @proxy.prevCQP
            queryData : @proxy.queryData if @proxy.queryData
            context : settings.corpusListing.getContextQueryString() if @isReadingMode() or currentMode == "parallel"
            within : settings.corpusListing.getWithinQueryString() if search().within
            incremental: !isPaging and $.support.ajaxProgress
        }
        _.extend opts.ajaxParams, getSortParams()
        return opts


    makeRequest: (cqp, isPaging) ->
        c.log "kwicResults.makeRequest", cqp, isPaging

        page = Number(search().page) or 0
        
        if !@hasInitialized?
            c.log "not init set page", page + 1
            @s.$parent.pageObj.pager = page + 1
        else if not isPaging
            @s.gotFirstKwic = false
            @s.$parent.pageObj.pager = 0
            c.log "not isPaging page reset"

        @hasInitialized ?= false
        @showPreloader()
        @s.aborted = false

        if @proxy.hasPending()
            @ignoreAbort = true
        else
            @ignoreAbort = false

        isReading = @isReadingMode()

        params = @buildQueryOptions(cqp, isPaging)
        progressCallback = if ((not params.ajaxParams.incremental)) then $.noop else $.proxy(@onProgress, this)
        # c.log "params.incremental", params.ajaxParams.incremental, isReading
        req = @getProxy().makeRequest params,
                            page,
                            progressCallback,
                            (data) => 
                                @renderResult data
        req.success (data) =>
            @hidePreloader()
            @renderCompleteResult(data)
        req.fail (jqXHR, status, errorThrown) =>
            c.log "kwic fail"
            if @ignoreAbort
                c.log "stats ignoreabort"
                return
            if status == "abort"
                safeApply @s, () =>
                    @hidePreloader()
                    @s.aborted = true

        

    getActiveData : () ->
        if @isReadingMode()
            @s.contextKwic
        else
            @s.kwic


    centerScrollbar: ->
        m = @$result.find(".match:first")
        return unless m.length
        area = @$result.find(".table_scrollarea").scrollLeft(0)
        match = m.first().position().left + m.width() / 2
        sidebarWidth = $("#sidebar").outerWidth() or 0
        area.stop(true, true).scrollLeft match - ($("body").innerWidth() - sidebarWidth) / 2
        return

    getCurrentRow: ->
        tr = @$result.find(".token_selected").closest("tr")
        if @$result.find(".token_selected").parent().is("td")
            tr.find "td > .word"
        else
            tr.find "div > .word"

    selectNext: ->
        unless @isReadingMode()
            i = @getCurrentRow().index(@$result.find(".token_selected").get(0))
            next = @getCurrentRow().get(i + 1)
            return unless next?
            $(next).click()

        else
            next = @$result.find(".token_selected").next().click()
        return next

    selectPrev: ->
        unless @isReadingMode()
            i = @getCurrentRow().index(@$result.find(".token_selected").get(0))
            return if i is 0
            prev = @getCurrentRow().get(i - 1)
            $(prev).click()
        else
            prev = @$result.find(".token_selected").prev().click()
        return prev

    selectUp: ->
        current = @selectionManager.selected
        unless @isReadingMode()
            prevMatch = @getWordAt(current.offset().left + current.width() / 2, current.closest("tr").prevAll(".not_corpus_info").first())
            prevMatch.click()
        else
            searchwords = current.prevAll(".word").get().concat(current.closest(".not_corpus_info").prevAll(".not_corpus_info").first().find(".word").get().reverse())
            def = current.parent().prev().find(".word:last")
            prevMatch = @getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click()

        return prevMatch

    selectDown: ->
        current = @selectionManager.selected
        unless @isReadingMode()
            nextMatch = @getWordAt(current.offset().left + current.width() / 2, current.closest("tr").nextAll(".not_corpus_info").first())
            nextMatch.click()
        else
            searchwords = current.nextAll(".word").add(current.closest(".not_corpus_info").nextAll(".not_corpus_info").first().find(".word"))
            def = current.parent().next().find(".word:first")
            nextMatch = @getFirstAtCoor(current.offset().left + current.width() / 2, searchwords, def).click()
        return nextMatch

    getFirstAtCoor: (xCoor, wds, default_word) ->
        output = null
        wds.each (i, item) ->
            thisLeft = $(this).offset().left
            thisRight = $(this).offset().left + $(this).width()
            if xCoor > thisLeft and xCoor < thisRight
                output = $(this)
                false

        output or default_word

    getWordAt: (xCoor, $row) ->
        output = $()
        $row.find(".word").each ->
            output = $(this)
            thisLeft = $(this).offset().left
            thisRight = $(this).offset().left + $(this).width()
            false if (xCoor > thisLeft and xCoor < thisRight) or thisLeft > xCoor

        output

class view.ExampleResults extends view.KWICResults
    constructor: (tabSelector, resultSelector, scope) ->
        c.log "ExampleResults constructor", tabSelector, resultSelector, scope
        super tabSelector, resultSelector, scope
        @proxy = new model.KWICProxy()
        
        @current_page = 0
        if @s.$parent.queryParams
            @makeRequest().then () =>
                @onentry()
        @tabindex = (@getResultTabs().length - 1) + @s.$parent.$index

    setupReadingHash : () ->

    makeRequest: () ->
        # debugger
        c.log "ExampleResults.makeRequest()", @current_page
        items_per_page = parseInt(@optionWidget.find(".num_hits").val())
        opts = @s.$parent.queryParams
        @resetView()
        opts.ajaxParams.incremental = false

        opts.ajaxParams.start = @current_page * items_per_page
        opts.ajaxParams.end = (opts.ajaxParams.start + items_per_page)

        prev = _.pick @proxy.prevParams, "cqp", "command", "corpus", "head", "rel", "source", "dep", "depextra"
        _.extend opts.ajaxParams, prev

        @showPreloader()

        #   this.proxy.makeRequest(opts, $.proxy(this.onProgress, this));
        progress = if opts.command == "query" then $.proxy(this.onProgress, this) else $.noop
        def = @proxy.makeRequest opts, null, progress, (data) => 
            c.log "first part done", data
            @renderResult data, opts.cqp
            @renderCompleteResult data
            safeApply @s, () =>
                @hidePreloader()
            # util.setJsonLink @proxy.prevRequest
            # @$result.find(".num-result").html util.prettyNumbers(data.hits)

        # def.success = (data) ->

        def.fail () ->
            safeApply @s, () =>
                @hidePreloader()



    renderResult : (data) ->
        super(data)
        @s.setupReadingWatch()


    renderCompleteResult : (data) ->
        curr = @current_page
        super(data)
        @current_page = curr


class view.LemgramResults extends BaseResults
    constructor: (tabSelector, resultSelector, scope) ->
        self = this
        super tabSelector, resultSelector, scope
        @s = scope
        @tabindex = 2
        #   TODO: figure out what I use this for.
        @resultDeferred = $.Deferred()
        @proxy = new model.LemgramProxy()
        window.lemgramProxy = @proxy
        @$result.find("#wordclassChk").change ->
            if $(this).is(":checked")
                $(".lemgram_result .wordclass_suffix", self.$result).show()
            else
                $(".lemgram_result .wordclass_suffix", self.$result).hide()

        

    resetView: ->
        super()
        $(".content_target", @$result).empty()
        safeApply @s, () =>
            @s.$parent.aborted = false
            @s.$parent.no_hits = false

    makeRequest : (word, type) ->
        if @proxy.hasPending()
            @ignoreAbort = true
        else
            @ignoreAbort = false
            @resetView()
        
        @showPreloader()
        def = @proxy.makeRequest word, type, (args...) =>
            @onProgress args...

        def.success (data) =>
            safeApply @s, () =>
                @renderResult(data, word)


        def.fail (jqXHR, status, errorThrown) =>
            c.log "def fail", status
            if @ignoreAbort
                c.log "lemgram ignoreabort"
                return
            if status == "abort"
                safeApply @s, () =>
                    @hidePreloader()
                    c.log "aborted true", @s
                    @s.$parent.aborted = true


    renderResult: (data, query) ->
        c.log "lemgram renderResult", data, query
        # @resetView()
        $(".content_target", @$result).empty()
        resultError = super(data)
        @hidePreloader()
        @s.$parent.progress = 100
        return if resultError is false
        unless data.relations
            @s.$parent.no_hits = true
                # @hasData = false

            @resultDeferred.reject()
        else if util.isLemgramId(query)
            @renderTables query, data.relations
            @resultDeferred.resolve()
        else
            @renderWordTables query, data.relations
            @resultDeferred.resolve()

    renderHeader: (wordClass, isLemgram) ->

        wordClass = (_.invert settings.wordpictureTagset)[wordClass.toLowerCase()]
        $(".tableContainer:last .lemgram_section").each((i) ->
            $parent = $(this).find(".lemgram_help")
            $(this).find(".lemgram_result").each (j) ->
                confObj = settings.wordPictureConf[wordClass][i][j]
                if confObj != "_"

                    unless $(this).find("table").length then return

                    if confObj.alt_label
                        label = confObj.alt_label
                    else
                        label = "rel_" + $(this).data("rel")
                    cell = $("<span />", class: "lemgram_header_item")
                        .localeKey(label)
                        .addClass(confObj.css_class or "").appendTo($parent)
                    $(this).addClass(confObj.css_class).css "border-color", $(this).css("background-color")
                else
                    # c.log "header data", $(this).data("word"), $(this).tmplItem().lemgram
                    label = $(this).data("word") or $(this).tmplItem().lemgram
                    classes = "hit"
                    if isLemgram
                        classes += " lemgram"
                    $("<span class='#{classes}'><b>#{label}</b></span>").appendTo $parent
        ).append "<div style='clear:both;'/>"

    renderWordTables: (word, data) ->
        self = this
        wordlist = $.map(data, (item) ->
            output = []
            output.push [item.head, item.headpos.toLowerCase()] if item.head.split("_")[0] is word
            output.push [item.dep, item.deppos.toLowerCase()] if item.dep.split("_")[0] is word
            output
        )
        unique_words = _.uniq wordlist, ([word, pos]) ->
            word + pos

        tagsetTrans = _.invert settings.wordpictureTagset
        unique_words = _.filter unique_words, ([currentWd, pos]) -> 
            settings.wordPictureConf[tagsetTrans[pos]]?
        if not unique_words.length
            @showNoResults()
            return
            
        
        
        $.each unique_words, (i, [currentWd, pos]) =>
            self.drawTable currentWd, pos, data
            self.renderHeader pos, false
            content = """
                #{currentWd} (<span rel="localize[pos]">#{util.getLocaleString(pos)}</span>)
            """
            $(".tableContainer:last").prepend($("<div>",
                class: "header"
            ).html(content)).find(".hit .wordclass_suffix").hide()
                
        $(".lemgram_result .wordclass_suffix").hide()
        @hidePreloader()


    renderTables: (lemgram, data) ->
        # wordClass = util.splitLemgram(lemgram).pos.slice(0, 2)
        if data[0].head == lemgram
            wordClass = data[0].headpos
        else
            wordClass = data[0].deppos

        @drawTable lemgram, wordClass, data #, getRelType
        $(".lemgram_result .wordclass_suffix").hide()
        @renderHeader wordClass, true
        @hidePreloader()

    drawTable: (token, wordClass, data) ->
        # c.log "token, wordClass", token, wordClass
        inArray = (rel, orderList) ->
            i = _.findIndex orderList, (item) -> 
                (item.field_reverse or false) == (rel.field_reverse or false) and item.rel == rel.rel
            type = (if rel.field_reverse then "head" else "dep")
            i : i
            type : type


        
        tagsetTrans = _.invert settings.wordpictureTagset
        getRelType = (item) ->
            return {rel : tagsetTrans[item.rel.toLowerCase()] , field_reverse : item.dep == token}

        wordClass = (_.invert settings.wordpictureTagset)[wordClass.toLowerCase()]

        unless settings.wordPictureConf[wordClass]?
            return
        orderArrays = [[], [], []]
        $.each data, (index, item) =>
            $.each settings.wordPictureConf[wordClass] or [], (i, rel_type_list) =>
                list = orderArrays[i]
                rel = getRelType(item)

                return unless rel
                ret = inArray(rel, rel_type_list)
                return if ret.i is -1
                list[ret.i] = [] unless list[ret.i]
                item.show_rel = ret.type
                list[ret.i].push item


        $.each orderArrays, (i, unsortedList) ->
            $.each unsortedList, (_, list) ->
                if list
                    list.sort (first, second) ->
                        second.mi - first.mi


            if settings.wordPictureConf[wordClass][i] and unsortedList.length
                toIndex = $.inArray("_", settings.wordPictureConf[wordClass][i])
                if util.isLemgramId(token)
                    unsortedList.splice toIndex, 0,
                        word: token.split("..")[0].replace(/_/g, " ")

                else
                    unsortedList.splice toIndex, 0,
                        word: util.lemgramToString(token)

            unsortedList = $.grep(unsortedList, (item, index) ->
                Boolean item
            )


        container = $("<div>", class: "tableContainer radialBkg")
        .appendTo(".content_target", @$result)

        c.log "orderArrays", orderArrays
        $("#lemgramResultsTmpl").tmpl(orderArrays,
            lemgram: token
        ).find(".example_link")
        .append($("<span>")
            .addClass("ui-icon ui-icon-document")
        ).css("cursor", "pointer")
        .click( (event) =>
            @onClickExample(event)
        ).end()
        .appendTo container

        $("td:nth-child(2)", @$result).each -> # labels
            $siblings = $(this).parent().siblings().find("td:nth-child(2)")
            siblingLemgrams = $.map($siblings, (item) ->
                $(item).data("lemgram").slice 0, -1
            )
            hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) isnt -1
            prefix = (if $(this).data("depextra").length then $(this).data("depextra") + " " else "")
            data = $(this).tmplItem().data
            if not data.dep
                label = "&mdash;"
            else 
                label = util.lemgramToString($(this).data("lemgram"), hasHomograph)
            $(this).html prefix + label



    #   self.renderHeader(wordClass);
    onClickExample: (event) ->
        self = this
        $target = $(event.currentTarget)
        c.log "onClickExample", $target
        data = $target.parent().tmplItem().data
        
        opts = {}
        opts.ajaxParams =
            start : 0
            end : 24
            command : "relations_sentences"
            source : data.source.join(",")
            corpus : null
            head: data.head
            dep: data.dep
            rel: data.rel
            depextra: data.depextra
            corpus: data.corpus


        @s.$root.kwicTabs.push opts

    showWarning: ->
        hasWarned = !!$.jStorage.get("lemgram_warning")

        #   var hasWarned = false;
        unless hasWarned
            $.jStorage.set "lemgram_warning", true
            $("#sidebar").sidebar "refreshContent", "lemgramWarning"
            safeApply @s, () =>
                @s.$root.sidebar_visible = true
            self.timeout = setTimeout(=>
                safeApply @s, () =>
                    @s.$root.sidebar_visible = false
                    $("#sidebar").sidebar "refreshContent"
            , 5000)

    onentry: ->
        c.log "lemgram onentry"
        super()
        @resultDeferred.done @showWarning
        return

    onexit: ->
        super()
        clearTimeout self.timeout
        safeApply @s, () =>
            @s.$root.sidebar_visible = false
        return

    showNoResults: ->
        @hidePreloader()
        # @$result.find(".content_target").html $("<i />").localeKey("no_lemgram_results")



    hideWordclass: ->
        $("td:first-child", @$result).each ->
            $(this).html $.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" "))


class view.StatsResults extends BaseResults
    constructor: (resultSelector, tabSelector, scope) ->
        super resultSelector, tabSelector, scope
        c.log "StatsResults constr", 
        self = this
        @tabindex = 1
        @gridData = null
        @proxy = new model.StatsProxy()
        window.statsProxy = @proxy
        @$result.on "click", ".arcDiagramPicture", (event) =>
            parts = $(event.currentTarget).attr("id").split("__")

            if parts[1] != "Σ"
                @newDataInGraph(parts[1])
            else # The ∑ row
                @newDataInGraph("SIGMA_ALL")

        @$result.on "click", ".slick-cell.l1.r1 .link", () ->
            query = $(this).data("query")
            
            opts = {}
            opts.ajaxParams =
                start : 0
                end : 24
                command : "query"
                corpus : $(this).data("corpora").join(",").toUpperCase()
                cqp : decodeURIComponent self.proxy.prevParams.cqp
                cqp2: decodeURIComponent query
                expand_prequeries : false
            
            safeApply scope.$root, () ->
                scope.$root.kwicTabs.push opts




        $(window).resize _.debounce( () =>
            $("#myGrid:visible").width($(window).width() - 40)
            nRows = @gridData?.length or 2
            h = (nRows * 2) + 4
            h = Math.min h, 40
            
            $("#myGrid:visible").height $("#myGrid .slick-viewport").height() + 40

        , 100)

        $("#kindOfData,#kindOfFormat").change () =>
            $("#exportButton").hide();
            $("#generateExportButton").show();

        $("#exportButton").hide();
        $("#generateExportButton").unbind("click").click () =>
            $("#exportButton").show()
            $("#generateExportButton").hide();
            @updateExportBlob()

        if $("html.msie7,html.msie8").length
            $("#showGraph").hide()
            return

        $("#showGraph").on "click", () =>
            if $("#showGraph").is(".disabled") then return
            params = @proxy.prevParams
            reduceVal = params.groupby

            subExprs = []
            labelMapping = {}
            
            showTotal = false
            mainCQP = params.cqp

            console.log "DOING GRAPH CHECKING"
            # THIS IS FLAWED AND SHOULD USE 'getSelectedRows()' INSTEAD.
            # FIXED FOR NOW BUT MIGHT ONLY WORK FOR VISIBLE CHECKBOXES!
            #for chk in @$result.find(".include_chk:checked")
            for chk in @$result.find(".slick-cell > input:checked")
                cell = $(chk).parent()
                #if cell.parent().is ".slick-row:nth-child(1)"
                #    showTotal = true
                #    continue
                cqp = decodeURIComponent cell.next().find(" > .link").data("query")
                unless cqp isnt "undefined" # TODO: make a better check
                    showTotal = true
                    continue
                subExprs.push cqp
                labelMapping[cqp] = cell.next().text()



            activeCorpora = _.flatten [key for key, val of @savedData.corpora when val.sums.absolute]

            @s.$apply () =>
                @s.onGraphShow
                    cqp : mainCQP
                    subcqps : subExprs
                    labelMapping : labelMapping
                    showTotal : showTotal
                    corpusListing : settings.corpusListing.subsetFactory activeCorpora


    updateExportBlob : () ->
        selVal = $("#kindOfData option:selected").val()
        selType = $("#kindOfFormat option:selected").val()
        dataDelimiter = ";"
        dataDelimiter = "%09" if selType is "tsv"
        cl = settings.corpusListing.subsetFactory(_.keys @savedData.corpora)

        header = [
            util.getLocaleString("stats_hit"), 
            util.getLocaleString("stats_total")
        ]
        header = header.concat _.pluck cl.corpora, "title"

        fmt = (what) ->
            what.toString()

        total = ["Σ", fmt @savedData.total.sums[selVal]]

        total = total.concat (fmt @savedData.corpora[corp.toUpperCase()].sums[selVal] for corp in _.pluck cl.corpora, "id")



        output = [
            total
        ]

        for wd in @savedWordArray
            row = [wd, fmt @savedData.total[selVal][wd]]
            values = for corp in _.pluck cl.corpora, "id"
                val = @savedData.corpora[corp.toUpperCase()][selVal][wd]
                if val 
                    val = fmt val
                else 
                    val = "0"

            
            output.push row.concat values


        csv = new CSV(output, {
            header : header
            delimiter : dataDelimiter
            # line : escape(String.fromCharCode(0x0D) + String.fromCharCode(0x0A))
        })

        csvstr = csv.encode()

        blob = new Blob([csvstr], { type: "text/#{selType}"})
        csvUrl = URL.createObjectURL(blob)

        $("#exportButton", @$result).attr({
            download : "export.#{selType}"
            href : csvUrl    
        })

    makeRequest : (cqp) ->
        c.log "statsrequest makerequest", cqp

        if currentMode == "parallel"
            cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")

        if @proxy.hasPending()
            @ignoreAbort = true
        else
            @ignoreAbort = false
            @resetView()

        @showPreloader()
        withinArg = settings.corpusListing.getWithinQueryString() if search().within
        @proxy.makeRequest(cqp, ((args...) => @onProgress(args...)), withinArg
        ).done( ([data, wordArray, columns, dataset]) =>
            # @s.aborted = false
            c.log "dataset.length", dataset.length
            safeApply @s, () =>
                @hidePreloader()
            @savedData = data
            @savedWordArray = wordArray

            @renderResult columns, dataset

        ).fail (textStatus, err) =>
            # _.map(@proxy.pendingRequests, function(item){return item.readyState})
            c.log "fail", arguments
            c.log "stats fail", @s.$parent.loading, _.map @proxy.pendingRequests, (item) -> item.readyState
            # if @proxy.hasPending()
                # c.log "stats makerequest abort exited"
                # return
            if @ignoreAbort
                c.log "stats ignoreabort"
                return
            safeApply @s, () =>
                @hidePreloader()
                if textStatus == "abort"
                    @s.aborted = true
                else
                    @resultError err


    renderResult: (columns, data) ->
        refreshHeaders = ->
            #$(".slick-header-column:nth(2)").click().click()
            $(".slick-column-name:nth(1),.slick-column-name:nth(2)").not("[rel^=localize]").each ->
                $(this).localeKey $(this).text()

        
        @gridData = data
        resultError = super(data)
        return if resultError is false

        if data[0].total_value.absolute == 0
            # @hidePreloader()
            safeApply @s, () =>
                @s.no_hits = true
            return

        checkboxSelector = new Slick.CheckboxSelectColumn
            cssClass: "slick-cell-checkboxsel"

        columns = [checkboxSelector.getColumnDefinition()].concat(columns)
        #$("#myGrid").width($(document).width())
        $("#myGrid").width(800)
        $("#myGrid").height(600)

        #return false
        console.log "grad data", data
        grid = new Slick.Grid $("#myGrid"), data, columns,
            enableCellNavigation: false
            enableColumnReorder: false
        
        grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}))
        grid.registerPlugin(checkboxSelector)
        @grid = grid
        @grid.autosizeColumns()
        #$("#myGrid").width("100%")
        
        sortCol = columns[2]
        log = _.debounce () ->
            c.log "grid sort"
        , 200
        grid.onSort.subscribe (e, args) ->
            sortCol = args.sortCol  
            data.sort (a, b) ->
                log()
                if sortCol.field is "hit_value"
                    x = a[sortCol.field]
                    y = b[sortCol.field]
                else
                    #x = a[sortCol.field].absolute or 0
                    #y = b[sortCol.field].absolute or 0
                    x = a[sortCol.field][0] or 0
                    y = b[sortCol.field][0] or 0
                ret = ((if x is y then 0 else ((if x > y then 1 else -1))))
                ret *= -1 unless args.sortAsc
                ret

            grid.setData data
            grid.updateRowCount()
            grid.render()

        grid.onHeaderCellRendered.subscribe (e, args) ->
            refreshHeaders()

        # remove first checkbox
        # c.log "remove", $(".slick-row:nth(0) .l0.r0 input", @$result).remove()
        refreshHeaders()
        $(".slick-row:first input", @$result).click()
        $(window).trigger("resize")

        $.when(timeDeferred).then =>
            safeApply @s, () =>
                @updateGraphBtnState()            
        safeApply @s, () =>
            @hidePreloader()

    updateGraphBtnState : () ->

        @s.graphEnabled = true
        cl = settings.corpusListing.subsetFactory(@proxy.prevParams.corpus.split(","))

        if not (_.compact cl.getTimeInterval()).length
            @s.graphEnabled = false

    newDataInGraph : (dataName) ->
        dataItems = []
        wordArray = []
        corpusArray = []
        @lastDataName = dataName
        $.each @savedData["corpora"], (corpus, obj) ->
            if dataName is "SIGMA_ALL"

                # ∑ selected
                totfreq = 0
                $.each obj["relative"], (wordform, freq) ->
                    numFreq = parseFloat(freq)
                    totfreq += numFreq if numFreq

                dataItems.push
                    value: totfreq
                    caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString())
                    shape_id: "sigma_all"

            else

                # Individual wordform selected
                freq = parseFloat(obj["relative"][dataName])
                if freq
                    dataItems.push
                        value: freq
                        caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString())
                        shape_id: dataName

                else
                    dataItems.push
                        value: 0
                        caption: ""
                        shape_id: dataName


            $("#dialog").remove()
            if dataName is "SIGMA_ALL"
                topheader = util.getLocaleString("statstable_hitsheader_lemgram")
                locstring = "statstable_hitsheader_lemgram"
            else
                topheader = util.getLocaleString("statstable_hitsheader") + "<i>#{dataName}</i>"
                locstring = "statstable_hitsheader"
            relHitsString = util.getLocaleString("statstable_relfigures_hits")
            $("<div id='dialog' title='#{topheader}' />")
            .appendTo("body")
            .append("""<div id="pieDiv"><br/><div id="statistics_switch" style="text-align:center">
                                <a href="javascript:" rel="localize[statstable_relfigures]" data-mode="relative">Relativa frekvenser</a>
                                <a href="javascript:" rel="localize[statstable_absfigures]" data-mode="absolute">Absoluta frekvenser</a>
                            </div>
                            <div id="chartFrame" style="height:380"></div>
                            <p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">#{relHitsString}</p></div>"""
            ).dialog(
                width: 400
                height: 500
                resize: ->
                    $("#chartFrame").css "height", $("#chartFrame").parent().width() - 20
                    stats2Instance.pie_widget "resizeDiagram", $(this).width() - 60
                    # false

                resizeStop: (event, ui) ->
                    w = $(this).dialog("option", "width")
                    h = $(this).dialog("option", "height")
                    if @width * 1.25 > @height
                        $(this).dialog "option", "height", w * 1.25
                    else
                        $(this).dialog "option", "width", h * 0.80
                    stats2Instance.pie_widget "resizeDiagram", $(this).width() - 60
                close: () ->
                    $("#pieDiv").remove()
            ).css("opacity", 0)
            .parent().find(".ui-dialog-title").localeKey("statstable_hitsheader_lemgram")
            $("#dialog").fadeTo 400, 1
            $("#dialog").find("a").blur() # Prevents the focus of the first link in the "dialog"
            stats2Instance = $("#chartFrame").pie_widget(
                container_id: "chartFrame"
                data_items: dataItems
            )
            statsSwitchInstance = $("#statistics_switch").radioList(
                change: =>
                    typestring = statsSwitchInstance.radioList("getSelected").attr("data-mode")
                    dataItems = []
                    dataName = @lastDataName
                    $.each @savedData["corpora"], (corpus, obj) ->
                        if dataName is "SIGMA_ALL"

                            # sigma selected
                            totfreq = 0
                            $.each obj[typestring], (wordform, freq) ->
                                if typestring is "absolute"
                                    numFreq = parseInt(freq)
                                else
                                    numFreq = parseFloat(freq)
                                totfreq += numFreq if numFreq

                            dataItems.push
                                value: totfreq
                                caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(totfreq.toString(), false)
                                shape_id: "sigma_all"

                        else

                            # Individual wordform selected
                            if typestring is "absolute"
                                freq = parseInt(obj[typestring][dataName])
                            else
                                freq = parseFloat(obj[typestring][dataName])
                            if freq
                                dataItems.push
                                    value: freq
                                    caption: settings.corpora[corpus.toLowerCase()]["title"] + ": " + util.formatDecimalString(freq.toString(), false)
                                    shape_id: dataName

                            else
                                dataItems.push
                                    value: 0
                                    caption: ""
                                    shape_id: dataName


                    stats2Instance.pie_widget "newData", dataItems
                    if typestring is "absolute"
                        loc = "statstable_absfigures_hits"
                    else
                        loc = "statstable_relfigures_hits"
                    $("#hitsDescription").localeKey loc

                selected: "relative"
            )

    onentry : () ->
        super()
        $(window).trigger("resize")
        return
    # onexit : () ->

    resetView: ->
        super()
        $("myGrid").empty()
        $("#exportStatsSection").show()
        $("#exportButton").attr({
            download : null,
            href : null
        })
        # safeApply @s, () ->
        @s.no_hits = false
        @s.aborted = false

    # showNoResults: ->
    #     c.log "showNoResults", @$result
    #     safeApply @s, () =>
    #         @hidePreloader()
    #     @$result.prepend $("<span class=' bad_search bs-callout bs-callout-warning'>")
    #         .localeKey("no_stats_results")
    #     $("#exportStatsSection").hide()

    # onProgress : (progressObj) ->
    #     super(progressObj)
        # c.log "onProgress", progressObj.stats



class view.GraphResults extends BaseResults
    constructor : (tabSelector, resultSelector, scope) ->
        super(tabSelector, resultSelector, scope)

        @zoom = "year"
        @granularity = @zoom[0]
        # @corpora = null
        @proxy = new model.GraphProxy()

        @makeRequest @s.data.cqp,
            @s.data.subcqps,
            @s.data.corpusListing,
            @s.data.labelMapping,
            @s.data.showTotal

        c.log "adding chart listener", @$result

        $(".chart", @$result).on "click", (event) =>

            target = $(".chart", @$result)
            val = $(".detail .x_label > span", target).data "val"
            cqp = $(".detail .item.active > span", target).data("cqp")
            c.log "chart click", cqp, target, @s.data.subcqps, @s.data.cqp
            # time =
            if cqp
                m = moment(val * 1000)

                start = m.format("YYYYMMDD")
                end = m.add(1, "year").subtract(1, "day").format("YYYYMMDD")
                timecqp = "[(int(_.text_datefrom) >= #{start} & int(_.text_dateto) <= #{end})]"

                n_tokens = @s.data.cqp.split("]").length - 2

                timecqp = ([timecqp].concat (_.map [0...n_tokens], () -> "[]")).join(" ")

                opts = {}
                opts.ajaxParams =
                    start : 0
                    end : 24
                    command : "query"
                    corpus: @s.data.corpusListing.stringifySelected()
                    cqp: @s.data.cqp
                    cqp2 : decodeURIComponent cqp
                    cqp3 : timecqp
                    expand_prequeries : false


                safeApply @s.$root, () =>
                    @s.$root.kwicTabs.push opts



    # onentry : () ->
    #     super
    # onexit : ->

    parseDate : (granularity, time) ->
        [year,month,day] = [null,0,1]
        switch granularity
            when "y" then year = time
            when "m"
                year = time[0...4]
                month = time[4...6]
            when "d"
                year = time[0...4]
                month = time[4...6]
                day = time[6...8]

        return moment([Number(year), Number(month), Number(day)])


    fillMissingDate : (data) ->
        dateArray = _.pluck data, "x"
        min = _.min dateArray, (mom) -> mom.toDate()
        max = _.max dateArray, (mom) -> mom.toDate()


        duration = switch @granularity
            when "y"
                duration = moment.duration year :  1
                diff = "year"
            when "m"
                duration = moment.duration month :  1
                diff = "month"
            when "d"
                duration = moment.duration day :  1
                diff = "day"

        n_diff = moment(max).diff min, diff

        momentMapping = _.object _.map data, (item) ->
            [moment(item.x).unix(), item.y]

        newMoments = []
        for i in [0..n_diff]
            newMoment = moment(min).add(diff, i)
            maybeCurrent = momentMapping[newMoment.unix()]
            if typeof maybeCurrent != 'undefined'
                lastYVal = maybeCurrent
            else
                newMoments.push {x : newMoment, y : lastYVal}
                

        return [].concat data, newMoments




    getSeriesData : (data) ->
        delete data[""]
        # TODO: getTimeInterval should take the corpora of this parent tab instead of the global ones.
        [first, last] = settings.corpusListing.getTimeInterval()
        firstVal = @parseDate "y", first
        lastVal = @parseDate "y", last.toString()

        hasFirstValue = false
        hasLastValue = false
        output = for [x, y] in (_.pairs data)
            mom = (@parseDate @granularity, x)
            if mom.isSame firstVal then hasFirstValue = true
            if mom.isSame lastVal then hasLastValue = true
            {x : mom, y : y}

        unless hasFirstValue
            output.push {x : firstVal, y:0}

        output = @fillMissingDate output


        output =  output.sort (a, b) ->
            a.x.unix() - b.x.unix()

        #remove last element
        output.splice(output.length-1, 1)

        for tuple in output
            tuple.x = tuple.x.unix()

        return output


    hideNthTick : (graphDiv) ->
        $(".x_tick:visible", graphDiv).hide()
        .filter((n) ->
            return n % 2 == 0
            # return Number($(this).text()) % 5 == 0
        ).show()

    updateTicks : () ->
        ticks = $(".chart .title:visible", @$result)
        firstTick = ticks.eq(0)
        secondTick = ticks.eq(1)

        margin = 5
        
        if not firstTick.length or not secondTick.length then return
        if firstTick.offset().left + firstTick.width() + margin > secondTick.offset().left
            @hideNthTick $(".chart", @$result)
            @updateTicks()  


    getNonTime : () ->
        #TODO: move settings.corpusListing.selected to the subview
        non_time = _.reduce (_.pluck settings.corpusListing.selected, "non_time"), ((a, b) -> (a or 0) + (b or 0)), 0
        # c.log "non_time", non_time
        sizelist = _.map settings.corpusListing.selected, (item) -> Number item.info.Size

        totalsize = _.reduce sizelist, (a, b) -> a + b


        return (non_time / totalsize) * 100


    # onProgress : (progress) ->
    #     super progress
    #     c.log "progress", progress

    getEmptyIntervals : (data) ->
        intervals = []
        i = 0

        while i < data.length
            item = data[i]

            if item.y == null
                interval = [_.clone item]
                breaker = true
                while breaker
                    i++
                    item = data[i]
                    if item?.y == null
                        interval.push _.clone item
                    else
                        # if data[i + 1] then interval.push _.clone data[i + 1]
                        intervals.push interval
                        breaker = false
            i++

        # return intervals.splice(intervals.length - 1, 1)
        return intervals


    drawIntervals : (graph, intervals) ->
        # c.log "unitWidth", unitWidth
        unless $(".zoom_slider", @$result).is ".ui-slider"
            return
        [from, to] = $('.zoom_slider', @$result).slider("values")
        
        unitSpan = moment.unix(to).diff(moment.unix(from), @zoom)
        unitWidth = graph.width / unitSpan

        $(".empty_area", @$result).remove()
        for list in intervals
            max = _.max list, "x"
            min = _.min list, "x"
            from = Math.round graph.x min.x
            to = Math.round graph.x max.x
            # c.log "from", from, to
            offset = 8
            $("<div>", {class : "empty_area"}).css
                # left : ((from + unitWidth / 2) - offset)
                left : from - unitWidth / 2
                # width : (to - from) - unitWidth / 2
                width : (to - from) + unitWidth
            .appendTo graph.element


    setBarMode : () ->
        if $(".legend .line", @$result).length > 1
            $(".legend li:last:not(.disabled) .action", @$result).click()
            if (_.all _.map $(".legend .line", @$result), (item) -> $(item).is(".disabled"))
                $(".legend li:first .action", @$result).click()
        return
    setLineMode : () ->

    setTableMode : () ->

    makeRequest : (cqp, subcqps, corpora, labelMapping, showTotal) ->
        c.log "makeRequest", cqp, subcqps, corpora, labelMapping, showTotal
        # hidden = $(".progress_container", @$result).nextAll().hide()
        @s.loading = true
        @showPreloader()
        @proxy.makeRequest(cqp, subcqps, corpora.stringifySelected()).progress( (data) =>
            @onProgress(data)



        ).fail( (data) =>
            c.log "graph crash"
            @resultError(data)
            @s.loading = false


        ).done (data) =>
            c.log "graph data", data
                
            if data.ERROR
                @resultError data
                return
            nontime = @getNonTime()
            
            if nontime
                $(".non_time", @$result).text(nontime.toFixed(2) + "%").parent().localize()
            else
                $(".non_time_div", @$result).hide()

            if _.isArray data.combined
                palette = new Rickshaw.Color.Palette("colorwheel")
                series = []
                for item in data.combined
                    color = palette.color()
                    # @colorToCqp[color] = item.cqp
                    series.push {
                        data : @getSeriesData item.relative
                        color : color
                        # name : item.cqp?.replace(/(\\)|\|/g, "") || "&Sigma;"
                        name : if item.cqp then labelMapping[item.cqp] else "&Sigma;"
                        cqp : item.cqp or cqp
                        abs_data : @getSeriesData item.absolute
                    }
            else # TODO: get rid of code doubling and use seriesData variable
                # @colorToCqp['steelblue'] = cqp
                series = [{
                            data: @getSeriesData data.combined.relative
                            color: 'steelblue'
                            name : "&Sigma;"
                            cqp : cqp
                            abs_data : @getSeriesData data.combined.absolute
                        }]
            Rickshaw.Series.zeroFill(series)
            # window.data = series[0].data
            emptyIntervals = @getEmptyIntervals(series[0].data)
            @s.hasEmptyIntervals = emptyIntervals.length
            # c.log "emptyIntervals", emptyIntervals

            for s in series
                s.data = _.filter s.data, (item) -> item.y != null


            graph = new Rickshaw.Graph
                element: $(".chart", @$result).get(0)
                renderer: 'line'
                interpolation : "linear"
                series: series
                padding :
                    top : 0.1
                    right : 0.01
                # min : "auto"
            graph.render()
            window._graph = graph
            
            

            @drawIntervals(graph, emptyIntervals)


            $(window).on "resize", _.throttle(() =>
                if @$result.is(":visible")
                    graph.setSize()
                    graph.render()
            , 200)

            $(".form_switch", @$result).click (event) =>
                val = @s.mode
                for cls in @$result.attr("class").split(" ")
                    if cls.match(/^form-/) then @$result.removeClass(cls)
                @$result.addClass("form-" +val)
                $(".chart,.zoom_slider,.legend", @$result.parent()).show()
                $(".time_table", @$result.parent()).hide()
                if val == "bar"
                    if $(".legend .line", @$result).length > 1
                        $(".legend li:last:not(.disabled) .action", @$result).click()
                        if (_.all _.map $(".legend .line", @$result), (item) -> $(item).is(".disabled"))
                            $(".legend li:first .action", @$result).click()
                else if val == "table"
                    $(".chart,.zoom_slider,.legend", @$result).hide()
                    $(".time_table", @$result.parent()).show()
                    nRows = series.length or 2
                    h = (nRows * 2) + 4
                    h = Math.min h, 40
                    $(".time_table:visible", @$result).height "#{h}.1em"
                    @time_grid?.resizeCanvas()
                    $(".exportTimeStatsSection", @$result).show()
                    
                    setExportUrl = () ->
                        selVal = $(".timeKindOfData option:selected", @$result).val()
                        selType = $(".timeKindOfFormat option:selected", @$result).val()
                        dataDelimiter = if selType is "TSV" then "%09" else ";"

                        header = [ util.getLocaleString("stats_hit") ]

                        for cell in series[0].data
                            header.push moment(cell.x * 1000).format("YYYY")

                        output = [header]

                        for row in series
                            cells = [ if row.name is "&Sigma;" then "Σ" else row.name ]
                            for cell in row.data
                                if selVal is "relative"
                                    cells.push cell.y
                                else
                                    i = _.indexOf (_.pluck row.abs_data, "x"), cell.x, true
                                    cells.push row.abs_data[i].y
                            output.push cells
                        
                        csv = new CSV(output, {
                            header : header
                            delimiter : dataDelimiter
                            # line : escape(String.fromCharCode(0x0D) + String.fromCharCode(0x0A))
                        })
                        csvstr = csv.encode()
                        blob = new Blob([csvstr], { type: "text/#{selType}"})
                        csvUrl = URL.createObjectURL(blob)
                        $(".exportTimeStatsSection .btn.export", @$result).attr({
                            download : "export.#{selType}"
                            href : csvUrl    
                        })

                    setExportUrl()

                    # $(".timeExportButton", @$result).unbind "click"
                    # $(".timeExportButton", @$result).click =>



                unless val == "table"
                    graph.setRenderer val
                    graph.render()
                    $(".exportTimeStatsSection", @$result).hide()

            HTMLFormatter = (row, cell, value, columnDef, dataContext) -> value


            time_table_data = []
            time_table_columns_intermediate = {}
            for row in series
                new_time_row = {"label" : row.name}
                for item in row.data
                    timestamp = moment(item.x * 1000).format("YYYY") # this needs to be fixed for other resolutions
                    time_table_columns_intermediate[timestamp] =
                        "name" : timestamp
                        "field" : timestamp
                        "formatter" : (row, cell, value, columnDef, dataContext) ->
                            loc = {
                                'sv' : "sv-SE"
                                'en' : "gb-EN"
                            }[$("body").scope().lang]
                            fmt = (valTup) ->
                                if typeof valTup[0] == "undefined" then return ""
                                return "<span>" +
                                        "<span class='relStat'>" + Number(valTup[1].toFixed(1)).toLocaleString(loc) + "</span> " + 
                                        "<span class='absStat'>(" + valTup[0].toLocaleString(loc) + ")</span> " +
                                  "<span>"
                            return fmt(value)
                    i = _.indexOf (_.pluck row.abs_data, "x"), item.x, true
                    #new_time_row[timestamp] = {"relative" : item.y, "absolute" : row.abs_data[i].y}
                    new_time_row[timestamp] = [item.y, row.abs_data[i].y]
                time_table_data.push new_time_row
            # Sort columns
            time_table_columns = [
                                "name" : "Hit"
                                "field" : "label"
                                "formatter" : HTMLFormatter
                                ]
            for key in _.keys(time_table_columns_intermediate).sort()
                time_table_columns.push(time_table_columns_intermediate[key])

            time_grid = new Slick.Grid $(".time_table", @$result), time_table_data, time_table_columns,
                enableCellNavigation: false
                enableColumnReorder: false
            #time_grid.autosizeColumns()
            $(".time_table", @$result).width("100%")
            @time_grid = time_grid
            # $(".smoothing_label .ui-button-text", @$result.parent()).localeKey("smoothing")
            # $(".form_switch .ui-button:first .ui-button-text", @$result).localeKey("line")
            # $(".form_switch .ui-button:eq(1) .ui-button-text", @$result).localeKey("bar")
            # $(".form_switch .ui-button:last .ui-button-text", @$result).localeKey("table")
            legend = new Rickshaw.Graph.Legend
                element: $(".legend", @$result).get(0)
                graph: graph

            shelving = new Rickshaw.Graph.Behavior.Series.Toggle
                graph: graph
                legend: legend

            if not showTotal and $(".legend .line", @$result).length > 1
                $(".legend .line:last .action", @$result).click()

            hoverDetail = new Rickshaw.Graph.HoverDetail( {
                graph: graph
                xFormatter: (x) =>
                    d = new Date(x * 1000)
                    output = ["<span rel='localize[year]'>#{util.getLocaleString('year')}</span>: <span class='currently'>#{d.getFullYear()}</span>",
                              "<span rel='localize[month]'>#{util.getLocaleString('month')}</span>: <span class='currently'>#{d.getMonth()}</span>",
                              "<span rel='localize[day]'>#{util.getLocaleString('day')}</span>: <span class='currently'>#{d.getDay()}</span>"
                              ]
                    out = switch @granularity
                        when "y" then output[0]
                        when "m" then output[0..1].join("\n")
                        when "d" then output.join("\n")

                    return "<span data-val='#{x}'>#{out}</span>"


                yFormatter: (y) ->
                    val = util.formatDecimalString (y.toFixed 2), false, true, true

                    "<br><span rel='localize[rel_hits_short]'>#{util.getLocaleString 'rel_hits_short'}</span> " + val
                formatter : (series, x, y, formattedX, formattedY, d) ->
                    i = _.indexOf (_.pluck series.abs_data, "x"), x, true
                    abs_y = series.abs_data[i].y


                    rel = series.name + ':&nbsp;' + formattedY
                    return """<span data-cqp="#{encodeURIComponent(series.cqp)}">
                        #{rel}
                        <br>
                        #{util.getLocaleString 'abs_hits_short'}: #{abs_y}
                    </span>"""
                # , 100)
            } )

            [first, last] = settings.corpusListing.getTimeInterval()

            timeunit = if last - first > 100 then "decade" else @zoom

            toDate = (sec) ->
                moment(sec * 1000).toDate()

            time = new Rickshaw.Fixtures.Time()
            old_ceil = time.ceil
            time.ceil = (time, unit) =>
                if unit.name == "decade"
                    out = Math.ceil(time / unit.seconds) * unit.seconds;
                    mom = moment(out * 1000)
                    if mom.date() == 31
                        mom.add("day", 1)
                    return mom.unix()
                else 
                    return old_ceil(time, unit)

            xAxis = new Rickshaw.Graph.Axis.Time
                graph: graph
                timeUnit: time.unit(timeunit)

            slider = new Rickshaw.Graph.RangeSlider
                graph: graph,
                element: $('.zoom_slider', @$result)

            old_render = xAxis.render
            xAxis.render = () =>
                old_render.call xAxis
                @updateTicks()
                @drawIntervals(graph, emptyIntervals)
            

            old_tickOffsets = xAxis.tickOffsets
            xAxis.tickOffsets = () =>
                domain = xAxis.graph.x.domain()

                unit = xAxis.fixedTimeUnit or xAxis.appropriateTimeUnit()
                count = Math.ceil((domain[1] - domain[0]) / unit.seconds)

                runningTick = domain[0]

                offsets = []

                for i in [0...count]
                    tickValue = time.ceil(runningTick, unit)
                    runningTick = tickValue + unit.seconds / 2

                    offsets.push( { value: tickValue, unit: unit, _date: moment(tickValue * 1000).toDate() } )

                return offsets

            xAxis.render()

            yAxis = new Rickshaw.Graph.Axis.Y
                graph: graph

            yAxis.render()
            # hidden.fadeIn()
            @hidePreloader()
            safeApply @s, () =>
                @s.loading = false

            $(window).trigger("resize")







