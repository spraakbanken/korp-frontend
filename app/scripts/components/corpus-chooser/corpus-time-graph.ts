/** @format */
import angular from "angular"
import { html } from "@/util"
import { StoreService } from "@/services/store"
import { CorpusTimeChart } from "./corpus-time-chart"

angular.module("korpApp").component("corpusTimeGraph", {
    template: html`<canvas id="time-graph-chart" height="80"></canvas>`,
    controller: [
        "store",
        function (store: StoreService) {
            const chart = new CorpusTimeChart(store.lang)
            store.watch("corpus", () => chart.update())
        },
    ],
})
