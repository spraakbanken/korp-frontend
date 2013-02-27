class BaseResults
    constructor: (tabSelector, resultSelector) ->
        @$tab = $(tabSelector)
        @$result = $(resultSelector)
        @index = @$tab.index()
        @optionWidget = $("#search_options")
        @num_result = @$result.find(".num-result")
        @$result.add(@$tab).addClass "not_loading"

    onProgress: (progressObj) ->

        # TODO: this item only exists in the kwic.
        @num_result.html prettyNumbers(progressObj["total_results"])
        unless isNaN(progressObj["stats"])
            try
                @$result.find(".progress progress").attr "value", Math.round(progressObj["stats"])
            catch e
                c.log "onprogress error", e
        @$tab.find(".tab_progress").css "width", Math.round(progressObj["stats"]).toString() + "%"

    renderResult: (data) ->

        #       this.resetView();
        @$result.find(".error_msg").remove()
        c.log "renderResults", @proxy
        util.setJsonLink @proxy.prevRequest if @$result.is(":visible")

        #$("#result-container").tabs("select", 0);
        disabled = $("#result-container").korptabs("option", "disabled")
        newDisabled = $.grep(disabled, (item) =>
            item isnt @index
        )
        $("#result-container").korptabs "option", "disabled", newDisabled
        if data.ERROR
            @resultError data
            false

    resultError: (data) ->
        c.log "json fetch error: " + $.dump(data.ERROR)
        @hidePreloader()
        @resetView()
        $('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">')
            .append("<img class='korp_fail' src='img/korp_fail.svg'>")
            .add($("<div class='fail_text' />")
            .localeKey("fail_text"))
            .addClass("inline_block")
            .prependTo(@$result)
            .wrapAll "<div class='error_msg'>"
        util.setJsonLink @proxy.prevRequest

    showPreloader: ->
        @$result.add(@$tab).addClass("loading").removeClass "not_loading"
        @$tab.find(".tab_progress").css "width", 0 #.show();
        @$result.find("progress").attr "value", 0

    hidePreloader: ->
        @$result.add(@$tab).removeClass("loading").addClass "not_loading"

    resetView: ->
        @$result.find(".error_msg").remove()


class view.KWICResults extends BaseResults
    constructor : (tabSelector, resultSelector) ->
        self = this
        @prevCQP = null
        super tabSelector, resultSelector
        @initHTML = @$result.html()
        @proxy = kwicProxy
        @readingProxy = new model.KWICProxy()
        @current_page = 0
        # @selectionManager = @$result.scope().selectionManager
        @selectionManager = getScope("kwicCtrl").selectionManager
        @$result.click =>
            return unless @selectionManager.hasSelected()
            @selectionManager.deselect()
            $.sm.send "word.deselect"

        @$result.find(".reading_btn").click =>
            isReading = @$result.is(".reading_mode")
            if $.bbq.getState("reading_mode")
                $.bbq.removeState "reading_mode"
            else
                $.bbq.pushState reading_mode: true


        @$result.addClass "reading_mode" if $.bbq.getState("reading_mode")

    resetView: ->
        super()
        # @$result.find(".results_table,.pager-wrapper").empty()
        @$result.find(".pager-wrapper").empty()

    getProxy: ->
        return @readingProxy if @$result.is(".reading_mode")
        @proxy

    onentry: ->
        @centerScrollbar()
        $(document).keydown $.proxy(@onKeydown, this)

    onexit: ->
        $(document).unbind "keydown", @onKeydown

    onKeydown: (event) ->
        isSpecialKeyDown = event.shiftKey or event.ctrlKey or event.metaKey
        return if isSpecialKeyDown or $("input[type=text], textarea").is(":focus")
        switch event.which
            when 78 # n
                @$result.find(".pager-wrapper .next").click()
                return false
            when 70 # f
                @$result.find(".pager-wrapper .prev").click()
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
        items_per_page = Number(@optionWidget.find(".num_hits").val())
        output = {}
        output.start = (page or 0) * items_per_page
        output.end = (output.start + items_per_page) - 1
        output

    renderCompleteResult: (data) ->
        unless data.hits
            c.log "no kwic results"
            @showNoResults()
            return
        @$result.removeClass "zero_results"
        @$result.find(".num-result").html prettyNumbers(data.hits)
        @renderHitsPicture data
        @buildPager data.hits
        @hidePreloader()


    # renderKwicResult: (data, sourceCQP) ->
    #     c.log "renderKwicResult", data
    #     # @$result.find(".results_table.reading").empty()
    #     @renderResult ".results_table.kwic", data, sourceCQP

    renderResult: (data) ->
        resultError = super(data)
        return if resultError is false
        self = this

        # this.prevCQP = sourceCQP;
        c.log "corpus_results"
        isReading = @$result.is(".reading_mode")



        # applyTo "kwicCtrl", ($scope) ->
        @$result.scope().$apply ($scope) ->
            if isReading
                $scope.setContextData(data)
            else
                $scope.setKwicData(data)

        if currentMode == "parallel" and not isReading
            for linked in $(".linked_sentence")
                mainrow = $(linked).prev()
                offset = mainrow.find(".left .word:first").position().left - 25
                $(linked).find(".lnk").css("padding-left", Math.round(offset))

        @hidePreloader()
        @$result.localize()
        @centerScrollbar()
        @$result.find(".match").children().first().click()

    showNoResults: ->
        # @$result.find(".results_table").empty()
        @$result.find(".pager-wrapper").empty()
        @hidePreloader()
        @$result.find(".num-result").html 0
        @$result.addClass("zero_results").click()

        #   this.$result.find(".sort_select").hide();
        @$result.find(".hits_picture").html ""

    renderHitsPicture: (data) ->
        self = this
        if settings.corpusListing.selected.length > 1
            totalhits = data["hits"]
            hits_picture_html = "<table class='hits_picture_table'><tr height='18px'>"
            barcolors = ["color_blue", "color_purple", "color_green", "color_yellow", "color_azure", "color_red"]
            ccounter = 0
            corpusOrderArray = $.grep(data.corpus_order, (corpus) ->
                data.corpus_hits[corpus] > 0
            )
            $.each corpusOrderArray, (index, corp) ->
                hits = data["corpus_hits"][corp]
                color = (if index % 2 is 0 then settings.primaryColor else settings.primaryLight)
                hits_picture_html += """<td class="hits_picture_corp" data="#{corp}"
                                            style="width:#{hits / totalhits * 100}%;background-color : #{color}"></td>"""

            hits_picture_html += "</tr></table>"
            @$result.find(".hits_picture").html hits_picture_html

            # Make sure that there is no mousover effect on touch screen devices:
            ua = navigator.userAgent
            if ua.match(/Android/i) or ua.match(/webOS/i) or ua.match(/iPhone/i) or ua.match(/iPod/i)
                @$result.find(".hits_picture_table").css "opacity", "1"
            @$result.find(".hits_picture_corp").each ->
                corpus_name = $(this).attr("data")
                $(this).tooltip
                    delay: 0
                    bodyHandler: ->
                        corpusObj = settings.corpora[corpus_name.toLowerCase()]
                        corpusObj = settings.corpora[corpus_name.split("|")[0].toLowerCase()]  if currentMode is "parallel"
                        nHits = prettyNumbers(data["corpus_hits"][corpus_name].toString())
                        return """<img src="img/korp_icon.png" style="vertical-align:middle"/>
                                  <b>#{corpusObj["title"]} (#{nHits}) #{util.getLocaleString("hitspicture_hits")})</b>
                                  <br/><br/><i>#{util.getLocaleString("hitspicture_gotocorpushits")}</i>"""



            # Click to ge to the first page with a hit in the particular corpus
            @$result.find(".hits_picture_corp").click (event) ->
                theCorpus = $(this).attr("data")

                # Count the index of the first hit for the corpus:
                firstIndex = 0
                $.each data["corpus_order"], (index, corp) ->
                    return false  if corp is theCorpus
                    firstIndex += data["corpus_hits"][corp]

                firstHitPage = Math.floor(firstIndex / $("#num_hits").val())
                self.handlePaginationClick firstHitPage, null, true
                false

        else
            @$result.find(".hits_picture").html ""

    scrollToShowWord: (word) ->
        offset = 200
        wordTop = word.offset().top
        newY = window.scrollY
        if wordTop > $(window).height() + window.scrollY
            newY += offset
        else newY -= offset  if wordTop < window.scrollY
        $("html, body").stop(true, true).animate scrollTop: newY
        wordLeft = word.offset().left
        area = @$result.find(".table_scrollarea")
        newX = Number(area.scrollLeft())
        if wordLeft > (area.offset().left + area.width())
            newX += offset
        else newX -= offset  if wordLeft < area.offset().left
        area.stop(true, true).animate scrollLeft: newX

    buildPager: (number_of_hits) ->
        c.log "buildPager", @current_page
        items_per_page = @optionWidget.find(".num_hits").val()
        @movePager "up"
        $.onScrollOut "unbind"
        @$result.find(".pager-wrapper").unbind().empty()
        if number_of_hits > items_per_page
            @$result.find(".pager-wrapper").pagination number_of_hits,
                items_per_page: items_per_page
                callback: $.proxy(@handlePaginationClick, this)
                next_text: util.getLocaleString("next")
                prev_text: util.getLocaleString("prev")
                link_to: "javascript:void(0)"
                num_edge_entries: 2
                ellipse_text: ".."
                current_page: @current_page or 0

            @$result.find(".next").attr "rel", "localize[next]"
            @$result.find(".prev").attr "rel", "localize[prev]"

    handlePaginationClick: (new_page_index, pagination_container, force_click) ->
        c.log "handlePaginationClick", new_page_index, @current_page
        self = this
        if new_page_index isnt @current_page or !!force_click
            isReading = @$result.is(".reading_mode")
            kwicCallback = @renderResult

            this.showPreloader();
            @current_page = new_page_index

            #     this.proxy.makeRequest(this.buildQueryOptions(), this.current_page, function(progressObj) {
            @getProxy().makeRequest @buildQueryOptions(), @current_page, ((progressObj) ->

                #progress
                self.$result.find(".progress progress").attr "value", Math.round(progressObj["stats"]) unless isNaN(progressObj["stats"])
                self.$tab.find(".tab_progress").css "width", Math.round(progressObj["stats"]).toString() + "%"
            ), ((data) ->
                #success
                self.buildPager data.hits
            ), $.proxy(kwicCallback, this)
            $.bbq.pushState page: new_page_index
        false

    buildQueryOptions: ->
        opts = {}
        opts.cqp = @prevCQP
        opts.queryData = @proxy.queryData
        opts.sort = $(".sort_select").val()
        opts.random_seed = $.bbq.getState("random_seed") if opts.sort is "random"
        opts.context = settings.corpusListing.getContextQueryString() if @$result.is(".reading_mode")
        return opts

    makeRequest: (page_num) ->
        isReading = @$result.is(".reading_mode")
        @showPreloader()

        # applyTo "kwicCtrl", ($scope) ->
        c.log "makeRequest", @$result, @$result.scope()
        @$result.scope().$apply ($scope) ->
            c.log "apply", $scope, $scope.setContextData
            if isReading
                $scope.setContextData({kwic:[]})
            else
                $scope.setKwicData({kwic:[]})
                # $scope.kwic = data.kwic

        kwicCallback = $.proxy(@renderResult, this)
        @proxy.makeRequest @buildQueryOptions(),
                           page_num or @current_page,
                           (if isReading then $.noop else $.proxy(@onProgress, this)),
                           $.proxy(@renderCompleteResult, this),
                           kwicCallback


    #   this.proxy.makeRequest(this.buildQueryOptions(), page_num || this.current_page, $.noop);
    setPage: (page) ->
        @$result.find(".pager-wrapper").trigger "setPage", [page]

    centerScrollbar: ->
        m = @$result.find(".match:visible:first")
        return unless m.length
        area = @$result.find(".table_scrollarea").scrollLeft(0)
        match = m.first().position().left + m.width() / 2
        sidebarWidth = $("#sidebar").outerWidth() or 0
        area.stop(true, true).scrollLeft match - ($("body").innerWidth() - sidebarWidth) / 2

    getCurrentRow: ->
        tr = @$result.find(".token_selected").closest("tr")
        if @$result.find(".token_selected").parent().is("td")
            tr.find "td > .word"
        else
            tr.find "div > .word"

    selectNext: ->
        unless @$result.is(".reading_mode")
            i = @getCurrentRow().index(@$result.find(".token_selected").get(0))
            next = @getCurrentRow().get(i + 1)
            return unless next?
            $(next).click()

        else
            next = @$result.find(".token_selected").next().click()
        return next

    selectPrev: ->
        unless @$result.is(".reading_mode")
            i = @getCurrentRow().index(@$result.find(".token_selected").get(0))
            return  if i is 0
            prev = @getCurrentRow().get(i - 1)
            $(prev).click()
        else
            prev = @$result.find(".token_selected").prev().click()
        return prev

    selectUp: ->
        current = @selectionManager.selected
        unless @$result.is(".reading_mode")
            prevMatch = @getWordAt(current.offset().left + current.width() / 2, current.closest("tr").prevAll(".sentence").first())
            prevMatch.click()
        else
            searchwords = current.prevAll(".word").get().concat(current.closest(".sentence").prev().find(".word").get().reverse())
            def = current.parent().prev().find(".word:last")
            prevMatch = @getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click()

        return prevMatch

    selectDown: ->
        current = @selectionManager.selected
        unless @$result.is(".reading_mode")
            nextMatch = @getWordAt(current.offset().left + current.width() / 2, current.closest("tr").nextAll(".sentence").first())
            nextMatch.click()
        else
            searchwords = current.nextAll(".word").add(current.closest(".sentence").next().find(".word"))
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
            false  if (xCoor > thisLeft and xCoor < thisRight) or thisLeft > xCoor

        output

    setupPagerMover: ->
        self = this
        pager = @$result.find(".pager-wrapper")
        upOpts =
            point: pager.offset().top + pager.height()
            callback: ->
                self.movePager "up"

        self.movePager "down"
        downOpts =
            point: pager.offset().top + pager.height()
            callback: ->
                self.movePager "down"

        self.movePager "up"
        c.log "onscrollout", upOpts.point, downOpts.point
        $.onScrollOut upOpts, downOpts

    movePager: (dir) ->
        pager = @$result.find(".pager-wrapper")
        if dir is "down"
            pager.data("prevPos", pager.prev()).appendTo @$result
        else
            pager.data("prevPos").after pager  if pager.data("prevPos")





class view.ExampleResults extends view.KWICResults
    constructor: (tabSelector, resultSelector) ->
        super tabSelector, resultSelector
        @proxy = new model.ExamplesProxy()
        @$result.find(".progress").hide()
        @$result.add(@$tab).addClass "not_loading customtab"
        @$result.removeClass "reading_mode"

    makeRequest: (opts) ->
        @resetView()
        $.extend opts,
            success: (data) =>
                c.log "ExampleResults success", data, opts
                @renderResult data, opts.cqp
                @renderCompleteResult data
                @hidePreloader()
                util.setJsonLink @proxy.prevRequest
                @$result.find(".num-result").html prettyNumbers(data.hits)

            error: ->
                @hidePreloader()

            incremental: false

        @showPreloader()

        #   this.proxy.makeRequest(opts, $.proxy(this.onProgress, this));
        @proxy.makeRequest opts, null, $.noop, $.noop, $.noop

    onHpp: ->

        #refresh search
        @handlePaginationClick 0, null, true
        false

    handlePaginationClick: (new_page_index, pagination_container, force_click) ->
        c.log "handlePaginationClick", new_page_index, @current_page
        if new_page_index isnt @current_page or !!force_click
            items_per_page = parseInt(@optionWidget.find(".num_hits").val())
            opts = {}
            opts.cqp = @prevCQP
            opts.start = new_page_index * items_per_page
            opts.end = (opts.start + items_per_page)
            opts.sort = $(".sort_select").val()
            @current_page = new_page_index
            @makeRequest opts
        false

    onSortChange: (event) ->
        opt = $(event.currentTarget).find(":selected")
        c.log "sort", opt
        if opt.is(":first-child")
            $.bbq.removeState "sort"
        else
            c.log "sort", opt.val()
            @handlePaginationClick 0, null, true


    #     $.bbq.pushState({"sort" : opt.val()});
    showPreloader: ->
        @$result.add(@$tab).addClass("loading").removeClass "not_loading"
        @$tab.find(".spinner").remove()
        $("<div class='spinner' />").appendTo(@$tab).spinner
            innerRadius: 5
            outerRadius: 7
            dashes: 8
            strokeWidth: 3

        @$tab.find(".tabClose").hide()

    hidePreloader: ->
        @$result.add(@$tab).addClass("not_loading").removeClass "loading"
        @$tab.find(".spinner").remove()
        @$tab.find(".tabClose").show()

class view.LemgramResults extends BaseResults
    constructor: (tabSelector, resultSelector) ->
        self = this
        super tabSelector, resultSelector

        #   TODO: figure out what I use this for.
        @resultDeferred = $.Deferred()
        @proxy = lemgramProxy
        @order = #    "_" represents the actual word in the order
            vb: ["SS_d,_,OBJ_d,ADV_d".split(",")] #OBJ_h, , "SS_h,_".split(",")
            nn: ["PA_h,AT_d,_,ET_d".split(","), "_,SS_h".split(","), "OBJ_h,_".split(",")]
            av: [[], "_,AT_h".split(",")]
            jj: [[], "_,AT_h".split(",")]
            pp: [[], "_,PA_d".split(",")]

        @$result.find("#wordclassChk").change ->
            if $(this).is(":checked")
                $(".lemgram_result .wordclass_suffix", self.$result).show()
            else
                $(".lemgram_result .wordclass_suffix", self.$result).hide()


    resetView: ->
        super()
        $("#results-lemgram .content_target").empty()

    renderResult: (data, query) ->
        resultError = super(data)
        @resetView()
        return  if resultError is false
        unless data.relations
            @showNoResults()
            @resultDeferred.reject()
        else if util.isLemgramId(query)
            @renderTables query, data.relations
            @resultDeferred.resolve()
        else
            @renderWordTables query, data.relations
            @resultDeferred.resolve()

    renderHeader: (wordClass, sections) ->
        colorMapping =
            SS: "color_blue"
            OBJ: "color_purple"
            ADV: "color_green"
            Head: "color_yellow"
            AT: "color_azure"
            ET: "color_red"
            PA: "color_green"

        $(".tableContainer:last .lemgram_section").each((i) ->
            $parent = $(this).find(".lemgram_help")
            $(this).find(".lemgram_result").each ->
                if $(this).data("rel")
                    color = colorMapping[$(this).data("rel")]
                    cell = $("<span />", class: "lemgram_header_item")
                        .localeKey(if i is 1 then altLabel else "malt_" + $(this).data("rel"))
                        .addClass(color).appendTo($parent)
                    if i > 0
                        altLabel = {
                            av: "nn"
                            jj: "nn"
                            nn: "vb"
                            pp: "nn"
                        }[wordClass]
                        # cell.attr("rel", altLabel).text util.getLocaleString(altLabel)?.capitalize()
                        c.log "altLabel", altLabel, wordClass
                        cell.localeKey(altLabel)
                    $(this).addClass(color).css "border-color", $(this).css("background-color")
                else
                    $($.format("<span class='hit'><b>%s</b></span>", $(this).data("word"))).appendTo $parent

        ).append "<div style='clear:both;'/>"

    renderWordTables: (word, data) ->
        self = this
        wordlist = $.map(data, (item) ->
            output = []
            output.push item.head  if item.head.split("_")[0] is word
            output.push item.dep  if item.dep.split("_")[0] is word
            output
        )
        unique_words = []
        $.each wordlist, (i, word) ->
            unique_words.push word  if $.inArray(word, unique_words) is -1

        $.each unique_words, (i, currentWd) ->
            getRelType = (item) ->
                if item.dep is currentWd
                    item.rel + "_h"
                else if item.head is currentWd
                    item.rel + "_d"
                else
                    false
            wordClass = currentWd.split("_")[1].toLowerCase()
            self.drawTable currentWd, wordClass, data, getRelType
            self.renderHeader wordClass
            $(".tableContainer:last").prepend($("<div>",
                class: "header"
            ).html(util.lemgramToString(currentWd))).find(".hit .wordclass_suffix").hide()

        $(".lemgram_result .wordclass_suffix").hide()
        @hidePreloader()

    renderTables: (lemgram, data) ->
        getRelType = (item) ->
            if item.dep is lemgram
                item.rel + "_h"
            else
                item.rel + "_d"
        wordClass = util.splitLemgram(lemgram).pos.slice(0, 2)
        @drawTable lemgram, wordClass, data, getRelType
        $(".lemgram_result .wordclass_suffix").hide()
        @renderHeader wordClass
        @hidePreloader()

    drawTable: (token, wordClass, data, relTypeFunc) ->
        inArray = (rel, orderList) ->
            i = $.inArray(rel, orderList)
            type = (if rel.slice(-1) is "h" then "head" else "dep")
            i: i
            type: type
        self = this
        c.log "drawTable", wordClass, @order[wordClass]
        unless @order[wordClass]?
            @showNoResults()
            return
        orderArrays = [[], [], []]
        $.each data, (index, item) ->
            $.each self.order[wordClass], (i, rel_type_list) ->
                list = orderArrays[i]
                rel = relTypeFunc(item)
                return if rel is false
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


            if self.order[wordClass][i] and unsortedList.length
                toIndex = $.inArray("_", self.order[wordClass][i])
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
        .appendTo("#results-lemgram .content_target")

        $("#lemgramResultsTmpl").tmpl(orderArrays,
            lemgram: token
        ).find(".example_link")
        .append($("<span>")
            .addClass("ui-icon ui-icon-document")
        ).css("cursor", "pointer")
        .click($.proxy(self.onClickExample, self)
        ).end()
        .appendTo container

        $("#results-lemgram td:nth-child(2)").each -> # labels
            $siblings = $(this).parent().siblings().find("td:nth-child(2)")
            siblingLemgrams = $.map($siblings, (item) ->
                $(item).data("lemgram").slice 0, -1
            )
            hasHomograph = $.inArray($(this).data("lemgram").slice(0, -1), siblingLemgrams) isnt -1
            prefix = (if $(this).data("depextra").length then $(this).data("depextra") + " " else "")

            label = (if $(this).data("lemgram") isnt "" then util.lemgramToString($(this).data("lemgram"), hasHomograph) else "&mdash;")
            $(this).html prefix + label



    #   self.renderHeader(wordClass);
    onClickExample: (event) ->
        self = this
        $target = $(event.currentTarget)
        c.log "onClickExample", $target
        data = $target.parent().tmplItem().data
        instance = $("#result-container").korptabs("addTab", view.ExampleResults)
        opts = instance.getPageInterval()
        opts.ajaxParams =
            head: data.head
            dep: data.dep
            rel: data.rel
            depextra: data.depextra
            corpus: data.corpus

        util.localize instance.$result
        instance.makeRequest opts

    showWarning: ->
        hasWarned = !!$.jStorage.get("lemgram_warning")

        #   var hasWarned = false;
        unless hasWarned
            $.jStorage.set "lemgram_warning", true
            $("#sidebar").sidebar "show", "lemgramWarning"
            self.timeout = setTimeout(->
                $("#sidebar").sidebar "hide"
            , 5000)

    onentry: ->
        c.log "lemgramResults.onentry", $.sm.getConfiguration()
        @resultDeferred.done @showWarning

    onexit: ->
        clearTimeout self.timeout
        $("#sidebar").sidebar "hide"

    showNoResults: ->
        @hidePreloader()
        @$result.find(".content_target").html $("<i />").localeKey("no_lemgram_results")

    hideWordclass: ->
        $("#results-lemgram td:first-child").each ->
            $(this).html $.format("%s <span class='wordClass'>%s</span>", $(this).html().split(" "))




newDataInGraph = (dataName, horizontalDiagram, targetDiv) ->
    dataItems = []
    wordArray = []
    corpusArray = []
    statsResults["lastDataName"] = dataName
    if horizontalDiagram # hits/corpus
        $.each statsResults.savedData["corpora"], (corpus, obj) ->
            if dataName is "SIGMA_ALL"

                # ∑ selected
                totfreq = 0
                $.each obj["relative"], (wordform, freq) ->
                    numFreq = parseFloat(freq)
                    totfreq += numFreq  if numFreq

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
        .appendTo("#results-stats")
        .append("""<br/><div id="statistics_switch" style="text-align:center">
                            <a href="javascript:" rel="localize[statstable_relfigures]" data-mode="relative">Relativa frekvenser</a>
                            <a href="javascript:" rel="localize[statstable_absfigures]" data-mode="absolute">Absoluta frekvenser</a>
                        </div>
                        <div id="chartFrame" style="height:380"></div>
                        <p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">#{relHitsString}</p>"""
        ).dialog(
            width: 400
            height: 500
            resize: ->
                $("#chartFrame").css "height", $("#chartFrame").parent().width() - 20
                stats2Instance.pie_widget "resizeDiagram", $(this).width() - 60
                false

            resizeStop: (event, ui) ->
                w = $(this).dialog("option", "width")
                h = $(this).dialog("option", "height")
                if @width * 1.25 > @height
                    $(this).dialog "option", "height", w * 1.25
                else
                    $(this).dialog "option", "width", h * 0.80
                stats2Instance.pie_widget "resizeDiagram", $(this).width() - 60
        ).css("opacity", 0)
        .parent().find(".ui-dialog-title").localeKey("statstable_hitsheader_lemgram")
        $("#dialog").fadeTo 400, 1
        $("#dialog").find("a").blur() # Prevents the focus of the first link in the "dialog"
        stats2Instance = $("#chartFrame").pie_widget(
            container_id: "chartFrame"
            data_items: dataItems
            bar_horizontal: false
            diagram_type: 0
        )
        statsSwitchInstance = $("#statistics_switch").radioList(
            change: ->
                typestring = statsSwitchInstance.radioList("getSelected").attr("data-mode")
                dataItems = new Array()
                dataName = statsResults["lastDataName"]
                $.each statsResults.savedData["corpora"], (corpus, obj) ->
                    if dataName is "SIGMA_ALL"

                        # sigma selected
                        totfreq = 0
                        $.each obj[typestring], (wordform, freq) ->
                            if typestring is "absolute"
                                numFreq = parseInt(freq)
                            else
                                numFreq = parseFloat(freq)
                            totfreq += numFreq  if numFreq

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
                    loc = "statstable_absfigures_hits"
                $("#hitsDescription").localeKey loc

            selected: "relative"
        )



class view.StatsResults extends BaseResults
    constructor: (tabSelector, resultSelector) ->
        super tabSelector, resultSelector
        self = this
        @proxy = statsProxy
        $(".arcDiagramPicture").live "click", ->
            parts = $(this).attr("id").split("__")

            if parts[1] != "Σ"
                newDataInGraph(parts[1],true)
            else # The ∑ row
                newDataInGraph("SIGMA_ALL",true)

        $(".slick-cell.l0.r0 .link").live "click", ->
            c.log "word click", $(this).data("context"), $(this).data("corpora")
            instance = $("#result-container").korptabs("addTab", view.ExampleResults)
            instance.proxy.command = "query"
            query = $(this).data("query")
            instance.makeRequest
                corpora: $(this).data("corpora").join(",")
                cqp: decodeURIComponent(query)

            util.localize instance.$result

        $(window).resize ->
            self.resizeGrid()

        $("#exportButton").unbind "click"
        $("#exportButton").click ->
            selVal = $("#kindOfData option:selected").val()
            selType = $("#kindOfFormat option:selected").val()
            dataDelimiter = ";"
            dataDelimiter = "\t"  if selType is "TSV"

            # Generate CSV from the data
            output = "corpus" + dataDelimiter
            $.each statsResults.savedWordArray, (key, aword) ->
                output += aword + dataDelimiter

            output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A)
            $.each statsResults.savedData["corpora"], (key, acorpus) ->
                output += settings.corpora[key.toLowerCase()]["title"] + dataDelimiter
                $.each statsResults.savedWordArray, (wkey, aword) ->
                    amount = acorpus[selVal][aword]
                    if amount
                        output += util.formatDecimalString(amount.toString(), false, true) + dataDelimiter
                    else
                        output += "0" + dataDelimiter

                output += String.fromCharCode(0x0D) + String.fromCharCode(0x0A)

            if selType is "TSV"
                window.open "data:text/tsv;charset=latin1," + escape(output)
            else
                window.open "data:text/csv;charset=latin1," + escape(output)


    renderResult: (columns, data) ->
        refreshHeaders = ->
            $(".slick-header-column:nth(1)").click().click()
            $(".slick-column-name:nth(0),.slick-column-name:nth(1)").not("[rel^=localize]").each ->
                $(this).localeKey $(this).text()

        @resetView()
        resultError = super(data)
        return  if resultError is false
        if data[0].total_value.absolute is 0
            @showNoResults()
            return
        grid = new Slick.Grid($("#myGrid"), data, columns,
            enableCellNavigation: false
            enableColumnReorder: true
        )
        @grid = grid
        @resizeGrid()
        sortCol = columns[1]
        window.data = data
        grid.onSort.subscribe (e, args) ->
            sortCol = args.sortCol
            data.sort (a, b) ->
                if sortCol.field is "hit_value"
                    x = a[sortCol.field]
                    y = b[sortCol.field]
                else
                    x = a[sortCol.field].absolute or 0
                    y = b[sortCol.field].absolute or 0
                ret = ((if x is y then 0 else ((if x > y then 1 else -1))))
                ret *= -1 unless args.sortAsc
                ret

            grid.setData data
            grid.updateRowCount()
            grid.render()

        grid.onHeaderRendered.subscribe (e, args) ->
            refreshHeaders()

        refreshHeaders()
        @renderPlot()
        @hidePreloader()

    renderPlot: ->
        self = this
        src = undefined
        css = cursor: "pointer"
        fill = "#666"
        if $.keys(statsResults.savedData.corpora).length < 2
            css["cursor"] = "normal"
            fill = "lightgrey"
        barElem = $("#showBarPlot").empty().get(0)
        paper = new Raphael(barElem, 33, 33)
        paper.path("M21.25,8.375V28h6.5V8.375H21.25zM12.25,28h6.5V4.125h-6.5V28zM3.25,28h6.5V12.625h-6.5V28z").attr
            fill: fill
            stroke: "none"
            transform: "s0.6"


        # Line Diagram
        $("#showBarPlot").css(css).click ->
            $.bbq.pushState display: "bar_plot"
            false

        @drawBarPlot()  if $.bbq.getState("display") is "bar_plot"

    drawBarPlot: ->
        data = statsResults.savedData.corpora
        display = []
        max = 0
        ticks = []
        spacing = .25
        accu = 0
        $.each $.keys(data).sort(), (i, corpus) ->
            ticks.push [accu + .5, settings.corpora[corpus.toLowerCase()].title]
            display.push [accu, data[corpus].sums.relative]
            max = data[corpus].sums.relative  if max < data[corpus].sums.relative
            accu = accu + 1 + spacing

        width = display.length * 60
        $("#plot_canvas").width width
        $.plot $("#plot_canvas"), [display],
            yaxis:
                max: max
            xaxis:
                ticks: ticks
            bars:
                show: true


        #     lines : {show : true}
        width = (if width > 1000 then 1000 else width + 40)
        $("#plot_popup").dialog(
            width: width + 40
            height: 500
            title: "Träffar per miljon token"
            beforeClose: ->
                $.bbq.removeState "display"
                false
        ).css("opacity", 0)
        .parent().find(".ui-dialog-title").localeKey("hits_per_mil")
        $("#plot_popup").fadeTo 400, 1


    #   $("#plot_popup").find("a").blur();
    resizeGrid: ->
        return unless @grid
        widthArray = $(".slick-header-column").map((item) ->
            $(this).width()
        )
        tableWidth = $.reduce(widthArray, (a, b) ->
            a + b
        , 100)

        #   tableWidth += 20;
        parentWidth = $("body").width() - 65
        $("#myGrid").width parentWidth
        if tableWidth < parentWidth
            @grid.autosizeColumns()
        else
            unless $(".c0").length
                setTimeout $.proxy(@resizeHits, this), 1
            else
                @resizeHits()
        $(".slick-column-name:nth(0),.slick-column-name:nth(1)").not("[rel^=localize]").each ->
            $(this).localeKey $(this).text()


    resizeHits: ->
        @setHitsWidth @getHitsWidth()

    getHitsWidth: ->

        # FIXME: not sure what's going on here.
        widthArray = $(".c0").map(->
            $(this).find(":nth-child(1)").outerWidth() + ($(this).find(":nth-child(2)").outerWidth() or 0)
        )
        unless widthArray.length
            400
        else
            $.reduce widthArray, Math.max

    setHitsWidth: (w) ->
        return unless @grid
        data = @grid.getColumns()
        data[0].currentWidth = w
        @grid.setColumns data


    # showError : function() {
    #   this.hidePreloader();
    #   $("<i/>")
    #   .localeKey("error_occurred")
    #   .appendTo("#results-stats");
    # },
    resetView: ->
        super()
        $("#exportStatsSection").show()

    showNoResults: ->
        @hidePreloader()
        $("#results-stats").prepend $("<i/ class='error_msg'>").localeKey("no_stats_results")
        $("#exportStatsSection").hide()
