import angular, { type IController, type IScope } from "angular"
import { Chart } from "chart.js"
import { html } from "@/util"
import { loc } from "@/i18n"
import { type Option } from "@/components/util/radio-list"
import { StoreService } from "@/services/store"

angular.module("korpApp").component("corpusDistributionChart", {
    template: html`
        <div class="flex flex-col gap-2 items-center">
            <canvas id="distribution-chart"></canvas>
            <radio-list options="$ctrl.modeOptions" ng-model="mode"></radio-list>
        </div>
    `,
    bindings: {
        row: "<",
    },
    controller: [
        "$scope",
        "store",
        function ($scope: CorpusDistributionChartScope, store: StoreService) {
            const $ctrl = this as CorpusDistributionChartController
            $ctrl.modeOptions = [
                {
                    value: "relative",
                    label: loc("statstable_relfigures", store.lang),
                },
                {
                    value: "absolute",
                    label: loc("statstable_absfigures", store.lang),
                },
            ]
            $scope.mode = "relative"
            let chart: Chart<"pie">

            const getValues = () => $ctrl.row.map((corpus) => corpus.values[$scope.mode == "relative" ? 1 : 0])

            $ctrl.$onInit = () => {
                chart = new Chart("distribution-chart", {
                    type: "pie",
                    data: {
                        labels: $ctrl.row.map((corpus) => corpus.title),
                        datasets: [{ data: getValues() }],
                    },
                    options: {
                        locale: store.lang,
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                })
            }

            $scope.$watch("mode", () => {
                chart.data.datasets[0].data = getValues()
                chart.update()
            })
        },
    ],
})

type CorpusDistributionChartScope = IScope & {
    mode: Mode
}

type CorpusDistributionChartController = IController & {
    row: { title: string; values: [number, number] }[]
    modeOptions: Option<Mode>[]
}

type Mode = "relative" | "absolute"
