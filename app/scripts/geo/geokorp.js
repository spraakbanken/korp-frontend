/** @format */
import { html } from "@/util"
import angular from "angular"

const sbMap = angular.module("sbMap", [])

sbMap.filter("trust", ($sce) => (input) => $sce.trustAsHtml(input))

sbMap.directive("sbMap", [
    "$compile",
    "$timeout",
    "$rootScope",
    ($compile, $timeout, $rootScope) => ({
        template: html`<div class="map">
            <div class="map-outer-container" ng-show="showMap">
                <div class="map-container"></div>
            </div>
            <div class="hover-info-container" style="opacity:0;display:none;"></div>
        </div>`,
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
            const container = angular.element(element.find(".map-container")).first()
            scope.map = L.map(container, {
                minZoom: 1,
                maxZoom: 13,
            }).setView([51.505, -0.09], 13)
            scope.selectedMarkers = []
            scope.$on("update_map", function () {
                return $timeout(function () {
                    return scope.map.invalidateSize()
                }, 0)
            })
            function createCircleMarker(color, diameter, borderRadius) {
                return L.divIcon({
                    html: html`<div
                        class="geokorp-marker"
                        style="border-radius:${borderRadius}px; height:${diameter}px; background-color:${color}"
                    ></div>`,
                    iconSize: new L.Point(diameter, diameter),
                })
            }
            function createMarkerIcon(color, cluster) {
                // TODO use scope.maxRel, but scope.maxRel is not set when markers are created
                // diameter = ((relSize / scope.maxRel) * 45) + 5
                return createCircleMarker(color, 10, cluster ? 1 : 5)
            }
            function createMultiMarkerIcon(markerData) {
                /** @type {[number, string][]} */
                const elements = []
                for (let i = 0; i < markerData.length; i++) {
                    const marker = markerData[i]
                    const diameter = (marker.point.rel / scope.maxRel) * 40 + 10
                    elements.push([
                        diameter,
                        html`<div
                            class="geokorp-multi-marker"
                            style="border-radius:${diameter}px; height:${diameter}px; width:${diameter}px; background-color:${marker.color}"
                        ></div>`,
                    ])
                }

                elements.sort((element1, element2) => element1[0] - element2[0])

                const gridSizeRaw = Math.ceil(Math.sqrt(elements.length)) + 1
                const gridSize = gridSizeRaw % 2 === 0 ? gridSizeRaw + 1 : gridSizeRaw
                const center = Math.floor(gridSize / 2)

                /** @type {([number, string][] | [])[]} */
                let grid = []
                for (let i = 0; i <= gridSize - 1; i++) grid.push([])

                const id = (x) => x
                const neg = (x) => -x
                for (let idx = 0; idx <= center; idx++) {
                    let x = -1
                    let y = -1
                    let xOp = neg
                    let yOp = neg
                    const stop = idx === 0 ? 0 : idx * 4 - 1
                    for (let j = 0; j <= stop; ++j) {
                        x = x === -1 ? center + idx : x + xOp(1)
                        y = y === -1 ? center : y + yOp(1)
                        if (x === center - idx) xOp = id
                        if (y === center - idx) yOp = id
                        if (x === center + idx) xOp = neg
                        if (y === center + idx) yOp = neg
                        const circle = elements.pop()
                        if (circle) {
                            grid[y][x] = circle
                        } else {
                            break
                        }
                    }
                }
                // remove all empty arrays and elements
                // TODO don't create empty stuff??
                grid = grid.filter((row) => row.length > 0)
                grid = grid.map((row) => row.filter((elem) => elem))

                //# take largest element from each row and add to height
                let height = 0
                let width = 0
                const gridCenter = Math.floor(grid.length / 2)

                /** @type {string[]} */
                const grid2 = []
                for (let idx = 0; idx < grid.length; ++idx) {
                    const row = grid[idx]
                    height += row.reduce((memo, val) => (val[0] > memo ? val[0] : memo), 0)
                    if (idx === gridCenter) {
                        width = grid[gridCenter].reduce((memo, val) => memo + val[0], 0)
                    }
                    const markerClass =
                        idx === gridCenter ? "marker-middle" : idx > gridCenter ? "marker-top" : "marker-bottom"
                    grid2.push(
                        html`<div class="${markerClass}" style="text-align:center; line-height:0;">
                            ${row.map((elem) => elem[1]).join("")}
                        </div>`
                    )
                }
                return L.divIcon({
                    html: grid2.join(""),
                    iconSize: new L.Point(width, height),
                })
            }

            // use the previously calculated "scope.maxRel" to decide the sizes of the bars
            // in the cluster icon that is returned (between 5px and 50px)
            /**
             * @param clusterGroups {Record<string, {order: number}>}
             * @param restColor {string}
             */
            function createClusterIcon(clusterGroups, restColor) {
                const groups = _.keys(clusterGroups)
                groups.sort((group1, group2) => clusterGroups[group1].order - clusterGroups[group2].order)
                if (groups.length > 4) {
                    groups.splice(3)
                    groups.push(restColor)
                }
                return function (cluster) {
                    /** @type {Record<string, number>} */
                    const sizes = groups.reduce((map, color) => ({ ...map, [color]: 0 }), {})
                    cluster.getAllChildMarkers().forEach((childMarker) => {
                        let color = childMarker.markerData.color
                        if (!(color in sizes)) color = restColor
                        sizes[color] += childMarker.markerData.point.rel
                    })

                    if (groups.length === 1) {
                        const color = groups[0]
                        const groupSize = sizes[color]
                        const diameter = (groupSize / scope.maxRel) * 45 + 5
                        return createCircleMarker(color, diameter, diameter)
                    }

                    const elements = Object.keys(sizes).map((color) => {
                        const groupSize = sizes[color]
                        const divWidth = (groupSize / scope.maxRel) * 45 + 5
                        return html`<div
                            class="cluster-geokorp-marker"
                            style="height:${divWidth}px; background-color:${color}"
                        ></div>`
                    })
                    return L.divIcon({
                        html: html`<div class="cluster-geokorp-marker-group">${elements.join("")}</div>`,
                        iconSize: new L.Point(40, 50),
                    })
                }
            }
            // check if the cluster with split into several clusters / markers
            // on zooom
            // TODO: does not work in some cases
            function shouldZooomToBounds(cluster) {
                let childClusters = cluster._childClusters.slice()
                const map = cluster._group._map
                const boundsZoom = map.getBoundsZoom(cluster._bounds)
                let zoom = cluster._zoom + 1
                while (childClusters.length > 0 && boundsZoom > zoom) {
                    zoom += 1
                    const newClusters = childClusters.flatMap((childCluster) => childCluster._childClusters)
                    childClusters = newClusters
                }
                return childClusters.length > 1
            }
            // check all current clusters and sum up the sizes of its childen
            // this is the max relative value of any cluster and can be used to
            // calculate marker sizes
            // TODO this needs to use the "rest" group when doing calcuations!!
            function updateMarkerSizes() {
                const bounds = scope.map.getBounds()
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
            function createFeatureLayer() {
                const featureLayer = L.featureGroup()
                featureLayer.on("click", function (e) {
                    if (e.layer.markerData instanceof Array) {
                        scope.selectedMarkers = e.layer.markerData
                    } else {
                        scope.selectedMarkers = [e.layer.markerData]
                    }
                    return mouseOver(scope.selectedMarkers)
                })
                featureLayer.on("mouseover", (e) =>
                    e.layer.markerData instanceof Array
                        ? mouseOver(e.layer.markerData)
                        : mouseOver([e.layer.markerData])
                )
                featureLayer.on("mouseout", (e) =>
                    scope.selectedMarkers.length > 0 ? mouseOver(scope.selectedMarkers) : mouseOut()
                )
                return featureLayer
            }
            // create marker cluster layer and all listeners
            function createMarkerCluster(clusterGroups, restColor) {
                const markerCluster = L.markerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    maxClusterRadius: 40,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: createClusterIcon(clusterGroups, restColor),
                })
                markerCluster.on("clustermouseover", (e) =>
                    mouseOver(_.map(e.layer.getAllChildMarkers(), (layer) => layer.markerData))
                )
                markerCluster.on("clustermouseout", (e) =>
                    scope.selectedMarkers.length > 0 ? mouseOver(scope.selectedMarkers) : mouseOut()
                )
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
                markerCluster.on("mouseover", (e) => mouseOver([e.layer.markerData]))
                markerCluster.on("mouseout", (e) =>
                    scope.selectedMarkers.length > 0 ? mouseOver(scope.selectedMarkers) : mouseOut()
                )
                markerCluster.on("animationend", (e) => updateMarkerSizes())
                return markerCluster
            }
            // takes a list of markers and displays clickable (callback determined by directive user) info boxes
            function mouseOver(markerData) {
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
                            markerDiv.bind("click", () => scope.markerCallback(marker))
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
            function mouseOut() {
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
            scope.$watchCollection("selectedGroups", () => updateMarkers())
            scope.$watch("useClustering", (newVal, oldVal) => newVal === !oldVal && updateMarkers())
            function updateMarkers() {
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
            function mergeMarkers(markerLists) {
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
            L.tileLayer.provider("OpenStreetMap").addTo(scope.map)
            scope.map.setView([scope.center.lat, scope.center.lng], scope.center.zoom)
            return (scope.showMap = true)
        },
    }),
])
