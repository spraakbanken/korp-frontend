/** @format */
import _ from "lodash"
import angular, { ICompileService, IController, IScope, ITimeoutService } from "angular"
import settings from "@/settings"
import { html, regescape } from "@/util"
import { MapTab, RootScope } from "@/root-scope.types"
import { AppSettings } from "@/settings/app-settings.types"
import { MapRequestResult } from "@/backend/backend"
import { MapResult } from "@/map_services"
import { WithinParameters } from "@/backend/types"
import type { Marker, MarkerEvent, MarkerGroup } from "@/components/result-map"
import "@/components/korp-error"

type ResultsMapController = IController & {
    active: boolean
    loading: boolean
    promise: MapTab
    setProgress: (loading: boolean, progress: number) => void
}

type ResultsMapScope = IScope & {
    center: AppSettings["map_center"]
    error?: string
    hasComponent?: boolean
    selectedGroups: string[]
    markerGroups?: Record<string, MarkerGroup>
    numResults: number
    useClustering: boolean
    newKWICSearch: (marker: MarkerEvent) => void
    toggleMarkerGroup: (groupName: string) => void
}

angular.module("korpApp").component("resultsMap", {
    template: html`<div class="map_result" ng-class="{loading: $ctrl.loading}">
        <korp-error ng-if="error" message="{{error}}"></korp-error>
        <div ng-if="!$ctrl.loading && numResults != 0">
            <div class="rickshaw_legend" id="mapHeader">
                <div
                    class="mapgroup"
                    ng-repeat="(label, group) in markerGroups"
                    ng-class="group.selected ? '' : 'disabled'"
                    ng-click="toggleMarkerGroup(label)"
                >
                    <span class="check">✔</span>
                    <div class="swatch" style="background-color: {{group.color}}"></div>
                    <span class="label" ng-if="label != 'total'" ng-bind-html="label | trust"></span>
                    <span class="label" ng-if="label == 'total'">Σ</span>
                </div>
                <div style="float:right;padding-right: 5px;">
                    <label>
                        <input
                            style="vertical-align: top;margin-top: 0px;margin-right: 5px;"
                            type="checkbox"
                            ng-model="useClustering"
                        />
                        {{'map_cluster' | loc:$root.lang}}
                    </label>
                </div>
            </div>
            <div ng-if="hasComponent">
                <dynamic-wrapper
                    name="result-map"
                    payload="{
                        center: center,
                        markers: markerGroups,
                        markerCallback: newKWICSearch,
                        selectedGroups: selectedGroups,
                        restColor: '#9b9fa5',
                        useClustering: useClustering,
                    }"
                ></dynamic-wrapper>
            </div>
        </div>
    </div>`,
    bindings: {
        active: "<",
        loading: "<",
        promise: "<",
        setProgress: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "$timeout",
        function ($rootScope: RootScope, $scope: ResultsMapScope, $timeout: ITimeoutService) {
            const $ctrl = this as ResultsMapController

            $scope.center = settings["map_center"]
            $scope.hasComponent = undefined
            $scope.selectedGroups = []
            $scope.markerGroups = {}
            $scope.numResults = 0
            $scope.useClustering = false

            const componentPromise = import(/* webpackChunkName: "map" */ "@/components/result-map")
            const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")

            $ctrl.$onInit = () => {
                $ctrl.setProgress(true, 0)

                Promise.all([$ctrl.promise, componentPromise, rickshawPromise]).then(
                    ([result, component, Rickshaw]) => {
                        $scope.$apply(($scope: ResultsMapScope) => {
                            $scope.hasComponent = true
                            $ctrl.setProgress(false, 100)
                            $scope.numResults = 20
                            $scope.markerGroups = result ? getMarkerGroups(Rickshaw, result) : undefined
                            $scope.selectedGroups = _.keys($scope.markerGroups)
                        })
                    },
                    (error) => {
                        console.error("Map data parsing failed:", error)
                        $scope.$apply(($scope: ResultsMapScope) => {
                            $ctrl.setProgress(false, 100)
                            $scope.error = error
                        })
                    }
                )
            }

            $ctrl.$onChanges = (changes) => {
                // Notify map when it becomes visible
                if (changes.active?.currentValue) {
                    $scope.$broadcast("update_map")
                }
            }

            $scope.toggleMarkerGroup = function (groupName: string) {
                if (!$scope.markerGroups) throw new Error("markerGroups not set")
                $scope.markerGroups[groupName].selected = !$scope.markerGroups[groupName].selected
                // It is important to replace the array, not modify it, to trigger a watcher in the result-map component.
                if ($scope.selectedGroups.includes(groupName)) {
                    $scope.selectedGroups = $scope.selectedGroups.filter((group) => group != groupName)
                } else {
                    $scope.selectedGroups = [...$scope.selectedGroups, groupName]
                }
            }

            function getMarkerGroups(Rickshaw: any, result: MapRequestResult): Record<string, MarkerGroup> {
                const palette: { color: () => string } = new Rickshaw.Color.Palette({ scheme: "colorwheel" }) // spectrum2000
                const groups = result.data.reduce((groups, res, idx) => {
                    const markers = getMarkers(
                        result.attribute.label,
                        result.cqp,
                        result.corpora,
                        result.within,
                        res,
                        idx
                    )
                    const group = {
                        selected: true,
                        order: idx,
                        color: palette.color(),
                        markers,
                    }
                    return { ...groups, [res.label]: group }
                }, {} as Record<string, MarkerGroup>)
                return groups
            }

            function getMarkers(
                label: string,
                cqp: string,
                corpora: string[],
                within: WithinParameters,
                res: MapResult,
                idx: number
            ): Record<string, Marker> {
                return _.fromPairs(
                    res.points.map((point, pointIdx) => {
                        // Include point index in the key, so that multiple
                        // places with the same name but different coordinates
                        // each get their own markers
                        const id = [point.name.replace(/-/g, ""), pointIdx.toString(), idx].join(":")
                        const marker = {
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
                        return [id, marker]
                    })
                )
            }

            /** Open the occurrences at a selected location */
            $scope.newKWICSearch = (marker: MarkerEvent) => {
                const { point, queryData } = marker
                const cl = settings.corpusListing.subsetFactory(queryData.corpora)
                const numberOfTokens = queryData.subCqp.split("[").length - 1
                const opts = {
                    cqp: queryData.searchCqp,
                    cqp2: `[_.${queryData.label} contains "${regescape(
                        [point.name, point.countryCode, point.lat, point.lng].join(";")
                    )}"]{${numberOfTokens}}`,
                    cqp3: queryData.subCqp,
                    corpus: cl.stringifySelected(),
                    show_struct: _.keys(cl.getStructAttrs()).join(","),
                    expand_prequeries: false,
                    ...queryData.within,
                }
                const readingMode = queryData.label === "paragraph__geocontext"
                $timeout(() => $rootScope.kwicTabs.push({ queryParams: opts, readingMode }), 0)
            }
        },
    ],
})

// https://stackoverflow.com/a/53398323/1750365
type DynamicWrapperScope = IScope & {
    name: string
    payload: Record<string, unknown>
}
angular.module("korpApp").component("dynamicWrapper", {
    bindings: {
        name: "@",
        payload: "=?",
    },
    controller: [
        "$compile",
        "$element",
        "$scope",
        function ($compile: ICompileService, $element: JQLite, $scope: DynamicWrapperScope) {
            const $ctrl = this
            $ctrl.$onInit = () => {
                const scope = $scope.$new()
                for (const key in $ctrl.payload || {}) {
                    ;(scope as unknown as Record<string, unknown>)[key] = $ctrl.payload[key]
                }
                const attrs = Object.keys($ctrl.payload)
                    .map((key) => `${key}="${key}"`)
                    .join(" ")
                const template = `<${$ctrl.name} ${attrs}></${$ctrl.name}>`
                $element.append($compile(template)(scope))
            }
        },
    ],
})
