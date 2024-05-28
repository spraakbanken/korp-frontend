/** @format */
import angular, { IController, IRootScopeService } from "angular"
import { Chart } from "chart.js"
import { html } from "@/util"

const defaultMode: Mode = "relative"

angular.module("korpApp").component("corpusDistributionChart", {
    template: html`
        <div class="flex flex-col gap-2 items-center">
            <canvas id="distribution-chart"></canvas>
            <div id="statistics_switch">
                <a data-mode="relative" href="javascript:"> {{ 'statstable_relfigures' | loc }} </a>
                <a data-mode="absolute" href="javascript:"> {{ 'statstable_absfigures' | loc }} </a>
            </div>
        </div>
    `,
    bindings: {
        row: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: IRootScopeService) {
            const $ctrl = this as CorpusDistributionChartController
            let chart: Chart<"pie">

            const getValues = (mode: Mode) => $ctrl.row.map((corpus) => corpus.values[mode == "relative" ? 1 : 0])

            $ctrl.$onInit = () => {
                chart = new Chart("distribution-chart", {
                    type: "pie",
                    data: {
                        labels: $ctrl.row.map((corpus) => corpus.title),
                        datasets: [{ data: getValues(defaultMode) }],
                    },
                    options: {
                        locale: $rootScope["lang"],
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                })

                setTimeout(() => {
                    const radioList = ($("#statistics_switch") as any).radioList({
                        selected: defaultMode,
                        change: () => {
                            const mode = radioList.radioList("getSelected").attr("data-mode")
                            chart.data.datasets[0].data = getValues(mode)
                            chart.update()
                        },
                    })
                })
            }
        },
    ],
})

type CorpusDistributionChartController = IController & {
    row: { title: string; values: [number, number] }[]
}

type Mode = "relative" | "absolute"
