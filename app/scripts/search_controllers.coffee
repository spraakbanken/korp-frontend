korpApp = angular.module("korpApp")


korpApp.controller "SearchCtrl", ($scope, $location) ->
    $scope.visibleTabs = [true, true, true, true]
    $scope.extendedTmpl = "views/extended_tmpl.html"
    $scope.isCompareSelected = false

    $scope.selectCompare = () ->
        $scope.isCompareSelected = true
    $scope.deselectCompare = () ->
        $scope.isCompareSelected = false

    $scope.$watch( (() -> $location.search().search_tab),
        (val) ->
            $scope.isCompareSelected = val == 3
    )

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




korpApp.controller "ExtendedSearch", ($scope, utils, $location, backend, $rootScope, searches, compareSearches, $timeout) ->
    s = $scope
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
            $location.search("search", "cqp")
        , 0)


    if $location.search().cqp
        s.cqp = $location.search().cqp

    s.$watch "cqp", (val) ->
        c.log "cqp change", val
        unless val then return
        $rootScope.activeCQP = CQP.expandOperators(val)
        $location.search("cqp", val)




korpApp.controller "ExtendedToken", ($scope, utils, $location) ->
    s = $scope
    c.log "ExtendedToken", s
    cqp = '[]'

    s.valfilter = utils.valfilter
    

    s.setDefault = (or_obj) ->
        # assign the first value from the opts 
        or_obj.op = _.values(s.getOpts(or_obj.type))[0][1]
        c.log "or_obj.op", or_obj.op

        or_obj.val = ""

    s.getOpts = (type) ->
        confObj = s.typeMapping?[type]

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

        c.log "onCorpusChange", selected

        s.types = utils.getAttributeGroups(settings.corpusListing)
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
        else
            token.and_block.splice _.indexOf and_array, 1


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


    s.$on "change_case", (event, val) ->
        c.log "change_case", val, s


korpApp.controller "AdvancedCtrl", ($scope, compareSearches, $location) ->
    $scope.cqp = "[]"
    $scope.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch {
            label : name or $rootScope.activeCQP
            cqp : $scope.cqp
            corpora : settings.corpusListing.getSelectedCorpora()

        }

    $scope.$on "btn_submit", () ->
        $location.search("search", "cqp|" + $scope.cqp)



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
        return utils.getAttributeGroups(listing)


    s.sendCompare = () ->
        $rootScope.compareTabs.push backend.requestCompare(s.cmp1, s.cmp2, s.reduce)
        # tab = $("#results-wrapper .nav.nav-tabs").scope().tabs[-1..][0]

    # s.sendCompare()




korpApp.filter "loc", ($rootScope) ->
    (translationKey) ->
        return util.getLocaleString translationKey


