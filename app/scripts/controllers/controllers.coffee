window.korpApp = angular.module('korpApp', ["watchFighters"
                                            "ui.bootstrap.dropdownToggle",
                                            "ui.bootstrap.tabs",
                                            "template/tabs/tabset.html"
                                            "template/tabs/tab.html"
                                            "template/tabs/tabset-titles.html"
                                            "ui.bootstrap.modal",
                                            "ui.bootstrap.typeahead"
                                            "template/typeahead/typeahead.html"
                                            "template/typeahead/typeahead-popup.html"
                                        ])

# korpApp.controller "kwicCtrl", ($scope) ->

korpApp.run ($rootScope, $location, $route, $routeParams) ->
    s = $rootScope
    s.lang = "sv"

    s.activeCQP = "[]"
    s.search = () -> $location.search arguments...

    s.searchDef = $.Deferred()


    s.onSearchLoad = () ->
        s.searchDef.resolve()


    s._loc = $location
    s.$watch "_loc.search()", () ->
        c.log "loc.search() change", $location.search()
        _.defer () -> window.onHashChange?()


    $rootScope.savedSearches = []

    $rootScope.saveSearch = (searchObj) ->
        $rootScope.savedSearches.push searchObj


    $rootScope.compareTabs = []


korpApp.controller "kwicCtrl", ($scope) ->
    c.log "kwicCtrl init"
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


korpApp.controller "compareCtrl", ($scope) ->
    s = $scope

    s.promise.then (data) ->
        # c.log "compare promise", _.pairs data.loglike
        s.tables = _.groupBy  (_.pairs data.loglike), ([word, val]) ->
            if val > 0 then "positive" else "negative"

        s.tables.positive = _.sortBy s.tables.positive, (tuple) -> tuple[1]
        s.tables.negative = _.sortBy s.tables.negative, (tuple) -> Math.abs tuple[1]









korpApp.controller "TokenList", ($scope, $location) ->
    s = $scope
    # s.defaultOptions = settings.defaultOptions


    cqp = '[msd = "" | word = "value2" & lex contains "ge..vb.1"] []{1,2}'
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
        onWatch = () ->
            for obj in config
                val = $location.search()[obj.key]
                unless val 
                    if obj.default then val = obj.default else continue
                

                val = (obj.val_in or _.identity)(val)
                # c.log "obj.val_in", obj.val_in
                

                if "scope_name" of obj
                    scope[obj.scope_name] = val
                else if "scope_func" of obj
                    scope[obj.scope_func](val)
                else
                    scope[obj.key] = val
        onWatch()
        scope.loc = $location
        scope.$watch 'loc.search()', ->
            onWatch()

        for obj in config
            watch = obj.expr or obj.scope_name or obj.key
            scope.$watch watch, do (obj, watch) ->
                (val) ->
                    # c.log "before val", scope.$eval watch
                    val = (obj.val_out or _.identity)(val)
                    if val == obj.default then val = null
                    $location.search obj.key, val or null
                    # c.log "post change", watch, val
                    obj.post_change?(val)



    

        



korpApp.controller "SimpleCtrl", ($scope, util, $location, backend, $rootScope) ->
    s = $scope
    c.log "SimpleCtrl"  
    s.isShowing = true

    s.togglePopover = () ->
        if s.isPopoverVisible
            s.popHide()
        else
            s.popShow()

    s.saveSearch = (name) ->
        c.log "savesearch", name
        s.popHide()
        $rootScope.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $rootScope.activeCQP
            corpora : settings.corpusListing.stringifySelected()

        }        
        




korpApp.controller "CompareSearchCtrl", ($scope, util, $location, backend, $rootScope) ->
    s = $scope

    $rootScope.saveSearch {
        label : "första"
        cqp : "[pos='NN']"
        corpora : settings.corpusListing.subsetFactory(["ROMI"]).stringifySelected()
    }
    $rootScope.saveSearch {
        label : "andra"
        cqp : "[pos='NN']"
        corpora : settings.corpusListing.subsetFactory(["ROMII"]).stringifySelected()
    }


    s.cmp1 = $rootScope.savedSearches[0]
    s.cmp2 = $rootScope.savedSearches[1]

    

    s.sendCompare = () ->
        $rootScope.compareTabs.push backend.requestCompare(s.cmp1.corpora,
                                  s.cmp1.cqp,
                                  s.cmp2.corpora,
                                  s.cmp2.cqp)





korpApp.factory 'backend', ($http, $q, util) ->
    requestCompare : (corpus1, cqp1, corpus2, cqp2) ->
        def = $q.defer()
        params = 
            command : "loglike"
            groupby : "word" #TODO: parametrize
            set1_corpus : corpus1
            set1_cqp : cqp1
            set2_corpus : corpus2
            set2_cqp : cqp2
            max : 50


        $http(
            url : settings.cgi_script
            params : params
            method : "GET"
        ).success (data) ->
            def.resolve data



        return def.promise





korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


