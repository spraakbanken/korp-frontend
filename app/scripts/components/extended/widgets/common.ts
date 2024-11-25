/** @format */
import _ from "lodash"
import settings from "@/settings"
import { loc, locAttribute } from "@/i18n"
import { html } from "@/util"
import "@/directives/escaper"
import { IController, IScope } from "angular"
import { Condition } from "@/cqp_parser/cqp.types"
import { StructService, StructServiceOptions } from "@/backend/struct-service"
import { RootScope } from "@/root-scope.types"
import { LocMap } from "@/i18n/types"

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
    dataset: string[][]
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
        escaper
        ng-options="tuple[0] as tuple[1] for tuple in dataset"
    ></select>
    <input ng-show="inputOnly" type="text" ng-model="input" />`

export const selectController = (autocomplete: boolean): IController => [
    "$scope",
    "$rootScope",
    "structService",
    function ($scope: SelectWidgetScope, $rootScope: RootScope, structService: StructService) {
        $rootScope.$on("corpuschooserchange", function (event, selected: string[]) {
            if (selected.length > 0) {
                reloadValues()
            }
        })

        function reloadValues() {
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
            const opts: StructServiceOptions = { count: false, returnByCorpora: false }
            if ($scope.type === "set") {
                opts.split = [attribute]
            }
            structService.getStructValues(corpora, [attribute], opts).then(
                function (data: string[]) {
                    $scope.loading = false

                    const dataset = _.uniq(data).map((item) => {
                        return item === "" ? [item, loc("empty")] : [item, locAttribute($scope.translation, item)]
                    })
                    $scope.dataset = _.sortBy(dataset, (tuple) => tuple[1])
                    if (!autocomplete) {
                        $scope.input = data.includes($scope.input) ? $scope.input : $scope.dataset[0][0]
                    }
                },
                () => console.log("attr_values error")
            )
        }

        // Load values initially
        reloadValues()

        $scope.$watch("orObj.op", (newVal, oldVal) => {
            $scope.inputOnly = !["=", "!=", "contains", "not contains"].includes($scope.orObj.op)
            if (newVal !== oldVal) {
                if (!autocomplete) {
                    $scope.input = "" || $scope.dataset[0][0]
                }
            }
        })

        $scope.getRows = (input) =>
            input
                ? $scope.dataset.filter((tuple) => tuple[0].toLowerCase().indexOf(input.toLowerCase()) !== -1)
                : $scope.dataset

        $scope.typeaheadInputFormatter = (model) => locAttribute($scope.translation, model)
    },
]
