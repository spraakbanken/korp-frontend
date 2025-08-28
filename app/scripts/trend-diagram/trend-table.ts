/** @format */
import moment from "moment"
import { FORMATS, Series } from "./util"
import { escapeHtml, formatFrequency } from "@/util"
import { sortedIndexOf } from "lodash"
import { AbsRelSeq } from "@/statistics/statistics.types"
import { StoreService } from "@/services/store"

export type TableRow = {
    label: string
    [timestamp: `${number}${string}`]: AbsRelSeq
}

export function renderTable(store: StoreService, el: HTMLElement, series: Series[]) {
    const rows: TableRow[] = []
    const columnsMap: Record<string, Slick.Column<any>> = {}
    for (const seriesRow of series) {
        const tableRow: TableRow = { label: seriesRow.name }
        for (const item of seriesRow.data) {
            const stampformat = FORMATS[item.zoom]
            const timestamp = moment(item.x * 1000).format(stampformat) as `${number}${string}` // this needs to be fixed for other resolutions
            columnsMap[timestamp] = {
                name: timestamp,
                field: timestamp,
                formatter(row, cell, value, columnDef, dataContext) {
                    return value == undefined ? "" : formatFrequency(store, value)
                },
                cssClass: "text-right",
            }
            const i = sortedIndexOf(
                seriesRow.abs_data.map((point) => point.x),
                item.x
            )
            tableRow[timestamp] = [seriesRow.abs_data[i].y, item.y]
        }
        rows.push(tableRow)
    }

    // Sort columns
    const columns: Slick.Column<any>[] = [
        {
            name: "Hit",
            field: "label",
            formatter: (row, cell, value) => escapeHtml(value) || `<span class="opacity-50">&empty;</span>`,
        },
    ]
    for (const key of Object.keys(columnsMap).sort()) {
        columns.push(columnsMap[key])
    }

    const grid = new Slick.Grid(el, rows, columns, {
        autoHeight: true,
        enableCellNavigation: false,
        enableColumnReorder: false,
        forceFitColumns: false,
    })
    return grid
}
