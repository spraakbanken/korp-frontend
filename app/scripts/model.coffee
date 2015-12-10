"use strict"
window.model = {}

model.getAuthorizationHeader = () ->
    if typeof authenticationProxy isnt "undefined" and not $.isEmptyObject(authenticationProxy.loginObj)
        "Authorization" : "Basic " + authenticationProxy.loginObj.auth
    else
        {}


class BaseProxy
    constructor: ->

        # progress
        @prev = ""
        @progress = 0
        @total
        @total_results = 0
        @pendingRequests = []

    expandCQP : (cqp) ->
        try
            return CQP.expandOperators cqp
        catch e
            c.warn "CQP expansion failed", cqp
            return cqp

    makeRequest: ->
        @abort()
        @prev = ""
        @progress = 0
        @total_results = 0
        @total = null

    abort: ->
        _.invoke @pendingRequests, "abort" if @pendingRequests.length
        # @pendingRequests = []

    hasPending : () ->
        _.any _.map @pendingRequests, (req) -> req.readyState != 4 and req.readyState != 0

    parseJSON: (data) ->
        try

            # var prefix = data[0] == "{" ? "" : "{";
            # var suffix = data.slice(-1) == "}" ? "" : "}";
            # var json = prefix + data.slice(0,-2) + suffix;
            json = data
            # json = "{" + json.slice(0, -1) + "}" if json.slice(-1) is ","
            if json[0] != "{" then json = "{" + json
            if json.match(/,\s*$/)
                json = json.replace(/,\s*$/, "") + "}"


            # c.log('json after', json)
            out = JSON.parse(json)
            # c.log "json parsing success!", json
            return out
        catch e

                    # c.log("trying data", data);
            return JSON.parse(data)

    addAuthorizationHeader: (req) ->
        pairs = _.pairs model.getAuthorizationHeader()
        if pairs.length
            req.setRequestHeader pairs[0]...

    calcProgress: (e) ->
        newText = e.target.responseText.slice(@prev.length)
        # c.log "newText", newText
        struct = {}
        try
            struct = @parseJSON(newText)
        # c.log("json parse failed in ", newText);
        $.each struct, (key, val) =>
            if key isnt "progress_corpora" and key.split("_")[0] is "progress"
                currentCorpus = val.corpus or val
                sum = _(currentCorpus.split("|")).map((corpus) ->
                    Number settings.corpora[corpus.toLowerCase()].info.Size
                ).reduce((a, b) ->
                    a + b
                , 0)
                @progress += sum
                @total_results += parseInt(val.hits)

        stats = (@progress / @total) * 100
        if not @total? and struct.progress_corpora?.length
            @total = $.reduce($.map(struct["progress_corpora"], (corpus) ->
                return if not corpus.length 
                _(corpus.split("|")).map((corpus) ->
                    parseInt settings.corpora[corpus.toLowerCase()].info.Size
                ).reduce((a, b) ->
                    a + b
                , 0)
            ), (val1, val2) ->
                val1 + val2
            , 0)
        @prev = e.target.responseText
        struct: struct
        stats: stats
        total_results: @total_results


class model.KWICProxy extends BaseProxy
    constructor: ->
        super()
        @prevRequest = null
        @queryData = null
        @prevAjaxParams = null
        @foundKwic = false


    popXhr: (xhr) ->
        i = $.inArray(@pendingRequests, xhr)
        @pendingRequests.pop i unless i is -1

    makeRequest: (options, page, progressCallback, kwicCallback) ->
        c.log "kwicproxy.makeRequest", options, page, kwicResults.getPageInterval(Number(page))
        self = this
        @foundKwic = false
        super()
        kwicCallback = kwicCallback or $.proxy(kwicResults.renderResult, kwicResults)
        self.progress = 0
        

        o = $.extend(
            queryData: null

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?

                progressCallback progressObj
                if progressObj["struct"].kwic
                    c.log "found kwic!"
                    @foundKwic = true
                    kwicCallback progressObj["struct"]
        , options)
        
        _.extend options.ajaxParams, settings.corpusListing.getWithinParameters()

        data =
            command: "query"
            defaultcontext: settings.defaultOverviewContext
            show: []
            show_struct: []
            cache : true

        $.extend data, kwicResults.getPageInterval(page), o.ajaxParams
        for corpus in settings.corpusListing.selected
            for key, val of corpus.within
                data.show.push _.last key.split(" ")
            for key, val of corpus.attributes
                data.show.push key


            if corpus.struct_attributes?
                $.each corpus.struct_attributes, (key, val) ->
                    data.show_struct.push key if $.inArray(key, data.show_struct) is -1

        if data.cqp
            data.cqp = @expandCQP(data.cqp)
        @prevCQP = data.cqp
        data.show = (_.uniq ["sentence"].concat(data.show)).join(",")
        c.log "data.show", data.show
        data.show_struct = (_.uniq data.show_struct).join(",")
        @prevRequest = data
        @prevMisc = {"hitsPerPage" : $("#num_hits").val()}
        @prevParams = data
        def = $.ajax(
            url: settings.cgi_script
            data: data
            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req
                self.prevUrl = this.url

            success: (data, status, jqxhr) ->
                c.log "jqxhr", this
                self.queryData = data.querydata
                kwicCallback data if data.incremental is false or not @foundKwic




            # error: o.error
            progress: o.progress
        )
        @pendingRequests.push def
        return def

class model.LemgramProxy extends BaseProxy
    constructor: ->
        super()
        # @pendingRequest = abort: $.noop

    makeRequest: (word, type, callback) ->
        super()
        self = this
        params =
            command: "relations"
            word: word
            corpus: settings.corpusListing.stringifySelected()
            incremental: $.support.ajaxProgress
            type: type
            cache : true
        @prevParams = params
        def =  $.ajax
            url: settings.cgi_script
            data: params
            # beforeSend: (jqXHR, settings) ->
            #   c.log "before relations send", settings
            #   # self.prevRequest = settings

            # error: (data, status) ->
            #     c.log "relationsearch abort", arguments
            #     if status == "abort"
                    
            #     else
            #         lemgramResults.resultError()
                    

            success: (data) ->
                c.log "relations success", data
                self.prevRequest = params
                # lemgramResults.renderResult data, word

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?
                callback progressObj

            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req
                self.prevUrl = this.url
        @pendingRequests.push def
        return def



    karpSearch: (word, sw_forms) ->
        deferred = $.Deferred((dfd) =>
            @pendingRequests.push $.ajax(
                url: "http://spraakbanken.gu.se/ws/karp-sok"
                data:
                    wf: word
                    resource: settings.corpusListing.getMorphology()
                    format: "json"
                    "sms-forms": false
                    "sw-forms": sw_forms

                success: (data, textStatus, xhr) ->
                    if Number(data.count) is 0
                        dfd.reject()
                        return
                    c.log "karp success", data, sw_forms
                    
                    div = (if $.isPlainObject(data.div) then [data.div] else data.div)
                    output = $.map(div.slice(0, Number(data.count)), (item) ->
                        item = util.convertLMFFeatsToObjects(item)
                        item.LexicalEntry.Lemma.FormRepresentation.feat_lemgram
                    )
                    
                    dfd.resolve output, textStatus, xhr

                error: (jqXHR, textStatus, errorThrown) ->
                    c.log "karp error", jqXHR, textStatus, errorThrown
                    dfd.reject()
            )
        ).promise()
        deferred

    saldoSearch: (word, sw_forms) ->
        dfd = $.Deferred()
        @karpSearch(word, sw_forms).done (lemgramArray) ->
            $.ajax(
                url: "http://spraakbanken.gu.se/ws/karp-sok"
                data:
                    lemgram: lemgramArray.join("|")
                    resource: "saldo"
                    format: "json"
            ).done((data, textStatus, xhr) ->
                if data.count is 0
                    dfd.reject()
                    c.log "saldo search 0 results"
                    return
                div = (if $.isPlainObject(data.div) then [data.div] else data.div)
                
                output = $.map(div.slice(0, Number(data.count)), (item) ->
                    sense = item.LexicalEntry.Sense
                    sense = [sense] unless $.isArray(sense)
                    _.map sense, (item) ->
                        item.id

                )
                c.log "saldoSearch results", output
                dfd.resolve output, textStatus, xhr
            ).fail ->
                c.log "saldo search failed"
                dfd.reject()


        dfd

    lemgramCount: (lemgrams, findPrefix, findSuffix) ->
        self = this
        count = $.grep(["lemgram", (if findPrefix then "prefix" else ""), (if findSuffix then "suffix" else "")], Boolean)
        $.ajax
            url: settings.cgi_script
            data:
                command: "lemgram_count"
                lemgram: lemgrams
                count: count.join(",")
                corpus: settings.corpusListing.stringifySelected()

            beforeSend: (req) ->
                self.addAuthorizationHeader req

            method: "POST"
            
    lemgramSearch: (lemgram, searchPrefix, searchSuffix) ->
        return $.format("[(lex contains \"%s\")%s%s]", [lemgram, @buildAffixQuery(searchPrefix, "prefix", lemgram), @buildAffixQuery(searchSuffix, "suffix", lemgram)])
        
    buildAffixQuery: (isValid, key, value) ->
        return "" unless isValid
        $.format "| (%s contains \"%s\")", [key, value]


class model.StatsProxy extends BaseProxy
    constructor: ->
        super()
        @prevRequest = null
        @prevParams = null
        @currentPage = 0
        @page_incr = 25

    processData: (def, data, reduceVals, reduceValLabels, ignoreCase) ->
        minWidth = 100

        columns = []

        for [reduceVal, reduceValLabel] in _.zip reduceVals, reduceValLabels
            columns.push
                id: reduceVal
                name: reduceValLabel
                field: "hit_value"
                sortable: true
                formatter: settings.reduce_statistics reduceVals, ignoreCase 
                minWidth: minWidth
                cssClass: "parameter-column"
                headerCssClass: "localized-header"

        columns.push
            id: "pieChart"
            name: ""
            field: "hit_value"
            sortable: false
            formatter: settings.reduce_statistics_pie_chart
            maxWidth: 25
            minWidth: 25
            
        columns.push  
            id: "total"
            name: "stats_total"
            field: "total_value"
            sortable: true
            formatter: @valueFormatter
            minWidth : minWidth
            headerCssClass: "localized-header"
        
        $.each _.keys(data.corpora).sort(), (i, corpus) =>
            columns.push
                id: corpus
                name: settings.corpora[corpus.toLowerCase()].title
                field: corpus + "_value"
                sortable: true
                formatter: @valueFormatter
                minWidth : minWidth

        groups = _.groupBy _.keys(data.total.absolute), (item) ->
            item.replace(/:\d+/g, "")

        wordArray = _.keys groups

        sizeOfDataset = wordArray.length
        dataset = new Array(sizeOfDataset + 1)

        summarizedData = {}
        for corpus, corpusData of data.corpora
            newAbsolute = _.reduce _.keys(corpusData.absolute), ((result, key) ->
                    newKey = key.replace(/:\d+/g, "")
                    currentValue = result[newKey] or 0
                    result[newKey] = currentValue + corpusData.absolute[key]
                    return result;
                ), {}
            newRelative = _.reduce _.keys(corpusData.relative), ((result, key) ->
                    newKey = key.replace(/:\d+/g, "")
                    currentValue = result[newKey] or 0
                    result[newKey] = currentValue + corpusData.relative[key]
                    return result;
                ), {}
            summarizedData[corpus] = { absolute: newAbsolute, relative: newRelative }
        
        statsWorker = new Worker "scripts/statistics_worker.js"
        statsWorker.onmessage = (e) ->
            c.log "Called back by the worker!\n"
            c.log e
            def.resolve [data, wordArray, columns, e.data, summarizedData]

        statsWorker.postMessage {
            "total" : data.total
            "dataset" : dataset
            "allrows" : (wordArray)
            "corpora" : data.corpora
            "groups" : groups
            loc : {
                'sv' : "sv-SE"
                'en' : "gb-EN"
            }[$("body").scope().lang]
        }

    makeParameters: (reduceVals, cqp) ->
        parameters = 
            command: "count"
            groupby: reduceVals.join ','
            cqp: @expandCQP cqp
            corpus: settings.corpusListing.stringifySelected(true)
            incremental: $.support.ajaxProgress
        _.extend parameters, settings.corpusListing.getWithinParameters()
        return parameters

    makeRequest: (cqp, callback) ->
        self = this
        super()
        reduceval = search().stats_reduce or "word"
        ignoreCase = false
        if reduceval is "word_insensitive"
            ignoreCase = true
            reduceval = "word" 
        
        ## todo: now supports multipe reduce parameters to backend 
        reduceVals = reduceval.split ","
        reduceValLabels = _.map reduceVals, (reduceVal) ->
            return "word" if reduceVal == "word"
            if settings.corpusListing.getCurrentAttributes()[reduceVal]
                return settings.corpusListing.getCurrentAttributes()[reduceVal].label
            else
                return settings.corpusListing.getStructAttrs()[reduceVal].label

        data = @makeParameters(reduceVals, cqp)

        data.split = _.filter(reduceVals, (reduceVal) -> 
            settings.corpusListing.getCurrentAttributes()[reduceVal]?.type == "set").join(',')

        if ignoreCase
            $.extend data,
                ignore_case: "word"

        @prevNonExpandedCQP = cqp
        @prevParams = data
        def = $.Deferred()
        @pendingRequests.push $.ajax
            url: settings.cgi_script
            data: data
            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req
                self.prevUrl = this.url

            error: (jqXHR, textStatus, errorThrown) ->
                c.log "gettings stats error, status: " + textStatus
                def.reject(textStatus, errorThrown)

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?
                callback? progressObj

            success: (data) =>
                if data.ERROR?
                    c.log "gettings stats failed with error", data.ERROR
                    def.reject(data)
                    return
                @processData(def, data, reduceVals, reduceValLabels, ignoreCase)

        return def.promise()

    valueFormatter: (row, cell, value, columnDef, dataContext) ->
        return dataContext[columnDef.id + "_display"]

class model.NameProxy extends model.StatsProxy
    constructor: ->
        super()    
        
    makeParameters: (reduceVal, cqp) ->
        # ignore reduceVal, map only works for word
        parameters = super(["word"], cqp)
        parameters.cqp2 = "[pos='PM']"
        return parameters
    
    processData: (def, data, reduceval) ->
        def.resolve data
    

class model.AuthenticationProxy
    constructor: ->
        @loginObj = {}

    makeRequest: (usr, pass) ->
        c.log "makeRequest: (usr, pass", usr, pass
        self = this
        if window.btoa
            auth = window.btoa(usr + ":" + pass)
        else
            throw "window.btoa is undefined"
        dfd = $.Deferred()
        $.ajax(
            url: settings.cgi_script
            type: "GET"
            data:
                command: "authenticate"

            beforeSend: (req) ->
                req.setRequestHeader "Authorization", "Basic " + auth
        ).done((data, status, xhr) ->
            c.log "auth done", arguments
            unless data.corpora
                dfd.reject()
                return
            self.loginObj =
                name: usr
                credentials: data.corpora
                auth: auth

            $.jStorage.set "creds", self.loginObj
            dfd.resolve data
        ).fail (xhr, status, error) ->
            c.log "auth fail", arguments

            dfd.reject()

        dfd
    hasCred : (corpusId) ->
        unless @loginObj.credentials then return false
        corpusId.toUpperCase() in @loginObj.credentials

class model.TimeProxy extends BaseProxy
    constructor: ->


    makeRequest: () ->
        dfd = $.Deferred()


        xhr = $.ajax
            url: settings.cgi_script
            type: "GET"
            data:
                command: "timespan"
                granularity: "y"
                corpus: settings.corpusListing.stringifyAll()

        xhr.done (data, status, xhr) =>
            c.log "timespan done", data
            if data.ERROR 
                c.error "timespan error", data.ERROR
                dfd.reject(data.ERROR )
                return

            rest = data.combined[""]
            delete data.combined[""]

            @expandTimeStruct data.combined
            combined = @compilePlotArray(data.combined)
            # dfd.resolve output, rest

            if _.keys(data).length < 2 or data.ERROR
                dfd.reject()
                return
            # @corpusdata = data
            
            dfd.resolve [data.corpora, combined, rest]


        xhr.fail ->
            c.log "timeProxy.makeRequest failed", arguments
            dfd.reject()

        dfd



    compilePlotArray: (dataStruct) ->
        output = []
        $.each dataStruct, (key, val) ->
            return if not key or not val
            output.push [parseInt(key), val]

        output = output.sort((a, b) ->
            a[0] - b[0]
        )
        output

    expandTimeStruct: (struct) ->
        # c.log "struct", struct
        years = _.map(_.pairs(_.omit(struct, "")), (item) ->
            Number item[0]
        )
        unless years.length then return
        minYear = _.min years
        maxYear = _.max years

        if _.isNaN(maxYear) or _.isNaN(minYear)
            c.log "expandTimestruct broken, years:", years
            return
        # while y < maxYear
        # c.log "years", minYear, maxYear
        for y in [minYear..maxYear]
            thisVal = struct[y]
            if typeof thisVal is "undefined"
                struct[y] = prevVal
            else
                prevVal = thisVal
        # c.log "after", struct


class model.GraphProxy extends BaseProxy
    constructor: ->
        super()
        @prevParams = null

    expandSubCqps : (subArray) ->
        padding = _.map [0...subArray.length.toString().length], -> "0"
        array = for cqp, i in subArray
            p = padding[i.toString().length..].join("")
            ["subcqp#{p}#{i}", cqp]
        return _.object array

    makeRequest: (cqp, subcqps, corpora, from, to) ->
        super()
        self = this
        params =
            command : "count_time"
            cqp : @expandCQP cqp
            corpus : corpora
            granularity : @granularity
            incremental: $.support.ajaxProgress
        
        if from
            params.from = from
        if to
            params.to = to

        #TODO: fix this for struct attrs
        _.extend params, @expandSubCqps subcqps
        @prevParams = params
        def = $.Deferred()

        $.ajax
            url: settings.cgi_script
            # url : "data.json"
            dataType : "json"
            data : params

            beforeSend: (req, settings) =>
                @prevRequest = settings
                @addAuthorizationHeader req
                self.prevUrl = this.url

            progress: (data, e) =>
                progressObj = @calcProgress(e)
                return unless progressObj?
                # callback progressObj
                def.notify progressObj

            error: (jqXHR, textStatus, errorThrown) ->
                def.reject(textStatus)
            success : (data) ->
                def.resolve data
            #     [first, last] = settings.corpusListing.getTimeInterval()
            #     data

        return def.promise()
