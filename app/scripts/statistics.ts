/** @format */
import _ from "lodash"
import settings from "@/settings"
import { reduceStringify } from "../config/statistics_config"
import { StatsNormalized } from "./backend/stats-proxy"
import {
    Dataset,
    isTotalRow,
    Row,
    StatisticsWorkerMessage,
    StatisticsProcessed,
    SearchParams,
    SlickgridColumn,
} from "./statistics.types"
import { formatFrequency, fromKeys } from "@/util"
import { locObj } from "./i18n"
import { StoreService } from "./services/store"

/** Create SlickGrid column definitions for statistics data. */
export function createColumns(store: StoreService, corpora: string[], attrs: string[]): SlickgridColumn[] {
    const cl = settings.corpusListing.subsetFactory(corpora)
    const attributes = cl.getReduceAttrs()
    const labels = attrs.map((name) => (name == "word" ? settings["word_label"] : attributes[name]?.label))

    // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
    const getCorpusTitle = (id: string): string => locObj(settings.corpora[id.toLowerCase()].title, store.lang)
    corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), store.lang))

    const minWidth = 100
    const columns: SlickgridColumn[] = []
    for (let [reduceVal, reduceValLabel] of _.zip(attrs, labels)) {
        if (reduceVal == null || reduceValLabel == null) break
        columns.push({
            id: reduceVal,
            translation: reduceValLabel,
            field: "hit_value",
            sortable: true,
            formatter: (row, cell, value, columnDef, data: Row) => {
                if (isTotalRow(data)) return "&Sigma;"
                const output = data.formattedValue[reduceVal!] || `<span class="opacity-50">&empty;</span>`
                return `<div class="link" data-row="${data.rowId}">${output}</div>`
            },
            minWidth,
            cssClass: "parameter-column",
        })
    }

    columns.push({
        id: "pieChart",
        name: "",
        field: "hit_value",
        sortable: false,
        formatter: () => `<i class="fa-solid fa-chart-pie block text-sm mx-1"></i>`,
        maxWidth: 25,
        minWidth: 25,
        cssClass: "total-column cursor-pointer",
    })

    columns.push({
        id: "total",
        name: "stats_total",
        field: "total",
        sortable: true,
        formatter: (row, cell, value) => formatFrequency(store, value),
        minWidth,
        headerCssClass: "localized-header",
        cssClass: "total-column text-right",
    })

    corpora.forEach((id) =>
        columns.push({
            id,
            translation: settings.corpora[id.toLowerCase()].title,
            field: "count",
            sortable: true,
            formatter: (row, cell, value, columnDef) => formatFrequency(store, value[columnDef.id!]),
            minWidth,
            cssClass: "text-right",
        })
    )

    return columns
}

const createStatisticsService = function () {
    function processData(
        originalCorpora: string,
        data: StatsNormalized,
        reduceVals: string[],
        ignoreCase: boolean,
        prevNonExpandedCQP: string
    ): Promise<StatisticsProcessed> {
        const corpora = Object.keys(data.corpora)
        const cl = settings.corpusListing.subsetFactory(corpora)

        // Get stringifiers for formatting attribute values
        const stringifiers = fromKeys(reduceVals, (attr) => reduceStringify(attr, cl))

        const params: SearchParams = {
            reduceVals,
            ignoreCase,
            originalCorpora,
            corpora,
            prevNonExpandedCQP,
        }

        // Delegate stats processing to a Web Worker for performance
        const worker = new Worker(new URL("./statistics_worker", import.meta.url))

        worker.postMessage({
            type: "korpStatistics",
            data,
            // Worker code cannot import settings
            groupStatistics: settings.group_statistics,
        } satisfies StatisticsWorkerMessage)

        // Return a promise that resolves when the worker is done
        return new Promise((resolve) => {
            worker.onmessage = (e: MessageEvent<Dataset>) => {
                // Terminate worker to free up resources
                worker.terminate()
                const rows = e.data

                // Format the values of the attributes we are reducing by
                for (const row of rows) {
                    if (isTotalRow(row)) continue
                    for (const attr of reduceVals) {
                        const words = row.statsValues.map((word) => word[attr]?.[0]).filter(Boolean)
                        row.formattedValue[attr] = stringifiers[attr](words)
                    }
                }

                let processed: StatisticsProcessed = { rows, params }

                if (settings["statistics_postprocess"]) {
                    processed = settings["statistics_postprocess"](processed)
                }

                resolve(processed)
            }
        })
    }

    return { processData }
}

export const statisticsService = createStatisticsService()
