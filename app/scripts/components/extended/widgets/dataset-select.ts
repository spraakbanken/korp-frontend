/** @format */
import _ from "lodash"
import { locAttribute } from "@/i18n"
import { selectTemplate, Widget, WidgetScope } from "./common"
import { LocLangMap } from "@/i18n/types"
import { Configurable } from "@/settings/config.types"
import { StoreService } from "@/services/store"

type DatasetSelectOptions = {
    sort?: boolean
}

type DatasetSelectScope = WidgetScope & {
    translation: LocLangMap
    dataset: Dataset
    options: [string, string][]
}

type Dataset = Record<string, string> | string[]

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
            function initialize() {
                $scope.options = formatOptions($scope.dataset, $scope.translation, store.lang, options?.sort !== false)
                $scope.model = $scope.model || $scope.options[0][0]
            }
            initialize()

            store.watch("lang", () => initialize())
        },
    ],
})

function formatOptions(dataset: Dataset, translation: LocLangMap, lang: string, sort: boolean): [string, string][] {
    const options: [string, string][] = _.isArray(dataset)
        ? _.map(dataset, (item) => [item, locAttribute(translation, item, lang)])
        : _.map(dataset, (v, k) => [k, locAttribute(translation, v, lang)])
    return sort ? options.sort((a, b) => a[1].localeCompare(b[1], lang)) : options
}
