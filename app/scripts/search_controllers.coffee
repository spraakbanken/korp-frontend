window.korpApp = angular.module('korpApp', ["watchFighters"
                                            "ui.bootstrap.dropdownToggle",
                                            "ui.bootstrap.tabs",
                                            "template/tabs/tabset.html"
                                            "template/tabs/tab.html"
                                            "ui.bootstrap.modal"
                                            "template/modal/backdrop.html"
                                            "template/modal/window.html"
                                            "ui.bootstrap.typeahead"
                                            "template/typeahead/typeahead-match.html",
                                            "template/typeahead/typeahead-popup.html"
                                            "angularSpinner"
                                            "uiSlider"
                                        ])

# korpApp.controller "kwicCtrl", ($scope) ->

korpApp.run ($rootScope, $location, utils, searches) ->
    s = $rootScope
    s.lang = "sv"
    s.word_selected = null

    # s.$watch "word_selected", (val) ->
    #     c.log "word_selected", val
        # unless $("#sidebar").data("korpSidebar") then return
        # if val 
        #     $("#sidebar").sidebar("show")
        # else
        #     $("#sidebar").sidebar("hide")

    s.sidebar_visible = false

    s.activeCQP = "[]"
    s.search = () -> $location.search arguments...



    s._loc = $location
    s.$watch "_loc.search()", () ->
        c.log "loc.search() change", $location.search()
        _.defer () -> window.onHashChange?()


    # $rootScope.savedSearches = []

    # $rootScope.saveSearch = (searchObj) ->
    #     $rootScope.savedSearches.push searchObj


    $rootScope.kwicTabs = []
    $rootScope.compareTabs = []
    $rootScope.graphTabs = []
    isInit = true
    s.$on "corpuschooserchange", (event, corpora) ->
        c.log "corpuschooserchange", corpora
        settings.corpusListing.select corpora
        nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id")
        c.log "corpus change", corpora.length, _.intersection(corpora, nonprotected).length, nonprotected.length
        if corpora.length and _.intersection(corpora, nonprotected).length isnt nonprotected.length
            # $.bbq.pushState({"corpus" : corpora.join(",")})
            # search corpus: corpora.join(",")
            $location.search "corpus", corpora.join(",")
        else
            $location.search "corpus", null
        if corpora.length
          
            # if(currentMode == "parallel")
            #     extendedSearch.reset();
            # else 
            #     extendedSearch.refreshTokens();
            view.updateReduceSelect()
            view.updateContextSelect "within"

        #           view.updateContextSelect("context");
        enableSearch = !!corpora.length
        view.enableSearch enableSearch


        # unless isInit
        #     $location.search("search", null).replace()
        isInit = false


    # corpus = search()["corpus"]
    searches.infoDef.then () ->
        corpus = $location.search().corpus
        if corpus
            corp_array = corpus.split(",")
            processed_corp_array = []
            settings.corpusListing.select(corp_array)
            $.each corp_array, (key, val) ->
                processed_corp_array = [].concat(processed_corp_array, getAllCorporaInFolders(settings.corporafolders, val))
            corpusChooserInstance.corpusChooser "selectItems", processed_corp_array
            $("#select_corpus").val corpus
        #     simpleSearch.enableSubmit()
        




korpApp.controller "SimpleCtrl", ($scope, utils, $location, backend, $rootScope, searches, compareSearches) ->
    s = $scope
    c.log "SimpleCtrl"  
    
    s.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $rootScope.activeCQP
            corpora : settings.corpusListing.getSelectedCorpora()
        }

    s.searches = searches
    s.$watch "searches.activeSearch", (search) ->
        # if search.type in ["word", "lemgram"]
        unless search then return 
        c.log "searches.activeSearch", search
        if search.type == "word"
            s.placeholder = null
            s.simple_text = search.val
            cqp = simpleSearch.getCQP(search.val)
            c.log "simple search cqp", cqp
            page = $rootScope.search()["page"] or 0
            searches.kwicSearch(cqp, page)
            # simpleSearch.makeLemgramSelect() if settings.lemgramSelect
            lemgramResults.showPreloader();
            lemgramProxy.makeRequest(search.val, "word", $.proxy(lemgramResults.onProgress, lemgramResults));

        else if search.type == "lemgram"
            s.placeholder = search.val
            s.simple_text = ""
        else 
            s.placeholder = null
            s.simple_text = ""


    s.lemgramToString = (lemgram) ->
        unless lemgram then return
        util.lemgramToString(lemgram).replace(/<.*?>/g, "")




korpApp.controller "ExtendedSearch", ($scope, utils, $location, backend, $rootScope, searches, compareSearches) ->
    s = $scope
    s.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $rootScope.activeCQP
            corpora : settings.corpusListing.getSelectedCorpora()

        }

    s.searches = searches
    # s.$watch "searches.activeSearch", (search) ->
    #     unless search then return

        #TODO: keep compat with old cqp|expr hash var, but move to plain cqp 
        # and use cqp=expr hash var to keep updating when extended changes

        # if search.type == "cqp"
        #     expr = 
    s.$on "btn_submit", () ->
        c.log "extended submit"
        $location.search("search", "cqp")




korpApp.controller "ExtendedToken", ($scope, utils, $location) ->
    s = $scope
    # cqp = '[(word = "ge" | pos = "JJ") & deprel = 1"SS" & deprel = "lol" & deprel = "10000"]'
    # cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "" | word = "")]'
    cqp = '[]'

    # s.valfilter = (attrobj) ->
    #     return if attrobj.isStructAttr then "_." + attrobj.value else attrobj.value

    s.valfilter = utils.valfilter
    # words = "word,pos,msd,lemma,lex,saldo,dephead,deprel,ref,prefix,suffix,entity".split(",")
    # word =
    #     group : "word"
    #     value : "word"
    #     label : "word"
    

    s.setDefault = (or_obj) ->
        # assign the first value from the opts 
        or_obj.op = _.values(s.getOpts(or_obj.type))[0][1]
        # c.log "setDefault", _.values(s.getOpts(or_obj.type)), or_obj.op

        or_obj.val = ""

    s.getOpts = (type) ->
        optObj = s.typeMapping?[type]?.opts or settings.defaultOptions
        _.pairs optObj



    onCorpusChange = (event, selected) ->
        # TODO: respece the setting 'word_attribute_selector' and similar
        # attrs = for key, obj of settings.corpusListing.getCurrentAttributes() when obj.displayType != "hidden"
        #     _.extend({group : "word_attr", value : key}, obj)

        # sent_attrs = for key, obj of settings.corpusListing.getStructAttrs() when obj.displayType != "hidden"
        #     _.extend({group : "sentence_attr", value : key}, obj)

        c.log "onCorpusChange", selected

        s.types = utils.getAttributeGroups(settings.corpusListing)
        s.typeMapping = _.object _.map s.types, (item) -> 
            if item.isStructAttr
                ["_." + item.value, item]
            else 
                [item.value, item]


        # s.types = _.sortBy s.types, "label"



    s.$on "corpuschooserchange", onCorpusChange

    onCorpusChange()

        
    s.removeOr = (and_array, i) ->
        if and_array.length > 1
            and_array.splice(i, 1)
        else
            s.token.and_block.splice _.indexOf and_array, 1


    s.addAnd = () ->
        s.token.and_block.push s.addOr([])

    toggleBound = (token, bnd) ->
        unless token.bound?[bnd]
            boundObj = {}
            boundObj[bnd] = true
            token.bound = _.extend (token.bound or {}), boundObj
        else 
            delete token.bound?[bnd]

    s.toggleStart = (token) ->
        toggleBound(token, "lbound")
    s.toggleEnd = (token) ->
        toggleBound(token, "rbound")

    s.toggleRepeat = (token) ->
        unless token.repeat
            token.repeat = [1,1]
        else 
            delete token.repeat


    s.getTokenCqp = ->
        if not s.token.cqp
            return ""
        s.token.cqp.match(/\[(.*)]/)[1]


    s.$on "change_case", (event, val) ->
        c.log "change_case", val, s


korpApp.controller "TokenList", ($scope, $location, $rootScope) ->
    s = $scope
    # s.defaultOptions = settings.defaultOptions


    # cqp = '[msd = "" | word = "value2" & lex contains "ge..vb.1"] []{1,2}'
    # cqp = '[lex contains "ge..vb.1"]'
    s.cqp = '[]'


    s.data = []

    # s.$watch "activeCQP", (cqp) ->
    try
        s.data = CQP.parse(s.cqp)
        c.log "s.data", s.data
    catch error
        output = []
        for token in s.cqp.split("[")
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
        s.data = CQP.parse($location.search().cqp)
    else
        s.data = CQP.parse(s.cqp)

    for token in s.data
        if "and_block" not of token or not token.and_block.length
            token.and_block = CQP.parse('[word = ""]')[0].and_block


    # c.log "s.data", s.data


    # expand [] to [word = '']
    

    s.$watch 'getCQPString()', (val) ->
        c.log "getCQPString", val
        cqpstr = CQP.stringify(s.data)
        $rootScope.activeCQP = cqpstr
        # $location.search({cqp : encodeURIComponent(cqpstr)})
        $location.search("cqp", cqpstr)
        
        

    s.getCQPString = ->
        return (CQP.stringify s.data) or ""


    s.addOr = (and_array) ->
        and_array.push
            type : "word"
            op : "="
            val : ""
        return and_array


    s.addToken = ->
        token = {and_block : [[]]}
        s.data.push token
        s.addOr token.and_block[0]

    s.removeToken = (i) ->
        unless s.data.length > 1 then return
        s.data.splice(i, 1)

korpApp.filter "mapper", () ->
    return (item, f) ->
        return f(item)




korpApp.controller "CompareSearchCtrl", ($scope, utils, $location, backend, $rootScope, compareSearches) ->
    s = $scope
    s.valfilter = utils.valfilter

    compareSearches.saveSearch {
        label : "frihet"
        cqp : "[lex contains 'frihet..nn.1']"
        corpora : ["VIVILL"]
    }
    compareSearches.saveSearch {
        label : "jämlikhet"
        cqp : "[lex contains 'jämlikhet..nn.1']"
        corpora : ["VIVILL"]
    }

    s.savedSearches = compareSearches.savedSearches
    s.cmp1 = compareSearches.savedSearches[0]
    s.cmp2 = compareSearches.savedSearches[1]

    s.reduce = 'word'
    # s.reduce = '_.text_parti'

    s.getAttrs = () ->
        unless s.cmp1 then return
        listing = settings.corpusListing.subsetFactory(_.uniq ([].concat s.cmp1.corpora, s.cmp2.corpora))
        return utils.getAttributeGroups(listing)


    s.sendCompare = () ->
        $rootScope.compareTabs.push backend.requestCompare(s.cmp1, s.cmp2, s.reduce)
        # tab = $("#results-wrapper .nav.nav-tabs").scope().tabs[-1..][0]

    # s.sendCompare()




korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


