/** @format */
import _ from "lodash"
import { locAttribute } from "@/i18n"
import { selectTemplate } from "./common"

/**
 * Select-element.
 * Use the following settings in the corpus:
 * - dataset: an object or an array of values
 * - escape: boolean, will be used by the escaper-directive
 */
export const datasetSelect = (options) => ({
    template: selectTemplate,
    controller: [
        "$scope",
        "$rootScope",
        function ($scope, $rootScope) {
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
