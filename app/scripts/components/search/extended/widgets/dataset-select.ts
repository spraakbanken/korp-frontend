import { selectTemplate, Widget, WidgetScope } from "./common"
import { Configurable } from "@/settings/config.types"
import { StoreService } from "@/services/store"
import { getDatasetOptions } from "@/data_init"

type DatasetSelectOptions = {
    sort?: boolean
}

type DatasetSelectScope = WidgetScope & {
    options: [string, string][]
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
            function initialize() {
                $scope.options = getDatasetOptions($scope.attr, store.lang, options?.sort !== false)
                $scope.model = $scope.model || $scope.options[0][0]
            }
            initialize()

            store.watch("lang", () => initialize())
        },
    ],
})
