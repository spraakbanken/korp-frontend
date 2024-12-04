/** @format */
import _ from "lodash"
import settings from "@/settings"
import { reduceStringify } from "../config/statistics_config"
import type { StatsNormalized, StatisticsWorkerMessage, StatisticsWorkerResult, SearchParams } from "./statistics.types"
import { hitCountHtml } from "@/util"
import { LangString } from "./i18n/types"
import { Row, TotalRow } from "./statistics_worker"
import { getLang, locObj } from "./i18n"
const pieChartImg = require("../img/stats2.png")

type SlickGridFormatter<T extends Slick.SlickData = any> = (
    row: number,
    cell: number,
    value: any,
    columnDef: Slick.Column<T>,
    dataContext: T
) => string

const createStatisticsService = function () {
    const createColumns = function (
        corpora: string[],
        reduceVals: string[],
        reduceValLabels: LangString[]
    ): SlickgridColumn[] {
        const valueFormatter: SlickGridFormatter<Row> = function (row, cell, value, columnDef, dataContext) {
            const [absolute, relative] = [...dataContext[`${columnDef.id}_value`]]
            return hitCountHtml(absolute, relative)
        }

        // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
        const lang = getLang()
        const getCorpusTitle = (id: string): string => locObj(settings.corpora[id.toLowerCase()].title, lang)
        corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), lang))

        const minWidth = 100
        const columns: SlickgridColumn[] = []
        const cl = settings.corpusListing.subsetFactory(corpora)
        const structAttrs = cl.getStructAttrs()
        for (let [reduceVal, reduceValLabel] of _.zip(reduceVals, reduceValLabels)) {
            if (reduceVal == null || reduceValLabel == null) break
            columns.push({
                id: reduceVal,
                translation: reduceValLabel,
                field: "hit_value",
                sortable: true,
                formatter: (row, cell, value, columnDef, dataContext: Row) => {
                    const isTotalRow = (row: Row): row is TotalRow => row.rowId === 0
                    if (!isTotalRow(dataContext)) {
                        // Get the attribute value of all matching words
                        const types = dataContext.statsValues.flatMap((type) => type[reduceVal!][0])
                        const formattedValue = reduceStringify(reduceVal!, types, structAttrs[reduceVal!])
                        dataContext.formattedValue[reduceVal!] = formattedValue
                        return `<span class="statistics-link" data-row=${dataContext["rowId"]}>${formattedValue}</span>`
                    } else {
                        return "&Sigma;"
                    }
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
            field: "total_value",
            sortable: true,
            formatter: valueFormatter,
            minWidth,
            headerCssClass: "localized-header",
        })

        const corpusColumns = corpora.map((id) => ({
            id,
            translation: settings.corpora[id.toLowerCase()].title,
            field: id + "_value",
            sortable: true,
            formatter: valueFormatter,
            minWidth,
        }))
        columns.push(...corpusColumns)

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
        const columns = createColumns(Object.keys(data.corpora), reduceVals, reduceValLabels)

        const statsWorker = new Worker(new URL("./statistics_worker", import.meta.url))
        statsWorker.onmessage = function (e: MessageEvent<StatisticsWorkerResult>) {
            const searchParams: SearchParams = {
                reduceVals,
                ignoreCase,
                originalCorpora,
                corpora: _.keys(data.corpora),
                prevNonExpandedCQP,
            }
            let result = [e.data, columns, searchParams]
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

export type SlickgridColumn = Slick.Column<any> & {
    translation?: LangString
}
