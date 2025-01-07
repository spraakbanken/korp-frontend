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
    StatisticsWorkerResult,
    SearchParams,
    SlickgridColumn,
} from "./statistics.types"
import { fromKeys, hitCountHtml } from "@/util"
import { LangString } from "./i18n/types"
import { getLang, locObj } from "./i18n"
const pieChartImg = require("../img/stats2.png")

const createStatisticsService = function () {
    const createColumns = function (
        corpora: string[],
        reduceVals: string[],
        reduceValLabels: LangString[]
    ): SlickgridColumn[] {
        // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
        const lang = getLang()
        const getCorpusTitle = (id: string): string => locObj(settings.corpora[id.toLowerCase()].title, lang)
        corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), lang))

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
                    const output = data.formattedValue[reduceVal!]
                    return `<span class="statistics-link" data-row=${data.rowId}>${output}</span>`
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
        })

        columns.push({
            id: "total",
            name: "stats_total",
            field: "total",
            sortable: true,
            formatter: (row, cell, value) => hitCountHtml(value, lang),
            minWidth,
            headerCssClass: "localized-header",
        })

        corpora.forEach((id) =>
            columns.push({
                id,
                translation: settings.corpora[id.toLowerCase()].title,
                field: "count",
                sortable: true,
                formatter: (row, cell, value, columnDef) => hitCountHtml(value[columnDef.id!], lang),
                minWidth,
            })
        )

        return columns
    }

    const processData = function (
        def: JQuery.Deferred<StatisticsWorkerResult>,
        originalCorpora: string,
        data: StatsNormalized,
        reduceVals: string[],
        reduceValLabels: LangString[],
        ignoreCase: boolean,
        prevNonExpandedCQP: string
    ) {
        const corpora = Object.keys(data.corpora)
        const columns = createColumns(corpora, reduceVals, reduceValLabels)

        const statsWorker = new Worker(new URL("./statistics_worker", import.meta.url))
        statsWorker.onmessage = function (e: MessageEvent<Dataset>) {
            // Format the values of the attributes we are reducing by
            const cl = settings.corpusListing.subsetFactory(corpora)
            const structAttrs = cl.getStructAttrs()
            const stringifiers = fromKeys(reduceVals, (attr) => reduceStringify(attr, structAttrs[attr]))
            for (const row of e.data) {
                if (isTotalRow(row)) continue
                for (const attr of reduceVals) {
                    const words = row.statsValues.map((word) => word[attr][0])
                    row.formattedValue[attr] = stringifiers[attr](words)
                }
            }

            const searchParams: SearchParams = {
                reduceVals,
                ignoreCase,
                originalCorpora,
                corpora: _.keys(data.corpora),
                prevNonExpandedCQP,
            }
            const result = [e.data, columns, searchParams]

            def.resolve(result as StatisticsWorkerResult)
        }

        statsWorker.postMessage({
            type: "korpStatistics",
            data,
            groupStatistics: settings.group_statistics,
        } as StatisticsWorkerMessage)
    }

    return { processData }
}

export const statisticsService = createStatisticsService()
