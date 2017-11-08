korpApp = angular.module("korpApp")
korpApp.factory "utils", ($location) ->
    valfilter : (attrobj) ->
        return if attrobj.isStructAttr then "_." + attrobj.value else attrobj.value

    setupHash : (scope, config) ->

        onWatch = () ->
            for obj in config
                val = $location.search()[obj.key]
                unless val
                    if obj.default? then val = obj.default else continue


                val = (obj.val_in or _.identity)(val)

                if "scope_name" of obj
                    scope[obj.scope_name] = val
                else if "scope_func" of obj
                    scope[obj.scope_func](val)
                else
                    scope[obj.key] = val

        onWatch()
        scope.$watch ( () -> $location.search() ), ->
            onWatch()

        for obj in config
            watch = obj.expr or obj.scope_name or obj.key
            scope.$watch watch, do (obj, watch) ->
                (val) ->
                    val = (obj.val_out or _.identity)(val)
                    if val == obj.default then val = null
                    $location.search obj.key, val or null
                    if obj.key == "page" then c.log "post change", watch, val
                    obj.post_change?(val)


korpApp.factory 'backend', ($http, $q, utils, lexicons) ->
    requestCompare : (cmpObj1, cmpObj2, reduce) ->
        reduce = _.map reduce, (item) -> item.replace(/^_\./, "")
        
        # remove all corpora which do not include all the "reduce"-attributes
        filterFun = (item) -> settings.corpusListing.corpusHasAttrs item, reduce
        corpora1 = _.filter cmpObj1.corpora, filterFun
        corpora2 = _.filter cmpObj2.corpora, filterFun
         
        corpusListing = settings.corpusListing.subsetFactory cmpObj1.corpora

        split = _.filter(reduce, (r) -> 
            settings.corpusListing.getCurrentAttributes()[r]?.type == "set").join(',')

        rankedReduce = _.filter reduce, (item) ->
            settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[item]?.ranked
        top = _.map(rankedReduce, (item) ->
            return item + ":1").join ','

        def = $q.defer()
        params =
            groupby : reduce.join ','
            set1_corpus : corpora1.join(",").toUpperCase()
            set1_cqp : cmpObj1.cqp
            set2_corpus : corpora2.join(",").toUpperCase()
            set2_cqp : cmpObj2.cqp
            max : 50
            split : split
            top : top

        conf =
            url : settings.korpBackendURL + "/loglike"
            params : params
            method : "GET"
            headers : {}


        _.extend conf.headers, model.getAuthorizationHeader()


        xhr = $http(conf)

        xhr.then (response) ->
            data = response.data

            if data.ERROR
                def.reject()
                return

            loglikeValues = data.loglike

            objs = _.map loglikeValues, (value, key) ->
                return {
                    value: key
                    loglike: value
                }
            
            tables = _.groupBy objs, (obj) ->
                if obj.loglike > 0
                    obj.abs = data.set2[obj.value] 
                    return "positive" 
                else 
                    obj.abs = data.set1[obj.value]
                    return "negative"

            groupAndSum = (table, currentMax) ->
                groups = _.groupBy table, (obj) ->
                    obj.value.replace(/(:.+?)(\/|$| )/g, "$2")

                res = _.map groups, (value, key) ->
                    tokenLists = _.map key.split("/"), (tokens) ->
                        return tokens.split(" ")

                    loglike = 0
                    abs = 0
                    cqp = []
                    elems = []
                    
                    _.map value, (val) ->
                        abs += val.abs
                        loglike += val.loglike
                        elems.push val.value
                    if Math.abs(loglike) > currentMax
                        currentMax = Math.abs loglike
                    { key: key, loglike : loglike, abs : abs, elems : elems, tokenLists: tokenLists }

                return [res, currentMax]

            [tables.positive, max] = groupAndSum tables.positive, 0
            [tables.negative, max] = groupAndSum tables.negative, max

            def.resolve [tables, max, cmpObj1, cmpObj2, reduce], xhr

        return def.promise

    relatedWordSearch : (lemgram) ->
        return lexicons.relatedWordSearch(lemgram)

    requestMapData: (cqp, cqpExprs, within, attribute) ->
        cqpSubExprs = {}
        _.map _.keys(cqpExprs), (subCqp, idx) ->
            cqpSubExprs["subcqp" + idx] = subCqp

        def = $q.defer()
        params =
            groupby: attribute.label
            cqp: cqp
            corpus: attribute.corpora.join(",")
            incremental: true
            split: attribute.label
        _.extend params, settings.corpusListing.getWithinParameters()

        _.extend params, cqpSubExprs

        conf =
            url : settings.korpBackendURL + "/count"
            params : params
            method : "GET"
            headers : {}

        _.extend conf.headers, model.getAuthorizationHeader()


        xhr = $http(conf)

        xhr.then (response) ->
            data = response.data
            createResult = (subResult, cqp, label) ->
                points = []
                _.map _.keys(subResult.absolute), (hit) ->
                    if (hit.startsWith "|") or (hit.startsWith " ")
                        return
                    [name, countryCode, lat, lng] = hit.split ";"

                    points.push (
                        abs: subResult.absolute[hit]
                        rel: subResult.relative[hit]
                        name: name
                        countryCode: countryCode
                        lat : parseFloat lat
                        lng : parseFloat lng)
                    
                return (
                    label: label
                    cqp: cqp
                    points: points
                )

            if _.isEmpty cqpExprs
                result = [createResult data.total, cqp, "Σ"]
            else
                result = []
                for subResult in data.total.slice(1, data.total.length)
                    result.push createResult subResult, subResult.cqp, cqpExprs[subResult.cqp]

            if data.ERROR
                def.reject()
                return

            def.resolve [{corpora: attribute.corpora, cqp: cqp, within: within, data: result, attribute: attribute}], xhr

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
            @getInfoData().then () ->
                def.resolve()
                initTimeGraph(timedef)

        kwicSearch : (cqp, isPaging) ->
            kwicResults.makeRequest cqp, isPaging
            if not isPaging
                statsResults.makeRequest cqp
                @nameEntitySearch cqp

        lemgramSearch : (word, type) ->
            if settings.wordpicture == false then return
            lemgramResults.makeRequest(word, type)

        nameEntitySearch : (cqp) ->
            if $location.search().show_map?
                nameEntitySearch.request cqp

        getInfoData : () ->
            def = $q.defer()
            $http(
                method : "GET"
                url : settings.korpBackendURL + "/info"
                params:
                    corpus : _(settings.corpusListing.corpora).pluck("id").invoke("toUpperCase").join ","
            ).then (response) ->
                data = response.data
                for corpus in settings.corpusListing.corpora
                    corpus["info"] = data["corpora"][corpus.id.toUpperCase()]["info"]
                    privateStructAttrs = []
                    for attr in data["corpora"][corpus.id.toUpperCase()].attrs.s
                        if attr.indexOf("__") isnt -1
                            privateStructAttrs.push attr
                    corpus["private_struct_attributes"] = privateStructAttrs
                util.loadCorpora()
                def.resolve()

            return def.promise




    searches = new Searches()
    
    searches.getCqpExpr = () ->
        search = searches.activeSearch
        cqpExpr = null
        if search
            if search.type == "word" or search.type == "lemgram"
                cqpExpr = $rootScope.simpleCQP
            else
                cqpExpr = search.val
        return cqpExpr
    
    oldValues = []
    $rootScope.$watchGroup [(() -> $location.search().search), "_loc.search().page"], (newValues) =>
        c.log "searches service watch", $location.search().search

        searchExpr = $location.search().search
        unless searchExpr then return
        [type, value...] = searchExpr?.split("|")
        value = value.join("|")

        newValues[1] = Number(newValues[1]) or 0
        oldValues[1] = Number(oldValues[1]) or 0

        if _.isEqual newValues, oldValues
            pageChanged = false
            searchChanged = true
        else
            pageChanged = newValues[1] != oldValues[1]
            searchChanged = newValues[0] != oldValues[0]

        pageOnly = pageChanged and not searchChanged

        if value
            if type == "lemgram"
                historyValue = unregescape value
            else
                historyValue = value
            view.updateSearchHistory historyValue, $location.absUrl()
        $q.all([searches.infoDef, searches.langDef.promise, $rootScope.globalFilterDef.promise]).then () ->
            extendedSearch = false
            if type == "cqp"
                extendedSearch = true
                if not value then value = $location.search().cqp
            if type in ["cqp", "word", "lemgram"]
                searches.activeSearch =
                    type : type
                    val : value
                    page: newValues[1]
                    pageOnly: pageOnly
            else if type == "saldo"
                extendedSearch.setOneToken "saldo", value

            if type == "cqp"
                if extendedSearch and $rootScope.globalFilter
                    value = CQP.stringify (CQP.mergeCqpExprs (CQP.parse(value or "[]")), $rootScope.globalFilter)
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

        saveSearch : (name, cqp) ->
            searchObj =
                label : name or cqp
                cqp : cqp
                corpora : settings.corpusListing.getSelectedCorpora()
            @savedSearches.push searchObj
            $.jStorage.set @key, @savedSearches

        flush: () ->
            @savedSearches[..] = []
            $.jStorage.set @key, @savedSearches


korpApp.factory "lexicons", ($q, $http) ->
    karpURL = "https://ws.spraakbanken.gu.se/ws/karp/v4"
    getLemgrams: (wf, resources, corporaIDs) ->
        deferred = $q.defer()

        args =
            "q" : wf
            "resource" : if $.isArray(resources) then resources.join(",") else resources
            "mode": "external"

        $http(
            method : "GET"
            url : "#{karpURL}/autocomplete"
            params : args
        ).then((response) ->
            data = response.data
            if data is null
                deferred.resolve []
            else
                # Pick the lemgrams. Would be nice if this was done by the backend instead.
                karpLemgrams = _.map data.hits.hits, (entry) -> entry._source.FormRepresentations[0].lemgram

                if karpLemgrams.length is 0
                    deferred.resolve []
                    return

                lemgram = karpLemgrams.join(",")
                corpora = corporaIDs.join(",")
                headers = model.getAuthorizationHeader()
                headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"
                $http(
                    method: 'POST'
                    url: settings.korpBackendURL + "/lemgram_count"
                    data : "lemgram=#{lemgram}&count=lemgram&corpus=#{corpora}"
                    headers : headers
                ).then (response) =>
                    data = response.data
                    delete data.time
                    allLemgrams = []
                    for lemgram, count of data
                        allLemgrams.push {"lemgram" : lemgram, "count" : count}
                    for klemgram in karpLemgrams
                        unless data[klemgram]
                            allLemgrams.push {"lemgram" : klemgram, "count" : 0}
                    deferred.resolve allLemgrams
        ).catch (response) ->
            deferred.resolve []
        return deferred.promise

    getSenses: (wf) ->
        deferred = $q.defer()

        args =
            "q" : wf
            "resource" : "saldom"
            "mode": "external"

        $http(
            method: 'GET'
            url: "#{karpURL}/autocomplete"
            params : args
        ).then((response) =>
            data = response.data
            if data is null
                deferred.resolve []
            else
                karpLemgrams = _.map data.hits.hits, (entry) -> entry._source.FormRepresentations[0].lemgram
                if karpLemgrams.length is 0
                    deferred.resolve []
                    return

                karpLemgrams = karpLemgrams.slice 0, 100

                senseargs =
                    "q" : "extended||and|lemgram|equals|#{karpLemgrams.join('|')}"
                    "resource" : "saldo"
                    "show" : "sense,primary"
                    "size" : 500

                $http(
                    method: 'GET'
                    url: "#{karpURL}/minientry"
                    params : senseargs
                ).then((response) ->
                    data = response.data
                    if data.hits.total is 0
                        deferred.resolve []
                        return
                    senses = _.map data.hits.hits, (entry) ->
                        {
                            "sense" : entry._source.Sense[0].senseid,
                            "desc" : entry._source.Sense[0].SenseRelations?.primary
                        }
                    deferred.resolve senses
                ).catch (response) ->
                    deferred.resolve []
        ).catch (response) ->
            deferred.resolve []
        return deferred.promise

    relatedWordSearch : (lemgram) ->
        def = $q.defer()
        req = $http(
            url : "#{karpURL}/minientry"
            method : "GET"
            params :
                q : "extended||and|lemgram|equals|#{lemgram}"
                show : "sense"
                resource : "saldo"
        ).then (response) ->
            data = response.data
            if data.hits.total is 0
                def.resolve []
                return
            else
                senses = _.map data.hits.hits, (entry) -> entry._source.Sense[0].senseid

                http = $http(
                    url : "#{karpURL}/minientry"
                    method : "GET"
                    params :
                        q : "extended||and|LU|equals|#{senses.join('|')}"
                        show : "LU,sense"
                        resource : "swefn"
                ).then (response) ->
                    data = response.data
                    if data.hits.total is 0
                        def.resolve []
                        return
                    else
                        eNodes = _.map data.hits.hits, (entry) ->
                            {
                                "label" : entry._source.Sense[0].senseid.replace("swefn--", "")
                                "words" : entry._source.Sense[0].LU
                            }

                        def.resolve eNodes

        return def.promise
