/** @format */
import { locAttribute } from "@/i18n"
import { html } from "@/util"
import { IController, IScope } from "angular"
import { Condition } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"
import { AttributeOption } from "@/corpus_listing"
import { loadOptions } from "@/extended-search"

export type Widget = {
    template: string
    controller: IController
}

export type WidgetScope<T = string> = IScope & {
    attr: AttributeOption
    orObj: Condition
    model: T
    input: string
}

export type SelectWidgetScope = WidgetScope & {
    $parent: any
    options: string[][]
    inputOnly: boolean
    loading: boolean
    getRows: (input?: string) => string[][]
    typeaheadInputFormatter: (model: string) => string
}

export const selectTemplate = html`<select
        ng-show="!inputOnly"
        ng-model="input"
        ng-options="tuple[0] as tuple[1] for tuple in options"
    ></select>
    <input ng-show="inputOnly" type="text" ng-model="input" />`

export const selectController = (autocomplete: boolean): IController => [
    "$scope",
    "store",
    function ($scope: SelectWidgetScope, store: StoreService) {
        store.watch("corpus", (selected) => {
            // TODO Destroy if new corpus selection doesn't support the attribute?
            if (selected.length > 0) {
                reloadValues()
            }
        })

        async function reloadValues() {
            $scope.loading = true
            const options = await loadOptions($scope.attr, store.lang)
            const currentInputExists = options.find((option) => option[0] == $scope.input)
            $scope.$apply(() => {
                $scope.loading = false
                $scope.options = options
                // Reset old selection if that option has been removed.
                if (!autocomplete && !currentInputExists) {
                    $scope.input = $scope.options[0][0]
                }
            })
        }

        // Load values initially
        reloadValues()

        $scope.$watch("orObj.op", (newVal, oldVal) => {
            $scope.inputOnly = !["=", "!=", "contains", "not contains"].includes($scope.orObj.op)
            if (newVal !== oldVal) {
                if (!autocomplete) {
                    $scope.input = $scope.options[0][0]
                }
            }
        })

        $scope.getRows = (input) =>
            input
                ? $scope.options.filter((tuple) => tuple[0].toLowerCase().indexOf(input.toLowerCase()) !== -1)
                : $scope.options

        $scope.typeaheadInputFormatter = (model) => locAttribute($scope.attr.translation, model, store.lang)
    },
]
