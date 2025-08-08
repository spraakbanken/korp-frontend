/** @format */
import _ from "lodash"
import angular, { ICompileService, IController, IRootElementService, IScope, ITimeoutService } from "angular"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import "@/../styles/map.scss"
import { AppSettings } from "@/settings/app-settings.types"
import { MarkerData, MarkerEvent, MarkerGroup } from "@/map"
import { StatisticsMap } from "@/statistics-map"

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

type MessageScope = IScope & {
    showLabel?: boolean
    point?: MarkerData["point"]
    label?: string
    color?: string
}

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

            let map: StatisticsMap

            const container = $element.find(".map-container")[0]
            map = new StatisticsMap(container, mouseOver, mouseOut)

            $ctrl.$onInit = () => {
                map.setCenter($ctrl.center)
                $scope.showMap = true
                updateMarkers()

                $ctrl.$onChanges = (changes) => {
                    if (changes.useClustering) map.useClustering = changes.useClustering.currentValue
                    updateMarkers()
                }
            }

            function updateMarkers() {
                const selectedMarkers = $ctrl.selectedGroups.map((group) => $ctrl.markers[group])
                map.updateMarkers(selectedMarkers, $ctrl.restColor)
            }

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

            $scope.$on("update_map", () => $timeout(() => map.map.invalidateSize()))

            /**
             * takes a list of markers and displays clickable (callback determined by directive user) info boxes
             */
            function mouseOver(markerData: MarkerData[]) {
                $timeout(() => {
                    $scope.$apply(() => {
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
                        hoverInfoElem.css("display", "block")
                    })
                }, 0)
            }

            function mouseOut() {
                const hoverInfoElem = $element.find(".hover-info-container")
                hoverInfoElem.css("opacity", "0")
                hoverInfoElem.css("display", "none")
            }
        },
    ],
})
