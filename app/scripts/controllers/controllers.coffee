window.korpApp = angular.module('korpApp', ["watchFighters"
                                            "ui.bootstrap.dropdownToggle",
                                            "ui.bootstrap.tabs",
                                            "template/tabs/tabset.html"
                                            "template/tabs/tab.html"
                                            "template/tabs/tabset-titles.html"
                                            "ui.bootstrap.modal"
                                            "template/modal/backdrop.html"
                                            "template/modal/window.html"
                                            "ui.bootstrap.typeahead"
                                            "template/typeahead/typeahead.html"
                                            "template/typeahead/typeahead-popup.html"
                                            "angularSpinner"
                                        ])

# korpApp.controller "kwicCtrl", ($scope) ->

korpApp.run ($rootScope, $location, $route, $routeParams, utils) ->
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



korpApp.controller "SimpleCtrl", ($scope, utils, $location, backend, $rootScope, searches) ->
    s = $scope
    c.log "SimpleCtrl"  
    
    s.$on "popover_submit", (event, name) ->
        $rootScope.saveSearch {
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
        else if search.type == "lemgram"
            s.placeholder = search.val
            s.simple_text = ""
        else 
            s.placeholder = null
            s.simple_text = ""


    s.lemgramToString = (lemgram) ->
        unless lemgram then return
        util.lemgramToString(lemgram).replace(/<.*?>/g, "")




korpApp.controller "ExtendedSearch", ($scope, utils, $location, backend, $rootScope, searches) ->
    s = $scope
    s.$on "popover_submit", (event, name) ->
        $rootScope.saveSearch {
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
            # expr = 





    s.submit = () ->
        c.log "extended submit"
        $location.search("search", "cqp")



korpApp.controller "ExtendedToken", ($scope, utils, $location) ->
    s = $scope
    # cqp = '[(word = "ge" | pos = "JJ") & deprel = 1"SS" & deprel = "lol" & deprel = "10000"]'
    # cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "" | word = "")]'

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
        or_obj.op = _.values(s.getOpts(or_obj.type))[0]

        or_obj.val = ""

    s.getOpts = (type) ->
        s.typeMapping?[type].opts or settings.defaultOptions


    onCorpusChange = (selected) ->
        # TODO: respece the setting 'word_attribute_selector' and similar
        # attrs = for key, obj of settings.corpusListing.getCurrentAttributes() when obj.displayType != "hidden"
        #     _.extend({group : "word_attr", value : key}, obj)

        # sent_attrs = for key, obj of settings.corpusListing.getStructAttrs() when obj.displayType != "hidden"
        #     _.extend({group : "sentence_attr", value : key}, obj)


        s.types = utils.getAttributeGroups(settings.corpusListing)
        s.typeMapping = _.object _.map s.types, (item) -> [item.value, item]


    s.$on "corpuschooserchange", onCorpusChange

    onCorpusChange()

        
    
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

korpApp.controller "TokenList", ($scope, $location, $rootScope) ->
    s = $scope
    # s.defaultOptions = settings.defaultOptions


    # cqp = '[msd = "" | word = "value2" & lex contains "ge..vb.1"] []{1,2}'
    cqp = '[lex contains "ge..vb.1"]'

    s.data = []

    # s.$watch "activeCQP", (cqp) ->
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


    for token in s.data
        if "and_block" not of token
            token.and_block = CQP.parse('[word = ""]')[0].and_block


    # c.log "s.data", s.data

    # if $location.search().cqp
    #     s.data = CQP.parse(decodeURIComponent($location.search().cqp))
    # else
    #     s.data = CQP.parse(cqp)

    # expand [] to [word = '']
    

    s.$watch 'getCQPString()', () ->
        cqpstr = CQP.stringify(s.data)
        $rootScope.activeCQP = cqpstr
        $location.search({cqp : encodeURIComponent(cqpstr)})



    s.addOr = (and_array) ->
        and_array.push
            type : "word"
            op : "="
            val : ""
        return and_array
    
    s.addToken = ->
        # s.data.push s.addOr([])
        token = {and_array : []}
        s.data.push token
        s.addOr token.and_array
        # s.data.push(JSON.parse(JSON.stringify(s.data[..-1][0])))

    s.removeToken = (i) ->
        s.data.splice(i, 1)
        

    s.getCQPString = ->
        return (CQP.stringify s.data) or ""


korpApp.filter "mapper", () ->
    return (item, f) ->
        return f(item)



korpApp.controller "CompareSearchCtrl", ($scope, utils, $location, backend, $rootScope) ->
    s = $scope
    cl = settings.corpusListing
    s.valfilter = utils.valfilter

    $rootScope.saveSearch {
        label : "första"
        cqp : "[pos='NN']"
        corpora : ["ROMI"]
    }
    $rootScope.saveSearch {
        label : "andra"
        cqp : "[pos='NN']"
        corpora : ["ROMII"]
    }


    s.cmp1 = $rootScope.savedSearches[0]
    s.cmp2 = $rootScope.savedSearches[1]

    s.reduce = 'word'

    s.getAttrs = () ->
        listing = cl.subsetFactory(_.uniq [].concat s.cmp1.corpora, s.cmp2.corpora)
        return utils.getAttributeGroups(listing)


    s.sendCompare = () ->
        $rootScope.compareTabs.push backend.requestCompare(s.cmp1, s.cmp2, s.reduce)


    # s.sendCompare()




korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


