korpApp = angular.module("korpApp")

# korpApp.controller "resultTabCtrl", ($scope) ->
#     s = $scope
    
#     s.selectTab = (i) ->
#         s.$broadcast "tabselect", i

#     s.$watch "getSelected()", (val) ->
#         s.$root.result_tab = val


korpApp.controller "resultContainerCtrl", ($scope, searches, $location) ->
    $scope.searches = searches
    # $scope.json_url = ""
    # $scope.tabclick = () ->
    #     c.log "click tab", $location.search().result_tab, $scope
        




korpApp.controller "kwicCtrl", ($scope, utils, $location) ->
    c.log "kwicCtrl init", $scope.$parent
    s = $scope

    s.active = true

    s.onexit = () ->
        c.log "onexit"
        s.$root.sidebar_visible = false

    punctArray = [",", ".", ";", ":", "!", "?", "..."]

    s.page = Number($location.search().page) + 1 or 1

    s.setPage = ($event, page) ->
        s.instance.setPage(page)
        return

    readingChange = () ->
        c.log "reading change"

        if s.instance?.getProxy().pendingRequests.length
            window.pending = s.instance.getProxy().pendingRequests
            
            $.when(s.instance.getProxy().pendingRequests...).then () ->
                c.log "readingchange makeRequest"
                s.instance.makeRequest()

    s.setupReadingHash = () ->
        utils.setupHash s, [
            key : "reading_mode",
            post_change : (isReading) =>
                c.log "change reading mode", isReading
                readingChange()
        ]

    s.setupReadingWatch = _.once () ->
        c.log "setupReadingWatch"
        init = true
        s.$watch "reading_mode", () ->
            if not init
                readingChange()   
            init = false



    s.toggleReading = () ->
        s.reading_mode = not s.reading_mode
        s.instance.centerScrollbar()

    s.hitspictureClick = (pageNumber) ->
        s.instance.handlePaginationClick(pageNumber, null, true)

    massageData = (sentenceArray) ->
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

    c.log "selectionManager"
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




korpApp.controller "StatsResultCtrl", ($scope, utils, $location, backend, searches, $rootScope) ->
    s = $scope

    s.onGraphShow = (data) ->
        c.log "show graph!", arguments
        $rootScope.graphTabs.push data




korpApp.controller "wordpicCtrl", ($scope, $location, utils, searches) ->
    $scope.word_pic = $location.search().word_pic?
    $scope.$watch (() -> $location.search().word_pic), (val) ->
        $scope.word_pic = Boolean(val)

    $scope.activate = () ->
        $location.search("word_pic", true)
        search = searches.activeSearch
        $scope.instance.makeRequest(search.val, search.type)
        

korpApp.controller "graphCtrl", ($scope) ->
    s = $scope
    s.active = true

    s.mode = "line"

    s.isGraph = () -> s.mode in ["line", "bar"]
    s.isTable = () -> s.mode == "table"

    # s.$watch "mode", (mode) ->
    #     c.log "mode", mode

    #     switch mode
    #         when "bar"
    #             safeApply s, () ->
    #                 s.instance.setBarMode()



korpApp.controller "compareCtrl", ($scope, $rootScope) ->
    s = $scope
    s.loading = true
    s.active = true



    s.promise.then ([data, cmp1, cmp2, reduce], xhr) ->
        s.loading = false
        if data.ERROR
            s.error = true
            return

        pairs = _.pairs data.loglike
        s.tables = _.groupBy  (pairs), ([word, val]) ->
            if val > 0 then "positive" else "negative"

        s.tables.negative = _.map s.tables.negative, ([word, val]) ->
            [word, val, data.set1[word]]
        s.tables.positive = _.map s.tables.positive, ([word, val]) ->
            [word, val, data.set2[word]]



        s.tables.positive = _.sortBy s.tables.positive, (tuple) -> tuple[1] * -1
        s.tables.negative = _.sortBy s.tables.negative, (tuple) -> (Math.abs tuple[1]) * -1
        s.reduce = reduce

        cl = settings.corpusListing.subsetFactory([].concat cmp1.corpora, cmp2.corpora)
        attributes = (_.extend {}, cl.getCurrentAttributes(), cl.getStructAttrs())
        s.stringify = attributes[_.str.strip(reduce, "_.")]?.stringify or angular.identity

        s.max = _.max pairs, ([word, val]) ->
            Math.abs val

        s.cmp1 = cmp1
        s.cmp2 = cmp2

        type = attributes[_.str.strip(reduce, "_.")]?.type

        op = if type == "set" then "contains" else "="
        cmps = [cmp1, cmp2]

        s.rowClick = (triple, cmp_index) ->
            cmp = cmps[cmp_index]

            c.log "triple", triple, cmp

            cqps = []
            
            for token in triple[0].split(" ")
                if type == "set" and token == "|"
                    cqps.push "[ambiguity(#{reduce}) = 0]"
                else
                    cqps.push CQP.fromObj 
                        type : reduce
                        op : op
                        val : token
            
            cqpobj = CQP.concat cqps...

            cl = settings.corpusListing.subsetFactory cmp.corpora
            
            opts = {
                start : 0
                end : 24
                ajaxParams : 
                    command : "query"
                    cqp : cmp.cqp
                    cqp2 : CQP.stringify cqpobj
                    corpus : cl.stringifySelected()
                    show_struct : _.keys cl.getStructAttrs()
                    expand_prequeries : false

            }
            $rootScope.kwicTabs.push opts
