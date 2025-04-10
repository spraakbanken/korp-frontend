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
    AbsRelSeq,
} from "./statistics.types"
import { formatRelativeHits, fromKeys, hitCountHtml } from "@/util"
import { LangString } from "./i18n/types"
import { locObj } from "./i18n"
import { RootScope } from "./root-scope.types"
const pieChartImg = require("../img/stats2.png")

const createStatisticsService = function () {
    // Root Scope is used so the cell formatters are re-triggered when language is changed.
    const createColumns = function (
        $rootScope: RootScope,
        corpora: string[],
        reduceVals: string[],
        reduceValLabels: LangString[]
    ): SlickgridColumn[] {
        // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
        const getCorpusTitle = (id: string): string => locObj(settings.corpora[id.toLowerCase()].title, $rootScope.lang)
        corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), $rootScope.lang))

        const minWidth = 100
        const columns: SlickgridColumn[] = []
        for (let [reduceVal, reduceValLabel] of _.zip(reduceVals, reduceValLabels)) {
            if (reduceVal == null || reduceValLabel == null) break
            columns.push({
                id: reduceVal,
                translation: reduceValLabel,
                field: "hit_value",
                sortable: true,
                formatter: (row, cell, value, columnDef, data: Row) => {
                    if (isTotalRow(data)) return "&Sigma;"
                    const output = data.formattedValue[reduceVal!] || `<span class="opacity-50">&empty;</span>`
                    return `<span class="statistics-link" data-row="${data.rowId}">${output}</span>`
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
            formatter(row, cell, value, columnDef, dataContext: any) {
                return `<img id="circlediagrambutton__${dataContext.rowId}" src="${pieChartImg}" class="arcDiagramPicture"/>`
            },
            maxWidth: 25,
            minWidth: 25,
            cssClass: "total-column",
        })

        columns.push({
            id: "total",
            name: "stats_total",
            field: "total",
            sortable: true,
            formatter: (row, cell, value) => formatFrequency(value),
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
                formatter: (row, cell, value, columnDef) => formatFrequency(value[columnDef.id!]),
                minWidth,
                cssClass: "text-right",
            })
        )

        function formatFrequency(absrel: AbsRelSeq): string {
            const [absolute, relative] = absrel
            return $rootScope.statsRelative
                ? formatRelativeHits(relative, $rootScope.lang)
                : absolute.toLocaleString($rootScope.lang)
        }

        return columns
    }

    function processData(
        $rootScope: RootScope,
        originalCorpora: string,
        data: StatsNormalized,
        reduceVals: string[],
        ignoreCase: boolean,
        prevNonExpandedCQP: string
    ): Promise<StatisticsProcessed> {
        const corpora = Object.keys(data.corpora)
        const cl = settings.corpusListing.subsetFactory(corpora)
        const attributes = cl.getReduceAttrs()
        const labels = reduceVals.map((name) => (name == "word" ? settings["word_label"] : attributes[name]?.label))

        const columns = createColumns($rootScope, corpora, reduceVals, labels)
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

                resolve({ rows, columns, params })
            }
        })
    }

    return { processData }
}

export const statisticsService = createStatisticsService()
