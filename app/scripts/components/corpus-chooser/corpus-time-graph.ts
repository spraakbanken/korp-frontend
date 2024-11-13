/** @format */
import angular from "angular"
import range from "lodash/range"
import { Chart } from "chart.js/auto"
import { loc } from "@/i18n"
import {
    calculateYearTicks,
    getSeries,
    getSeriesSelected,
    getCountUndatedSelected,
    getSpan,
    getCountUndated,
} from "@/timeseries"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import { StoreService } from "@/services/store"
import "@/services/store"

angular.module("korpApp").component("corpusTimeGraph", {
    template: html`<canvas id="time-graph-chart" height="80"></canvas>`,
    controller: [
        "$rootScope",
        "store",
        function ($rootScope: RootScope, store: StoreService) {
            const { min, max } = getSpan()

            const datasetsDated = [
                {
                    label: loc("corpselector_selected"),
                    data: {},
                    backgroundColor: "navy",
                },
                {
                    label: loc("corpselector_all"),
                    data: getSeries(),
                    backgroundColor: "lightgrey",
                },
            ]

            // If there is undated data, add another bar.
            // To include the undated part on the side, make it show as a year slightly higher than the max of dated data.
            const undatedFakeYear: number = max + Math.max(2, Math.ceil((max - min) / 60))
            const datasetsUndated = [
                {
                    label: loc("corpselector_selected"),
                    data: {} as Record<number, number | undefined>,
                    backgroundColor: "#cd5c5c",
                },
                {
                    label: loc("corpselector_all"),
                    data: { [undatedFakeYear]: getCountUndated() },
                    backgroundColor: "lightgrey",
                },
            ]

            function updateSelectedData() {
                datasetsDated[0].data = getSeriesSelected()
                datasetsUndated[0].data[undatedFakeYear] = getCountUndatedSelected() || undefined
            }
            updateSelectedData()

            const chart = new Chart(document.getElementById("time-graph-chart") as HTMLCanvasElement, {
                type: "bar",
                data: getCountUndated()
                    ? {
                          // Labels need to be strings to match with the `{[year]: count}` format of the datasets.
                          // `max + 1` because `range` excludes end value.
                          labels: range(min, undatedFakeYear + 1).map(String),
                          datasets: [...datasetsDated, ...datasetsUndated],
                      }
                    : {
                          labels: range(min, max + 1).map(String),
                          datasets: datasetsDated,
                      },
                options: {
                    scales: {
                        y: {
                            display: false,
                            beginAtZero: true,
                        },
                        x: {
                            ticks: {
                                autoSkip: false,
                            },
                            // Calculate what years to label. Subtract `min` because Chart.js wants the indices, not the labels.
                            afterBuildTicks: (axis) =>
                                (axis.ticks = calculateYearTicks(min, max).map((v) => ({ value: v - min }))),
                        },
                    },
                    datasets: {
                        bar: {
                            // Show bars behind each other, not next to.
                            grouped: false,
                            // Eliminate space between bars
                            categoryPercentage: 1.0,
                            barPercentage: 1.0,
                            // Make low-resource years show more
                            minBarLength: 2,
                        },
                    },
                    locale: $rootScope.lang,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            caretSize: 0,
                            yAlign: "bottom",
                            callbacks: {
                                title: (items) =>
                                    Number(items[0].label) < undatedFakeYear
                                        ? `${loc("corpselector_year")} ${items[0].label}`
                                        : loc("corpselector_undated"),
                            },
                            // See `defaults` in https://github.com/chartjs/Chart.js/blob/master/src/plugins/plugin.tooltip.js
                            animations: {
                                opacity: {
                                    duration: 100,
                                },
                            },
                        },
                    },
                    interaction: {
                        mode: "nearest",
                        axis: "x",
                        intersect: false,
                    },
                    animation: {
                        duration: 200,
                    },
                },
            })

            store.watch("selectedCorpusIds", () => {
                updateSelectedData()
                // `'none'` to disable animations. Animations would be nice, but they look weird when new data has different min/max year.
                // TODO Do animations look better if data is given as array including empty years, not a record?
                chart.update("none")
            })
        },
    ],
})
