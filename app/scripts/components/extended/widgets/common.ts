/** @format */
import _ from "lodash"
import settings from "@/settings"
import { loc, locAttribute } from "@/i18n"
import { html } from "@/util"
import { IController, IScope } from "angular"
import { Condition } from "@/cqp_parser/cqp.types"
import { getAttrValues } from "@/backend/attr-values"
import { LocMap } from "@/i18n/types"
import { StoreService } from "@/services/store"

export type Widget = {
    template: string
    controller: IController
}

export type WidgetScope<T = string> = IScope & {
    orObj: Condition
    model: T
    input: string
}

export type SelectWidgetScope = WidgetScope & {
    $parent: any
    options: string[][]
    type: string
    translation: LocMap
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
            // TODO this exploits the API
            const attributeDefinition: { value: string } = $scope.$parent.$ctrl.attributeDefinition
            if (!attributeDefinition) {
                return
            }

            const attribute = attributeDefinition.value
            const selectedCorpora = settings.corpusListing.selected

            // check which corpora support attributes
            const corpora: string[] = []
            for (let corpusSettings of selectedCorpora) {
                if (attribute in corpusSettings["struct_attributes"] || attribute in corpusSettings.attributes) {
                    corpora.push(corpusSettings.id)
                }
            }

            $scope.loading = true
            const split = $scope.type === "set"
            const data = await getAttrValues(corpora, attribute, split)

            const options = _.uniq(data)
                .map((item) => (item === "" ? ["", loc("empty")] : [item, locAttribute($scope.translation, item)]))
                .sort((a, b) => a[1].localeCompare(b[1], store.lang))

            $scope.$apply(() => {
                $scope.loading = false
                $scope.options = options
                if (!autocomplete) {
                    $scope.input = data.includes($scope.input) ? $scope.input : $scope.options[0][0]
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

        $scope.typeaheadInputFormatter = (model) => locAttribute($scope.translation, model)
    },
]
