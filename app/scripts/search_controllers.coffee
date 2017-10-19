korpApp = angular.module("korpApp")

window.SearchCtrl = ["$scope", "$location", "$filter", "utils", "searches", ( ($scope, $location, $filter, utils, searches) ->
    $scope.visibleTabs = [true, true, true, true]
    $scope.extendedTmpl = "views/extended_tmpl.html"
    # for parallel mode
    searches.langDef.resolve()
    $scope.isCompareSelected = false


    $scope.$watch( (() -> $location.search().search_tab),
        (val) ->
            $scope.isCompareSelected = val == 3
    )

    setupWatchWordPic = () ->
        $scope.$watch (() -> $location.search().word_pic), (val) ->
            $scope.word_pic = Boolean(val)

        $scope.$watch "word_pic", (val) ->
            $location.search("word_pic", Boolean(val) or null)

    setupWatchMap = () ->
        $scope.$watch (() -> $location.search().show_map), (val) ->
            $scope.show_map = Boolean(val)

        $scope.$watch "show_map", (val) -> $location.search("show_map", Boolean(val) or null)

    setupWatchStats = () ->
        $scope.showStatistics = true
        
        $scope.$watch (() -> $location.search().hide_stats), (val) ->
            $scope.showStatistics = not val?

        $scope.$watch "showStatistics", (val) ->
            if $scope.showStatistics
                $location.search("hide_stats", null)
            else
                $location.search("hide_stats", true)

    setupWatchWordPic()
    setupWatchMap()
    setupWatchStats()

    $scope.settings = settings
    $scope.showStats = () ->
        return settings.statistics != false

    unless $location.search().stats_reduce
        $location.search 'stats_reduce', ("word")
    
    if settings.statisticsCaseInsensitiveDefault
        $location.search 'stats_reduce_insensitive', 'word'

    $scope.corpusChangeListener = $scope.$on "corpuschooserchange", (event, selected) ->
        c.log "SearchCtrl corpuschooserchange"
        $scope.noCorporaSelected = not selected.length
        allAttrs = settings.corpusListing.getStatsAttributeGroups()
        $scope.statCurrentAttrs = _.filter allAttrs, (item) -> not item.hideStatistics
        $scope.statSelectedAttrs = $location.search().stats_reduce.split ','
        insensitiveAttrs = $location.search().stats_reduce_insensitive
        if insensitiveAttrs
            $scope.statInsensitiveAttrs = insensitiveAttrs.split ','

        

    $scope.$watch 'statSelectedAttrs', ((selected) ->
        if selected and selected.length > 0
            $location.search 'stats_reduce', ($scope.statSelectedAttrs.join ',')
    ), true

    $scope.$watch 'statInsensitiveAttrs', ((insensitive) ->
        if insensitive and insensitive.length > 0
            $location.search 'stats_reduce_insensitive', ($scope.statInsensitiveAttrs.join ',')
        else if insensitive
            $location.search 'stats_reduce_insensitive', null
    ), true

    setupHitsPerPage = () ->
        $scope.getHppFormat = (val) ->
            if val == $scope.hitsPerPage
                return $filter("loc")("hits_per_page", $scope.lang) + ": " + val
            else
                return val
        
        $scope.hitsPerPageValues = settings.hitsPerPageValues
        $scope.hitsPerPage = $location.search().hpp or settings.hitsPerPageDefault
        
        $scope.$watch (() -> $location.search().hpp), (val) ->
            $scope.hitsPerPage = val or settings.hitsPerPageDefault

        $scope.$watch "hitsPerPage", (val) ->
            if val == settings.hitsPerPageDefault
                $location.search("hpp", null)
            else
                $location.search("hpp", val)

    setupKwicSort = () ->
        kwicSortValueMap =
            "": "appearance_context"
            "keyword": "word_context"
            "left": "left_context"
            "right": "right_context"
            "random": "random_context"
        $scope.kwicSortValues = _.keys kwicSortValueMap

        $scope.getSortFormat = (val) ->
            mappedVal = kwicSortValueMap[val]
            if val == $scope.kwicSort
                return $filter("loc")("sort_default", $scope.lang) + ": " + $filter("loc")(mappedVal, $scope.lang)
            else
                return $filter("loc")(mappedVal, $scope.lang)

        $scope.kwicSort = $location.search().sort or ""
        
        $scope.$watch (() -> $location.search().sort), (val) ->
            $scope.kwicSort = val or ""

        $scope.$watch "kwicSort", (val) ->
            if val == ""
                $location.search("sort", null)
            else
                $location.search("sort", val)

    setupHitsPerPage()
    setupKwicSort()

)]


korpApp.controller "SearchCtrl", window.SearchCtrl

korpApp.controller "SimpleCtrl", ($scope, utils, $location, backend, $rootScope, searches, compareSearches, $uibModal, $timeout) ->
    s = $scope

    s.prefix = false
    s.suffix = false 
    s.isCaseInsensitive = false
    if settings.inputCaseInsensitiveDefault
        s.isCaseInsensitive = true

    s.$on "btn_submit", () ->
        c.log "simple search submit"
        s.updateSearch()
        $location.search "within", null

    # triggers watch on searches.activeSearch
    s.updateSearch = ->
        locationSearch "search", null
        $timeout (()->
            if s.textInField
                util.searchHash "word", s.textInField
                s.model = null
                s.placeholder = null
            else if s.model
                util.searchHash "lemgram", s.model
        ), 0

    s.$watch "getCQP()", (val) ->
        if not val then return
        $rootScope.simpleCQP = CQP.expandOperators(val)

    s.getCQP = () ->
        currentText = (s.textInField or "").trim()

        if currentText
            suffix = if s.isCaseInsensitive then " %c" else ""
            wordArray = currentText.split(" ")
            tokenArray = _.map wordArray, (token) =>
                orParts = []
                if s.prefix
                    orParts.push token + ".*"
                if s.suffix
                    orParts.push ".*" + token
                if not (s.prefix or s.suffix)
                    orParts.push regescape token
                res = _.map orParts, (orPart) ->
                    return 'word = "' + orPart + '"' + suffix
                return "[" + res.join(" | ") + "]"
            val = tokenArray.join(" ")
        else if s.placeholder or util.isLemgramId(currentText)
            lemgram = if s.model then s.model else currentText
            val = "[lex contains \"#{lemgram}\""
            if s.prefix
                val += " | prefix contains \"#{lemgram}\""
            if s.suffix
                val += " | suffix contains \"#{lemgram}\""
            val += "]"

        if $rootScope.globalFilter
            val = CQP.stringify (CQP.mergeCqpExprs (CQP.parse(val or "[]")), $rootScope.globalFilter)

        return val

    s.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch name, s.getCQP()

    s.stringifyRelatedHeader = (wd) ->
        wd.replace(/_/g, " ")

    s.stringifyRelated = (wd) ->
        util.saldoToString(wd)

    modalInstance = null
    s.clickRelated = (wd, attribute) ->
        modalInstance?.close()
        c.log "modalInstance", modalInstance
        $scope.$root.searchtabs()[1].tab.select()
        if attribute is "saldo"
            cqp = "[saldo contains \"#{regescape(wd)}\"]"
        else
            cqp = "[sense rank_contains \"#{regescape(wd)}\"]"
        s.$root.$broadcast "extended_set", cqp
        $location.search "search", "cqp"
        $location.search "cqp", cqp

    s.relatedDefault = 3
    s.clickX = () ->
        modalInstance.dismiss()

    s.showAllRelated = () ->
        modalInstance = $uibModal.open(
            template: """
            <div class="modal-header">
                <h3 class="modal-title">{{'similar_header' | loc:lang}} (SWE-FN)</h3>
                <span ng-click="clickX()" class="close-x">×</span>
            </div>
            <div class="modal-body">
                <div ng-repeat="obj in relatedObj" class="col"><a target="_blank" ng-href="https://spraakbanken.gu.se/karp/#?mode=swefn&lexicon=swefn&amp;search=extended||and|sense|equals|swefn--{{obj.label}}" class="header">{{stringifyRelatedHeader(obj.label)}}</a>
                  <div class="list_wrapper">
                      <ul>
                        <li ng-repeat="wd in obj.words"> <a ng-click="clickRelated(wd, relatedObj.attribute)" class="link">{{stringifyRelated(wd) + " "}}</a></li>
                      </ul>
                  </div>
                </div>
            </div>
            """
            scope : s
            size : 'lg'
            windowClass : "related"
        )

    s.searches = searches
    s.$watch("searches.activeSearch", (search) ->
        unless search then return
        if search.type == "word" || search.type == "lemgram"
            if search.type == "word"
                s.textInField = search.val
            else
                s.placeholder = unregescape search.val
                s.model = search.val
            s.doSearch()
        else
            s.placeholder = null
            lemgramResults?.resetView()
    )

    s.doSearch = () ->
        search = searches.activeSearch
        s.relatedObj = null
        cqp = s.getCQP()
        searches.kwicSearch(cqp, search?.pageOnly)

        if not search?.pageOnly
            if search.type == "lemgram"
                sense = true
                saldo = true
                for corpus in settings.corpusListing.selected
                    if "sense" of corpus.attributes
                        saldo = false
                    if "saldo" of corpus.attributes
                        sense = false

                if sense or saldo
                    backend.relatedWordSearch(unregescape search.val).then (data) ->
                        s.relatedObj = data
                        s.relatedObj.attribute = if sense then "sense" else "saldo"

            if s.word_pic and (search.type == "lemgram" or " " not in search.val)
                value = if search.type == "lemgram" then unregescape search.val else search.val
                searches.lemgramSearch(value, search.type)
            else
                lemgramResults?.resetView()

    utils.setupHash s, [
            {key : "prefix"},
            {key : "suffix"},
            {key : "isCaseInsensitive"}
    ]


korpApp.controller "ExtendedSearch", ($scope, utils, $location, backend, $rootScope, searches, compareSearches, $timeout) ->
    s = $scope
    s.$on "popover_submit", (event, name) ->
        compareSearches.saveSearch name, $rootScope.extendedCQP

    s.searches = searches
    s.$on "btn_submit", () ->
        c.log "extended submit"
        $location.search("search", null)
        $location.search("page", null)
        $timeout( () ->
            $location.search("search", "cqp")
            within = s.within if s.within not in _.keys settings.defaultWithin
            $location.search "within", within
        , 0)


    s.$on "extended_set", ($event, val) ->
        s.cqp = val

    if $location.search().cqp
        s.cqp = $location.search().cqp

    s.$watch "repeatError", (repeatError) ->
        s.searchDisabled = repeatError

    updateExtendedCQP = () ->
        val2 = CQP.expandOperators(s.cqp)
        if $rootScope.globalFilter
            val2 = CQP.stringify (CQP.mergeCqpExprs (CQP.parse(val2 or "[]")), $rootScope.globalFilter)
        $rootScope.extendedCQP = val2

    $rootScope.$watch "globalFilter", () ->
        if $rootScope.globalFilter
            updateExtendedCQP()

    s.$watch "cqp", (val) ->
        unless val then return
        try
            updateExtendedCQP()
        catch e
            c.log "cqp parse error:", e
        $location.search("cqp", val)

    s.withins = []

    s.getWithins = () ->
        union = settings.corpusListing.getWithinKeys()
        output = _.map union, (item) -> {value : item}
        return output

    s.$on "corpuschooserchange", () ->
        s.withins = s.getWithins()
        s.within = s.withins[0]?.value


korpApp.controller "ExtendedToken", ($scope, utils, $location) ->
    s = $scope
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

    # returning new array each time kills angular, hence the memoizing
    s.getOpts = _.memoize (type) ->
        unless type of (s.typeMapping or {}) then return
        confObj = s.typeMapping?[type]
        unless confObj
            c.log "confObj missing", type, s.typeMapping
            return

        confObj = _.extend {}, (confObj?.opts or settings.defaultOptions)

        if confObj.type == "set"
            confObj.is = "contains"

        return _.pairs confObj


    onCorpusChange = (event, selected) ->
        # TODO: respect the setting 'wordAttributeSelector' and similar
        unless selected?.length then return
        lang = s.$parent.$parent?.l?.lang
        allAttrs = settings.corpusListing.getAttributeGroups(lang)
        s.types = _.filter allAttrs, (item) -> not item.hideExtended
        s.typeMapping = _.object _.map s.types, (item) ->
            if item.isStructAttr
                ["_." + item.value, item]
            else
                [item.value, item]

    s.$on "corpuschooserchange", onCorpusChange

    onCorpusChange(null, settings.corpusListing.selected)

    s.removeOr = (token, and_array, i) ->
        if and_array.length > 1
            and_array.splice(i, 1)
        else if token.and_block.length > 1
            token.and_block.splice (_.indexOf token.and_block, and_array), 1


    s.addAnd = (token) ->
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


korpApp.directive "advancedSearch", () ->
    controller : ($scope, compareSearches, $location, $timeout, $rootScope) ->
        expr = ""
        if $location.search().search
            [type, expr...] = $location.search().search?.split("|")
            expr = expr.join("|")

        if type == "cqp"
            $scope.cqp = expr or "[]"
        else
            $scope.cqp = "[]"

        $scope.$on "popover_submit", (event, name) ->
            compareSearches.saveSearch name, $scope.cqp

        $scope.$on "btn_submit", () ->
            c.log "advanced submit", $scope.cqp
            $location.search "search", null
            $location.search "page", null
            $location.search "within", null
            $timeout( () ->
                $location.search "search", "cqp|" + $scope.cqp
            , 0)


korpApp.filter "mapper", () ->
    return (item, f) ->
        return f(item)


korpApp.directive "compareSearchCtrl", () ->
    controller: ($scope, utils, $location, backend, $rootScope, compareSearches) ->
        s = $scope
        s.valfilter = utils.valfilter

        s.savedSearches = compareSearches.savedSearches
        s.$watch "savedSearches.length", () ->
            s.cmp1 = compareSearches.savedSearches[0]
            s.cmp2 = compareSearches.savedSearches[1]
            unless s.cmp1 and s.cmp2 then return

            listing = settings.corpusListing.subsetFactory(_.uniq ([].concat s.cmp1.corpora, s.cmp2.corpora))
            allAttrs = listing.getAttributeGroups()
            s.currentAttrs = _.filter allAttrs, (item) -> not item.hideCompare

        s.reduce = 'word'

        s.sendCompare = () ->
            $rootScope.compareTabs.push backend.requestCompare(s.cmp1, s.cmp2, [s.reduce])

        s.deleteCompares = () ->
            compareSearches.flush()


korpApp.filter "loc", ($rootScope) ->
    (translationKey, lang) ->
        return util.getLocaleString translationKey, lang