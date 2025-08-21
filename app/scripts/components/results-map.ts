/** @format */
import _ from "lodash"
import angular, { IController, IScope, ITimeoutService } from "angular"
import settings from "@/settings"
import { html, regescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { AppSettings } from "@/settings/app-settings.types"
import { MarkerEvent, MarkerGroup } from "@/map"
import "@/components/korp-error"
import "@/components/result-map"
import { ExampleTask } from "@/backend/task/example-task"
import { MapTask } from "@/backend/task/map-task"

type ResultsMapController = IController & {
    active: boolean
    loading: boolean
    setProgress: (loading: boolean, progress: number) => void
    task: MapTask
}

type ResultsMapScope = IScope & {
    center: AppSettings["map_center"]
    error?: string
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
            <result-map
                center="center"
                markers="markerGroups"
                marker-callback="newKWICSearch"
                selected-groups="selectedGroups"
                rest-color="'#9b9fa5'"
                use-clustering="useClustering"
            ></result-map>
        </div>
    </div>`,
    bindings: {
        active: "<",
        loading: "<",
        setProgress: "<",
        task: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "$timeout",
        function ($rootScope: RootScope, $scope: ResultsMapScope, $timeout: ITimeoutService) {
            const $ctrl = this as ResultsMapController

            $scope.center = settings["map_center"]
            $scope.selectedGroups = []
            $scope.markerGroups = {}
            $scope.numResults = 0
            $scope.useClustering = false

            const rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")

            $ctrl.$onInit = () => {
                $ctrl.setProgress(true, 0)
                const promise = $ctrl.task.send()

                Promise.all([rickshawPromise, promise]).then(
                    ([Rickshaw, result]) => {
                        const palette = new (Rickshaw as any).Color.Palette({ scheme: "colorwheel" })
                        $scope.$apply(($scope: ResultsMapScope) => {
                            $ctrl.setProgress(false, 100)
                            $scope.numResults = 20
                            $scope.markerGroups = result ? $ctrl.task.getMarkerGroups(() => palette.color()) : undefined
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

            /** Open the occurrences at a selected location */
            $scope.newKWICSearch = (marker: MarkerEvent) => {
                const { point, queryData } = marker
                const location = [point.name, point.countryCode, point.lat, point.lng].join(";")
                const numberOfTokens = queryData.subCqp.split("[").length - 1
                const cqpGeo = `[_.${queryData.label} contains "${regescape(location)}"]{${numberOfTokens}}`

                const cqps = [queryData.searchCqp, cqpGeo, queryData.subCqp]
                const readingMode = queryData.label === "paragraph__geocontext"
                const task = new ExampleTask(queryData.corpora, cqps, queryData.within, readingMode)
                $timeout(() => $rootScope.kwicTabs.push(task))
            }
        },
    ],
})
