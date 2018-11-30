/** @format */
/* eslint-disable
    no-return-assign,
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS201: Simplify complex destructure assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
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
                    return (s.loading = false)
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
                    currentCqp !== (s.lastSearch != null ? s.lastSearch.cqp : undefined) ||
                    searchCorpora !== (s.lastSearch != null ? s.lastSearch.corpora : undefined)
                ) {
                    return (s.hasResult = false)
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

        s.hoverTemplate = `<div class="hover-info" ng-repeat="(name, values) in names">
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
                return (s.hasResult = true)
            }
        })

        s.countCorpora = () =>
            __guard__(
                s.proxy != null ? s.proxy.prevParams : undefined,
                x => x.corpus.split(",").length
            )

        const fixData = function(data) {
            const fixedData = {}
            const abs = data.total.absolute
            const rel = data.total.relative
            const names = _.keys(abs)
            for (let name of Array.from(names)) {
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
                    return markers(fixedData).then(function(markers) {
                        s.markers = { all: { markers: markers, color: palette.color() } }
                        s.selectedGroups = ["all"]
                        s.numResults = _.keys(markers).length
                        return (s.loading = false)
                    })
                } else {
                    s.selectedGroups = []
                    s.markers = {}
                    s.numResults = 0
                    return (s.loading = false)
                }
            })

        const createCqp2Fun = function() {
            const posTags = Array.from(settings.mapPosTag).map(posTag => `pos='${posTag}'`)
            const nameMatching = `(${posTags.join(" | ")})`
            return name => `[word='${name}' & ${nameMatching}]`
        }
        const getCqp2 = createCqp2Fun()

        return (s.newKWICSearch = function(marker) {
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
            return $rootScope.kwicTabs.push({ queryParams: opts })
        })
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
            (...args) => {
                const [result] = Array.from(args[0])
                const xhr = args[1]
                s.loading = false
                s.numResults = 20
                s.markerGroups = getMarkerGroups(result)
                return (s.selectedGroups = _.keys(s.markerGroups))
            },
            () => {
                s.loading = false
                return (s.error = true)
            }
        )

        s.toggleMarkerGroup = function(groupName) {
            s.markerGroups[groupName].selected = !s.markerGroups[groupName].selected
            if (Array.from(s.selectedGroups).includes(groupName)) {
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

            for (let point of Array.from(res.points)) {
                ;(function(point) {
                    const id = point.name.replace(/-/g, "") + idx
                    return (markers[id] = {
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
                    })
                })(point)
            }

            return markers
        }

        return (s.newKWICSearch = function(marker) {
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
            return $timeout(
                () =>
                    $rootScope.kwicTabs.push({
                        readingMode: queryData.label === "paragraph__geocontext",
                        queryParams: opts
                    }),
                0
            )
        })
    }
}))

function __guard__(value, transform) {
    return typeof value !== "undefined" && value !== null ? transform(value) : undefined
}
