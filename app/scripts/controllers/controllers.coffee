window.korpApp = angular.module('korpApp', ["watchFighters"
                                            "ui.bootstrap.dropdownToggle",
                                            "ui.bootstrap.tabs",
                                            "template/tabs/tabset.html"
                                            "template/tabs/tab.html"
                                            "template/tabs/tabset-titles.html"

                                            "ui.bootstrap.typeahead"
                                            "template/typeahead/typeahead.html"
                                            "template/typeahead/typeahead-popup.html"
                                        ])

# korpApp.controller "kwicCtrl", ($scope) ->

korpApp.run ($rootScope, $location, $route, $routeParams) ->
    s = $rootScope
    s.lang = "sv"

    s.search = () -> $location.search arguments...

    s.searchDef = $.Deferred()


    s.onSearchLoad = () ->
        s.searchDef.resolve()


    s._loc = $location
    s.$watch "_loc.search()", () ->
        c.log "loc.search() change", $location.search()
        _.defer () -> window.onHashChange?()


korpApp.controller "kwicCtrl", ($scope) ->
    s = $scope

    punctArray = [",", ".", ";", ":", "!", "?", "..."]

    massageData = (sentenceArray) ->
        unless sentenceArray then return
        currentStruct = []
        prevCorpus = ""
        output = []
        for sentence, i in sentenceArray
            [matchSentenceStart, matchSentenceEnd] = findMatchSentence sentence
            {start, end} = sentence.match

            for j in [0...sentence.tokens.length]
                wd = sentence.tokens[j]
                if start <= j < end
                    _.extend wd, {_match : true}
                if matchSentenceStart < j < matchSentenceEnd
                    _.extend wd, {_matchSentence : true}
                if wd.word in punctArray
                    _.extend wd, {_punct : true}
                if wd.structs?.open
                    wd._open = wd.structs.open
                    currentStruct = [].concat(currentStruct, wd.structs.open)
                else if wd.structs?.close
                    wd._close = wd.structs.close
                    currentStruct = _.without currentStruct, wd.structs.close...


                _.extend wd, {_struct : currentStruct} if currentStruct.length

            
            if currentMode == "parallel"
                mainCorpusId = sentence.corpus.split("|")[0].toLowerCase()
                linkCorpusId = sentence.corpus.split("|")[1].toLowerCase()
            else
                mainCorpusId = sentence.corpus.toLowerCase()

            id = (linkCorpusId or mainCorpusId)

            if prevCorpus != id
                # id = mainCorpusId
                # if currentMode == "parallel"
                #     id = sentence.corpus.split("|")[1].toLowerCase()

                corpus = settings.corpora[id]
                newSent = {newCorpus : corpus.title, noContext : _.keys(corpus.context).length == 1}
                output.push newSent

            if i % 2 == 0
                sentence._color = settings.primaryColor
            else
                sentence._color = settings.primaryLight

            sentence.corpus = mainCorpusId

            output.push(sentence)
            if sentence.aligned
                [corpus_aligned, tokens] = _.pairs(sentence.aligned)[0]
                output.push
                    tokens : tokens
                    isLinked : true
                    corpus : corpus_aligned
                    _color : sentence._color


            prevCorpus = id

            # return sentence
        return output

    findMatchSentence = (sentence) ->
        span = []
        {start, end} = sentence.match
        decr = start
        incr = end
        while decr >= 0
            if "sentence" in (sentence.tokens[decr--].structs?.open or [])
                span[0] = decr
                break
        while incr < sentence.tokens.length
            if "sentence" in (sentence.tokens[incr++].structs?.close or [])
                span[1] = incr
                break

        return span





    s.kwic = []
    s.contextKwic = []
    s.setContextData = (data) ->
        s.contextKwic = massageData data.kwic

    s.setKwicData = (data) ->
        s.kwic = massageData(data.kwic)

    s.selectionManager = new util.SelectionManager()

    s.selectLeft = (sentence) ->
        if not sentence.match then return
        # c.log "left", sentence.tokens.slice 0, sentence.match.start
        sentence.tokens.slice 0, sentence.match.start

    s.selectMatch = (sentence) ->
        if not sentence.match then return
        from = sentence.match.start
        sentence.tokens.slice from, sentence.match.end

    s.selectRight = (sentence) ->
        if not sentence.match then return
        from = sentence.match.end
        len = sentence.tokens.length
        sentence.tokens.slice from, len




korpApp.directive 'kwicWord', ->
    replace: true
    template : """<span class="word" set-class="getClassObj(wd)"
                    set-text="wd.word + ' '" ></span>
                """ #ng-click="wordClick($event, wd, sentence)"
    link : (scope, element) ->
        # scope.getClassObj = (wd) ->
        #     output =
        #         reading_match : wd._match
        #         punct : wd._punct
        #         match_sentence : wd._matchSentence

        #     for struct in (wd._struct or [])
        #         output["struct_" + struct] = true

        #     for struct in (wd._open or [])
        #         output["open_" + struct] = true
        #     for struct in (wd._close or [])
        #         output["close_" + struct] = true
        scope.getClassObj = (wd) ->
            output =
                reading_match : wd._match
                punct : wd._punct
                match_sentence : wd._matchSentence

            for struct in (wd._struct or [])
                output["struct_" + struct] = true

            for struct in (wd._open or [])
                output["open_" + struct] = true
            for struct in (wd._close or [])
                output["close_" + struct] = true



            return (x for [x, y] in _.pairs output when y).join " "



korpApp.controller "TokenList", ($scope, $location) ->
    s = $scope
    # s.defaultOptions = settings.defaultOptions


    cqp = '[pos = "NN" | word = "value2" & lex contains "ge..vb.1"] []{1,2}'
    # cqp = '[word = "value"] []{1,2}'
    s.data = []
    try
        s.data = CQP.parse(cqp)
        c.log "s.data", s.data
    catch error
        output = []
        for token in cqp.split("[")
            if not token
                continue
            token = "[" + token
            try
                tokenObj = CQP.parse(token)
            catch error
                tokenObj = [{cqp : token}]
            output = output.concat(tokenObj)

        s.data = output
        c.log "crash", s.data


    # c.log "s.data", s.data

    if $location.search().cqp
        s.data = CQP.parse(decodeURIComponent($location.search().cqp))
    else
        s.data = CQP.parse(cqp)

    # expand [] to [word = '']
    for token in s.data
        if "and_block" not of token
            token.and_block = CQP.parse('[word = ""]')[0].and_block

    s.$watch 'getCQPString()', () ->
        cqpstr = CQP.stringify(s.data)
        # $location.search({cqp : encodeURIComponent(cqpstr)})

    s.getCQPString = ->
        return (CQP.stringify s.data) or ""

    s.addToken = ->
        s.data.push(JSON.parse(JSON.stringify(s.data[..-1][0])))
    s.removeToken = (i) ->
        s.data.splice(i, 1)

korpApp.filter "mapper", () ->
    return (item, f) ->
        return f(item)

korpApp.controller "ExtendedToken", ($scope, $location) ->
    s = $scope
    # cqp = '[(word = "ge" | pos = "JJ") & deprel = 1"SS" & deprel = "lol" & deprel = "10000"]'
    # cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "" | word = "")]'

    s.valfilter = (attrobj) ->
        return if attrobj.isStructAttr then "_." + attrobj.value else attrobj.value

    # words = "word,pos,msd,lemma,lex,saldo,dephead,deprel,ref,prefix,suffix,entity".split(",")
    word =
        group : "word"
        value : "word"
        label : "word"


    

    s.setDefault = (or_obj) ->
        # assign the first value from the opts 
        or_obj.op = _.values(s.getOpts(or_obj.type))[0]

        or_obj.val = ""

    s.getOpts = (type) ->
        s.typeMapping?[type].opts or settings.defaultOptions


    s.$on "corpuschooserchange", (selected) ->
        # TODO: respece the setting 'word_attribute_selector' and similar
        attrs = for key, obj of settings.corpusListing.getCurrentAttributes() when obj.displayType != "hidden"
            _.extend({group : "word_attr", value : key}, obj)

        sent_attrs = for key, obj of settings.corpusListing.getStructAttrs() when obj.displayType != "hidden"
            _.extend({group : "sentence_attr", value : key}, obj)


        s.types = [word].concat(attrs, sent_attrs)
        s.typeMapping = _.object _.map s.types, (item) -> [item.value, item]



        
    s.addOr = (and_array) ->
        and_array.push
            type : "word"
            op : "="
            val : ""
        return and_array
    s.removeOr = (and_array, i) ->
        if and_array.length > 1
            and_array.splice(i, 1)
        else
            s.token.and_block.splice _.indexOf and_array, 1


    s.addAnd = () ->
        s.token.and_block.push s.addOr([])


    s.getTokenCqp = ->
        if not s.token.cqp
            return ""
        s.token.cqp.match(/\[(.*)]/)[1]

korpApp.factory "util", ($location) ->
    setupHash : (scope, config) ->
        # config = [
        #     expr : "sorttuple[0]"
        #     scope_name : "sortVal"
        #     scope_func : "locChange"
        #     key : "sortering"
        #     val_in : (val) ->
        #         newVal
        #     val_out : (val) ->
        #         newVal
        #     post_change : () ->
        #     default : [val : valval]

        # ]
        scope.loc = $location
        scope.$watch 'loc.search()', ->
            for obj in config
                val = $location.search()[obj.key]
                unless val then continue

                val = (obj.val_in or _.identity)(val)

                if "scope_name" of obj
                    scope[obj.scope_name] = val
                else if "scope_func" of obj
                    scope[obj.scope_func](val)
                else
                    scope[obj.key] = val

        for obj in config
            watch = obj.expr or obj.scope_name or obj.key
            scope.$watch watch or obj.key, do (obj) ->
                (val) ->
                    val = (obj.val_out or _.identity)(val)
                    $location.search obj.key, if val? then val else null
                    obj.post_change?(val)


korpApp.controller "SearchPaneCtrl", ($scope, util, $location) ->
    s = $scope
    # $location.search()["search_tab"]
    s.search_tab = parseInt($location.search()["search_tab"]) or 0
    c.log "search_tab init", s.search_tab

    s.getSelected = () ->
        unless s.tabs?.length then return s.search_tab
        for p, i in s.tabs
            return i if p.active
    s.setSelected = (index) ->
        # unless s.tabs then return
        for p in s.tabs
            p.active = false
        if s.tabs[index]
            s.tabs[index].active = true

    util.setupHash s,[
        expr : "getSelected()"
    #     # scope_name : "sortVal"
        val_out : (val) ->
            c.log "val out", val
            return val
    #         # s.select
        val_in : (val) ->
            c.log "val_in", typeof val
            # return parseInt(val)
            s.setSelected parseInt(val)
            return parseInt(val)
    #     # scope_func : "select"
        key : "search_tab"
    ]




korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


korpApp.directive "tokenValue", ($compile, $controller) ->
    defaultTmpl = "<input ng-model='model'>"

    # require:'ngModel',
    scope :
        tokenValue : "="
        model : "=ngModel"
    template : """
        <div class="arg_value">{{tokenValue.label}}</div>
    """
    link : (scope, elem, attr, ngModelCtrl) ->
        scope.$watch "tokenValue", (valueObj) ->
            c.log "watch value", valueObj
            unless valueObj then return

            

            # _.extend scope, (_.pick valueObj, "dataset", "translationKey")
            if valueObj.controller
                locals = {$scope : _.extend scope, valueObj} 

                $controller(valueObj.controller, locals)
            # valueObj.controller?(scope, _.omit valueObj)

            tmplElem = $compile(valueObj.extended_template or defaultTmpl)(scope)
            elem.html(tmplElem)


korpApp.directive "korpAutocomplete", () ->
    scope : 
        model : "="
        stringify : "="
        sorter : "="
        type : "@"
    link : (scope, elem, attr) ->
        
        c.log "scope.model", scope.model, scope.type
        setVal = (lemgram) ->
            $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, ""))
                .val("").blur().placeholder()
        if scope.model
            setVal(scope.model)
        arg_value = elem.korp_autocomplete(
            labelFunction: scope.stringify
            sortFunction: scope.sorter
            type: scope.type
            select: (lemgram) ->
                c.log "extended lemgram", lemgram, $(this)
                # $(this).data "value", (if data.label is "baseform" then lemgram.split(".")[0] else lemgram)
                setVal(lemgram)
                scope.$apply () ->
                    scope.model = lemgram
            "sw-forms": true
        )
        .blur(->
            input = this
            setTimeout (->
                c.log "blur"

                if ($(input).val().length and not util.isLemgramId($(input).val())) or $(input).data("value") is null
                    $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder()
                else
                    $(input).removeClass("invalid_input")
                # self._trigger "change"
            ), 100
        )



