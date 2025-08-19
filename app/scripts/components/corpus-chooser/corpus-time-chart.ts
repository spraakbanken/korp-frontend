/** @format */
import range from "lodash/range"
import { Chart, ChartDataset } from "chart.js/auto"
import { loc } from "@/i18n"
import {
    calculateYearTicks,
    getCountUndated,
    getCountUndatedSelected,
    getSeries,
    getSeriesSelected,
    getSpan,
} from "@/timeseries"

type Data = Record<number, number | undefined>
type Dataset = ChartDataset<"bar", Data>

export class CorpusTimeChart {
    datasetsDated: Dataset[]
    datasetsUndated: Dataset[]
    /** A year slightly above the max of dated data, used to show undated data beside the rest. */
    undatedFakeYear: number
    chart: Chart<"bar", Data, string>

    constructor(lang: string) {
        const { min, max } = getSpan()!

        this.datasetsDated = [
            {
                label: loc("corpselector_selected", lang),
                data: {},
                backgroundColor: "navy",
            },
            {
                label: loc("corpselector_all", lang),
                data: getSeries(),
                backgroundColor: "lightgrey",
            },
        ]

        // If there is undated data, add another bar.
        this.undatedFakeYear = max + Math.max(2, Math.ceil((max - min) / 60))
        this.datasetsUndated = [
            {
                label: loc("corpselector_selected", lang),
                data: {},
                backgroundColor: "#cd5c5c",
            },
            {
                label: loc("corpselector_all", lang),
                data: { [this.undatedFakeYear]: getCountUndated() },
                backgroundColor: "lightgrey",
            },
        ]

        this.updateSelectedData()

        this.chart = new Chart<"bar", Data, string>(document.getElementById("time-graph-chart") as HTMLCanvasElement, {
            type: "bar",
            data: getCountUndated()
                ? {
                      // Labels need to be strings to match with the `{[year]: count}` format of the datasets.
                      // `max + 1` because `range` excludes end value.
                      labels: range(min, this.undatedFakeYear + 1).map(String),
                      datasets: [...this.datasetsDated, ...this.datasetsUndated],
                  }
                : {
                      labels: range(min, max + 1).map(String),
                      datasets: this.datasetsDated,
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
                locale: lang,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        caretSize: 0,
                        yAlign: "bottom",
                        callbacks: {
                            title: (items) =>
                                Number(items[0].label) < this.undatedFakeYear
                                    ? `${loc("corpselector_year", lang)} ${items[0].label}`
                                    : loc("corpselector_undated", lang),
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
    }

    updateSelectedData() {
        this.datasetsDated[0].data = getSeriesSelected()
        this.datasetsUndated[0].data[this.undatedFakeYear] = getCountUndatedSelected() || undefined
    }

    update() {
        this.updateSelectedData()
        // `'none'` to disable animations. Animations would be nice, but they look weird when new data has different min/max year.
        // TODO Do animations look better if data is given as array including empty years, not a record?
        this.chart.update("none")
    }
}
