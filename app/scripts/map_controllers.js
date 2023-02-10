/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("mapCtrl", [
    "$timeout",
    ($timeout) => ({
        controller: [
            "$scope",
            "$rootScope",
            ($scope, $rootScope) => {
                const s = $scope

                s.onentry = () => s.$broadcast("update_map")

                s.loading = true
                s.newDynamicTab()
                s.center = settings["map_center"]
                s.markers = {}
                s.selectedGroups = []
                s.markerGroups = []
                s.mapSettings = { baseLayer: "OpenStreetMap" }
                s.numResults = 0
                s.useClustering = false

                if (!window.Rickshaw) {
                    var rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
                }

                Promise.all([rickshawPromise || Rickshaw, s.promise]).then(
                    ([rickshawModule, result]) => {
                        window.Rickshaw = rickshawModule
                        s.$apply(($scope) => {
                            $scope.loading = false
                            $scope.numResults = 20
                            $scope.markerGroups = getMarkerGroups(result)
                            $scope.selectedGroups = _.keys($scope.markerGroups)
                        })
                    },
                    (err) => {
                        console.error("Map data parsing failed:", err)
                        this.s.$apply(($scope) => {
                            $scope.loading = false
                            $scope.error = true
                        })
                    }
                )

                s.toggleMarkerGroup = function (groupName) {
                    s.markerGroups[groupName].selected = !s.markerGroups[groupName].selected
                    if (s.selectedGroups.includes(groupName)) {
                        return s.selectedGroups.splice(s.selectedGroups.indexOf(groupName), 1)
                    } else {
                        return s.selectedGroups.push(groupName)
                    }
                }

                var getMarkerGroups = function (result) {
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
                                ),
                            })
                    )
                    s.restColor = "#9b9fa5"
                    return groups
                }

                var getMarkers = function (label, cqp, corpora, within, res, idx) {
                    const markers = {}

                    for (let [pointIdx, point] of res.points.entries()) {
                        // Include point index in the key, so that multiple
                        // places with the same name but different coordinates
                        // each get their own markers
                        const id = [point.name.replace(/-/g, ""), pointIdx.toString(), idx].join(":")
                        markers[id] = {
                            lat: point.lat,
                            lng: point.lng,
                            queryData: {
                                searchCqp: cqp,
                                subCqp: res.cqp,
                                label,
                                corpora,
                                within,
                            },
                            label: res.label,
                            point,
                        }
                    }

                    return markers
                }

                s.newKWICSearch = function (marker) {
                    const { queryData } = marker
                    const { point } = marker
                    const cl = settings.corpusListing.subsetFactory(queryData.corpora)
                    const numberOfTokens = queryData.subCqp.split("[").length - 1
                    const opts = {
                        start: 0,
                        end: 24,
                        ajaxParams: {
                            cqp: queryData.searchCqp,
                            cqp2: `[_.${queryData.label} contains "${regescape(
                                [point.name, point.countryCode, point.lat, point.lng].join(";")
                            )}"]{${numberOfTokens}}`,
                            cqp3: queryData.subCqp,
                            corpus: cl.stringifySelected(),
                            show_struct: _.keys(cl.getStructAttrs()),
                            expand_prequeries: false,
                        },
                    }
                    _.extend(opts.ajaxParams, queryData.within)
                    $timeout(
                        () =>
                            $rootScope.kwicTabs.push({
                                readingMode: queryData.label === "paragraph__geocontext",
                                queryParams: opts,
                            }),
                        0
                    )
                }

                s.closeTab = function (idx, e) {
                    e.preventDefault()
                    s.mapTabs.splice(idx, 1)
                    s.closeDynamicTab()
                }
            },
        ],
    }),
])
