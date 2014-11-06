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

    makeRequest: ->
        @prev = ""
        @progress = 0
        @total_results = 0
        @total = null

    abort: ->
        _.invoke @pendingRequests, "abort" if @pendingRequests.length
        @pendingRequests = []

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

class model.SearchProxy extends BaseProxy
    constructor: ->

    relatedWordSearch: (lemgram) ->
        $.ajax
            url: "http://spraakbanken.gu.se/ws/saldo-ws/grel/json/" + lemgram
            success: (data) ->
                c.log "related words success"
                lemgrams = []
                $.each data, (i, item) ->
                    lemgrams = lemgrams.concat(item.rel)

                hasAnyFreq = false
                lemgramProxy.lemgramCount(lemgrams).done (freqs) ->
                    $.each data, (i, item) ->
                        item.rel = $.grep(item.rel, (lemgram) ->
                            hasAnyFreq = true if freqs[lemgram]
                            !!freqs[lemgram]
                        )

                    if hasAnyFreq
                        simpleSearch.renderSimilarHeader lemgram, data
                    else
                        simpleSearch.removeSimilarHeader()



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

    makeRequest: (options, page, callback, successCallback, kwicCallback) ->
        c.log "kwicproxy.makeRequest"
        self = this
        @foundKwic = false
        super()
        successCallback = successCallback or $.proxy(kwicResults.renderCompleteResult, kwicResults)
        # kwicCallback = kwicCallback or $.proxy(kwicResults.renderKwicResult, kwicResults)
        kwicCallback = kwicCallback or $.proxy(kwicResults.renderResult, kwicResults)
        self.progress = 0
        

        o = $.extend(
            # cqp: $("body").scope().activeCQP || search().cqp
            queryData: null
            # ajaxParams: @prevAjaxParams
            success: (data, status, xhr) ->
                self.popXhr xhr
                successCallback data

            error: (data, status, xhr) ->
                c.log "kwic error", data
                self.popXhr xhr
                kwicResults.hidePreloader()

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?

                #               c.log("progressObj", progressObj)
                callback progressObj
                if progressObj["struct"].kwic
                    c.log "found kwic!"
                    @foundKwic = true
                    kwicCallback progressObj["struct"]
        , options)


        # @prevAjaxParams = o.ajaxParams

        #       kwicResults.num_result = 0;
        # defaults
        data =
            command: "query"
            # corpus: settings.corpusListing.stringifySelected()
            defaultcontext: _.keys(settings.defaultContext)[0]
            defaultwithin: _.keys(settings.defaultWithin)[0]
            show: []
            show_struct: []
            incremental: $.support.ajaxProgress
            cache : true

        $.extend data, kwicResults.getPageInterval(page), o.ajaxParams
        for corpus in settings.corpusListing.selected
            for key, val of corpus.within
                data.show.push key
            for key, val of corpus.attributes
                data.show.push key


            if corpus.struct_attributes?
                $.each corpus.struct_attributes, (key, val) ->
                    data.show_struct.push key if $.inArray(key, data.show_struct) is -1

        # if $(".within_select").val() != settings.defaultWithin
        #     data.within = settings.corpusListing.getWithinQueryString()
        data.show = _.uniq data.show
        @prevCQP = data.cqp
        data.show = (_.uniq data.show).join(",")
        data.show_struct = (_.uniq data.show_struct).join(",")
        @prevRequest = data
        @prevMisc = {"hitsPerPage" : $("#num_hits").val()}
        @prevParams = data
        @pendingRequests.push $.ajax(
            url: settings.cgi_script
            data: data
            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req

            success: (data, status, jqxhr) ->
                self.queryData = data.querydata
                kwicCallback data if data.incremental is false or not @foundKwic
                o.success data, data.cqp

            error: o.error
            progress: o.progress
        )

# class model.ExamplesProxy extends model.KWICProxy
#     constructor: ->
#         super()
#         @command = "relations_sentences"

class model.LemgramProxy extends BaseProxy
    constructor: ->
        super()
        # @pendingRequest = abort: $.noop

    buildAffixQuery: (isValid, key, value) ->
        return "" unless isValid
        $.format "| (%s contains \"%s\")", [key, value]

    lemgramSearch: (lemgram, searchPrefix, searchSuffix) ->
        cqp = $.format("[(lex contains \"%s\")%s%s]", [lemgram, @buildAffixQuery(searchPrefix, "prefix", lemgram), @buildAffixQuery(searchSuffix, "suffix", lemgram)])
        cqp

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
                lemgramResults.renderResult data, word

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?
                callback progressObj

            beforeSend: (req, settings) ->
                self.prevRequest = settings
                self.addAuthorizationHeader req
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
                    if data.count is 0
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


class model.StatsProxy extends BaseProxy
    constructor: ->
        super()
        @prevRequest = null
        @prevParams = null
        @currentPage = 0
        @page_incr = 25

    makeRequest: (cqp, callback) ->
        self = this
        super()
        statsResults.showPreloader()
        # reduceval = $.bbq.getState("stats_reduce") or "word"
        reduceval = search().stats_reduce or "word"
        reduceval = "word" if reduceval is "word_insensitive"

        data =
            command: "count"
            groupby: reduceval
            cqp: cqp
            corpus: settings.corpusListing.stringifySelected(true)
            incremental: $.support.ajaxProgress
            defaultwithin: "sentence"

        if settings.corpusListing.getCurrentAttributes()[reduceval]?.type == "set"
            data.split = reduceval

        if $("#reduceSelect select").val() is "word_insensitive"
            $.extend data,
                ignore_case: "word"

        # data.within = settings.corpusListing.getWithinQueryString() if $.sm.In("extended") and $(".within_select").val() is "paragraph"
        if $(".within_select").val() != settings.defaultWithin
            data.within = settings.corpusListing.getWithinQueryString()
        @prevParams = data
        def = $.Deferred()
        @pendingRequests.push $.ajax
            url: settings.cgi_script
            data: data
            beforeSend: (req, settings) ->
                c.log "req", req

                self.prevRequest = settings
                self.addAuthorizationHeader req

            error: (jqXHR, textStatus, errorThrown) ->
                c.log "gettings stats error, status: " + textStatus
                def.reject(textStatus, errorThrown)

            progress: (data, e) ->
                progressObj = self.calcProgress(e)
                return unless progressObj?
                callback progressObj

            success: (data) ->
                if data.ERROR?
                    c.log "gettings stats failed with error", $.dump(data.ERROR)
                    # statsResults.resultError data
                    def.reject(data)
                    return
                minWidth = 100
                columns = [
                    id: "hit"
                    name: "stats_hit"
                    field: "hit_value"
                    sortable: true
                    formatter: settings.reduce_stringify(reduceval)
                    minWidth : minWidth
                ,
                    id: "total"
                    name: "stats_total"
                    field: "total_value"
                    sortable: true
                    formatter: self.valueFormatter
                    minWidth : minWidth
                ]
                $.each $.keys(data.corpora).sort(), (i, corpus) ->
                    columns.push
                        id: corpus
                        name: settings.corpora[corpus.toLowerCase()].title
                        field: corpus + "_value"
                        sortable: true
                        formatter: self.valueFormatter
                        minWidth : minWidth


                totalRow =
                    id: "row_total"
                    hit_value: "&Sigma;"
                    total_value: data.total.sums
                
                $.each data.corpora, (corpus, obj) ->
                    totalRow[corpus + "_value"] = obj.sums

                wordArray = $.keys(data.total.absolute)

                valueGetter = (obj, word) ->
                    return obj[word]

                wordGetter = (word) ->
                    return word

                if reduceval in ["lex", "saldo", "baseform"]
                    groups = _.groupBy wordArray, (item) ->
                        item.replace(/:\d+/g, "")



                    combinedWordArray = _.keys groups
                    c.log "combinedWordArray", combinedWordArray
                    c.log "groups", groups
                    add = (a, b) -> a + b
                        
                    valueGetter = (obj, word) ->
                        _.reduce (_.map groups[word], (wd) -> obj[wd]), add
                    
                    wordGetter = (word) ->
                        groups[word]

                    # c.log "combined", wordArray.length, _.keys(combined).length, combined


                dataset = [totalRow]

                for word, i in (combinedWordArray or wordArray)
                    row =
                        id: "row" + i
                        hit_value: wordGetter word
                        total_value:
                            absolute: (valueGetter data.total.absolute, word)
                            relative: valueGetter data.total.relative, word

                    # $.each data.corpora, (corpus, obj) ->
                    for corpus, obj of data.corpora
                        row[corpus + "_value"] =
                            absolute: (valueGetter obj.absolute, word)
                            relative: (valueGetter obj.relative, word)
                    dataset[i+1] = row
                c.log "stats resolve"
                def.resolve [data, wordArray, columns, dataset]
                # statsResults.savedData = data
                # statsResults.savedWordArray = wordArray
                # statsResults.renderResult columns, dataset
        return def.promise()


    valueFormatter: (row, cell, value, columnDef, dataContext) ->
        return "" if not value.relative and not value.absolute
        return """<span>
                        <span class='relStat'>#{util.formatDecimalString(value.relative.toFixed(1), true)}</span>
                        <span class='absStat'>(#{util.prettyNumbers(String(value.absolute))})</span>
                  <span>"""

class model.AuthenticationProxy
    constructor: ->
        @loginObj = {}

    makeRequest: (usr, pass) ->
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

    makeRequest: (cqp, subcqps, corpora) ->
        super()
        params =
            command : "count_time"
            cqp : cqp
            corpus : corpora
            granularity : @granularity
            incremental: $.support.ajaxProgress

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
