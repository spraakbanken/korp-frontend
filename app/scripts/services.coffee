korpApp = angular.module("korpApp")
korpApp.factory "utils", ($location) ->
    valfilter : (attrobj) ->
        return if attrobj.isStructAttr then "_." + attrobj.value else attrobj.value

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
                    if obj.default? then val = obj.default else continue


                val = (obj.val_in or _.identity)(val)
                # c.log "obj.val_in", obj.val_in

                # if obj.key == "page" then c.log "page watch", val
                if "scope_name" of obj
                    scope[obj.scope_name] = val
                else if "scope_func" of obj
                    scope[obj.scope_func](val)
                else
                    scope[obj.key] = val
                # obj.post_change?(val)
        onWatch()
        # scope.loc = $location
        scope.$watch ( () -> $location.search() ), ->
            onWatch()

        for obj in config
            watch = obj.expr or obj.scope_name or obj.key
            # c.log "watch", watch
            scope.$watch watch, do (obj, watch) ->
                (val) ->
                    # c.log "before val", scope.$eval watch
                    val = (obj.val_out or _.identity)(val)
                    if val == obj.default then val = null
                    $location.search obj.key, val or null
                    if obj.key == "page" then c.log "post change", watch, val
                    obj.post_change?(val)


korpApp.factory "debounce", ($timeout) ->
    (func, wait, options) ->
        args = null
        inited = null
        result = null
        thisArg = null
        timeoutDeferred = null
        trailing = true

        delayed = ->
            inited = timeoutDeferred = null
            result = func.apply(thisArg, args) if trailing
        if options is true
            leading = true
            trailing = false
        else if options and angular.isObject(options)
            leading = options.leading
            trailing = (if "trailing" of options then options.trailing else trailing)
        return () ->
            args = arguments
            thisArg = this
            $timeout.cancel timeoutDeferred
            if not inited and leading
                inited = true
                result = func.apply(thisArg, args)
            else
                timeoutDeferred = $timeout(delayed, wait)
            result

korpApp.factory 'backend', ($http, $q, utils) ->
    requestCompare : (cmpObj1, cmpObj2, reduce) ->
        reduce = reduce.replace(/^_\./, "")
        
        # remove all corpora which do not include the "reduce"-attribute
        filterFun = (item) -> settings.corpusListing.corpusHasAttr item, reduce
        corpora1 = _.filter cmpObj1.corpora, filterFun
        corpora2 = _.filter cmpObj2.corpora, filterFun
         
        corpusListing = settings.corpusListing.subsetFactory cmpObj1.corpora
        
        def = $q.defer()
        params =
            command : "loglike"
            groupby : reduce
            set1_corpus : corpora1.join(",").toUpperCase()
            set1_cqp : cmpObj1.cqp
            set2_corpus : corpora2.join(",").toUpperCase()
            set2_cqp : cmpObj2.cqp
            max : 50

        conf =
            url : settings.cgi_script
            params : params
            method : "GET"
            headers : {}


        _.extend conf.headers, model.getAuthorizationHeader()


        xhr = $http(conf)

        xhr.success (data) ->
            def.resolve [data, cmpObj1, cmpObj2, reduce], xhr



        return def.promise

    relatedWordSearch : (lemgram) ->
        def = $q.defer()
        # http://spraakbanken.gu.se/ws/karp-sok?cql=lemgram==/pivot/saldo%20g%C3%A5..vb.1&resource=swefn&mini-entries=true&info=lu​
        req = $http(
            url : "http://spraakbanken.gu.se/ws/karp-sok"
            method: "GET"
            params :
                cql : "lemgram==/pivot/saldo " + lemgram
                # sense : lemma
                resource : "swefn"
                "mini-entries" : true
                info : "lu"
                format : "json"
        ).success (data) ->
            # c.log "relatedWordSearch", data.div[0].e.info.info.feat

            if angular.isArray data.div
                eNodes = data.div[0].e
            else
                eNodes = data.div.e
            unless angular.isArray eNodes then eNodes = [eNodes]
            output = for e in eNodes
                {
                    label : e.s.replace("swefn--", "")
                    words : _.pluck e.info.info.feat, "val"
                }

            def.resolve output

        return def.promise

korpApp.factory 'nameEntitySearch', ($rootScope, $q) ->

    class NameEntities
        constructor: () ->

        request: (cqp) ->
            @def = $q.defer()
            @promise = @def.promise
            @proxy = new model.NameProxy()
            $rootScope.$broadcast 'map_data_available', cqp, settings.corpusListing.stringifySelected(true)
            @proxy.makeRequest(cqp, @progressCallback).then (data) =>
                @def.resolve data

        progressCallback: (progress) ->
            $rootScope.$broadcast 'map_progress', progress

    return new NameEntities()

korpApp.factory 'searches', (utils, $location, $rootScope, $http, $q, nameEntitySearch) ->

    class Searches
        constructor : () ->
            @activeSearch = null
            def = $q.defer()
            timedef = $q.defer()
            @infoDef = def.promise
            @timeDef = timedef.promise

            # is resolved when parallel search controller is loaded
            @langDef = $q.defer()
            # @modeDef = @getMode()
            # @modeDef.then () =>
            @getInfoData().then () ->
                def.resolve()
                initTimeGraph(timedef)

        kwicRequest : (cqp, isPaging) ->

            c.log "kwicRequest", cqp
            kwicResults.makeRequest(cqp, isPaging)


        kwicSearch : (cqp, isPaging) ->
            # simpleSearch.resetView()
            # kwicResults.@
            @kwicRequest cqp, isPaging
            statsResults.makeRequest cqp
            @nameEntitySearch cqp


        lemgramSearch : (lemgram, searchPrefix, searchSuffix, isPaging) ->
            #TODO: this is dumb, move the cqp calculations elsewhere
            cqp = new model.LemgramProxy().lemgramSearch(lemgram, searchPrefix, searchSuffix)
            statsResults.makeRequest cqp
            @kwicRequest cqp, isPaging
            @nameEntitySearch cqp

            if settings.wordpicture == false then return

            # lemgramResults.showPreloader()
            lemgramResults.makeRequest(lemgram, "lemgram")
            # def = lemgramProxy.makeRequest(lemgram, "lemgram", $.proxy(lemgramResults.onProgress, lemgramResults))
            # c.log "def", def
            # def.fail (jqXHR, status, errorThrown) ->
            #     c.log "def fail", status
            #     if status == "abort"
            #         safeApply lemgramResults.s, () =>
            #             lemgramResults.hidePreloader()

        nameEntitySearch : (cqp) ->
            if $location.search().show_map?
                nameEntitySearch.request cqp

        getMode : () ->
            def = $q.defer()
            mode = $.deparam.querystring().mode
            if mode? and mode isnt "default"
                $.getScript("modes/#{mode}_mode.js").done(->
                    $rootScope.$apply () ->
                        def.resolve()

                ).fail (args, msg, e) ->
                    $rootScope.$apply () ->
                        def.reject()
            else
                def.resolve()

            return def.promise

        getInfoData : () ->
            def = $q.defer()
            $http(
                method : "GET"
                url : settings.cgi_script
                params:
                    command : "info"
                    corpus : _(settings.corpusListing.corpora).pluck("id").invoke("toUpperCase").join ","
            ).success (data) ->
                c.log "data", data
                for corpus in settings.corpusListing.corpora
                    corpus["info"] = data["corpora"][corpus.id.toUpperCase()]["info"]

                c.log "loadCorpora"
                util.loadCorpora()
                def.resolve()

            return def.promise




    searches = new Searches()
    # infoDef = searches.getInfoData()


    oldValues = []
    $rootScope.$watchGroup [(() -> $location.search().search), "_loc.search().page"], (newValues) =>
        c.log "searches service watch", $location.search().search

        searchExpr = $location.search().search
        unless searchExpr then return
        [type, value...] = searchExpr?.split("|")
        value = value.join("|")
        # page = $location.search().page or 0

        newValues[1] = Number(newValues[1]) or 0
        oldValues[1] = Number(oldValues[1]) or 0
        c.log "newValues", newValues
        c.log "oldValues", oldValues

        # weird workaround for bug that makes oldValues[0] undefined sometimes
        # if not oldValues[0]?
        #     oldValues[0] = newValues[0]

        if _.isEqual newValues, oldValues
            pageChanged = false
            searchChanged = true
        else
            pageChanged = newValues[1] != oldValues[1]
            searchChanged = newValues[0] != oldValues[0]

        pageOnly = pageChanged and not searchChanged

        view.updateSearchHistory value, $location.absUrl()
        # $.when(chained).then () ->
            # $rootScope.$apply () ->
        $q.all([searches.infoDef, searches.langDef.promise]).then () ->
            switch type
                when "word"
                    searches.activeSearch =
                        type : type
                        val : value
                        page: newValues[1]
                        pageOnly: pageOnly

                when "lemgram"
                    searches.activeSearch =
                        type : type
                        val : value
                        page: newValues[1]
                        pageOnly: pageOnly


                    # $.sm.send "submit.lemgram", data
                when "saldo"
                    extendedSearch.setOneToken "saldo", value
                    # $.sm.send "submit.cqp", data
                when "cqp"
                    # advancedSearch.setCQP value
                    # if not value then value = CQP.expandOperators $location.search().cqp
                    if not value then value = $location.search().cqp
                    # c.log "cqp search", value, $location.search().cqp
                    searches.activeSearch =
                        type : type
                        val : value
                        page: newValues[1]
                        pageOnly: pageOnly


                    searches.kwicSearch value, pageOnly
            oldValues = [].concat newValues


    return searches


korpApp.service "compareSearches",
    class CompareSearches
        constructor : () ->
            if currentMode != "default"
                @key = 'saved_searches_' + currentMode
            else
                @key = "saved_searches"
            c.log "key", @key
            @savedSearches = ($.jStorage.get @key) or []

        saveSearch : (searchObj) ->
            @savedSearches.push searchObj
            $.jStorage.set @key, @savedSearches

        flush: () ->
            @savedSearches[..] = []
            $.jStorage.set @key, @savedSearches


korpApp.factory "lexicons", ($q, $http) ->
    getLemgrams: (wf, resources, corporaIDs, restrictToSingleWords) ->
        deferred = $q.defer()
        swforms = if restrictToSingleWords then "true" else "false"
        args =
            "cql" : "wf==" + wf
            "resurs" : resources
            "lemgram-ac" : "true"
            "format" : "json"
            "sw-forms" : swforms
            "sms-forms" : "false"
        $http(
                method: 'GET'
                url: "http://spraakbanken.gu.se/ws/karp-sok"
                params : args
            ).success((data, status, headers, config) =>
                if data is null
                    deferred.resolve []
                else
                    unless angular.isArray(data) then data = [data]
                    karpLemgrams = data
                    korpargs =
                        "command" : "lemgram_count"
                        "lemgram" : data
                        "count" : "lemgram"
                        "corpus" : corporaIDs
                    $http(
                        method: 'POST'
                        url: settings.cgi_script
                        params : korpargs
                    ).success((data, status, headers, config) =>
                        delete data.time
                        allLemgrams = []
                        for lemgram, count of data
                            allLemgrams.push {"lemgram" : lemgram, "count" : count}
                        for klemgram in karpLemgrams
                            unless data[klemgram]
                                allLemgrams.push {"lemgram" : klemgram, "count" : 0}
                        deferred.resolve allLemgrams
                    ).error (data, status, headers, config) ->
                        deferred.resolve []
            ).error (data, status, headers, config) ->
                deferred.resolve []
        return deferred.promise
    getSenses: (wf) ->
        deferred = $q.defer()
        args =
            "cql" : "wf==" + wf
            "resurs" : "saldom"
            "lemgram-ac" : "true"
            "format" : "json"
            "sw-forms" : "false"
            "sms-forms" : "false"
        $http(
            method: 'GET'
            url: "http://spraakbanken.gu.se/ws/karp-sok"
            params : args
        ).success((data, status, headers, config) =>
            if data is null
                deferred.resolve []
            else
                unless angular.isArray(data) then data = [data]
                senseargs =
                    "cql" : "lemgram == " + data.join(" or lemgram == ")
                    "resurs" : "saldo"
                    "format" : "json"
                    "mini-entries" : "true"
                    "info" : "primary"
                $http(
                    method: 'POST'
                    url: "http://spraakbanken.gu.se/ws/karp-sok"
                    params : senseargs
                ).success((data, status, headers, config) ->
                    console.log "sense data", data
                    unless data?.div?.e
                        deferred.resolve []
                        return null
                    unless $.isArray(data?.div.e) then data.div.e = [data.div.e]
                    senses = _.map data.div.e, (obj) ->
                        {
                            "sense" : obj.s,
                            "desc" : obj.info?.info?.SenseRelation?.targets
                        }
                    console.log "OUTSENSES", senses
                    deferred.resolve senses
                ).error (data, status, headers, config) ->
                    deferred.resolve []
        ).error (data, status, headers, config) ->
            deferred.resolve []
        return deferred.promise