/** @format */
import _ from "lodash"
import angular, { ICompileService, IController, IRootElementService, IScope, ITimeoutService } from "angular"
import L from "leaflet"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import "@/../styles/map.scss"
import { AppSettings } from "@/settings/app-settings.types"
import { WithinParameters } from "@/backend/types"
import { Point } from "@/map_services"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet-providers"

type ResultMapController = IController & {
    center: AppSettings["map_center"]
    markers: Record<string, MarkerGroup>
    markerCallback: (marker: MarkerEvent) => void
    selectedGroups: string[]
    restColor: string
    useClustering: boolean
}

type ResultMapScope = IScope & {
    showMap: boolean
}

export type MarkerGroup = {
    selected: boolean
    order: number
    color: string
    markers: Record<string, Marker>
}

export type Marker = MarkerEvent & {
    lat: number
    lng: number
    label: string
}

export type MarkerEvent = {
    point: Point
    queryData: MarkerQueryData
}

/** Needed for making a sub-search */
export type MarkerQueryData = {
    searchCqp: string
    subCqp: string
    label: string
    corpora: string[]
    within: WithinParameters
}

type CustomMarker = L.Marker & {
    markerData: MarkerData
}

type CustomMarkerMany = L.Marker & {
    markerData: MarkerData[]
}

type MarkerData = MarkerEvent & {
    label: string
    color: string
}

type MergedMarker = {
    markerData: MarkerData[]
    lat: number
    lng: number
}

type MessageScope = IScope & {
    showLabel?: boolean
    point?: MarkerData["point"]
    label?: string
    color?: string
}

class MarkerClusterGroup extends L.MarkerClusterGroup {
    getAllChildMarkers: () => CustomMarker[]
}

class MarkerCluster extends L.MarkerCluster {
    getAllChildMarkers: () => CustomMarker[]
}

/** Determine if a given layer is a single marker */
const isMarker = <T extends L.Layer>(layer: T | CustomMarker): layer is CustomMarker => "markerData" in layer

/** Determine if a given layer is a cluster marker */
const isMarkerCluster = <T extends L.Layer>(layer: T | MarkerClusterGroup): layer is MarkerClusterGroup =>
    "getChildCount" in layer

angular.module("korpApp").component("resultMap", {
    template: html`<div class="map">
        <div class="map-outer-container" ng-show="showMap">
            <div class="map-container"></div>
        </div>
        <div class="hover-info-container" style="opacity:0;display:none;"></div>
    </div>`,
    bindings: {
        center: "<",
        markers: "<",
        markerCallback: "<",
        selectedGroups: "<",
        restColor: "<", // free color to use for grouping etc
        useClustering: "<",
    },
    controller: [
        "$compile",
        "$element",
        "$scope",
        "$timeout",
        "$rootScope",
        function (
            $compile: ICompileService,
            $element: IRootElementService,
            $scope: ResultMapScope,
            $timeout: ITimeoutService,
            $rootScope: RootScope
        ) {
            const $ctrl = this as ResultMapController

            $scope.showMap = false
            let selectedMarkers: MarkerData[] = []
            let featureLayer: L.FeatureGroup
            let markerCluster: MarkerClusterGroup
            /** Maximum frequency in current result */
            let maxRel = 0

            const useClustering = () => (angular.isDefined($ctrl.useClustering) ? $ctrl.useClustering : true)

            const hoverTemplate = html`<div class="hover-info">
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

            $ctrl.$onChanges = () => {
                updateMarkers()
            }

            const container = $element.find(".map-container")[0]
            const map = L.map(container, {
                minZoom: 1,
                maxZoom: 13,
            }).setView([51.505, -0.09], 13)

            // Load map layer with leaflet-providers
            L.tileLayer.provider("OpenStreetMap").addTo(map)

            $ctrl.$onInit = () => {
                if ($ctrl.center) map.setView([$ctrl.center.lat, $ctrl.center.lng], $ctrl.center.zoom)
                $scope.showMap = true
            }

            $scope.$on("update_map", () => $timeout(() => map.invalidateSize()))

            function createCircleMarker(color: string, diameter: number, borderRadius: number) {
                return L.divIcon({
                    html: html`<div
                        class="geokorp-marker"
                        style="border-radius:${borderRadius}px; height:${diameter}px; background-color:${color}"
                    ></div>`,
                    iconSize: new L.Point(diameter, diameter),
                })
            }

            function createMarkerIcon(color: string, cluster: boolean) {
                // TODO use scope.maxRel, but scope.maxRel is not set when markers are created
                // diameter = ((relSize / scope.maxRel) * 45) + 5
                return createCircleMarker(color, 10, cluster ? 1 : 5)
            }

            /**
             * Organizes several markers at the same location in a 2D grid.
             * Like:
             *    o
             *   oOo
             */
            function createMultiMarkerIcon(markerData: MarkerData[]) {
                const elements = markerData.map((marker) => {
                    const diameter = (marker.point.rel / maxRel) * 40 + 10
                    return [
                        diameter,
                        html`<div
                            class="geokorp-multi-marker"
                            style="border-radius:${diameter}px; height:${diameter}px; width:${diameter}px; background-color:${marker.color}"
                        ></div>`,
                    ] as [number, string]
                })

                elements.sort((a, b) => a[0] - b[0])

                const gridSizeRaw = Math.ceil(Math.sqrt(elements.length)) + 1
                const gridSize = gridSizeRaw % 2 === 0 ? gridSizeRaw + 1 : gridSizeRaw
                const center = Math.floor(gridSize / 2)

                const gridRaw: ([number, string][] | [])[] = []
                for (let i = 0; i <= gridSize - 1; i++) gridRaw.push([])

                const id = (x: number) => x
                const neg = (x: number) => -x
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
                            gridRaw[y][x] = circle
                        } else {
                            break
                        }
                    }
                }
                // remove all empty arrays and elements
                // TODO don't create empty stuff??
                const grid = gridRaw.filter((row) => row.length > 0).map((row) => row.filter((elem) => elem))

                //# take largest element from each row and add to height
                let height = 0
                let width = 0
                const gridCenter = Math.floor(grid.length / 2)

                const rows = grid.map((row, idx) => {
                    height += row.reduce((memo, val) => (val[0] > memo ? val[0] : memo), 0)
                    if (idx === gridCenter) {
                        width = grid[gridCenter].reduce((memo, val) => memo + val[0], 0)
                    }
                    const markerClass =
                        idx === gridCenter ? "marker-middle" : idx > gridCenter ? "marker-top" : "marker-bottom"
                    return html`<div class="${markerClass}" style="text-align:center; line-height:0;">
                        ${row.map((elem) => elem[1]).join("")}
                    </div>`
                })
                return L.divIcon({
                    html: rows.join(""),
                    iconSize: new L.Point(width, height),
                })
            }

            /**
             * use the previously calculated "scope.maxRel" to decide the sizes of the bars
             * in the cluster icon that is returned (between 5px and 50px)
             */
            function createClusterIcon(clusterGroups: Record<string, MarkerGroup>, restColor: string) {
                const groups = Object.keys(clusterGroups)
                groups.sort((group1, group2) => clusterGroups[group1].order - clusterGroups[group2].order)
                if (groups.length > 4) {
                    groups.splice(3)
                    groups.push(restColor)
                }
                return function (cluster: MarkerClusterGroup) {
                    const sizes = _.fromPairs(groups.map((color) => [color, 0]))
                    cluster.getAllChildMarkers().forEach((childMarker: CustomMarker) => {
                        let color = childMarker.markerData.color
                        if (!(color in sizes)) color = restColor
                        sizes[color] += childMarker.markerData.point.rel
                    })

                    if (groups.length === 1) {
                        const color = groups[0]
                        const groupSize = sizes[color]
                        const diameter = (groupSize / maxRel) * 45 + 5
                        return createCircleMarker(color, diameter, diameter)
                    }

                    const elements = _.map(
                        sizes,
                        (size, color) =>
                            html`<div
                                class="cluster-geokorp-marker"
                                style="height:${(size / maxRel) * 45 + 5}px; background-color:${color}"
                            ></div>`
                    )
                    return L.divIcon({
                        html: html`<div class="cluster-geokorp-marker-group">${elements.join("")}</div>`,
                        iconSize: new L.Point(40, 50),
                    })
                }
            }

            /**
             * check if the cluster with split into several clusters / markers on zooom
             * TODO: does not work in some cases
             */
            function shouldZooomToBounds(cluster: any) {
                // This code is a modification of MarkerCluster.zoomToBounds()
                // See https://github.com/Leaflet/Leaflet.markercluster/blob/master/src/MarkerCluster.js
                let childClusters = cluster._childClusters.slice()
                const map = cluster._group._map
                const boundsZoom = map.getBoundsZoom(cluster._bounds)
                let zoom = cluster._zoom + 1
                while (childClusters.length > 0 && boundsZoom > zoom) {
                    zoom += 1
                    const newClusters = childClusters.flatMap((childCluster: any) => childCluster._childClusters)
                    childClusters = newClusters
                }
                return childClusters.length > 1
            }

            /**
             * check all current clusters and sum up the sizes of its childen
             * this is the max relative value of any cluster and can be used to
             * calculate marker sizes
             * TODO this needs to use the "rest" group when doing calcuations!!
             */
            function updateMarkerSizes() {
                maxRel = 0
                if (useClustering() && markerCluster) {
                    map.eachLayer((layer) => {
                        if (isMarkerCluster(layer)) {
                            const sumRels: Record<string, number> = {}
                            for (const child of layer.getAllChildMarkers()) {
                                const color = child.markerData.color
                                if (!sumRels[color]) sumRels[color] = 0
                                sumRels[color] += child.markerData.point.rel
                            }
                            maxRel = Math.max(maxRel, ...Object.values(sumRels))
                        } else if (isMarker(layer)) maxRel = Math.max(maxRel, layer.markerData.point.rel)
                    })
                    return markerCluster.refreshClusters()
                }
            }
            // TODO when scope.maxRel is set, we should redraw all non-cluster markers using this

            /**
             * create normal layer (and all listeners) to be used when clustering is not enabled
             */
            function createFeatureLayer() {
                const featureLayer = L.featureGroup()
                featureLayer.on("click", (e) => {
                    const marker = e.propagatedFrom as CustomMarker | CustomMarkerMany
                    selectedMarkers = marker.markerData instanceof Array ? marker.markerData : [marker.markerData]
                    mouseOver(selectedMarkers)
                })
                featureLayer.on("mouseover", (e) => {
                    const marker = e.propagatedFrom as CustomMarker | CustomMarkerMany
                    marker.markerData instanceof Array ? mouseOver(marker.markerData) : mouseOver([marker.markerData])
                })
                featureLayer.on("mouseout", () =>
                    selectedMarkers.length > 0 ? mouseOver(selectedMarkers) : mouseOut()
                )
                return featureLayer
            }

            /**
             * create marker cluster layer and all listeners
             */
            function createMarkerCluster(
                clusterGroups: Record<string, MarkerGroup>,
                restColor: string
            ): MarkerClusterGroup {
                const markerCluster = L.markerClusterGroup({
                    spiderfyOnMaxZoom: false,
                    showCoverageOnHover: false,
                    maxClusterRadius: 40,
                    zoomToBoundsOnClick: false,
                    iconCreateFunction: createClusterIcon(clusterGroups, restColor) as any,
                }) as MarkerClusterGroup
                markerCluster.on("clustermouseover", (e: { propagatedFrom: MarkerCluster }) =>
                    mouseOver(e.propagatedFrom.getAllChildMarkers().map((layer) => layer.markerData))
                )
                markerCluster.on("clustermouseout", () =>
                    selectedMarkers.length > 0 ? mouseOver(selectedMarkers) : mouseOut()
                )
                markerCluster.on("clusterclick", (e: { propagatedFrom: MarkerCluster }) => {
                    selectedMarkers = e.propagatedFrom.getAllChildMarkers().map((layer) => layer.markerData)
                    mouseOver(selectedMarkers)
                    if (shouldZooomToBounds(e.propagatedFrom)) {
                        return e.propagatedFrom.zoomToBounds()
                    }
                })
                markerCluster.on("click", (e: { propagatedFrom: CustomMarker }) => {
                    selectedMarkers = [e.propagatedFrom.markerData]
                    return mouseOver(selectedMarkers)
                })
                markerCluster.on("mouseover", (e) => mouseOver([e.propagatedFrom.markerData]))
                markerCluster.on("mouseout", (e) =>
                    selectedMarkers.length > 0 ? mouseOver(selectedMarkers) : mouseOut()
                )
                markerCluster.on("animationend", (e) => updateMarkerSizes())
                return markerCluster
            }

            /**
             * takes a list of markers and displays clickable (callback determined by directive user) info boxes
             */
            function mouseOver(markerData: MarkerData[]) {
                return $timeout(() => {
                    return $scope.$apply(() => {
                        markerData.sort((a, b) => b.point.rel - a.point.rel)
                        const selectedMarkers = markerData

                        const content = selectedMarkers.map((marker) => {
                            const msgScope: MessageScope = $rootScope.$new(true)
                            msgScope.showLabel = true
                            msgScope.point = marker.point
                            msgScope.label = marker.label
                            msgScope.color = marker.color
                            const markerDiv = $compile(hoverTemplate)(msgScope)
                            return markerDiv.bind("click", () => $ctrl.markerCallback(marker))
                        })

                        const hoverInfoElem = $element.find(".hover-info-container")
                        hoverInfoElem.empty()
                        hoverInfoElem.append(content)
                        hoverInfoElem[0].scrollTop = 0
                        hoverInfoElem.css("opacity", "1")
                        return hoverInfoElem.css("display", "block")
                    })
                }, 0)
            }

            function mouseOut() {
                const hoverInfoElem = $element.find(".hover-info-container")
                hoverInfoElem.css("opacity", "0")
                return hoverInfoElem.css("display", "none")
            }

            map.on("click", (e) => {
                selectedMarkers = []
                return mouseOut()
            })

            function updateMarkers() {
                if (markerCluster) map.removeLayer(markerCluster)
                if (featureLayer) map.removeLayer(featureLayer)

                if (useClustering()) {
                    const selectedMarkers = $ctrl.selectedGroups.map((group) => $ctrl.markers[group])
                    const clusterGroups = _.keyBy(selectedMarkers, "color")
                    markerCluster = createMarkerCluster(clusterGroups, $ctrl.restColor)
                    map.addLayer(markerCluster)

                    const isCluster = $ctrl.selectedGroups.length !== 1
                    for (const group of $ctrl.selectedGroups) {
                        const markerGroup = $ctrl.markers[group]
                        maxRel = 0
                        Object.values(markerGroup.markers).map((markerOrig) => {
                            const icon = createMarkerIcon(markerGroup.color, isCluster)
                            const marker = L.marker([markerOrig.lat, markerOrig.lng], { icon }) as CustomMarker
                            marker.markerData = {
                                label: markerOrig.label,
                                color: markerGroup.color,
                                point: markerOrig.point,
                                queryData: markerOrig.queryData,
                            }
                            markerCluster.addLayer(marker)
                        })
                    }
                } else {
                    featureLayer = createFeatureLayer()
                    map.addLayer(featureLayer)

                    const markers = $ctrl.selectedGroups.map((group) => $ctrl.markers[group])
                    const markersMerged = mergeMarkers(markers)
                    for (const markerData of markersMerged) {
                        const icon = createMultiMarkerIcon(markerData.markerData)
                        const marker = L.marker([markerData.lat, markerData.lng], { icon }) as CustomMarkerMany
                        marker.markerData = markerData.markerData
                        featureLayer.addLayer(marker)
                    }
                }

                updateMarkerSizes()
            }

            /**
             * merge lists of markers into one list with several hits in one marker
             * also calculate maxRel
             */
            function mergeMarkers(markerLists: MarkerGroup[]): MergedMarker[] {
                maxRel = 0
                const val = markerLists.reduce((memo, parent) => {
                    for (const child1 of Object.values(parent.markers)) {
                        const child: MarkerData = { ...child1, color: parent.color }
                        const latLng = child1.lat + "," + child1.lng
                        if (child.point.rel > maxRel) maxRel = child.point.rel
                        if (latLng in memo) memo[latLng].markerData.push(child)
                        else
                            memo[latLng] = {
                                markerData: [child],
                                lat: child1.lat,
                                lng: child1.lng,
                            }
                    }
                    return memo
                }, {} as Record<string, MergedMarker>)
                return Object.values(val)
            }
        },
    ],
})
