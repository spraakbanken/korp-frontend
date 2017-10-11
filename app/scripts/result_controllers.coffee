korpApp = angular.module("korpApp")

korpApp.controller "resultContainerCtrl", ($scope, searches, $location) ->
    $scope.searches = searches


class KwicCtrl
    setupHash : () ->
        c.log "setupHash", @scope.$id
        @utils.setupHash @scope, [
            key : "page"
            post_change : () =>
                c.log "post_change page hash", @scope.page
                @scope.pageObj.pager = (@scope.page or 0) + 1
                c.log "@scope.pageObj.pager", @scope.pageObj.pager
            val_in : Number
        ]

    initPage : () ->
        @scope.pageObj =
            pager: Number(@location.search().page) + 1 or 1
        @scope.page = @scope.pageObj.pager - 1


    @$inject: ['$scope', "$timeout", "utils", "$location", "kwicDownload"]
    constructor: (@scope, @timeout, @utils, @location, @kwicDownload) ->
        s = @scope
        $scope = @scope
        c.log "kwicCtrl init", $scope.$parent
        $location = @location

        s.onexit = () ->
            c.log "onexit"
            s.$root.sidebar_visible = false

        punctArray = [",", ".", ";", ":", "!", "?", "..."]

        @initPage()

        s.pageChange = ($event, page) ->
            c.log "pageChange", arguments
            $event.stopPropagation()
            s.page = page - 1

        @setupHash()
        s.onPageInput = ($event, page, numPages) ->
            if $event.keyCode == 13
                if page > numPages then page = numPages
                if page <= 0 then page = "1"
                s.gotoPage = page
                s.pageObj.pager = page
                s.page = Number(page) - 1

        readingChange = () ->
            if s.instance?.getProxy().pendingRequests.length
                window.pending = s.instance.getProxy().pendingRequests

                $.when(s.instance.getProxy().pendingRequests...).then () ->
                    c.log "readingchange makeRequest"
                    s.instance.makeRequest()

        s.setupReadingHash = () =>
            @utils.setupHash s, [
                key : "reading_mode",
                post_change : (isReading) =>
                    c.log "change reading mode", isReading
                    readingChange()
            ]

        # used by example kwic
        s.setupReadingWatch = _.once () ->
            c.log "setupReadingWatch"
            init = true
            s.$watch "reading_mode", () ->
                if not init
                    readingChange()
                init = false

        s.toggleReading = () ->
            s.reading_mode = not s.reading_mode
            s.instance.centerScrollbar()

        s.hitspictureClick = (pageNumber) ->
            c.log "pageNumber", pageNumber
            s.page = Number(pageNumber)

        massageData = (hitArray) ->
            prevCorpus = ""
            output = []

            for hitContext, i in hitArray
                currentStruct = {}
                if currentMode == "parallel"
                    mainCorpusId = hitContext.corpus.split("|")[0].toLowerCase()
                    linkCorpusId = hitContext.corpus.split("|")[1].toLowerCase()
                else
                    mainCorpusId = hitContext.corpus.toLowerCase()

                id = (linkCorpusId or mainCorpusId)
                
                [matchSentenceStart, matchSentenceEnd] = findMatchSentence hitContext
                {matchStart, matchEnd} = hitContext.match

                for j in [0...hitContext.tokens.length]
                    wd = hitContext.tokens[j]
                    wd.position = j
                    wd._open = []
                    wd._close = []
                    if matchStart <= j < matchEnd
                        _.extend wd, {_match : true}
                    if matchSentenceStart < j < matchSentenceEnd
                        _.extend wd, {_matchSentence : true}
                    if wd.word in punctArray
                        _.extend wd, {_punct : true}

                    for structItem in wd.structs?.open or []
                        spaceIdx = structItem.indexOf(" ")
                        if spaceIdx == -1
                            key = structItem
                            val = ""
                        else
                            key = structItem.substring(0, spaceIdx)
                            val = structItem.substring(spaceIdx + 1)
                        wd._open.push key
                        if key of settings.corpora[id].attributes
                            currentStruct[key] = val

                    _.extend wd, currentStruct

                    for structItem in wd.structs?.close or []
                        wd._close.push structItem
                        delete currentStruct[structItem]

                if prevCorpus != id
                    corpus = settings.corpora[id]
                    newSent = {newCorpus : corpus.title, noContext : _.keys(corpus.context).length == 1}
                    output.push newSent

                if i % 2 == 0
                    hitContext._color = settings.primaryColor
                else
                    hitContext._color = settings.primaryLight

                hitContext.corpus = mainCorpusId

                output.push(hitContext)
                if hitContext.aligned
                    [corpus_aligned, tokens] = _.pairs(hitContext.aligned)[0]
                    output.push
                        tokens : tokens
                        isLinked : true
                        corpus : corpus_aligned
                        _color : hitContext._color

                prevCorpus = id

            return output

        findMatchSentence = (hitContext) ->
            span = []
            {start, end} = hitContext.match
            decr = start
            incr = end
            while decr >= 0
                if "sentence" in (hitContext.tokens[decr--].structs?.open or [])
                    span[0] = decr
                    break
            while incr < hitContext.tokens.length
                if "sentence" in (hitContext.tokens[incr++].structs?.close or [])
                    span[1] = incr
                    break

            return span


        s.kwic = []
        s.contextKwic = []
        s.setContextData = (data) ->
            s.pagerHitsPerPage = s.hitsPerPage
            s.contextKwic = massageData data.kwic

        s.setKwicData = (data) ->
            s.pagerHitsPerPage = s.hitsPerPage
            s.kwic = massageData(data.kwic)

        c.log "selectionManager"
        s.selectionManager = new util.SelectionManager()

        s.selectLeft = (sentence) ->
            if not sentence.match then return
            sentence.tokens.slice 0, sentence.match.start

        s.selectMatch = (sentence) ->
            if not sentence.match then return
            from = sentence.match.start
            sentence.tokens.slice from, sentence.match.end

        s.selectRight = (sentence) ->
            if not sentence.match then return
            from = sentence.match.end
            len = sentence.tokens.length
            sentence.tokens.slice from, len

        s.$watch (() -> $location.search().hpp), (hpp) ->
            s.hitsPerPage = hpp or 25

        s.download = 
            options: [
                    {value: "", label: "download_kwic"},
                    {value: "kwic/csv", label: "download_kwic_csv"},
                    {value: "kwic/tsv", label: "download_kwic_tsv"},
                    {value: "annotations/csv", label: "download_annotations_csv"},
                    {value: "annotations/tsv", label: "download_annotations_tsv"},
                ]
            selected: ""
            init: (value, hitsDisplay) =>
                if s.download.blobName
                    URL.revokeObjectURL s.download.blobName
                if value == ""
                    return
                requestData = s.instance.getProxy().prevParams
                [fileName, blobName] = @kwicDownload.makeDownload value.split("/")..., s.kwic, requestData, hitsDisplay
                s.download.fileName = fileName
                s.download.blobName = blobName
                s.download.selected = ""
                @timeout (() -> 
                        angular.element("#kwicDownloadLink")[0].click()
                    ), 0

korpApp.directive "kwicCtrl", () ->
    controller: KwicCtrl

class ExampleCtrl extends KwicCtrl

    @$inject: ['$scope', "$timeout", "utils", "$location", "kwicDownload"]
    constructor: (@scope, $timeout, utils, $location, @kwicDownload) ->
        super(@scope, $timeout, utils, $location, @kwicDownload)
        s = @scope

        s.newDynamicTab()

        s.hitspictureClick = (pageNumber) ->
            s.page = Number(pageNumber)
            s.pageChange(null, pageNumber)


        s.pageChange = ($event, page) ->
            $event?.stopPropagation()
            s.instance.current_page = page
            s.instance.makeRequest()

        s.exampleReadingMode = s.kwicTab.readingMode

        s.toggleReading = () ->
            s.exampleReadingMode = not s.exampleReadingMode
            s.instance.centerScrollbar()

            if s.instance?.getProxy().pendingRequests.length
                window.pending = s.instance.getProxy().pendingRequests

                $.when(s.instance.getProxy().pendingRequests...).then () ->
                    s.instance.makeRequest()

    initPage : () ->
        @scope.pageObj =
            pager : 0
        @scope.page = 0
    setupHash : () ->


korpApp.directive "exampleCtrl", () ->
    controller: ExampleCtrl


korpApp.directive "statsResultCtrl", () ->
    controller: ($scope, utils, $location, backend, searches, $rootScope) ->
        s = $scope
        s.loading = false
        s.progress = 0

        s.$watch (() -> $location.search().hide_stats), (val) ->
            s.showStatistics = not val?

        $scope.activate = () ->
            $location.search("hide_stats", null)
            cqp = searches.getCqpExpr()
            s.showStatistics = true
            $scope.instance.makeRequest(cqp)

        s.onGraphShow = (data) ->
            $rootScope.graphTabs.push data
        
        s.newMapEnabled = settings.newMapEnabled

        s.getGeoAttributes = (corpora) ->
            attrs = {}
            for corpus in settings.corpusListing.subsetFactory(corpora).selected
                for attr in corpus.private_struct_attributes
                    if attr.indexOf "geo" isnt -1
                        if attrs[attr]
                            attrs[attr].corpora.push corpus.id
                        else
                            attrs[attr] =
                                label: attr
                                corpora: [corpus.id]

            attrs = _.map attrs, (val) -> val
            if attrs and attrs.length > 0
                attrs[0].selected = true

            s.mapAttributes = attrs

        s.mapToggleSelected = (index, event) ->
            _.map s.mapAttributes, (attr) -> attr.selected = false
            
            attr = s.mapAttributes[index]
            attr.selected = true
            event.stopPropagation()

        s.showMap = () ->
            cqpExpr = CQP.expandOperators searches.getCqpExpr()

            cqpExprs = {}
            for rowIx in s.instance.getSelectedRows()
                if rowIx == 0
                    continue
                row = s.instance.getDataAt(rowIx)
                searchParams = s.instance.searchParams
                cqp = statisticsFormatting.getCqp searchParams.reduceVals, row.hit_value, searchParams.ignoreCase
                texts = statisticsFormatting.getTexts searchParams.reduceVals, row.hit_value, searchParams.corpora
                cqpExprs[cqp] = texts.join ", "

            selectedAttributes = _.filter(s.mapAttributes, "selected")
            if selectedAttributes.length > 1
                c.log "Warning: more than one selected attribute, choosing first"
            selectedAttribute = selectedAttributes[0]
            
            within = settings.corpusListing.subsetFactory(selectedAttribute.corpora).getWithinParameters()
            $rootScope.mapTabs.push backend.requestMapData(cqpExpr, cqpExprs, within, selectedAttribute)


korpApp.directive "wordpicCtrl", () ->
    controller: ($scope, $rootScope, $location, utils, searches) ->
        $scope.loading = false
        $scope.progress = 0
        $scope.word_pic = $location.search().word_pic?
        $scope.$watch (() -> $location.search().word_pic), (val) ->
            $scope.word_pic = Boolean(val)

        $scope.activate = () ->
            $location.search("word_pic", true)
            search = searches.activeSearch
            searchVal = if search.type == "lemgram" then unregescape search.val else search.val
            $scope.instance.makeRequest(searchVal, search.type)

        $scope.settings =
            showNumberOfHits: "15"

        $scope.hitSettings = ["15"]

        $scope.minimize = (table) ->
          return table.slice 0, $scope.settings.showNumberOfHits

        $scope.onClickExample = (event, row) ->
            data = row

            opts = {}
            opts.ajaxParams =
                start : 0
                end : 24
                command : "relations_sentences"
                source : data.source.join(",")
                corpus: data.corpus

            $rootScope.kwicTabs.push { queryParams: opts }

        $scope.showWordClass = false

        $rootScope.$on "word_picture_data_available", (event, data) ->
            $scope.data = data

            max = 0
            _.map data, (form) ->
                _.map form, (categories) ->
                    if categories instanceof Array
                        _.map categories, (cols) ->
                            _.map cols, (col) ->
                                if col.table and (col.table.length > max)
                                    max = col.table.length

            $scope.hitSettings = []
            if max < 15
                $scope.settings =
                    showNumberOfHits: "1000"
            else
                $scope.hitSettings.push "15"
                $scope.settings =
                    showNumberOfHits: "15"

            if max > 50
                $scope.hitSettings.push "50"
            if max > 100
                $scope.hitSettings.push "100"
            if max > 500
                $scope.hitSettings.push "500"

            $scope.hitSettings.push "1000"

        $scope.localeString = (lang, hitSetting) ->
            if hitSetting == "1000"
                return util.getLocaleString "word_pic_show_all", lang
            else
                return util.getLocaleString("word_pic_show_some", lang) + " " + hitSetting + " " + util.getLocaleString("word_pic_hits", lang)

        $scope.isLemgram = (word) ->
            return util.isLemgramId(word)

        $scope.renderTable = (obj) ->
          return obj instanceof Array

        $scope.parseLemgram = (row, allLemgrams) ->
          set = row[row.show_rel].split('|')
          lemgram = set[0]

          word = _.str.trim(lemgram)
          infixIndex = ""
          concept = lemgram
          infixIndex = ""
          type = "-"

          hasHomograph = (lemgram.slice 0, -1) in allLemgrams
          prefix = row.depextra

          if util.isLemgramId(lemgram)
              match = util.splitLemgram(lemgram)
              infixIndex = match.index
              if row.dep
                  concept = match.form.replace(/_/g, " ")
              else
                  concept = "-"
              type = match.pos.slice(0, 2)
          return {
              label: prefix + " " + concept
              pos: type
              idx: infixIndex
              showIdx: not(infixIndex is "" or infixIndex is "1")
            }

        $scope.getTableClass = (wordClass, parentIdx, idx) ->
            return settings.wordPictureConf[wordClass][parentIdx][idx].css_class

        $scope.getHeaderLabel = (header, section, idx) ->
            if header.alt_label
                return header.alt_label
            else
                return "rel_" + section[idx].rel

        $scope.getHeaderClasses = (header, token) ->
            if header isnt '_'
               return "lemgram_header_item " + header.css_class
            else
                classes = "hit"
                if $scope.isLemgram(token)
                    classes += " lemgram"
                return classes

        $scope.renderResultHeader = (parentIndex, section, wordClass, index) ->
            headers = settings.wordPictureConf[wordClass][parentIndex]
            return section[index] and section[index].table

        $scope.getResultHeader = (index, wordClass) ->
            return settings.wordPictureConf[wordClass][index]

        $scope.fromLemgram = (maybeLemgram) ->
            if util.isLemgramId(maybeLemgram)
                return util.splitLemgram(maybeLemgram).form
            else
                return maybeLemgram


korpApp.directive "graphCtrl", () ->
    controller: ($scope) ->
        s = $scope
        s.newDynamicTab()

        s.mode = "line"

        s.isGraph = () -> s.mode in ["line", "bar"]
        s.isTable = () -> s.mode == "table"


korpApp.directive "compareCtrl", () ->
    controller: ($scope, $rootScope) ->
        s = $scope
        s.loading = true
        s.newDynamicTab()

        s.resultOrder = (item) ->
            return Math.abs item.loglike

        s.promise.then (([tables, max, cmp1, cmp2, reduce], xhr) ->
            s.loading = false

            s.tables = tables
            s.reduce = reduce

            cl = settings.corpusListing.subsetFactory([].concat cmp1.corpora, cmp2.corpora)
            attributes = (_.extend {}, cl.getCurrentAttributes(), cl.getStructAttrs())

            s.stringify = _.map reduce, (item) ->
                return attributes[_.str.strip item, "_."]?.stringify or angular.identity

            s.max = max

            s.cmp1 = cmp1
            s.cmp2 = cmp2

            cmps = [cmp1, cmp2]

            s.rowClick = (row, cmp_index) ->
                cmp = cmps[cmp_index]

                splitTokens = _.map row.elems, (elem) ->
                    _.map (elem.split "/"), (tokens) ->
                        tokens.split " "

                # number of tokens in search
                tokenLength = splitTokens[0][0].length

                # transform result from grouping on attribute to grouping on token place
                tokens = _.map [0 .. tokenLength - 1], (tokenIdx) ->
                           tokens = _.map reduce, (reduceAttr, attrIdx) ->
                               return _.unique _.map(splitTokens, (res) ->
                                   return res[attrIdx][tokenIdx])
                           return tokens


                cqps = _.map tokens, (token) ->
                    cqpAnd = _.map [0..token.length-1], (attrI) ->
                        attrKey = reduce[attrI]
                        attrVal = token[attrI]


                        if "_." in attrKey
                            c.log "error, attribute key contains _."

                        attribute = attributes[attrKey]
                        if attribute
                            type = attribute.type
                            attrKey = "_." + attrKey if attribute.isStructAttr


                        op = if type == "set" then "contains" else "="

                        if type == "set" and attrVal.length > 1
                            variants = []
                            _.map attrVal, (val) ->
                                parts = val.split(":")
                                if variants.length == 0
                                    for idx in [0..parts.length - 2]
                                        variants.push []
                                for idx in [1..parts.length - 1]
                                    variants[idx - 1].push parts[idx]

                            key  = attrVal[0].split(":")[0]
                            variants = _.map variants, (variant) ->
                                return ":(" + variant.join("|") + ")"
                            val = key + variants.join("")
                        else
                            val = attrVal[0]

                        if type == "set" and val == "|"
                            return "ambiguity(#{attrKey}) = 0"
                        else
                            return "#{attrKey} #{op} \"#{val}\""

                    return "[" + cqpAnd.join(" & ") + "]"

                cqp = cqps.join " "

                cl = settings.corpusListing.subsetFactory cmp.corpora

                opts = {
                    start : 0
                    end : 24
                    ajaxParams :
                        command : "query"
                        cqp : cmp.cqp
                        cqp2 : cqp
                        corpus : cl.stringifySelected()
                        show_struct : _.keys cl.getStructAttrs()
                        expand_prequeries : false

                }
                $rootScope.kwicTabs.push { queryParams: opts }),
            () ->
                s.loading = false
                s.error = true
