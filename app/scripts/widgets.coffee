Sidebar =
    options: {
        displayOrder : [
            "pos",
            "posset",
            "lemma",
            "lex",
            "saldo",
            "variants"
        ].reverse()
    }
    _init: () ->
        dfd = $.Deferred()


    updateContent: (sentenceData, wordData, corpus, tokens) ->
        @element.html '<div id="selected_sentence" /><div id="selected_word" />'
        corpusObj = settings.corpora[corpus]

        $("<div />").html("<h4 rel='localize[corpus]'></h4> <p>#{corpusObj.title}</p>").prependTo "#selected_sentence"
        unless $.isEmptyObject(corpusObj.attributes)
            $("#selected_word").append $("<h4>").localeKey("word_attr")

            @renderContent(wordData, corpusObj.attributes).appendTo "#selected_word"
        unless $.isEmptyObject(corpusObj.struct_attributes)
            $("#selected_sentence").append $("<h4>").localeKey("sentence_attr")

            @renderContent(sentenceData, corpusObj.struct_attributes).appendTo "#selected_sentence"

        @element.localize()
        @applyEllipse()
        if corpusObj.attributes.deprel
            @renderGraph(tokens)

    renderGraph : (tokens) ->
        outerW = $(window).width() - 80

        $("<span class='link show_deptree'>Visa träd</button>").localeKey("show_deptree").click( ->
            info = $("<span class='info' />")
            iframe = $('<iframe src="lib/deptrees/deptrees.html"></iframe>').css("width", outerW - 40).load ->

                wnd = this.contentWindow
                tokens = tokens
                wnd.draw_deptree.call wnd, tokens, (msg) ->
                    [type, val] = _.head _.pairs msg
                    info.empty().append $("<span>").localeKey(type), $("<span>: </span>"), $("<span>").localeKey("#{type}_#{val}")

            $("#deptree_popup").empty().append(info, iframe).dialog(
                height : 300
                width : outerW

            ).parent().find(".ui-dialog-title").localeKey("dep_tree")

        ).appendTo(@element)





    renderContent: (wordData, corpus_attrs) ->
        pairs = _.pairs(wordData)
        order = @options.displayOrder
        pairs.sort ([a], [b]) ->
            $.inArray(b, order) - $.inArray(a, order)
        items = for [key, value] in pairs when corpus_attrs[key]
            @renderItem key, value, corpus_attrs[key]

        return $(items)

    renderItem: (key, value, attrs) ->
        if attrs.displayType == "hidden" or attrs.displayType == "date_interval"
            return ""
        output = $("<p><span rel='localize[#{attrs.label}]'>#{key}</span>: </p>")
        output.data("attrs", attrs)
        if value == "|" or value == ""
            output.append "<i rel='localize[empty]' style='color : grey'>${util.getLocaleString('empty')}</i>"


        if attrs.type == "set"
            pattern = attrs.pattern or '<span data-key="<% key %>"><%= val %></span>'
            ul = $("<ul>")
            getStringVal = (str) ->
                return _.reduce(_.invoke(_.invoke(str, "charCodeAt", 0), "toString"), (a,b) -> a + b);
            valueArray = _.filter(value?.split("|") or [], Boolean)
            if key == "variants"
                # TODO: this doesn't sort quite as expected
                valueArray.sort (a, b) ->
                    splita = util.splitLemgram(a);
                    splitb = util.splitLemgram(b);
                    strvala = getStringVal(splita.form) + splita.index + getStringVal(splita.pos);
                    strvalb = getStringVal(splitb.form) + splitb.index + getStringVal(splitb.pos);

                    return parseInt(strvala) - parseInt(strvalb);

            itr = if _.isArray(valueArray) then valueArray else _.values(valueArray)
            lis = for x in itr when x.length
                val = (attrs.stringify or _.identity)(x)

                inner = $(_.template(pattern, {key : x, val : val}))
                if attrs.translationKey?
                    prefix = attrs.translationKey or ""
                    inner.localeKey(prefix + val)
                li = $("<li></li>").data("key", x).append inner
                if attrs.externalSearch
                    address = _.template(attrs.externalSearch, {val : x})
                    li.append $("<a href='#{address}' class='external_link' target='_blank'></a>")
                                                    .click (event) -> event.stopImmediatePropagation()
                if attrs.internalSearch
                    li.addClass("link").click ->
                        cqpVal = $(this).data("key")
                        $.bbq.pushState({"search": "cqp|[#{key} contains '#{cqpVal}']"})


                li
            ul.append lis
            output.append ul

            return output


        value = (attrs.stringify or _.identity)(value)


        if attrs.type == "url"
            return output.append "<a href='#{value}' class='exturl sidebar_url'>#{decodeURI(value)}</a>"

        else if key == "msd"
            return output.append """<span class='msd'>#{value}</span>
                                        <a href='markup/msdtags.html' target='_blank'>
                                            <span id='sidbar_info' class='ui-icon ui-icon-info'></span>
                                        </a>
                                    </span>
                                """
        else if attrs.pattern
            return output.append _.template(attrs.pattern, {key : key, val : value})

        else
            if attrs.translationKey
                return output.append "<span rel='localize[#{attrs.translationKey}#{value}]'></span>"
            else
                return output.append "<span>#{value || ''}</span>"


    applyEllipse: ->
        oldDisplay = @element.css("display")
        @element.css "display", "block"
        totalWidth = @element.width()

        # ellipse for too long links of type=url
        @element.find(".sidebar_url").css("white-space", "nowrap").each ->
            while $(this).width() > totalWidth
                oldtext = $(this).text()
                a = $.trim(oldtext, "/").replace("...", "").split("/")
                domain = a.slice(2, 3)
                midsection = a.slice(3).join("/")
                midsection = "..." + midsection.slice(2)
                $(this).text ["http:/"].concat(domain, midsection).join("/")
                break  if midsection is "..."

        @element.css "display", oldDisplay

    _parseLemma: (attr, tmplVal) ->
        seq = []
        if attr?
            seq = $.map(attr.split("|"), (item) ->
                lemma = item.split(":")[0]
                if tmplVal.pattern
                    $.format tmplVal.pattern, [lemma, lemma]
                else
                    lemma
            )
        seq = $.grep(seq, (itm) ->
            itm and itm.length
        )
        $.arrayToHTMLList(seq).outerHTML()

    refreshContent: (mode) ->
        if mode is "lemgramWarning"
            $.Deferred((dfd) =>
                @element.load "markup/parse_warning.html", =>
                    util.localize()
                    @element.addClass("ui-state-highlight").removeClass "kwic_sidebar"
                    dfd.resolve()

            ).promise()
        else
            @element.removeClass("ui-state-highlight").addClass "kwic_sidebar"
            instance = $("#result-container").korptabs("getCurrentInstance")
            instance?.selectionManager?.selected?.click()

    updatePlacement: ->
        max = Math.round($("#columns").position().top)
        if $(window).scrollTop() < max
            @element.removeClass "fixed"
        else @element.addClass "fixed"  if $("#left-column").height() > $("#sidebar").height()

    show: (mode) ->

        # make sure that both hide animation and content load is done before showing
        $.when(@element).pipe(=>
            @refreshContent mode
        ).done =>
            @element.show "slide",
                direction: "right"

            $("#left-column").animate
                right: 265
            , null, null, ->
                $.sm.send "sidebar.show.end"



    hide: ->
        return  if $("#left-column").css("right") is "0px"
        @element.hide "slide",
            direction: "right"

        $("#left-column").animate
            right: 0
        , null, null, ->
            $.sm.send "sidebar.hide.end"




$.widget("korp.sidebar", Sidebar)



$.widget "korp.radioList",
    options:
        change: $.noop
        separator: "|"
        selected: "default"

    _create: ->
        @_super()
        self = this
        $.each @element, ->

            # $.proxy(self.options.change, self.element)();
            $(this).children().wrap("<li />").click(->
                unless $(this).is(".radioList_selected")
                    self.select $(this).data("mode")
                    self._trigger "change", $(this).data("mode")
            ).parent().prepend($("<span>").text(self.options.separator)).wrapAll "<ul class='inline_list' />"

        @element.find(".inline_list span:first").remove()
        @select @options.selected

    select: (mode) ->
        @options.selected = mode
        target = @element.find("a").filter(->
            $(this).data("mode") is mode
        )
        @element.find(".radioList_selected").removeClass "radioList_selected"
        @element.find(target).addClass "radioList_selected"
        @element

    getSelected: ->
        @element.find ".radioList_selected"

ModeSelector =
    options:
        modes: []

    _create: ->
        self = this
        $.each @options.modes, (i, item) ->
            a = $("<a href='javascript:'>")
            .localeKey(item.localekey).data("mode", item.mode)
            if not item.labOnly or (isLab and item.labOnly)
                a.appendTo self.element

        @_super()

$.widget "korp.modeSelector", $.korp.radioList, ModeSelector
$.extend $.ui.autocomplete.prototype,
    _renderItem: (ul, item) ->
        li = $("<li></li>").data("ui-autocomplete-item", item)
            .append($("<a></a>")[(if @options.html then "html" else "text")](item.label))
            .appendTo(ul)
        li.addClass "autocomplete-item-disabled"  unless item["enabled"]
        li

    _renderMenu: (ul, items) ->
        that = this
        currentCategory = ""
        $.each items, (index, item) ->
            if item.category and item.category isnt currentCategory
                ul.append $("<li class='ui-autocomplete-category'></li>").localeKey(item.category)
                currentCategory = item.category
            that._renderItem ul, item


$.fn.korp_autocomplete = (options) ->
    selector = $(this)
    if typeof options is "string" and options is "abort"
        lemgramProxy.abort()
        selector.preloader "hide"
        return
    options = $.extend(
        type: "lem"
        select: $.noop
        labelFunction: util.lemgramToString
        middleware: (request, idArray) ->
            dfd = $.Deferred()
            has_morphs = settings.corpusListing.getMorphology().split("|").length > 1
            if has_morphs
                idArray.sort (a, b) ->
                    first = (if a.split("--").length > 1 then a.split("--")[0] else "saldom")
                    second = (if b.split("--").length > 1 then b.split("--")[0] else "saldom")
                    second < first

            else
                idArray.sort options.sortFunction or view.lemgramSort
            labelArray = util.sblexArraytoString(idArray, options.labelFunction)
            listItems = $.map(idArray, (item, i) ->
                out =
                    label: labelArray[i]
                    value: item
                    input: request.term
                    enabled: true

                out["category"] = (if item.split("--").length > 1 then item.split("--")[0] else "saldom")  if has_morphs
                out
            )
            dfd.resolve listItems
            dfd.promise()
    , options)
    selector.preloader(
        timeout: 500
        position:
            my: "right center"
            at: "right center"
            offset: "-1 0"
            collision: "none"
    ).autocomplete
        html: true
        source: (request, response) ->
            c.log "autocomplete request", request
            c.log "autocomplete type", options.type
            promise = if options.type is "saldo"
            then lemgramProxy.saldoSearch(request.term, options["sw-forms"])
            else lemgramProxy.karpSearch(request.term, options["sw-forms"])
            promise.done((idArray, textstatus, xhr) ->
                idArray = $.unique(idArray)
                options.middleware(request, idArray).done (listItems) ->
                    selector.data "dataArray", listItems
                    response listItems
                    if selector.autocomplete("widget").height() > 300
                        selector.autocomplete("widget").addClass "ui-autocomplete-tall"
                    $("#autocomplete_header").remove()
                    $("<li id='autocomplete_header' />")
                        .localeKey("autocomplete_header")
                        .css("font-weight", "bold")
                        .css("font-size", 10)
                        .prependTo selector.autocomplete("widget")
                    selector.preloader "hide"

            ).fail ->
                c.log "sblex fail", arguments
                selector.preloader "hide"

            selector.data "promise", promise

        search: ->
            selector.preloader "show"

        minLength: 1
        select: (event, ui) ->
            event.preventDefault()
            selectedItem = ui.item.value
            $.proxy(options.select, selector) selectedItem

        close: (event) ->
            false

        focus: ->
            false

    selector

KorpTabs =
    _init: ->
        @_super()
        @n = 0
        @urlPattern = "#custom-tab-"
        @element.on "click", ".tabClose", (event) =>
            closebtn = $(event.currentTarget)

            unless closebtn.parent().is(".ui-state-disabled")
                c.log "href", closebtn.prev().attr("href")
                href = closebtn.prev().attr("href")
                li = closebtn.closest(".custom_tab")
                prevLi = li.prev()
                li.remove()
                $(href, @element).remove()
                this.refresh()
                prevLi.find("a:first").click()
                # don't follow the link
            event.stopImmediatePropagation()
            event.preventDefault()

        @tabs.first().data "instance", kwicResults

    getPanelTemplate : () ->
        """ <div id="results-kwic" ng-controller="kwicCtrl" ng-cloak>
                <div class="result_controls">
                    <div class="controls_n" >
                        <span rel="localize[num_results]">Antal träffar</span>: <span class="num-result">0</span>
                    </div>
                    <div class="progress">
                        <progress value="0" max="100"></progress>
                    </div>
                   <div class="hits_picture" ></div>
               </div>

                <div class="pager-wrapper"></div>
                <span class="reading_btn show link" rel="localize[show_reading]">Visa läsläge</span>
                <span class="reading_btn hide link" rel="localize[show_kwic]">Visa kwic</span>


                <div class="table_scrollarea">
                    <table class="results_table kwic" cellspacing="0">
                        <tr class="sentence" ng-repeat="sentence in kwic" ng-class-even="'even'" ng-class-odd="'odd'"
                            ng-class="{corpus_info : sentence.newCorpus, not_corpus_info : !sentence.newCorpus}">
                            <td class="empty_td"></td>
                            <td colspan="0" class="corpus_title">
                                {{sentence.newCorpus}}
                                <span class='corpus_title_warn' rel='localize[no_context_support]' ng-show="sentence.noContext"></span>
                            </td>

                            <td class="left" ng-show="!sentence.newCorpus">
                                <span kwic-word ng-repeat="wd in selectLeft(sentence)"></span>
                            </td>
                            <td class="match" ng-show="!sentence.newCorpus">
                                <span kwic-word ng-repeat="wd in selectMatch(sentence)"></span>
                            </td>
                            <td class="right" ng-show="!sentence.newCorpus">
                                <span kwic-word ng-repeat="wd in selectRight(sentence)"></span>
                            </td>

                        </tr>
                    </table>
                </div>

            </div>"""
    getTabTemplate: (href, label) ->
        """
        <li class="custom_tab">
            <a class="custom_anchor" href="#{href}">
                <span rel="localize[example]">#{label}</span>
            </a>
            <a class="tabClose" href="#">
                <span class="ui-icon ui-icon-circle-close"></span>
            </a>
            <div class="tab_progress"></div>
        </li>"""


    _tabify: (init) ->
        @_super init
        @redrawTabs()

    redrawTabs: ->
        this.refresh()
        $(".custom_tab").css "margin-left", "auto"
        $(".custom_tab:first").css "margin-left", 8

    addTab: (klass, headerLabel = "KWIC") ->
        url = @urlPattern + @n
        # @add url, headerLabel
        tabs = $(".ui-tabs-nav", this.element).append(@getTabTemplate(url, headerLabel))

        # c.log "@element", @element, @element.find("li:last")
        li = $(".ui-tabs-nav > li:last", @element)
        panel = $("<div>").append(@getPanelTemplate()).children().first().attr("id", url[1..]).unwrap()


        @element.append panel
        @redrawTabs()
        newDiv = @element.children().last()
        # angular.injector(['ng']).invoke ["$rootScope", "$compile", ($rootScope, $compile) ->
        @element.injector().invoke ["$rootScope", "$compile", ($rootScope, $compile) ->
            cnf = $compile newDiv
            cnf($rootScope)
        ]

        instance = new klass(li, url)
        li.data "instance", instance
        @n++
        li.find("a.ui-tabs-anchor").trigger "click"


        return instance

    enableAll: ->
        $.each ".custom_tab", (i, elem) =>
            @enable i


    getCurrentInstance: ->
        @tabs.filter(".ui-tabs-active").data("instance") or null

$.widget "korp.korptabs", $.ui.tabs, KorpTabs
ExtendedToken =
    options: {}
    _init: ->
        self = this
        @table = @element
        #close icon
        @element.find(".ui-icon-circle-close").click ->
            return  if $(this).css("opacity") is "0"
            c.log "close"
            self.element.remove()
            self._trigger "close"

        @element.find(".insert_arg").click =>
            @insertArg true

        @insertArg()
        repeat = @element.find(".repeat")
        @element.find("button").button(
            icons:
                primary: "ui-icon-gear"

            text: false
        ).click ->
            return  if $("#opt_menu").is(":visible")
            $("#opt_menu").show().menu({}).one("click", (evt) ->
                c.log "click", evt.target
                return  unless $(evt.target).is("a")
                item = $(evt.target).data("item")
                self.element.toggleClass item
                self._trigger "change"
            ).position
                my: "right top"
                at: "right bottom"
                of: this

            $("body").one "click", ->
                $("#opt_menu").hide()

            false

        @element.find(".close_token .ui-icon").click ->
            item = $(this).closest(".close_token").data("item")
            self.element.toggleClass item
            self._trigger "change"

        @element.find(".repeat input").change =>
            @_trigger "change"


    insertArg: (animate) ->
        c.log "insertArg"
        self = this
        arg = $("#argTmpl").tmpl().find(".or_container").append(@insertOr()).end().find(".insert_or").click(->
            thisarg = $(this).closest(".query_arg").find(".or_container")
            lastVal = thisarg.find(".arg_type:last").val()
            self.insertOr(true).appendTo($(this).closest(".query_arg").find(".or_container")).hide().slideDown()
            thisarg.find(".arg_type:last").val(lastVal).trigger "change"
            self._trigger "change"
        ).end().appendTo(@element.find(".args")).before($("<span>",
            class: "and"
        ).localeKey("and").hide().fadeIn())
        util.localize arg
        arg.hide().slideDown "fast"  if animate
        self._trigger "change"

    insertOr: (usePrev) ->
        self = this
        try
            arg_select = @makeSelect()
        catch e
            c.log "error", e
            return

        arg_value = @makeWordArgValue()
        arg_value.attr "data-placeholder", "any_word_placeholder"
        link_mod = $("<span class='val_mod sensitive'>").text("Aa").click(->
            if $("#mod_menu").length
                $("#mod_menu").remove()
                return


            menuMarkup = """
            <li data-val="sensitive">
                <a rel="localize[case_sensitive]">#{util.getLocaleString('case_sensitive')}</a>
            </li>
            <li data-val="insensitive">
                <a rel="localize[case_insensitive]">#{util.getLocaleString('case_insensitive')}</a>
            </li>
            """

            $("<ul id='mod_menu'>")
            .append(menuMarkup)
            .insertAfter(this).menu({
                select : (event, ui) ->
                    c.log "set ui", this
                    $(this).prev().removeClass("sensitive insensitive").addClass ui.item.data("val")
                    self._trigger "change"
                }).position(
                my: "right top"
                at: "right bottom"
                of: this
                )
            # ).find("a").click (event) ->
            #     c.log "click", $(this).data("val")
            #     $(this).removeClass("sensitive insensitive").addClass $(this).data("val")
            #     self._trigger "change"

            $("body").one "click", ->
                $("#mod_menu").remove()

            false
        )
        #.prev().fadeOut();
        orElem = $("#orTmpl").tmpl()
        .find(".right_col")
        .append(arg_select, arg_value, link_mod).end()
        .find(".remove_arg").click(->
            return  if $(this).css("opacity") is "0"
            arg = $(this).closest(".or_arg")
            if arg.siblings(".or_arg").length is 0
                arg.closest(".query_arg").slideUp("fast", ->
                    $(this).remove()
                    self._trigger "change"
                ).prev().remove()
            else
                arg.slideUp ->
                    $(this).remove()
                    self._trigger "change"

        ).end()
        arg_value.keyup()
        orElem

    makeSelect: ->
        arg_select = $("<select/>").addClass("arg_type").change($.proxy(@onArgTypeChange, this))
        lang = @element.closest(".lang_row,#query_table").find(".lang_select").val() if currentMode is "parallel"
        groups = $.extend({}, settings.arg_groups,
            word_attr: settings.corpusListing.getCurrentAttributes(lang)
            sentence_attr: settings.corpusListing.getStructAttrs(lang)
        )
        c.log "groups", groups
        $.each groups, (lbl, group) ->
            return  if $.isEmptyObject(group)
            optgroup = $("<optgroup/>",
                label: util.getLocaleString(lbl).toLowerCase()
                rel: $.format("localize[%s]", lbl)
            ).appendTo(arg_select)
            $.each group, (key, val) ->
                return  if val.displayType is "hidden"
                $("<option/>",
                    rel: $.format("localize[%s]", val.label)
                ).val(key).text(util.getLocaleString(val.label) or "").appendTo(optgroup).data "dataProvider", val


        arg_opts = @makeOptsSelect(settings.defaultOptions)
        c.log "arg_opts", arg_opts
        $("<div>", class: "arg_selects")
        .append arg_select, arg_opts

    makeOptsSelect: (groups) ->
        self = this
        if $.isEmptyObject(groups)
            return $("<span>", class: "arg_opts")
        $("<select>", class: "arg_opts")
        .append($.map(groups, (key, value) ->
            $("<option>", value: key)
            .localeKey(key).get 0
        )).change ->
            self._trigger "change"


    refresh: ->
        self = this
        @table.find(".or_arg").each ->
            oldVal = $(this).find(".arg_type").val()
            optVal = $(this).find(".arg_opts").val()
            oldLower = $(this).find(".arg_value")
            old_ph = oldLower.attr("placeholder")
            old_data = oldLower.data("value")

            newSelects = self.makeSelect()
            $(this).find(".arg_selects").replaceWith newSelects
            newSelects.find(".arg_type").val(oldVal).change()
            newSelects.find(".arg_opts").val optVal
            if oldLower.attr("placeholder")
                $(this).find(".arg_value").data("value", old_data).attr("placeholder", old_ph).placeholder()
            else
                $(this).find(".arg_value").val oldLower.val()


    makeWordArgValue: (label) ->
        self = this

        out = $("<input type='text'/>").addClass("arg_value")
        if label is "word"
            out.keyup(->
                if $(this).val() is ""
                    $(this).prev().find(".arg_opts").attr "disabled", "disabled"
                else
                    $(this).prev().find(".arg_opts").attr "disabled", null
            ).change(=>
                c.log "change", @_trigger
                @_trigger "change"
            ).keyup()
        return out

    onArgTypeChange: (event) ->
        # change input widget
        self = this
        target = $(event.currentTarget)
        oldVal = target.parent().siblings(".arg_value:input[type=text]").val() or ""
        oldOptVal = target.next().val()
        data = target.find(":selected").data("dataProvider")
        # c.log "didSelectArgtype ", data
        arg_value = null
        switch data.displayType
            when "select"
                sorter = (a, b) ->
                    return a > b  if data.localize is false
                    prefix = data.translationKey or ""
                    (if util.getLocaleString(prefix + a) >= util.getLocaleString(prefix + b) then 1 else -1)
                arg_value = $("<select />")
                if $.isArray(data.dataset)
                    keys = data.dataset
                else
                    keys = _.keys(data.dataset)
                keys.sort sorter
                $.each keys, (_, key) ->
                    opt = $("<option />").val(regescape(key)).appendTo(arg_value)
                    if data.localize is false
                        opt.text key
                    else
                        opt.localeKey (data.translationKey or "") + key

            when "autocomplete"
                if data.label is "saldo"
                    type = "saldo"
                    labelFunc = util.saldoToString
                    sortFunc = view.saldoSort
                    c.log "saldo"
                else
                    type = "lem"
                    labelFunc = util.lemgramToString
                    sortFunc = view.lemgramSort
                arg_value = $("<input type='text'/>").korp_autocomplete(
                    labelFunction: labelFunc
                    sortFunction: sortFunc
                    type: type
                    select: (lemgram) ->
                        c.log "extended lemgram", lemgram, $(this)
                        $(this).data "value", (if data.label is "baseform" then lemgram.split(".")[0] else lemgram)
                        $(this).attr("placeholder", labelFunc(lemgram, true).replace(/<\/?[^>]+>/g, "")).val("").blur().placeholder()

                    "sw-forms": true
                ).blur(->
                    input = this
                    setTimeout (->
                        c.log "blur"

                        if ($(input).val().length and not util.isLemgramId($(input).val())) or $(input).data("value") is null
                            $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder()
                        else
                            $(input).removeClass("invalid_input")
                        self._trigger "change"
                    ), 100
                )
            when "date_interval"
                all_years = _(settings.corpusListing.selected)
                            .pluck("time")
                            .map(_.pairs)
                            .flatten(true)
                            .filter((tuple) ->
                                tuple[0] and tuple[1]
                            ).map(_.compose(Number, _.head))
                            .value()
                # c.log "all", all_years
                start = Math.min(all_years...)
                end = Math.max(all_years...)
                arg_value = $("<div>")
                arg_value.data "value", [start, end]
                from = $("<input type='text' class='from'>").val(start)
                to = $("<input type='text' class='to'>").val(end)
                slider = $("<div />").slider(
                    range: true
                    min: start
                    max: end
                    values: [start, end]
                    slide: (event, ui) ->
                        from.val ui.values[0]
                        to.val ui.values[1]

                    change: (event, ui) ->
                        $(this).data "value", ui.values
                        arg_value.data "value", ui.values
                        self._trigger "change"
                )
                from.add(to).keyup ->
                    self._trigger "change"

                arg_value.append slider, from, to
            else
                arg_value = @makeWordArgValue(data.label)
                arg_value.attr "data-placeholder", "any_word_placeholder"  if data.label is "word"
                util.localize arg_value
        target.parent().siblings(".arg_value").replaceWith arg_value
        newSelect = @makeOptsSelect(data.opts or settings.defaultOptions)
        target.next().replaceWith newSelect

        # target.next().val(oldOptVal).attr "disabled", null
        arg_value.val oldVal  if oldVal? and oldVal.length
        switch target.val()
            when "msd"
                $("#msd_popup").load "markup/msd.html", ->
                    $(this).find("a").click ->
                        arg_value.val $(this).parent().data("value")
                        $("#msd_popup").dialog("close")

                $("<span class='ui-icon ui-icon-info' />").click(->
                    w = $("html").width() * 0.6
                    h = $("html").height()
                    $("#msd_popup").fadeIn("fast").dialog(
                        width: w
                        height: h
                        modal: true
                    ).parent().find(".ui-dialog-title").localeKey("msd_long")

                    $(".ui-widget-overlay").one "click", (evt) ->
                        c.log "body click"
                        $("#msd_popup").dialog("close")

                ).insertAfter arg_value
                arg_value.css "width", "93%"
            else
                @element.find(".ui-icon-info").remove()
        arg_value.addClass("arg_value").keyup().change ->
            self._trigger "change"

        @_trigger "change"

    getOrCQP: (andSection, expand) ->
        self = this
        output = ""
        args = {}
        $(".or_container", andSection).each (i, item) ->

            $(this).find(".or_arg").each ->
                type = $(this).find(".arg_type").val()
                data = $(this).find(".arg_type :selected").data("dataProvider")
                if not data then return
                value = $(this).find(".arg_value").val()
                opt = $(this).find(".arg_opts").val()
                case_sens = (if $(this).find(".val_mod.sensitive").length is 0 then " %c" else "")
                value = null if data.displayType in ["autocomplete", "date_interval"]
                args[type] = [] unless args[type]
                args[type].push
                    data: data
                    value: value or $(this).find(".arg_value").data("value") or ""
                    opt: opt
                    case_sens: case_sens



        inner_query = []
        $.each args, (type, valueArray) ->
            $.each valueArray, (i, obj) ->
                defaultArgsFunc = (s, op) ->
                    getOp = (value) ->
                            {
                            is: [operator, "", value, ""]
                            is_not: [not_operator, "", value, ""]
                            starts_with: ["=", "", value, ".*"]
                            contains: ["=", ".*", value, ".*"]
                            ends_with: ["=", ".*", value, ""]
                            matches: ["=", "", value, ""]
                            }[op]

                    stringify = (value) ->
                        return $.format('%s%s %s "%s%s%s"%s', [prefix, type].concat(getOp(value), [obj.case_sens]))
                    operator = (if obj.data.type is "set" then "contains" else "=")
                    not_operator = (if obj.data.type is "set" then "not contains" else "!=")
                    prefix = (if obj.data.isStructAttr then "_." else "")
                    formatter = (if op is "matches" or obj.data.displayType is "select" then _.identity else regescape)

                    value = formatter(s)
                    if currentMode is "law"
                        expandToNonStrict = (value) ->

                            prefix = (if obj.data.isStructAttr isnt null then "_." else "")
                            undef = $.format("%s%s = '__UNDEF__'", [prefix, type])
                            $.format "(%s | %s)", [stringify(value), undef]

                        return expandToNonStrict(value)  if expand
                    stringify value
                do (type, obj, defaultArgsFunc) ->
                    c.log "type, obj.value", type, obj
                    argFunc = settings.getTransformFunc(type, obj.value, obj.opt) or defaultArgsFunc
                    inner_query.push argFunc(obj.value, obj.opt or settings.defaultOptions)

        # c.log "inner_query", inner_query, expand
        if inner_query.length > 1
            output = "(#{inner_query.join(" | ")})"
        else
            output = inner_query[0]
        bound = []
        bound.push "lbound(sentence)" if @element.is(".lbound_item")
        bound.push "rbound(sentence)" if @element.is(".rbound_item")
        boundprefix = " & "
        boundprefix = "" if output is ""
        boundStr = (if bound.length then boundprefix + bound.join(" & ") else "")
        output + boundStr

    sortAnd : (andBlock1, andBlock2) ->
        min1 = _.min _.map $(andBlock1).find(".arg_type"), (item) -> _.indexOf settings.cqp_prio, $(item).val()
        min2 = _.min _.map $(andBlock2).find(".arg_type"), (item) -> _.indexOf settings.cqp_prio, $(item).val()
        return min2 - min1


    getCQP: (strict) ->
        minOfContainer = (or_container) ->
            types = _.invoke(_.map($(".arg_type", or_container).get(), $), "val")
            Math.min.apply null, _.map(types, getAnnotationRank)
        self = this
        if not strict and currentMode is "law"

            # which or blocks must be expanded?
            totalMin = _.map($(".or_container").get(), minOfContainer)
            min = Math.min.apply(null, totalMin)

        andList = @element.find(".query_arg").sort(@sortAnd)

        output = $(andList).map((item) ->
            expand = false
            if not strict and currentMode is "law"
                or_min = minOfContainer(this)
                expand = true  if or_min > min
            self.getOrCQP $(this), expand
        ).get()
        output = $.grep(output, Boolean)
        min_max = @element.find(".repeat:visible input").map(->
            $(this).val()
        ).get()
        suffix = ""
        if min_max.length
            min_max[0] = Number(min_max[0]) or 0
            min_max[1] = Number(min_max[1]) or ""
            suffix = $.format("{%s}", min_max.join(", "))
        "[" + output.join(" & ") + "]" + suffix

$.widget "korp.extendedToken", ExtendedToken

