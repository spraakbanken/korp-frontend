/** @format */
import { locAttribute } from "@/util"

export const datasetSelect = (options) => ({
    template: html`<select
            ng-show="!inputOnly"
            ng-model="input"
            escaper
            ng-options="tuple[0] as tuple[1] for tuple in dataset"
        ></select>
        <input ng-show="inputOnly" type="text" ng-model="input" />`,
    controller: [
        "$rootScope",
        "$scope",
        function ($rootScope, $scope) {
            let dataset
            const original = $scope.dataset

            $rootScope.$watch("lang", (newVal, oldVal) => {
                if (newVal != oldVal) {
                    initialize()
                }
            })
            function initialize() {
                if (_.isArray(original)) {
                    dataset = _.map(original, (item) => [item, locAttribute($scope.translation, item)])
                } else {
                    dataset = _.map(original, (v, k) => [k, locAttribute($scope.translation, v)])
                }
                if (options == undefined || options.sort == undefined || options.sort) {
                    $scope.dataset = _.sortBy(dataset, (tuple) => tuple[1])
                } else {
                    $scope.dataset = dataset
                }
                $scope.model = $scope.model || $scope.dataset[0][0]
            }
            initialize()
        },
    ],
})
