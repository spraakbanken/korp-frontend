window.korpApp = angular.module('korpApp', ["watchFighters"
                                            "ui.bootstrap.dropdownToggle",
                                            "ui.bootstrap.tabs",
                                            "template/tabs/pane.html"
                                            "template/tabs/tabs.html"

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
    cqp = '[word = "value" | word = "value2" & lex contains "ge..vb.1"] []{1,2}'
    s.data = []
    try
        s.data = CQP.parse(cqp)
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
    if $location.search().cqp
        s.data = CQP.parse(decodeURI($location.search().cqp))
    else
        s.data = CQP.parse(cqp)

    s.$watch 'getCQPString()', () ->
        # $location.search($.param({cqp : CQP.stringify(s.data)}))
        # $location.search({cqp : encodeURI(CQP.stringify(s.data))})

    s.getCQPString = ->
        return (CQP.stringify s.data) or ""

    s.addToken = ->
        c.log s.data[..-1][0]
        s.data.push(JSON.parse(JSON.stringify(s.data[..-1][0])))
    s.removeToken = (i) ->
        s.data.splice(i, 1)

korpApp.controller "ExtendedToken", ($scope, $location) ->
    s = $scope
    # cqp = '[(word = "ge" | pos = "JJ") & deprel = 1"SS" & deprel = "lol" & deprel = "10000"]'
    # cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "" | word = "")]'


    s.types = "word,pos,msd,lemma,lex,saldo,dephead,deprel,ref,prefix,suffix,entity".split(",")
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

            s.token.and_block.splice s.$parent.$index, 1


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
                    $location.search obj.key, val or null
                    obj.post_change?(val)


korpApp.controller "SearchPaneCtrl", ($scope, util) ->
    s = $scope
    s.search_tab = 0
    s.getSelected = () ->
        for p, i in s.panes
            return i if p.selected
    s.setSelected = (index) ->
        for p in s.panes
            p.selected = false
        s.panes[index].selected = true
    # s.setPane
    util.setupHash s,[
        expr : "getSelected()"
    #     # scope_name : "sortVal"
        val_out : (val) ->
            return val
    #         # s.select
        val_in : (val) ->
            s.setSelected val
    #     # scope_func : "select"
        key : "search_tab"
    ]



# korpApp.controller "SimpleSearchCtrl", ($scope, util) ->



korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        # c.log "loc", $rootScope.lang, util.getLocaleString translationKey
        return util.getLocaleString translationKey
