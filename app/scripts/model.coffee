"use strict"
window.model = {}

model.getAuthorizationHeader = () ->
    if typeof authenticationProxy isnt "undefined" and not $.isEmptyObject(authenticationProxy.loginObj)
        "Authorization" : "Basic " + authenticationProxy.loginObj.auth
    else
        {}


class BaseProxy
    constructor: ->
        @prev = ""
        @progress = 0
        @total
        @total_results = 0
        @pendingRequests = []

    expandCQP : (cqp) ->
        try
            return CQP.expandOperators cqp
        catch e
            c.warn "CQP expansion failed", cqp, e
            return cqp

    makeRequest: ->
        @abort()
        @prev = ""
        @progress = 0
        @total_results = 0
        @total = null

    abort: ->
        _.invoke @pendingRequests, "abort" if @pendingRequests.length

    hasPending : () ->
        _.any _.map @pendingRequests, (req) -> req.readyState != 4 and req.readyState != 0

    parseJSON: (data) ->
        try
            json = data
            if json[0] != "{" then json = "{" + json
            if json.match(/,\s*$/)
                json = json.replace(/,\s*$/, "") + "}"
            out = JSON.parse(json)
            return out
        catch e
            return JSON.parse(data)

    addAuthorizationHeader: (req) ->
        pairs = _.pairs model.getAuthorizationHeader()
        if pairs.length
            req.setRequestHeader pairs[0]...

    calcProgress: (e) ->
        newText = e.target.responseText.slice(@prev.length)
        struct = {}
        try
            struct = @parseJSON(newText)
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
            tmp = $.map struct["progress_corpora"], (corpus) ->
                return if not corpus.length
                
                _(corpus.split("|")).map((corpus) ->
                    parseInt settings.corpora[corpus.toLowerCase()].info.Size
                ).reduce((a, b) ->
                    a + b
                , 0)
            @total = _.reduce(tmp, (val1, val2) ->
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

    makeRequest: (options, page, progressCallback, kwicCallback) ->
        c.log "kwicproxy.makeRequest", options, page, kwicResults.getPageInterval(Number(page))
        self = this
        @foundKwic = false
        super()
        kwicCallback = kwicCallback or $.proxy(kwicResults.renderResult, kwicResults)
        self.progress = 0
        progressObj = progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?

                progressCallback progressObj
                if progressObj["struct"].kwic
                    c.log "found kwic!"
                    @foundKwic = true
                    kwicCallback progressObj["struct"]

        unless options.ajaxParams.within
            _.extend options.ajaxParams, settings.corpusListing.getWithinParameters()

        data =
            command: "query"
            defaultcontext: settings.defaultOverviewContext
            show: []
            show_struct: []

        $.extend data, kwicResults.getPageInterval(page), options.ajaxParams
        for corpus in settings.corpusListing.selected
            for key, val of corpus.within
                data.show.push _.last key.split(" ")
            for key, val of corpus.attributes
                data.show.push key

            if corpus.structAttributes?
                $.each corpus.structAttributes, (key, val) ->
                    data.show_struct.push key if $.inArray(key, data.show_struct) is -1

        if data.cqp
            data.cqp = @expandCQP data.cqp
        @prevCQP = data.cqp
        data.show = (_.uniq ["sentence"].concat(data.show)).join(",")
        c.log "data.show", data.show
        data.show_struct = (_.uniq data.show_struct).join(",")

        if locationSearch()["in_order"] == false
            data.in_order = false

        @prevRequest = data
        @prevParams = data
        def = $.ajax(
            url: settings.korpBackendURL + "/" + data.command
            data: data
            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req
                self.prevUrl = this.url

            success: (data, status, jqxhr) ->
                self.queryData = data.querydata
                kwicCallback data if data.incremental is false or not @foundKwic

            progress: progressObj.progress
        )
        @pendingRequests.push def
        return def


class model.LemgramProxy extends BaseProxy
    constructor: ->
        super()

    makeRequest: (word, type, callback) ->
        super()
        self = this
        params =
            command: "relations"
            word: word
            corpus: settings.corpusListing.stringifySelected()
            incremental: true
            type: type
            max : 1000
        @prevParams = params
        def =  $.ajax
            url: settings.korpBackendURL + "/" + params.command
            data: params

            success: (data) ->
                c.log "relations success", data
                self.prevRequest = params

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


class model.StatsProxy extends BaseProxy
    constructor: ->
        super()
        @prevRequest = null
        @prevParams = null

    processData: (def, data, reduceVals, reduceValLabels, ignoreCase) ->
        minWidth = 100

        columns = []

        for [reduceVal, reduceValLabel] in _.zip reduceVals, reduceValLabels
            columns.push
                id: reduceVal
                name: reduceValLabel
                field: "hit_value"
                sortable: true
                formatter: statisticsFormatting.reduceStatistics reduceVals, ignoreCase, _.keys(data.corpora)
                minWidth: minWidth
                cssClass: "parameter-column"
                headerCssClass: "localized-header"

        columns.push
            id: "pieChart"
            name: ""
            field: "hit_value"
            sortable: false
            formatter: statisticsFormatting.reduceStatisticsPieChart
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
            item.replace(/(:.+?)(\/|$| )/g, "$2")
            fields = item.split("/")
            newFields = []
            for [reduceVal, field] in _.zip reduceVals, fields
                if reduceVal in ["saldo", "prefix", "suffix", "lex", "lemma", "sense", "text_swefn", "text_blingbring"]
                    newFields.push field.replace(/(:.+?)($| )/g, "$2")
                    
                else
                    newFields.push field
            newFields.join("/")
            return newFields

        wordArray = _.keys groups

        sizeOfDataset = wordArray.length
        dataset = new Array(sizeOfDataset + 1)

        statsWorker = new Worker "scripts/statistics_worker.js"
        statsWorker.onmessage = (e) ->
            c.log "Called back by the worker!\n"
            c.log e
            searchParams = 
                reduceVals: reduceVals
                ignoreCase: ignoreCase
                corpora: _.keys data.corpora
            def.resolve [data, wordArray, columns, e.data.dataset, e.data.summarizedData, searchParams]

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
            "attrs" : reduceVals
        }

    makeParameters: (reduceVals, cqp, ignoreCase) ->
        parameters =
            command: "count"
            groupby: reduceVals.join ','
            cqp: @expandCQP cqp
            corpus: settings.corpusListing.stringifySelected(true)
            incremental: true
        _.extend parameters, settings.corpusListing.getWithinParameters()
        if ignoreCase
            _.extend parameters, {ignore_case: "word"}
        return parameters

    makeRequest: (cqp, callback) ->
        self = this
        super()
        reduceval = locationSearch().stats_reduce or "word"
        reduceVals = reduceval.split ","

        ignoreCase = locationSearch().stats_reduce_insensitive?

        reduceValLabels = _.map reduceVals, (reduceVal) ->
            return "word" if reduceVal == "word"
            maybeReduceAttr = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[reduceVal]
            if maybeReduceAttr
                return maybeReduceAttr.label
            else
                return settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())[reduceVal].label

        data = @makeParameters(reduceVals, cqp, ignoreCase)

        wordAttrs = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())
        structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        data.split = _.filter(reduceVals, (reduceVal) ->
            return wordAttrs[reduceVal]?.type == "set" or structAttrs[reduceVal]?.type == "set").join(',')

        rankedReduceVals = _.filter reduceVals, (reduceVal) ->
            settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[reduceVal]?.ranked
        data.top = _.map(rankedReduceVals, (reduceVal) ->
            return reduceVal + ":1").join(',')

        @prevNonExpandedCQP = cqp
        @prevParams = data
        def = $.Deferred()
        @pendingRequests.push $.ajax
            url: settings.korpBackendURL + "/" + data.command
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
        parameters = super(["word"], cqp, false)
        posTags = for posTag in settings.mapPosTag
            "pos='#{posTag}'"
        parameters.cqp2  = "[" + posTags.join(" | ") + "]"
        return parameters

    processData: (def, data, reduceval) ->
        def.resolve data


class model.AuthenticationProxy
    constructor: ->
        @loginObj = {}

    makeRequest: (usr, pass, saveLogin) ->
        self = this
        if window.btoa
            auth = window.btoa(usr + ":" + pass)
        else
            throw "window.btoa is undefined"
        dfd = $.Deferred()
        $.ajax(
            url: settings.korpBackendURL + "/authenticate"
            type: "GET"
            beforeSend: (req) ->
                req.setRequestHeader "Authorization", "Basic " + auth
        ).done((data, status, xhr) ->
            unless data.corpora
                dfd.reject()
                return
            self.loginObj =
                name: usr
                credentials: data.corpora
                auth: auth
            if saveLogin
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
            url: settings.korpBackendURL + "/timespan"
            type: "GET"
            data:
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

            if _.keys(data).length < 2 or data.ERROR
                dfd.reject()
                return

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
        years = _.map(_.pairs(_.omit(struct, "")), (item) ->
            Number item[0]
        )
        unless years.length then return
        minYear = _.min years
        maxYear = _.max years

        if _.isNaN(maxYear) or _.isNaN(minYear)
            c.log "expandTimestruct broken, years:", years
            return

        for y in [minYear..maxYear]
            thisVal = struct[y]
            if typeof thisVal is "undefined"
                struct[y] = prevVal
            else
                prevVal = thisVal



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
            incremental: true

        if from
            params.from = from
        if to
            params.to = to

        #TODO: fix this for struct attrs
        _.extend params, @expandSubCqps subcqps
        @prevParams = params
        def = $.Deferred()

        $.ajax
            url: settings.korpBackendURL + "/" + params.command
            dataType : "json"
            data : params

            beforeSend: (req, settings) =>
                @prevRequest = settings
                @addAuthorizationHeader req
                self.prevUrl = this.url

            progress: (data, e) =>
                progressObj = @calcProgress(e)
                return unless progressObj?
                def.notify progressObj

            error: (jqXHR, textStatus, errorThrown) ->
                def.reject(textStatus)
            success : (data) ->
                def.resolve data

        return def.promise()
