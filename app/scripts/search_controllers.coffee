korpApp = angular.module("korpApp")


korpApp.controller "SearchCtrl", ($scope, $location, utils) ->
    $scope.visibleTabs = [true, true, true, true]
    $scope.extendedTmpl = "views/extended_tmpl.html"
    $scope.isCompareSelected = false

    $scope.settings = settings

    $scope.$watch( (() -> $location.search().search_tab),
        (val) ->
            $scope.isCompareSelected = val == 3
    )

    $scope.$watch (() -> $location.search().word_pic), (val) ->
        $scope.word_pic = Boolean(val)

    $scope.$watch "word_pic", (val) ->
        $location.search("word_pic", Boolean(val) or null)

    $scope.showStats = () -> settings.statistics != false

    # utils.setupHash $scope, [
    #         key : "word_pic"
    #         val_out : Boolean
    #         val_in : Boolean
    #         default : false
    #         post_change : () ->
    #             c.log "post_change word_pic", $scope.word_pic
    # ]

korpApp.config ($tooltipProvider) ->
    $tooltipProvider.options
        appendToBody: true


korpApp.controller "SimpleCtrl", ($scope, utils, $location, backend, $rootScope, searches, compareSearches) ->
    s = $scope

    s.$on "popover_submit", (event, name) ->
        cqp = s.instance.getCQP()
        compareSearches.saveSearch {
            label : name or cqp
            cqp : cqp
            corpora : settings.corpusListing.getSelectedCorpora()
        }
    

    s.stringifyRelatedHeader = (wd) ->
        wd.replace(/_/g, " ")

    s.stringifyRelated = (wd) ->
        util.saldoToString(wd)

    s.clickRelated = (wd) ->
        $location.search("search", "cqp|" + "[saldo contains '#{wd}']")

    s.relatedDefault = 4
    s.relatedLimit = s.relatedDefault


    s.searches = searches
    s.$watch "searches.activeSearch", (search) =>
        # if search.type in ["word", "lemgram"]
        unless search then return 
        c.log "searches.activeSearch", search
        page = $rootScope.search()["page"] or 0
        s.relatedObj = null
        if search.type == "word"
            s.placeholder = null
            s.simple_text = search.val
            cqp = simpleSearch.getCQP(search.val)
            c.log "simple search cqp", cqp
            searches.kwicSearch(cqp, page)
            # simpleSearch.makeLemgramSelect() if settings.lemgramSelect
            if settings.wordpicture != false and s.word_pic and " " not in search.val
                lemgramResults.makeRequest(search.val, "word");
                # lemgramProxy.makeRequest(search.val, "word", $.proxy(lemgramResults.onProgress, lemgramResults));
            else  
                lemgramResults.resetView()

        else if search.type == "lemgram"
            s.placeholder = search.val
            s.simple_text = ""
            cqp = "[lex contains '#{search.val}']"
            backend.relatedWordSearch(search.val).then (data) ->
                s.relatedObj = data
            
            if s.word_pic
                searches.lemgramSearch(lemgram, s.prefix, s.suffix, page)
            else
                searches.kwicSearch(cqp, page)
            
        else 
            s.placeholder = null
            s.simple_text = ""
            lemgramResults.resetView()


    s.lemgramToString = (lemgram) ->
        unless lemgram then return
        util.lemgramToString(lemgram).replace(/<.*?>/g, "")

    utils.setupHash s, [
            key : "prefix"
        ,
            key : "suffix"
        ,
            key : "isCaseInsensitive"
    ]




korpApp.controller "ExtendedSearch", ($scope, utils, $location, backend, $rootScope, searches, compareSearches, $timeout) ->
    s = $scope
    s.within = "sentence"
    s.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $rootScope.activeCQP
            corpora : settings.corpusListing.getSelectedCorpora()

        }

    s.searches = searches
    s.$on "btn_submit", () ->
        c.log "extended submit"
        $location.search("search", null)
        $timeout( () ->
            within = s.within unless s.within in _.keys settings.defaultWithin
            $location.search("within", within or null)
            $location.search("search", "cqp")
        , 0)


    if $location.search().cqp
        s.cqp = $location.search().cqp

    s.$watch "cqp", (val) ->
        c.log "cqp change", val
        unless val then return
        try 
            $rootScope.activeCQP = CQP.expandOperators(val)
        catch e
            c.log "cqp parse error:", e
        $location.search("cqp", val)




    s.withins = []

    s.getWithins = () ->
        intersect = settings.corpusListing.getAttrIntersection("within")
        union = settings.corpusListing.getAttrUnion("within")
        # opts = $(".#{withinOrContext}_select option")
        # opts.data("locSuffix", null).attr("disabled", null).removeClass "limited"

        # return union
        output = _.map union, (item) -> {value : item}

        # all support enhanced context
        if union.length > intersect.length
            for obj in output
                if obj.value not in intersect
                    obj.partial = true
                else
                    obj.partial = false

        return output

    s.$on "corpuschooserchange", () ->
        s.withins = s.getWithins()




korpApp.controller "ExtendedToken", ($scope, utils, $location) ->
    s = $scope
    c.log "ExtendedToken", s
    cqp = '[]'

    s.valfilter = utils.valfilter
    
    s.setDefault = (or_obj) ->
        # assign the first value from the opts 
        opts = s.getOpts(or_obj.type)

        unless opts
            or_obj.op = "is"
        else
            or_obj.op = _.values(opts)[0][1]


        or_obj.val = ""

    s.getOpts = (type) ->
        confObj = s.typeMapping?[type]
        unless confObj
            c.log "confObj missing", type, s.typeMapping
            return

        optObj = _.extend {}, (confObj?.opts or settings.defaultOptions)
        if confObj.type == "set"
            optObj.is = "contains"

        _.pairs optObj



    onCorpusChange = (event, selected) ->
        # TODO: respece the setting 'word_attribute_selector' and similar
        # attrs = for key, obj of settings.corpusListing.getCurrentAttributes() when obj.displayType != "hidden"
        #     _.extend({group : "word_attr", value : key}, obj)

        # sent_attrs = for key, obj of settings.corpusListing.getStructAttrs() when obj.displayType != "hidden"
        #     _.extend({group : "sentence_attr", value : key}, obj)

        c.log "onCorpusChange", selected, s.l

        lang = s.$parent.$parent?.l?.lang
        # c.log "lang", lang
        s.types = settings.corpusListing.getAttributeGroups(lang)
        s.typeMapping = _.object _.map s.types, (item) -> 
            if item.isStructAttr
                ["_." + item.value, item]
            else 
                [item.value, item]


        c.log "typeMapping", s.typeMapping
        # s.types = _.sortBy s.types, "label"



    s.$on "corpuschooserchange", onCorpusChange

    onCorpusChange()

        
    s.removeOr = (token, and_array, i) ->
        if and_array.length > 1
            and_array.splice(i, 1)
        else if token.and_block.length > 1
            token.and_block.splice (_.indexOf token.and_block, and_array), 1


    s.addAnd = (token) ->
        # c.log "s", s, s.token, 
        token.and_block.push s.addOr([])

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

    s.onInsertMousedown = (event) ->
        event.stopPropagation()



korpApp.controller "AdvancedCtrl", ($scope, compareSearches, $location, $timeout) ->
    expr = ""
    if $location.search().search
        [type, expr...] = $location.search().search?.split("|")
        expr = expr.join("|")
    
    if type == "cqp" 
        $scope.cqp = expr or "[]"
    else
        $scope.cqp = "[]"

    # $scope.getSimpleCQP = () -> 
    #     out = simpleSearch.getCQP()
    #     c.log "getSimpleCQP", out
    #     out

    $scope.$watch () -> 
        simpleSearch?.getCQP()
    , (val) ->
        $scope.simpleCQP = val

    $scope.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $scope.cqp
            corpora : settings.corpusListing.getSelectedCorpora()

        }

    $scope.$on "btn_submit", () ->
        c.log "advanced cqp", $scope.cqp
        $location.search("search", null)
        $timeout( () ->
            $location.search("search", "cqp|" + $scope.cqp)
        , 0)



korpApp.filter "mapper", () ->
    return (item, f) ->
        return f(item)




korpApp.controller "CompareSearchCtrl", ($scope, utils, $location, backend, $rootScope, compareSearches) ->
    s = $scope
    s.valfilter = utils.valfilter

    # compareSearches.saveSearch {
    #     label : "frihet"
    #     cqp : "[lex contains 'frihet..nn.1']"
    #     corpora : ["VIVILL"]
    # }
    # compareSearches.saveSearch {
    #     label : "jämlikhet"
    #     cqp : "[lex contains 'jämlikhet..nn.1']"
    #     corpora : ["VIVILL"]
    # }

    s.savedSearches = compareSearches.savedSearches
    s.$watch "savedSearches.length", () ->
        s.cmp1 = compareSearches.savedSearches[0]
        s.cmp2 = compareSearches.savedSearches[1]
        


    s.reduce = 'word'

    s.getAttrs = () ->
        unless s.cmp1 and s.cmp2 then return
        listing = settings.corpusListing.subsetFactory(_.uniq ([].concat s.cmp1.corpora, s.cmp2.corpora))
        return listing.getAttributeGroups()


    s.sendCompare = () ->
        $rootScope.compareTabs.push backend.requestCompare(s.cmp1, s.cmp2, s.reduce)
        # tab = $("#results-wrapper .nav.nav-tabs").scope().tabs[-1..][0]

    s.deleteCompares = () ->
        compareSearches.flush()

    # s.sendCompare()




korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


