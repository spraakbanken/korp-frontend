korpApp = angular.module("korpApp")

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
                currentCqp = searches.getCqpExpr()
                searchCorpora = settings.corpusListing.stringifySelected(true)
                if currentCqp != s.lastSearch?.cqp or searchCorpora != s.lastSearch?.corpora
                    s.hasResult = false

        s.activate = () ->
            $location.search("show_map", true)
            s.showMap = true
            cqpExpr = searches.getCqpExpr()
            if cqpExpr
                nameEntitySearch.request cqpExpr

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

        createCqp2Fun = () ->
            posTags = for posTag in settings.mapPosTag
                "pos='#{posTag}'"
            nameMatching  = "(" + posTags.join(" | ") + ")"
            return (name) ->
                return "[word='#{name}' & #{nameMatching}]"
        getCqp2 = createCqp2Fun()
        
        s.newKWICSearch = (marker) ->
            point = marker.point
            cl = settings.corpusListing.subsetFactory(s.lastSearch.corpora.split(","))
            opts = {
                start : 0
                end : 24
                ajaxParams :
                    command : "query"
                    cqp : s.lastSearch.cqp
                    cqp2: getCqp2(point.name)
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
        s.newDynamicTab()
        s.center = settings.mapCenter
        s.markers = {}
        s.selectedGroups = []
        s.markerGroups = []
        s.mapSettings =
            baseLayer : "OpenStreetMap"
        s.numResults = 0
        s.useClustering = false

        s.promise.then (([result], xhr) =>
                s.loading = false
                s.numResults = 20
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
            palette = new Rickshaw.Color.Palette { scheme: 'colorwheel' } # spectrum2000
            groups = {}
            _.map result.data, (res, idx) ->
                groups[res.label] = 
                    selected: true 
                    order: idx
                    color: palette.color()
                    markers: getMarkers result.attribute.label, result.cqp, result.corpora, result.within, res, idx
            s.restColor = "#9b9fa5"
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
            $timeout(() ->
                $rootScope.kwicTabs.push { readingMode: queryData.label == "paragraph__geocontext", queryParams: opts }
            , 0)
            
