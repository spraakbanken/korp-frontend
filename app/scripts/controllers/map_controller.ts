/** @format */
import _ from "lodash"
import angular, { ITimeoutService } from "angular"
import settings from "@/settings"
import { regescape } from "@/util"
import { MapTab, RootScope } from "@/root-scope.types"
import { AppSettings } from "@/settings/app-settings.types"
import { MapRequestResult } from "@/backend/backend"
import { MapResult, Point } from "@/map_services"
import { WithinParameters } from "@/backend/types"
import { TabHashScope } from "@/directives/tab-hash"

type MapControllerScope = TabHashScope & {
    center: AppSettings["map_center"]
    error?: string
    selectedGroups: string[]
    markerGroups?: Record<string, MarkerGroup>
    loading: boolean
    numResults: number
    useClustering: boolean
    promise: MapTab
    restColor: string
    closeTab: (idx: number, e: Event) => void
    newKWICSearch: (marker: MarkerEvent) => void
    toggleMarkerGroup: (groupName: string) => void
    onentry: () => void
    onexit: () => void
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

angular.module("korpApp").directive("mapCtrl", [
    "$timeout",
    ($timeout: ITimeoutService) => ({
        controller: [
            "$scope",
            "$rootScope",
            ($scope: MapControllerScope, $rootScope: RootScope) => {
                $scope.onentry = () => $scope.$broadcast("update_map")
                $scope.loading = true
                $scope.newDynamicTab()
                $scope.center = settings["map_center"]
                $scope.selectedGroups = []
                $scope.markerGroups = {}
                $scope.numResults = 0
                $scope.useClustering = false

                const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")

                Promise.all([rickshawPromise, $scope.promise]).then(
                    ([Rickshaw, result]) => {
                        $scope.$apply(($scope: MapControllerScope) => {
                            $scope.loading = false
                            $scope.numResults = 20
                            $scope.markerGroups = result ? getMarkerGroups(Rickshaw, result) : undefined
                            $scope.selectedGroups = _.keys($scope.markerGroups)
                        })
                    },
                    (error) => {
                        console.error("Map data parsing failed:", error)
                        $scope.$apply(($scope: MapControllerScope) => {
                            $scope.loading = false
                            $scope.error = error
                        })
                    }
                )

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
                    $scope.restColor = "#9b9fa5"
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

                $scope.closeTab = function (idx: number, e: Event) {
                    e.preventDefault()
                    $rootScope.mapTabs.splice(idx, 1)
                    $scope.closeDynamicTab()
                }
            },
        ],
    }),
])
