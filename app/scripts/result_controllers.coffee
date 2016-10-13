korpApp = angular.module("korpApp")

korpApp.controller "resultContainerCtrl", ($scope, searches, $location) ->
    $scope.searches = searches
    $scope.enableMap = settings.enableMap

# korpApp.controller "kwicCtrl", class KwicCtrl
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
        # @scope.pager = Number(@location.search().page) + 1 or 1
        c.log "initPage", @location.search().page
        @scope.pageObj =
            pager: Number(@location.search().page) + 1 or 1
        @scope.page = @scope.pageObj.pager - 1


    @$inject: ['$scope', "utils", "$location"]
    constructor: (@scope, @utils, @location) ->
        s = @scope
        $scope = @scope
        c.log "kwicCtrl init", $scope.$parent
        $location = @location

        s.active = true

        s.onexit = () ->
            c.log "onexit"
            s.$root.sidebar_visible = false

        punctArray = [",", ".", ";", ":", "!", "?", "..."]

        @initPage()

        s.$watch "pageObj.pager", (val) ->
            c.log "pageobj watch", val



        s.pageChange = ($event, page) ->
            c.log "pageChange", arguments
            $event.stopPropagation()
            s.page = page - 1



        @setupHash()
        s.onPageInput = ($event, page, numPages) ->
            if $event.keyCode == 13
                if page > numPages then page = numPages
                s.pageObj.pager = page
                s.page = Number(page) - 1

        readingChange = () ->
            c.log "reading change"

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

        massageData = (sentenceArray) ->
            currentStruct = []
            prevCorpus = ""
            output = []
            isOpen = false
            for sentence, i in sentenceArray
                [matchSentenceStart, matchSentenceEnd] = findMatchSentence sentence
                {start, end} = sentence.match

                for j in [0...sentence.tokens.length]
                    wd = sentence.tokens[j]
                    if start <= j < end
                        _.extend wd, {_match : true}
                    if matchSentenceStart < j < matchSentenceEnd
                        _.extend wd, {_matchSentence : true}
                    if wd.word in punctArray
                        _.extend wd, {_punct : true}
                    if wd.structs?.open
                        wd._open = wd.structs.open
                        currentStruct = [].concat(currentStruct, wd.structs.open)
                        # c.log "currentStruct open", currentStruct
                        isOpen = true
                    else if isOpen and wd.structs?.close
                        wd._close = wd.structs.close
                        currentStruct = _.without currentStruct, wd.structs.close...
                        # c.log "currentStruct close", currentStruct, wd.structs.close

                    if isOpen
                        _.extend wd, {_struct : currentStruct} if currentStruct.length


                    if wd.structs?.close
                        currentStruct = []
                        isOpen = false


                if currentMode == "parallel"
                    mainCorpusId = sentence.corpus.split("|")[0].toLowerCase()
                    linkCorpusId = sentence.corpus.split("|")[1].toLowerCase()
                else
                    mainCorpusId = sentence.corpus.toLowerCase()

                id = (linkCorpusId or mainCorpusId)

                if prevCorpus != id
                    corpus = settings.corpora[id]
                    newSent = {newCorpus : corpus.title, noContext : _.keys(corpus.context).length == 1}
                    output.push newSent

                if i % 2 == 0
                    sentence._color = settings.primaryColor
                else
                    sentence._color = settings.primaryLight

                sentence.corpus = mainCorpusId

                output.push(sentence)
                if sentence.aligned
                    [corpus_aligned, tokens] = _.pairs(sentence.aligned)[0]
                    output.push
                        tokens : tokens
                        isLinked : true
                        corpus : corpus_aligned
                        _color : sentence._color


                prevCorpus = id

                # return sentence
            return output

        findMatchSentence = (sentence) ->
            span = []
            {start, end} = sentence.match
            decr = start
            incr = end
            while decr >= 0
                if "sentence" in (sentence.tokens[decr--].structs?.open or [])
                    span[0] = decr
                    break
            while incr < sentence.tokens.length
                if "sentence" in (sentence.tokens[incr++].structs?.close or [])
                    span[1] = incr
                    break

            return span





        s.kwic = []
        s.contextKwic = []
        s.setContextData = (data) ->
            s.contextKwic = massageData data.kwic

        s.setKwicData = (data) ->
            s.kwic = massageData(data.kwic)

        c.log "selectionManager"
        s.selectionManager = new util.SelectionManager()

        s.selectLeft = (sentence) ->
            if not sentence.match then return
            # c.log "left", sentence.tokens.slice 0, sentence.match.start
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

korpApp.directive "kwicCtrl", () ->
    controller: KwicCtrl

class ExampleCtrl extends KwicCtrl
    @$inject: ['$scope', "utils", "$location"]
    constructor: (@scope, utils, $location) ->
      
        super(@scope, utils, $location)
        s = @scope

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

# korpApp.controller "StatsResultCtrl", ($scope, utils, $location, backend, searches, $rootScope) ->
korpApp.directive "statsResultCtrl", () ->
    controller: ($scope, utils, $location, backend, searches, $rootScope) ->
        s = $scope

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
            getCqpExpr = () ->
                # TODO currently copy pasted from watch on "searches.activeSearch"
                search = searches.activeSearch
                cqpExpr = null
                if search
                    if search.type == "word" or search.type == "lemgram"
                        cqpExpr = simpleSearch.getCQP(search.val)
                    else
                        cqpExpr = search.val
                return cqpExpr

            cqpExpr = CQP.expandOperators getCqpExpr()

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
        $scope.word_pic = $location.search().word_pic?
        $scope.$watch (() -> $location.search().word_pic), (val) ->
            $scope.word_pic = Boolean(val)

        $scope.activate = () ->
            $location.search("word_pic", true)
            search = searches.activeSearch
            $scope.instance.makeRequest(search.val, search.type)

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
                head: data.head
                dep: data.dep
                rel: data.rel
                depextra: data.depextra
                corpus: data.corpus

            $rootScope.kwicTabs.push { queryParams: opts }

        $scope.showWordClass = false

        $rootScope.$on "word_picture_data_available", (event, data) ->
            $scope.data = data

            max = 0
            _.map data, (form) ->
                _.map form, (something) ->
                    if something instanceof Array
                        _.map something, (asdf) ->
                            _.map asdf, (qwerty) ->
                                if qwerty.table and (qwerty.table.length > max)
                                    max = qwerty.table.length

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

# korpApp.controller "graphCtrl", ($scope) ->
korpApp.directive "graphCtrl", () ->
    controller: ($scope) ->
        s = $scope
        s.active = true

        s.mode = "line"

        s.isGraph = () -> s.mode in ["line", "bar"]
        s.isTable = () -> s.mode == "table"

    # s.$watch "mode", (mode) ->
    #     c.log "mode", mode

    #     switch mode
    #         when "bar"
    #             safeApply s, () ->
    #                 s.instance.setBarMode()


# korpApp.controller "compareCtrl", ($scope, $rootScope) ->
korpApp.directive "compareCtrl", () ->
    controller: ($scope, $rootScope) ->
        s = $scope
        s.loading = true
        s.active = true


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

korpApp.directive "mapCtrl", () ->
    controller: ($scope, $rootScope, $location, $timeout, searches, nameEntitySearch, markers, nameMapper) ->
        s = $scope
        s.loading = false
        s.hasResult = false
        s.aborted = false

        $(document).keyup (event) ->
            if event.keyCode == 27 and s.showMap and s.loading
                s.proxy?.abort()
                $timeout (() ->
                    s.aborted = true
                    s.loading = false), 0

        s.$watch (() -> $location.search().result_tab), (val) ->
            $timeout (() -> s.tabVisible = val == 1), 0

        s.showMap = $location.search().show_map?
        s.$watch (() -> $location.search().show_map), (val) ->
            if val == s.showMap
                return

            s.showMap = Boolean(val)
            if s.showMap
                currentCqp = getCqpExpr()
                searchCorpora = settings.corpusListing.stringifySelected(true)
                if currentCqp != s.lastSearch?.cqp or searchCorpora != s.lastSearch?.corpora
                    s.hasResult = false

        s.activate = () ->
            $location.search("show_map", true)
            s.showMap = true
            cqpExpr = getCqpExpr()
            if cqpExpr
                nameEntitySearch.request cqpExpr

        getCqpExpr = () ->
            # TODO currently copy pasted from watch on "searches.activeSearch"
            search = searches.activeSearch
            cqpExpr = null
            if search
                if search.type == "word" or search.type == "lemgram"
                    cqpExpr = simpleSearch.getCQP(search.val)
                else
                    cqpExpr = search.val
            return cqpExpr

        s.center = settings.mapCenter

        s.hoverTemplate = """<div class="hover-info" ng-repeat="(name, values) in names">
                              <div><span>{{ 'map_name' | loc }}: </span> <span>{{name}}</span></div>
                              <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{values.abs_occurrences}}</span></div>
                              <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{values.rel_occurrences}}</span></div>
                           </div>"""
        s.markers = {}
        s.mapSettings =
            baseLayer : "Stamen Watercolor"
        s.numResults = 0
        s.showTime = true

        s.$on "map_progress", (event, progress) ->
            s.progress = Math.round(progress["stats"])

        s.$on "map_data_available", (event, cqp, corpora) ->
            s.aborted = false
            if s.showMap
                s.proxy = nameEntitySearch.proxy
                s.lastSearch = { cqp: cqp, corpora: corpora }
                s.loading = true
                updateMapData()
                s.hasResult = true

        s.countCorpora = () ->
            s.proxy?.prevParams?.corpus.split(",").length

        fixData = (data) ->
            fixedData = {}
            abs = data.total.absolute
            rel = data.total.relative
            names = _.keys abs
            for name in names
                fixedData[name] = {
                    rel_occurrences : (Math.round((data.total.relative[name] + 0.00001) * 1000) / 1000)
                    abs_occurrences : data.total.absolute[name]
                }
            return fixedData

        updateMapData = () ->
            nameEntitySearch.promise.then (data) ->
                if data.count != 0
                    fixedData = fixData data
                    palette = new Rickshaw.Color.Palette("colorwheel")
                    markers(fixedData).then (markers) ->
                        s.markers = {"all":{"markers":markers, "color": palette.color()}}
                        s.selectedGroups = ["all"]
                        s.numResults = _.keys(markers).length
                        s.loading = false
                else
                    s.selectedGroups = []
                    s.markers = {}
                    s.numResults = 0
                    s.loading = false

        s.newKWICSearch = (marker) ->
            point = marker.point
            cl = settings.corpusListing.subsetFactory(s.lastSearch.corpora.split(","))
            opts = {
                start : 0
                end : 24
                ajaxParams :
                    command : "query"
                    cqp : s.lastSearch.cqp
                    cqp2: "[word='" + point.name + "' & (pos='PM' | pos='NNP' | pos='NNPS')]",
                    corpus : s.lastSearch.corpora
                    show_struct : _.keys cl.getStructAttrs()
                    expand_prequeries : true
                    defaultwithin : 'sentence'
            }
            $rootScope.kwicTabs.push { queryParams: opts }

korpApp.directive "newMapCtrl", ($timeout, searches) ->
    controller: ($scope, $rootScope) ->
        s = $scope
        s.loading = true
        s.active = true

        s.center = settings.mapCenter
        s.markers = {}
        s.selectedGroups = []
        s.markerGroups = []
        s.mapSettings =
            baseLayer : "Stamen Watercolor"
        s.numResults = 0

        s.promise.then (([result], xhr) =>
                s.loading = false
                s.numResults = 20
                s.result = result
                s.markerGroups = getMarkerGroups result
                s.selectedGroups = _.keys s.markerGroups
            ),
            () =>
                s.loading = false
                s.error = true

        s.toggleMarkerGroup = (groupName) ->
            s.markerGroups[groupName].selected = not s.markerGroups[groupName].selected
            if groupName in s.selectedGroups
                s.selectedGroups.splice (s.selectedGroups.indexOf groupName), 1
            else
                s.selectedGroups.push groupName

        getMarkerGroups = (result) ->
            palette = new Rickshaw.Color.Palette("colorwheel")
            groups = {}
            _.map result.data, (res, idx) ->
                groups[res.label] = 
                    selected: true 
                    color: palette.color()
                    markers: getMarkers result.attribute.label, result.cqp, result.corpora, result.within, res, idx
            return groups

        getMarkers = (label, cqp, corpora, within, res, idx) ->
            markers = {}

            for point in res.points
                do(point) ->
                    id = point.name.replace(/-/g , "") + idx
                    markers[id] =
                        lat: point.lat
                        lng: point.lng
                        queryData:
                            searchCqp: cqp
                            subCqp: res.cqp
                            label: label
                            corpora: corpora
                            within: within
                        label: res.label
                        point: point

            return markers

        s.newKWICSearch = (marker) ->
            queryData = marker.queryData
            point = marker.point
            cl = settings.corpusListing.subsetFactory(queryData.corpora)
            numberOfTokens = queryData.subCqp.split("[").length - 1
            opts = {
                start : 0
                end : 24
                ajaxParams :
                    command : "query"
                    cqp : queryData.searchCqp
                    cqp2: "[_." + queryData.label + " contains " + "'" + [point.name, point.countryCode, point.lat, point.lng].join(";") + "']{" + numberOfTokens + "}",
                    cqp3: queryData.subCqp
                    corpus : cl.stringifySelected()
                    show_struct : _.keys cl.getStructAttrs()
                    expand_prequeries : false
            }
            _.extend opts.ajaxParams, queryData.within
            $rootScope.kwicTabs.push { readingMode: queryData.label == "paragraph__geocontext", queryParams: opts }



korpApp.controller "VideoCtrl", ($scope, $uibModal) ->

    $scope.videos = []

    $scope.open = () ->
        modalInstance = $uibModal.open
            animation: false
            templateUrl: 'markup/sidebar_video.html'
            controller: 'VideoInstanceCtrl'
            size: 'modal-lg'
            windowClass: 'video-modal-bootstrap'
            resolve:
                items: () ->
                    return $scope.videos
                startTime: () ->
                    return $scope.startTime
                endTime: () ->
                    return $scope.endTime
                fileName: () ->
                    return $scope.fileName
                sentence: () ->
                    return $scope.sentence

    $scope.startTime = 0

korpApp.controller "VideoInstanceCtrl", ($scope, $compile, $timeout, $uibModalInstance, items, startTime, endTime, fileName, sentence) ->
    $scope.fileName = fileName
    $scope.sentence = sentence

    transformSeconds = (seconds) ->
        d = moment.duration seconds, 'seconds'
        hours = Math.floor d.asHours()
        mins = Math.floor(d.asMinutes()) - hours * 60
        secs = Math.floor(d.asSeconds()) - hours * 3600 - mins * 60
        return hours + ":" + mins + ":" + secs

    if startTime
        $scope.startTime = transformSeconds startTime
    if endTime
        $scope.endTime = transformSeconds endTime

    $scope.init = () ->
        videoElem = angular.element("#korp-video")

        # workaround for firefox problem, not possible to create source-elem in template
        for videoData in items
            srcElem = angular.element '<source>'
            srcElem.attr 'src', videoData.url
            srcElem.attr 'type', videoData.type
            $compile(srcElem)($scope);
            videoElem.append srcElem

        video = videoElem[0]

        video.addEventListener "durationchange", () ->
            video.currentTime = startTime
            video.play()

        video.addEventListener "timeupdate", () =>
            if($scope.pauseAfterEndTime and endTime and video.currentTime >= endTime)
                video.pause()
                $timeout (() -> $scope.isPaused = true), 0

        $scope.goToStartTime = () ->
            video.currentTime = startTime
            $scope.isPaused = false
            video.play()

        $scope.continuePlay = () ->
            $scope.pauseAfterEndTime = false
            $scope.isPaused = false
            video.play()

    $scope.isPaused = false
    $scope.pauseAfterEndTime = true

    $scope.ok = () -> $uibModalInstance.close()
