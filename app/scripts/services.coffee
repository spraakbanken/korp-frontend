korpApp = angular.module("korpApp")
korpApp.factory "utils", ($location) ->
    valfilter : (attrobj) ->
        return if attrobj.isStructAttr then "_." + attrobj.value else attrobj.value
    getAttributeGroups : (corpusListing) ->
        word =
            group : "word"
            value : "word"
            label : "word"
        
        attrs = for key, obj of corpusListing.getCurrentAttributes() when obj.displayType != "hidden"
            _.extend({group : "word_attr", value : key}, obj)

        common_keys = _.compact _.flatten _.map corpusListing.selected, (corp) -> _.keys corp.common_attributes
        common = _.pick settings.common_struct_types, common_keys...

        sent_attrs = for key, obj of (_.extend {}, common, corpusListing.getStructAttrs()) when obj.displayType != "hidden"
            _.extend({group : "sentence_attr", value : key}, obj)

        sent_attrs = _.sortBy sent_attrs, (item) ->
            util.getLocaleString(item.label)

        return [word].concat(attrs, sent_attrs)
        

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
                # obj.post_change?(val)
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



korpApp.factory 'backend', ($http, $q, utils) ->
    requestCompare : (cmpObj1, cmpObj2, reduce) ->
        def = $q.defer()
        # c.log "reduce", reduce, reduce.replace(/^_\./, "")
        params = 
            command : "loglike"
            groupby : reduce.replace(/^_\./, "")
            set1_corpus : cmpObj1.corpora.join(",").toUpperCase()
            set1_cqp : cmpObj1.cqp
            set2_corpus : cmpObj2.corpora.join(",").toUpperCase()
            set2_cqp : cmpObj2.cqp
            max : 50

        conf = 
            url : settings.cgi_script
            params : params
            method : "GET"
        xhr = $http(conf)

        xhr.success (data) ->
            def.resolve [data, cmpObj1, cmpObj2, reduce], xhr



        return def.promise

    # requestGraph : () ->
        # def = $q.defer()

        # new GraphProxy().makeRequest(cqp, subcqps, corpora)



korpApp.factory 'searches', (utils, $location, $rootScope, $http, $q) ->

    class Searches
        constructor : () ->
            @activeSearch = null
            def = $q.defer()
            timedef = $q.defer()
            @infoDef = def.promise
            @timeDef = timedef.promise
            # @modeDef = @getMode()
            # @modeDef.then () =>
            @getInfoData().then () ->
                def.resolve()
                initTimeGraph(timedef)


            



        kwicRequest : (cqp, page) ->
            kwicResults.showPreloader()
            # kwicResults.s.$parent.loading = true
            isReading = search().reading
            
            c.log "kwicRequest", page, cqp
            kwicResults.makeRequest(page, cqp)

            return

            #var kwicCallback = isReading ? kwicResults.renderContextResult : kwicResults.renderKwicResult;
            kwicCallback = kwicResults.renderResult
            getSortParams = () -> 
                sort = search().sort
                if sort == "random"
                    if search().random_seed
                        rnd = search().random_seed
                    else
                        rnd = Math.ceil(Math.random() * 10000000)
                        search random_seed: rnd

                    return {
                        sort : sort
                        random_seed : rnd
                    }
                return {sort : sort}


            kwicopts = {
                ajaxParams : getSortParams()
            }
            
            kwicopts.ajaxParams.context = settings.corpusListing.getContextQueryString() if isReading or currentMode is "parallel"
            kwicopts.ajaxParams.cqp = cqp if cqp

            kwicProxy.makeRequest kwicopts, page, $.proxy(kwicResults.onProgress, kwicResults), null, $.proxy(kwicCallback, kwicResults)
        
        kwicSearch : (cqp, page) ->
            # simpleSearch.resetView()
            @kwicRequest cqp, page
            statsProxy?.makeRequest cqp, $.proxy(statsResults.onProgress, statsResults)

        lemgramSearch : (lemgram, searchPrefix, searchSuffix, page) ->
            cqp = new model.LemgramProxy().lemgramSearch(lemgram, searchPrefix, searchSuffix)
            statsProxy?.makeRequest cqp, $.proxy(statsResults.onProgress, statsResults)
            @kwicRequest cqp, page
            
            if settings.wordpicture == false then return
            
            searchProxy.relatedWordSearch lemgram
            c.log "lemgramSearch", lemgram
            lemgramResults.showPreloader()
            
            #simpleSearch
            #.clear();
            #.setPlaceholder(util.lemgramToString(lemgram).replace(/<.*?>/g, ""), lemgram)
            type = lemgramProxy.makeRequest(lemgram, "lemgram", $.proxy(lemgramResults.onProgress, lemgramResults))
            # cqp = lemgramProxy.lemgramSearch(lemgram, searchPrefix, searchSuffix)
            
            #kwicProxy.makeRequest({cqp : cqp, "sort" : $.bbq.getState("sort")}, page, $.proxy(kwicResults.onProgress, kwicResults));
            # $("#cqp_string").val cqp

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



    $rootScope.$watch "_loc.search().search", () =>
        c.log "watch", $location.search().search
        searchExpr = $location.search().search
        unless searchExpr then return
        [type, value] = searchExpr?.split("|")
        page = $rootScope.search()["page"] or 0
        c.log "page", page

        view.updateSearchHistory value
        # $.when(chained).then () ->
            # $rootScope.$apply () ->
        searches.infoDef.then () ->
            switch type
                when "word"
                    searches.activeSearch = 
                        type : type
                        val : value

                when "lemgram"
                    searches.activeSearch = 
                        type : type
                        val : value

                    
                    # $.sm.send "submit.lemgram", data
                when "saldo"
                    extendedSearch.setOneToken "saldo", value
                    # $.sm.send "submit.cqp", data
                when "cqp"
                    # advancedSearch.setCQP value
                    c.log "cqp search", value
                    if not value then value = CQP.expandOperators $location.search().cqp
                    searches.activeSearch = 
                        type : type
                        val : value


                    searches.kwicSearch value, page



    return searches


korpApp.service "compareSearches",
    class CompareSearches
        constructor : () ->
            if currentMode != "default"
                @key = 'saved_searches_' + currentMode
            else 
                @key = "saved_searches"
            @savedSearches = ($.jStorage.get @key) or []

        saveSearch : (searchObj) ->
            @savedSearches.push searchObj
            $.jStorage.set @key, @savedSearches

        flush: () ->
            @savedSearches[..] = []
            $.jStorage.set @key, @savedSearches


