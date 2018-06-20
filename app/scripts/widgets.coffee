
Sidebar =
    _init: () ->

    updateContent: (sentenceData, wordData, corpus, tokens) ->
        @element.html '<div id="selected_sentence" /><div id="selected_word" />'
        corpusObj = settings.corpora[corpus]

        corpusInfo = $("<div />").html("<h4 rel='localize[corpus]'></h4> <p>#{corpusObj.title}</p>")
        corpusInfo.prependTo "#selected_sentence"

        if corpusObj["inStrix"]
            sentenceID = sentenceData["sentence_id"]
            if sentenceID
                # TODO fix this so that strix uses correct corpus ids
                strixCorpus = if corpus == "wikipedia-sv" then "wikipedia" else corpus
                strixLinkText = "#{settings.strixUrl}?sentenceID=#{sentenceID}&documentCorpus=#{strixCorpus}"
                $("<div class='strix-link'/>").html("<a target='_blank' href='#{strixLinkText}' rel='localize[read_in_strix]'></a>").prependTo corpusInfo

        customData = pos: [], struct: []
        unless $.isEmptyObject(corpusObj.customAttributes)
            [word, sentence] = @renderCustomContent wordData, sentenceData, corpusObj.customAttributes, tokens
            customData.pos = word
            customData.struct = sentence

        posData = []
        unless $.isEmptyObject(corpusObj.attributes)
            posData = @renderCorpusContent "pos", wordData, sentenceData, corpusObj.attributes, tokens, corpusObj.customAttributes or {}, customData.pos
        structData = []
        unless $.isEmptyObject(corpusObj.structAttributes)
            structData = @renderCorpusContent "struct", wordData, sentenceData, corpusObj.structAttributes, tokens, corpusObj.customAttributes or {}, customData.struct

        $("#selected_word").append $("<h4>").localeKey("word_attr")
        $("#selected_sentence").append $("<h4>").localeKey("sentence_attr")
        $("#selected_word").append posData
        $("#selected_sentence").append structData

        @element.localize()
        @applyEllipse()
        if corpusObj.attributes.deprel
            @renderGraph(tokens)

    renderGraph : (tokens) ->
        $("<span class='link show_deptree'></button>").localeKey("show_deptree").click( ->
            outerW = $(window).width() - 80
            info = $("<span class='info' />")
            iframe = $('<iframe src="lib/deptrees/deptrees.html"></iframe>').css("width", outerW - 40).on "load", ->

                wnd = this.contentWindow
                tokens = tokens
                wnd.draw_deptree.call wnd, tokens, (msg) ->
                    [type, val] = _.head _.toPairs msg
                    info.empty().append $("<span>").localeKey(type), $("<span>: </span>"), $("<span>").localeKey("#{type}_#{val}")

            $("#deptree_popup").empty().append(info, iframe).dialog(
                height : 300
                width : outerW
            ).parent().find(".ui-dialog-title").localeKey("dep_tree")

        ).appendTo(@element)

    renderCorpusContent: (type, wordData, sentenceData, corpus_attrs, tokens, customAttrs, customData) ->
        if type == "struct"
            pairs = _.toPairs(sentenceData)

        else if type == "pos"
            pairs = _.toPairs(wordData)

        pairs = _.filter pairs, ([key, val]) -> corpus_attrs[key]
        pairs = _.filter pairs, ([key, val]) -> not (corpus_attrs[key].displayType == "hidden" or corpus_attrs[key].hideSidebar)

        for custom in customData
            pairs.push custom

        pairs.sort ([a], [b]) ->
            if a of corpus_attrs
                ord1 = corpus_attrs[a].order
            else
                ord1 = customAttrs[a].order

            if b of corpus_attrs
                ord2 = corpus_attrs[b].order
            else
                ord2 = customAttrs[b].order

            # first three cases to handle ord1 or ord2 being undefined
            if ord1 == ord2
                return 0
            if not ord1
                return -1
            if not ord2
                return 1
            else
                return ord1 - ord2

        items = []
        for [key, value] in pairs
            if key of customAttrs
                items.push value
            else
                items = items.concat (@renderItem key, value, corpus_attrs[key], wordData, sentenceData, tokens).get?(0)

        items = _.compact items
        return $(items)

    renderCustomContent: (wordData, sentenceData, corpus_attrs, tokens) ->
        structItems = []
        posItems = []
        for key, attrs of corpus_attrs
            output = @renderItem(key, "not_used", attrs, wordData, sentenceData, tokens).get?(0)
            if attrs.customType == "struct"
                structItems.push [key, output]
            else if attrs.customType == "pos"
                posItems.push [key, output]
        return [posItems, structItems]

    renderItem: (key, value, attrs, wordData, sentenceData, tokens) ->
        if attrs.label
            output = $("<p><span rel='localize[#{attrs.label}]'></span>: </p>")
        else
            output = $("<p></p>")
        if attrs.renderItem
            return output.append(attrs.renderItem key, value, attrs, wordData, sentenceData, tokens)

        output.data("attrs", attrs)
        if value == "|" or value == "" or value == null
            output.append "<i rel='localize[empty]' style='color : grey'>${util.getLocaleString('empty')}</i>"
            return output

        if attrs.type == "set" and attrs.display?.expandList
            valueArray = _.filter(value?.split("|") or [], Boolean)
            attrSettings = attrs.display.expandList
            if attrs.ranked
                valueArray = _.map valueArray, (value) -> val = value.split(":"); [val[0], val[val.length - 1]]

                lis = []

                for [value, prob], outerIdx in valueArray
                    li = $("<li></li>")
                    subValues = if attrSettings.splitValue then attrSettings.splitValue value else [value]
                    for subValue, idx in subValues
                        val = (attrs.stringify or attrSettings.stringify or _.identity)(subValue)
                        inner = $("<span>" + val + "</span>")
                        inner.attr "title", prob

                        if attrs.internalSearch and (attrSettings.linkAllValues or outerIdx is 0)
                            inner.data("key", subValue)
                            inner.addClass("link").click ->
                                searchKey = attrSettings.searchKey or key
                                cqpVal = $(this).data("key")
                                cqpExpr = if attrSettings.internalSearch then attrSettings.internalSearch searchKey, cqpVal else "[#{searchKey} contains '#{regescape(cqpVal)}']"
                                locationSearch({"search": "cqp", "cqp": cqpExpr, "page": null})
                        if attrs.externalSearch
                            address = _.template(attrs.externalSearch)({val : subValue})
                            externalLink = $("<a href='#{address}' class='external_link' target='_blank' style='margin-top: -6px'></a>")

                        li.append inner
                        if attrSettings.joinValues and idx isnt subValues.length - 1
                            li.append attrSettings.joinValues
                    if externalLink
                        li.append externalLink
                    lis.push li
            else
                lis = []
                for value in valueArray
                    li = $("<li></li>")
                    li.append value
                    lis.push li

            if lis.length == 0
                ul = $('<i rel="localize[empty]" style="color : grey"></i>')

            else
                ul = $("<ul style='list-style:initial'>")
                ul.append lis

                if lis.length isnt 1 and (not attrSettings.showAll)

                    _.map lis, (li, idx) -> if idx != 0 then li.css('display', 'none')

                    showAll = $("<span class='link' rel='localize[complemgram_show_all]'></span><span> (" + (lis.length - 1) + ")</span>")
                    ul.append showAll

                    showOne = $("<span class='link' rel='localize[complemgram_show_one]'></span>")
                    showOne.css "display", "none"
                    ul.append showOne

                    showAll.click () ->
                        showAll.css "display", "none"
                        showOne.css "display", "inline"
                        _.map lis, (li) ->

                            li.css "display", "list-item"

                    showOne.click () ->
                        showAll.css "display", "inline"
                        showOne.css "display", "none"
                        _.map lis, (li, i) ->
                            if i != 0
                                li.css "display", "none"

            output.append ul
            return output

        else if attrs.type == "set"
            pattern = attrs.pattern or '<span data-key="<%= key %>"><%= val %></span>'
            ul = $("<ul>")
            getStringVal = (str) ->
                return _.reduce(_.invokeMap(_.invokeMap(str, "charCodeAt", 0), "toString"), (a,b) -> a + b);
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

                inner = $(_.template(pattern)({key : x, val : val}))
                if attrs.translationKey?
                    prefix = attrs.translationKey or ""
                    inner.localeKey(prefix + val)

                if attrs.internalSearch
                    inner.addClass("link").click ->
                        cqpVal = $(this).data("key")
                        locationSearch({"page": null, "search": "cqp", "cqp": "[#{key} contains \"#{regescape(cqpVal)}\"]"})

                li = $("<li></li>").data("key", x).append inner
                if attrs.externalSearch
                    address = _.template(attrs.externalSearch)({val : x})
                    li.append $("<a href='#{address}' class='external_link' target='_blank'></a>")


                li
            ul.append lis
            output.append ul

            return output


        str_value = (attrs.stringify or _.identity)(value)


        if attrs.type == "url"
            return output.append "<a href='#{str_value}' class='exturl sidebar_url' target='_blank'>#{decodeURI(str_value)}</a>"

        else if key == "msd"
            # msdTags = require '../markup/msdtags.html'
            msdTags = 'markup/msdtags.html'
            return output.append """<span class='msd_sidebar'>#{str_value}</span>
                                        <a href='#{msdTags}' target='_blank'>
                                            <span class='sidebar_info ui-icon ui-icon-info'></span>
                                        </a>
                                    </span>
                                """
        else if attrs.pattern
            return output.append _.template(attrs.pattern)({key : key, val : str_value, pos_attrs : wordData, struct_attrs : sentenceData })

        else
            if attrs.translationKey
                if loc_data["en"][attrs.translationKey + value]
                    return output.append "<span rel='localize[#{attrs.translationKey}#{value}]'></span>"
                else
                    return output.append "<span>#{value}</span>"
            else
                return output.append "<span>#{str_value || ''}</span>"

    applyEllipse: ->
        # oldDisplay = @element.css("display")
        # @element.css "display", "block"
        totalWidth = @element.width()

        # ellipse for too long links of type=url
        @element.find(".sidebar_url").css("white-space", "nowrap").each ->
            while $(this).width() > totalWidth
                oldtext = $(this).text()
                a = _.trim(oldtext, "/").replace("...", "").split("/")
                domain = a.slice(2, 3)
                midsection = a.slice(3).join("/")
                midsection = "..." + midsection.slice(2)
                $(this).text ["http:/"].concat(domain, midsection).join("/")
                break if midsection is "..."

        # @element.css "display", oldDisplay

    updatePlacement: ->
        max = Math.round($("#columns").position().top)
        if $(window).scrollTop() < max
            @element.removeClass "fixed"
        else @element.addClass "fixed" if $("#left-column").height() > $("#sidebar").height()


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
