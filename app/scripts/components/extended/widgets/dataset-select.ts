/** @format */
import _ from "lodash"
import { locAttribute } from "@/i18n"
import { selectTemplate, Widget, WidgetScope } from "./common"
import { LocMap } from "@/i18n/types"
import { Configurable } from "@/settings/config.types"
import { StoreService } from "@/services/store"

type DatasetSelectOptions = {
    sort?: boolean
}

type DatasetSelectScope = WidgetScope & {
    translation: LocMap
    // It can be Record<string, string> or string[] on init, and is then reformatted to string[][]
    dataset: Record<string, string> | string[] | string[][]
}

/**
 * Select-element.
 * Use the following settings in the corpus:
 * - dataset: an object or an array of values
 * - escape: boolean (true by default), set to false to prevent escaping regexp value
 */
export const datasetSelect: Configurable<Widget, DatasetSelectOptions> = (options) => ({
    template: selectTemplate,
    controller: [
        "$scope",
        "store",
        function ($scope: DatasetSelectScope, store: StoreService) {
            let dataset: [string, string][]
            const original = $scope.dataset as Record<string, string> | string[]

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

            store.watch("lang", () => initialize())
        },
    ],
})
