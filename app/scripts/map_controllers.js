/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("mapCtrl", () => ({
    controller(
        $scope,
        $rootScope,
        $location,
        $timeout,
        searches,
        nameEntitySearch,
        markers,
        nameMapper
    ) {
        const s = $scope
        s.loading = false
        s.hasResult = false
        s.aborted = false

        $(document).keyup(function(event) {
            if (event.keyCode === 27 && s.showMap && s.loading) {
                if (s.proxy != null) {
                    s.proxy.abort()
                }
                return $timeout(function() {
                    s.aborted = true
                    s.loading = false
                }, 0)
            }
        })

        s.$watch(
            () => $location.search().result_tab,
            val => $timeout(() => (s.tabVisible = val === 1), 0)
        )

        s.showMap = $location.search().show_map != null
        s.$watch(() => $location.search().show_map, function(val) {
            if (val === s.showMap) {
                return
            }

            s.showMap = Boolean(val)
            if (s.showMap) {
                const currentCqp = searches.getCqpExpr()
                const searchCorpora = settings.corpusListing.stringifySelected(true)
                if (
                    s.lastSearch &&
                    (s.lastSearch.cqp == currentCqp || s.lastSearch.corpora == searchCorpora)
                ) {
                    s.hasResult = false
                }
            }
        })

        s.activate = function() {
            $location.search("show_map", true)
            s.showMap = true
            const cqpExpr = searches.getCqpExpr()
            if (cqpExpr) {
                return nameEntitySearch.request(cqpExpr)
            }
        }

        s.center = settings.mapCenter

        s.hoverTemplate = `
            <div class="hover-info" ng-repeat="(name, values) in names">
               <div><span>{{ 'map_name' | loc }}: </span> <span>{{name}}</span></div>
               <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{values.abs_occurrences}}</span></div>
               <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{values.rel_occurrences}}</span></div>
            </div>`
        s.markers = {}
        s.mapSettings = { baseLayer: "Stamen Watercolor" }
        s.numResults = 0
        s.showTime = true

        s.$on("map_progress", (event, progress) => (s.progress = Math.round(progress["stats"])))

        s.$on("map_data_available", function(event, cqp, corpora) {
            s.aborted = false
            if (s.showMap) {
                s.proxy = nameEntitySearch.proxy
                s.lastSearch = { cqp, corpora }
                s.loading = true
                updateMapData()
                s.hasResult = true
            }
        })

        s.countCorpora = () => {
            if (s.proxy && s.proxy.prevParams) {
                return s.proxy.prevParams.corpus.split(",").length
            }
        }

        const fixData = function(data) {
            const fixedData = {}
            const abs = data.total.absolute
            const rel = data.total.relative
            const names = _.keys(abs)
            for (let name of names) {
                fixedData[name] = {
                    rel_occurrences:
                        Math.round((data.total.relative[name] + 0.00001) * 1000) / 1000,
                    abs_occurrences: data.total.absolute[name]
                }
            }
            return fixedData
        }

        var updateMapData = () =>
            nameEntitySearch.promise.then(function(data) {
                if (data.count !== 0) {
                    const fixedData = fixData(data)
                    const palette = new Rickshaw.Color.Palette("colorwheel")
                    markers(fixedData).then(function(markers) {
                        s.markers = { all: { markers: markers, color: palette.color() } }
                        s.selectedGroups = ["all"]
                        s.numResults = _.keys(markers).length
                        s.loading = false
                    })
                } else {
                    s.selectedGroups = []
                    s.markers = {}
                    s.numResults = 0
                    s.loading = false
                }
            })

        const createCqp2Fun = function() {
            const posTags = settings.mapPosTag.map(posTag => `pos='${posTag}'`)
            const nameMatching = `(${posTags.join(" | ")})`
            return name => `[word='${name}' & ${nameMatching}]`
        }
        const getCqp2 = createCqp2Fun()

        s.newKWICSearch = function(marker) {
            const { point } = marker
            const cl = settings.corpusListing.subsetFactory(s.lastSearch.corpora.split(","))
            const opts = {
                start: 0,
                end: 24,
                ajaxParams: {
                    command: "query",
                    cqp: s.lastSearch.cqp,
                    cqp2: getCqp2(point.name),
                    corpus: s.lastSearch.corpora,
                    show_struct: _.keys(cl.getStructAttrs()),
                    expand_prequeries: true,
                    default_within: "sentence"
                }
            }
            $rootScope.kwicTabs.push({ queryParams: opts })
        }
    }
}))

korpApp.directive("newMapCtrl", ($timeout, searches) => ({
    controller($scope, $rootScope) {
        const s = $scope

        s.onentry = () => s.$broadcast("update_map")

        s.loading = true
        s.newDynamicTab()
        s.center = settings.mapCenter
        s.markers = {}
        s.selectedGroups = []
        s.markerGroups = []
        s.mapSettings = { baseLayer: "OpenStreetMap" }
        s.numResults = 0
        s.useClustering = false

        s.promise.then(
            result => {
                s.loading = false
                s.numResults = 20
                s.markerGroups = getMarkerGroups(result)
                s.selectedGroups = _.keys(s.markerGroups)
            },
            err => {
                console.error("Map data parsing failed:", err)
                s.loading = false
                s.error = true
            }
        )

        s.toggleMarkerGroup = function(groupName) {
            s.markerGroups[groupName].selected = !s.markerGroups[groupName].selected
            if (s.selectedGroups.includes(groupName)) {
                return s.selectedGroups.splice(s.selectedGroups.indexOf(groupName), 1)
            } else {
                return s.selectedGroups.push(groupName)
            }
        }

        var getMarkerGroups = function(result) {
            const palette = new Rickshaw.Color.Palette({ scheme: "colorwheel" }) // spectrum2000
            const groups = {}
            _.map(
                result.data,
                (res, idx) =>
                    (groups[res.label] = {
                        selected: true,
                        order: idx,
                        color: palette.color(),
                        markers: getMarkers(
                            result.attribute.label,
                            result.cqp,
                            result.corpora,
                            result.within,
                            res,
                            idx
                        )
                    })
            )
            s.restColor = "#9b9fa5"
            return groups
        }

        var getMarkers = function(label, cqp, corpora, within, res, idx) {
            const markers = {}

            for (let point of res.points) {
                const id = point.name.replace(/-/g, "") + idx
                markers[id] = {
                    lat: point.lat,
                    lng: point.lng,
                    queryData: {
                        searchCqp: cqp,
                        subCqp: res.cqp,
                        label,
                        corpora,
                        within
                    },
                    label: res.label,
                    point
                }
            }

            return markers
        }

        s.newKWICSearch = function(marker) {
            const { queryData } = marker
            const { point } = marker
            const cl = settings.corpusListing.subsetFactory(queryData.corpora)
            const numberOfTokens = queryData.subCqp.split("[").length - 1
            const opts = {
                start: 0,
                end: 24,
                ajaxParams: {
                    command: "query",
                    cqp: queryData.searchCqp,
                    cqp2: `[_.${queryData.label} contains '${[
                        point.name,
                        point.countryCode,
                        point.lat,
                        point.lng
                    ].join(";")}']{${numberOfTokens}}`,
                    cqp3: queryData.subCqp,
                    corpus: cl.stringifySelected(),
                    show_struct: _.keys(cl.getStructAttrs()),
                    expand_prequeries: false
                }
            }
            _.extend(opts.ajaxParams, queryData.within)
            $timeout(
                () =>
                    $rootScope.kwicTabs.push({
                        readingMode: queryData.label === "paragraph__geocontext",
                        queryParams: opts
                    }),
                0
            )
        }
        
        s.closeTab = function(idx, e) {
            e.preventDefault()
            s.mapTabs.splice(idx, 1)
            s.closeDynamicTab()
        }
    }
}))
