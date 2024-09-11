/** @format */
import { html } from "@/util"
import angular from "angular"

const sbMap = angular.module("sbMap", ["sbMapTemplate"])

sbMap.filter("trust", function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input)
    }
})

sbMap.directive("sbMap", [
    "$compile",
    "$timeout",
    "$rootScope",
    ($compile, $timeout, $rootScope) => ({
        templateUrl: "template/sb_map.html",
        restrict: "E",
        scope: {
            markers: "=sbMarkers",
            center: "=sbCenter",
            baseLayer: "=sbBaseLayer",
            markerCallback: "=sbMarkerCallback",
            selectedGroups: "=sbSelectedGroups",
            useClustering: "=?sbUseClustering",
            restColor: "=?sbRestColor", // free color to use for grouping etc
            oldMap: "=?sbOldMap",
        },
        link(scope, element, attrs) {
            var createCircleMarker,
                createClusterIcon,
                createFeatureLayer,
                createMarkerCluster,
                createMarkerIcon,
                createMultiMarkerIcon,
                map,
                mergeMarkers,
                mouseOut,
                mouseOver,
                openStreetMap,
                shouldZooomToBounds,
                updateMarkerSizes,
                updateMarkers
            scope.useClustering = angular.isDefined(scope.useClustering) ? scope.useClustering : true
            scope.oldMap = angular.isDefined(scope.oldMap) ? scope.oldMap : false
            scope.showMap = false
            scope.hoverTemplate = html`<div class="hover-info">
                <div ng-if="showLabel" class="swatch" style="background-color: {{color}}"></div>
                <div
                    ng-if="showLabel"
                    ng-bind-html="label | trust"
                    style="display: inline; font-weight: bold; font-size: 15px"
                ></div>
                <div><span>{{ 'map_name' | loc }}: </span> <span>{{point.name}}</span></div>
                <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{point.abs}}</span></div>
                <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{point.rel | number:2}}</span></div>
            </div>`
            map = angular.element(element.find(".map-container"))
            scope.map = L.map(map[0], {
                minZoom: 1,
                maxZoom: 13,
            }).setView([51.505, -0.09], 13)
            scope.selectedMarkers = []
            scope.$on("update_map", function () {
                return $timeout(function () {
                    return scope.map.invalidateSize()
                }, 0)
            })
            createCircleMarker = function (color, diameter, borderRadius) {
                return L.divIcon({
                    html:
                        '<div class="geokorp-marker" style="border-radius:' +
                        borderRadius +
                        "px;height:" +
                        diameter +
                        "px;background-color:" +
                        color +
                        '"></div>',
                    iconSize: new L.Point(diameter, diameter),
                })
            }
            createMarkerIcon = function (color, cluster) {
                // TODO use scope.maxRel, but scope.maxRel is not set when markers are created
                // diameter = ((relSize / scope.maxRel) * 45) + 5
                return createCircleMarker(color, 10, cluster ? 1 : 5)
            }
            createMultiMarkerIcon = function (markerData) {
                var center,
                    circle,
                    color,
                    diameter,
                    elements,
                    grid,
                    gridSize,
                    height,
                    i,
                    id,
                    idx,
                    j,
                    marker,
                    markerClass,
                    neg,
                    ref,
                    ref1,
                    row,
                    something,
                    stop,
                    width,
                    x,
                    xOp,
                    y,
                    yOp
                elements = (function () {
                    var i, len, results
                    results = []
                    for (i = 0, len = markerData.length; i < len; i++) {
                        marker = markerData[i]
                        color = marker.color
                        diameter = (marker.point.rel / scope.maxRel) * 40 + 10
                        results.push([
                            diameter,
                            '<div class="geokorp-multi-marker" style="border-radius:' +
                                diameter +
                                "px;height:" +
                                diameter +
                                "px;width:" +
                                diameter +
                                "px;background-color:" +
                                color +
                                '"></div>',
                        ])
                    }
                    return results
                })()
                elements.sort(function (element1, element2) {
                    return element1[0] - element2[0]
                })
                gridSize = Math.ceil(Math.sqrt(elements.length)) + 1
                gridSize = gridSize % 2 === 0 ? gridSize + 1 : gridSize
                center = Math.floor(gridSize / 2)
                grid = (function () {
                    var i, ref, results
                    results = []
                    for (x = i = 0, ref = gridSize - 1; 0 <= ref ? i <= ref : i >= ref; x = 0 <= ref ? ++i : --i) {
                        results.push([])
                    }
                    return results
                })()
                id = function (x) {
                    return x
                }
                neg = function (x) {
                    return -x
                }
                for (idx = i = 0, ref = center; 0 <= ref ? i <= ref : i >= ref; idx = 0 <= ref ? ++i : --i) {
                    x = -1
                    y = -1
                    xOp = neg
                    yOp = neg
                    stop = idx === 0 ? 0 : idx * 4 - 1
                    for (
                        something = j = 0, ref1 = stop;
                        0 <= ref1 ? j <= ref1 : j >= ref1;
                        something = 0 <= ref1 ? ++j : --j
                    ) {
                        if (x === -1) {
                            x = center + idx
                        } else {
                            x = x + xOp(1)
                        }
                        if (y === -1) {
                            y = center
                        } else {
                            y = y + yOp(1)
                        }
                        if (x === center - idx) {
                            xOp = id
                        }
                        if (y === center - idx) {
                            yOp = id
                        }
                        if (x === center + idx) {
                            xOp = neg
                        }
                        if (y === center + idx) {
                            yOp = neg
                        }
                        circle = elements.pop()
                        if (circle) {
                            grid[y][x] = circle
                        } else {
                            break
                        }
                    }
                }
                // remove all empty arrays and elements
                // TODO don't create empty stuff??
                grid = _.filter(grid, function (row) {
                    return row.length > 0
                })
                grid = _.map(grid, function (row) {
                    return (row = _.filter(row, function (elem) {
                        return elem
                    }))
                })
                //# take largest element from each row and add to height
                height = 0
                width = 0
                center = Math.floor(grid.length / 2)
                grid = (function () {
                    var k, len, results
                    results = []
                    for (idx = k = 0, len = grid.length; k < len; idx = ++k) {
                        row = grid[idx]
                        height =
                            height +
                            _.reduce(
                                row,
                                function (memo, val) {
                                    if (val[0] > memo) {
                                        return val[0]
                                    } else {
                                        return memo
                                    }
                                },
                                0
                            )
                        if (idx < center) {
                            markerClass = "marker-bottom"
                        }
                        if (idx === center) {
                            width = _.reduce(
                                grid[center],
                                function (memo, val) {
                                    return memo + val[0]
                                },
                                0
                            )
                            markerClass = "marker-middle"
                        }
                        if (idx > center) {
                            markerClass = "marker-top"
                        }
                        results.push(
                            '<div class="' +
                                markerClass +
                                '" style="text-align: center;line-height: 0;">' +
                                _.map(row, function (elem) {
                                    return elem[1]
                                }).join("") +
                                "</div>"
                        )
                    }
                    return results
                })()
                return L.divIcon({
                    html: grid.join(""),
                    iconSize: new L.Point(width, height),
                })
            }
            // use the previously calculated "scope.maxRel" to decide the sizes of the bars
            // in the cluster icon that is returned (between 5px and 50px)
            createClusterIcon = function (clusterGroups, restColor) {
                var allGroups, visibleGroups
                allGroups = _.keys(clusterGroups)
                visibleGroups = allGroups.sort(function (group1, group2) {
                    return clusterGroups[group1].order - clusterGroups[group2].order
                })
                if (allGroups.length > 4) {
                    visibleGroups = visibleGroups.splice(0, 3)
                    visibleGroups.push(restColor)
                }
                return function (cluster) {
                    var child,
                        color,
                        diameter,
                        divWidth,
                        elements,
                        group,
                        groupSize,
                        i,
                        j,
                        k,
                        len,
                        len1,
                        len2,
                        ref,
                        ref1,
                        rel,
                        sizes
                    sizes = {}
                    for (i = 0, len = visibleGroups.length; i < len; i++) {
                        group = visibleGroups[i]
                        sizes[group] = 0
                    }
                    ref = cluster.getAllChildMarkers()
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        child = ref[j]
                        color = child.markerData.color
                        if (!(color in sizes)) {
                            color = restColor
                        }
                        rel = child.markerData.point.rel
                        sizes[color] = sizes[color] + rel
                    }
                    if (allGroups.length === 1) {
                        color = _.keys(sizes)[0]
                        groupSize = sizes[color]
                        diameter = (groupSize / scope.maxRel) * 45 + 5
                        return createCircleMarker(color, diameter, diameter)
                    } else {
                        elements = ""
                        ref1 = _.keys(sizes)
                        for (k = 0, len2 = ref1.length; k < len2; k++) {
                            color = ref1[k]
                            groupSize = sizes[color]
                            divWidth = (groupSize / scope.maxRel) * 45 + 5
                            elements =
                                elements +
                                '<div class="cluster-geokorp-marker" style="height:' +
                                divWidth +
                                "px;background-color:" +
                                color +
                                '"></div>'
                        }
                        return L.divIcon({
                            html: '<div class="cluster-geokorp-marker-group">' + elements + "</div>",
                            iconSize: new L.Point(40, 50),
                        })
                    }
                }
            }
            // check if the cluster with split into several clusters / markers
            // on zooom
            // TODO: does not work in some cases
            shouldZooomToBounds = function (cluster) {
                var boundsZoom, childCluster, childClusters, i, len, newClusters, zoom
                childClusters = cluster._childClusters.slice()
                map = cluster._group._map
                boundsZoom = map.getBoundsZoom(cluster._bounds)
                zoom = cluster._zoom + 1
                while (childClusters.length > 0 && boundsZoom > zoom) {
                    zoom = zoom + 1
                    newClusters = []
                    for (i = 0, len = childClusters.length; i < len; i++) {
                        childCluster = childClusters[i]
                        newClusters = newClusters.concat(childCluster._childClusters)
                    }
                    childClusters = newClusters
                }
                return childClusters.length > 1
            }
            // check all current clusters and sum up the sizes of its childen
            // this is the max relative value of any cluster and can be used to
            // calculate marker sizes
            // TODO this needs to use the "rest" group when doing calcuations!!
            updateMarkerSizes = function () {
                var bounds
                bounds = scope.map.getBounds()
                scope.maxRel = 0
                if (scope.useClustering && scope.markerCluster) {
                    scope.map.eachLayer(function (layer) {
                        var child, color, i, j, len, len1, ref, ref1, rel, results, sumRel, sumRels
                        if (layer.getChildCount) {
                            sumRels = {}
                            ref = layer.getAllChildMarkers()
                            for (i = 0, len = ref.length; i < len; i++) {
                                child = ref[i]
                                color = child.markerData.color
                                if (!sumRels[color]) {
                                    sumRels[color] = 0
                                }
                                sumRels[color] = sumRels[color] + child.markerData.point.rel
                            }
                            ref1 = _.values(sumRels)
                            results = []
                            for (j = 0, len1 = ref1.length; j < len1; j++) {
                                sumRel = ref1[j]
                                if (sumRel > scope.maxRel) {
                                    results.push((scope.maxRel = sumRel))
                                } else {
                                    results.push(void 0)
                                }
                            }
                            return results
                        } else if (layer.markerData) {
                            rel = layer.markerData.point.rel
                            if (rel > scope.maxRel) {
                                return (scope.maxRel = rel)
                            }
                        }
                    })
                    return scope.markerCluster.refreshClusters()
                }
            }
            // TODO when scope.maxRel is set, we should redraw all non-cluster markers using this

            // create normal layer (and all listeners) to be used when clustering is not enabled
            createFeatureLayer = function () {
                var featureLayer
                featureLayer = L.featureGroup()
                featureLayer.on("click", function (e) {
                    if (e.layer.markerData instanceof Array) {
                        scope.selectedMarkers = e.layer.markerData
                    } else {
                        scope.selectedMarkers = [e.layer.markerData]
                    }
                    return mouseOver(scope.selectedMarkers)
                })
                featureLayer.on("mouseover", function (e) {
                    if (e.layer.markerData instanceof Array) {
                        return mouseOver(e.layer.markerData)
                    } else {
                        return mouseOver([e.layer.markerData])
                    }
                })
                featureLayer.on("mouseout", function (e) {
                    if (scope.selectedMarkers.length > 0) {
                        return mouseOver(scope.selectedMarkers)
                    } else {
                        return mouseOut()
                    }
                })
                return featureLayer
            }
            // create marker cluster layer and all listeners
            createMarkerCluster = function (clusterGroups, restColor) {
                var markerCluster
                markerCluster = L.markerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    maxClusterRadius: 40,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: createClusterIcon(clusterGroups, restColor),
                })
                markerCluster.on("clustermouseover", function (e) {
                    return mouseOver(
                        _.map(e.layer.getAllChildMarkers(), function (layer) {
                            return layer.markerData
                        })
                    )
                })
                markerCluster.on("clustermouseout", function (e) {
                    if (scope.selectedMarkers.length > 0) {
                        return mouseOver(scope.selectedMarkers)
                    } else {
                        return mouseOut()
                    }
                })
                markerCluster.on("clusterclick", function (e) {
                    scope.selectedMarkers = _.map(e.layer.getAllChildMarkers(), function (layer) {
                        return layer.markerData
                    })
                    mouseOver(scope.selectedMarkers)
                    if (shouldZooomToBounds(e.layer)) {
                        return e.layer.zoomToBounds()
                    }
                })
                markerCluster.on("click", function (e) {
                    scope.selectedMarkers = [e.layer.markerData]
                    return mouseOver(scope.selectedMarkers)
                })
                markerCluster.on("mouseover", function (e) {
                    return mouseOver([e.layer.markerData])
                })
                markerCluster.on("mouseout", function (e) {
                    if (scope.selectedMarkers.length > 0) {
                        return mouseOver(scope.selectedMarkers)
                    } else {
                        return mouseOut()
                    }
                })
                markerCluster.on("animationend", function (e) {
                    return updateMarkerSizes()
                })
                return markerCluster
            }
            // takes a list of markers and displays clickable (callback determined by directive user) info boxes
            mouseOver = function (markerData) {
                return $timeout(function () {
                    return scope.$apply(function () {
                        var compiled,
                            content,
                            hoverInfoElem,
                            i,
                            len,
                            marker,
                            markerDiv,
                            msgScope,
                            name,
                            oldMap,
                            selectedMarkers
                        content = []
                        // support for "old" map
                        oldMap = false
                        if (markerData[0].names) {
                            oldMap = true
                            selectedMarkers = (function () {
                                var i, len, ref, results
                                ref = _.keys(markerData[0].names)
                                results = []
                                for (i = 0, len = ref.length; i < len; i++) {
                                    name = ref[i]
                                    results.push({
                                        color: markerData[0].color,
                                        searchCqp: markerData[0].searchCqp,
                                        point: {
                                            name: name,
                                            abs: markerData[0].names[name].abs_occurrences,
                                            rel: markerData[0].names[name].rel_occurrences,
                                        },
                                    })
                                }
                                return results
                            })()
                        } else {
                            markerData.sort(function (markerData1, markerData2) {
                                return markerData2.point.rel - markerData1.point.rel
                            })
                            selectedMarkers = markerData
                        }
                        for (i = 0, len = selectedMarkers.length; i < len; i++) {
                            marker = selectedMarkers[i]
                            msgScope = $rootScope.$new(true)
                            msgScope.showLabel = !oldMap
                            msgScope.point = marker.point
                            msgScope.label = marker.label
                            msgScope.color = marker.color
                            compiled = $compile(scope.hoverTemplate)
                            markerDiv = compiled(msgScope)
                            ;(function (marker) {
                                return markerDiv.bind("click", function () {
                                    return scope.markerCallback(marker)
                                })
                            })(marker)
                            content.push(markerDiv)
                        }
                        hoverInfoElem = angular.element(element.find(".hover-info-container"))
                        hoverInfoElem.empty()
                        hoverInfoElem.append(content)
                        hoverInfoElem[0].scrollTop = 0
                        hoverInfoElem.css("opacity", "1")
                        return hoverInfoElem.css("display", "block")
                    })
                }, 0)
            }
            mouseOut = function () {
                var hoverInfoElem
                hoverInfoElem = angular.element(element.find(".hover-info-container"))
                hoverInfoElem.css("opacity", "0")
                return hoverInfoElem.css("display", "none")
            }
            scope.showHoverInfo = false
            scope.map.on("click", function (e) {
                scope.selectedMarkers = []
                return mouseOut()
            })
            scope.$watchCollection("selectedGroups", function (selectedGroups) {
                return updateMarkers()
            })
            scope.$watch("useClustering", function (newVal, oldVal) {
                if (newVal === !oldVal) {
                    return updateMarkers()
                }
            })
            updateMarkers = function () {
                var clusterGroups,
                    color,
                    group,
                    groupData,
                    i,
                    j,
                    k,
                    l,
                    len,
                    len1,
                    len2,
                    len3,
                    marker,
                    markerData,
                    markerGroup,
                    markerGroupId,
                    marker_id,
                    markers,
                    ref,
                    ref1,
                    selectedGroups
                selectedGroups = scope.selectedGroups
                markers = scope.markers
                if (scope.markerCluster) {
                    scope.map.removeLayer(scope.markerCluster)
                }
                if (scope.featureLayer) {
                    scope.map.removeLayer(scope.featureLayer)
                }
                if (scope.useClustering) {
                    clusterGroups = {}
                    for (i = 0, len = selectedGroups.length; i < len; i++) {
                        group = selectedGroups[i]
                        groupData = markers[group]
                        clusterGroups[groupData.color] = {
                            order: groupData.order,
                        }
                    }
                    scope.markerCluster = createMarkerCluster(clusterGroups, scope.restColor)
                    scope.map.addLayer(scope.markerCluster)
                } else {
                    scope.featureLayer = createFeatureLayer()
                    scope.map.addLayer(scope.featureLayer)
                }
                if (scope.useClustering || scope.oldMap) {
                    for (j = 0, len1 = selectedGroups.length; j < len1; j++) {
                        markerGroupId = selectedGroups[j]
                        markerGroup = markers[markerGroupId]
                        color = markerGroup.color
                        scope.maxRel = 0
                        ref = _.keys(markerGroup.markers)
                        for (k = 0, len2 = ref.length; k < len2; k++) {
                            marker_id = ref[k]
                            markerData = markerGroup.markers[marker_id]
                            markerData.color = color
                            marker = L.marker([markerData.lat, markerData.lng], {
                                icon: createMarkerIcon(color, !scope.oldMap && selectedGroups.length !== 1),
                            })
                            marker.markerData = markerData
                            if (scope.useClustering) {
                                scope.markerCluster.addLayer(marker)
                            } else {
                                scope.featureLayer.addLayer(marker)
                            }
                        }
                    }
                } else {
                    markers = (function () {
                        var l, len3, results
                        results = []
                        for (l = 0, len3 = selectedGroups.length; l < len3; l++) {
                            markerGroupId = selectedGroups[l]
                            results.push(markers[markerGroupId])
                        }
                        return results
                    })()
                    ref1 = mergeMarkers(_.values(markers))
                    for (l = 0, len3 = ref1.length; l < len3; l++) {
                        markerData = ref1[l]
                        marker = L.marker([markerData.lat, markerData.lng], {
                            icon: createMultiMarkerIcon(markerData.markerData),
                        })
                        marker.markerData = markerData.markerData
                        scope.featureLayer.addLayer(marker)
                    }
                }
                return updateMarkerSizes()
            }
            // merge lists of markers into one list with several hits in one marker
            // also calculate maxRel
            mergeMarkers = function (markerLists) {
                var val
                scope.maxRel = 0
                val = _.reduce(
                    markerLists,
                    function (memo, val) {
                        var latLng, markerData, markerId, ref
                        ref = val.markers
                        for (markerId in ref) {
                            markerData = ref[markerId]
                            markerData.color = val.color
                            latLng = markerData.lat + "," + markerData.lng
                            if (markerData.point.rel > scope.maxRel) {
                                scope.maxRel = markerData.point.rel
                            }
                            if (latLng in memo) {
                                memo[latLng].markerData.push(markerData)
                            } else {
                                memo[latLng] = {
                                    markerData: [markerData],
                                }
                                memo[latLng].lat = markerData.lat
                                memo[latLng].lng = markerData.lng
                            }
                        }
                        return memo
                    },
                    {}
                )
                return _.values(val)
            }
            // Load map layer with leaflet-providers
            openStreetMap = L.tileLayer.provider("OpenStreetMap")
            openStreetMap.addTo(scope.map)
            scope.map.setView([scope.center.lat, scope.center.lng], scope.center.zoom)
            return (scope.showMap = true)
        },
    }),
])
