import "slickgrid/slick.core"
import "slickgrid/slick.grid"
import "slickgrid/plugins/slick.checkboxselectcolumn"
import "slickgrid/plugins/slick.rowselectionmodel"
import "slickgrid/slick.interactions.js"
import "slickgrid/slick.grid.css"
import { Dataset, isTotalRow, Row, SingleRow } from "./statistics.types"
import { StoreService } from "@/services/store"
import settings from "@/settings"
import { loc, locObj } from "@/i18n"
import { formatFrequency } from "@/i18n/util"
import { zip } from "lodash"
import { corpusListing } from "@/corpora/corpus_listing"

export class StatisticsGrid extends Slick.Grid<Row> {
    constructor(
        el: HTMLElement,
        data: Dataset,
        corpusIds: string[],
        attrs: string[],
        readonly store: StoreService,
        showPieChart: (row: Row) => void,
        onValueClick: (row: Row, corpusId?: string) => void,
    ) {
        const columns = createColumns(store, corpusIds, attrs)

        // @ts-ignore CheckboxSelectColumn type is missing?
        const checkboxSelector = new Slick.CheckboxSelectColumn({ cssClass: "slick-cell-checkboxsel" })
        columns.splice(0, 0, checkboxSelector.getColumnDefinition())

        super(el, data, columns, {
            enableCellNavigation: false,
            enableColumnReorder: false,
            forceFitColumns: false,
        })

        // @ts-ignore RowSelectionModel type is missing?
        this.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }))
        this.registerPlugin(checkboxSelector)
        this.setSelectedRows([0])
        this.autosizeColumns()
        this.refreshColumns()

        this.onSort.subscribe((e, args) => {
            const { sortCol, sortAsc } = args

            if (!(sortCol?.field && sortCol.id)) return
            const sorter = getSorter(sortCol.field, sortCol.id, store.lang)

            data.sort((a, b) => {
                // Place totals row first
                if (isTotalRow(a)) return -1
                if (isTotalRow(b)) return 1
                return sorter(a, b) * (sortAsc ? 1 : -1)
            })

            this.setData(data, false)
            this.updateRowCount()
            this.render()
        })

        this.setSortColumn("total", false)

        this.onClick.subscribe((e, args) => {
            const column = this.getColumns()[args.cell]
            const row = this.getDataItem(args.row)
            if (column.id == "pieChart") showPieChart(row)
            else if ((column.field == "hit_value" && !isTotalRow(row)) || column.field == "total") onValueClick(row)
            else if (column.field == "count") onValueClick(row, column.id!)
        })
    }

    refreshColumns() {
        const columns = this.getColumns() as SlickgridColumn[]
        columns.forEach((column) => {
            if (column.getName) column.name = column.getName(this.store.lang)
        })
        this.setColumns(columns)
    }
}

function getSorter(type: string, col: string, lang: string): Comparer<SingleRow> {
    const sorters: Record<string, Comparer<SingleRow>> = {
        hit_value: (a, b) => a.formattedValue[col].localeCompare(b.formattedValue[col], lang),
        total: (a, b) => a.total[0] - b.total[0],
        count: (a, b) => a.count[col][0] - b.count[col][0],
    }

    return sorters[type]
}

type Comparer<T> = (a: T, b: T) => number

/** Create SlickGrid column definitions for statistics data. */
function createColumns(store: StoreService, corpora: string[], attrs: string[]): SlickgridColumn[] {
    const cl = corpusListing.pick(corpora)
    const attributes = cl.getReduceAttrs()
    const labels = attrs.map((name) => (name == "word" ? settings["word_label"] : attributes[name]?.label))

    // This sorting will not react to language change, but that's quite alright, we like columns staying in place.
    const getCorpusTitle = (id: string): string => locObj(settings.corpora[id.toLowerCase()].title, store.lang)
    corpora.sort((a, b) => getCorpusTitle(a).localeCompare(getCorpusTitle(b), store.lang))

    const minWidth = 100
    const dir = settings["dir"] ? `dir="${settings["dir"]}"` : ""
    const columns: SlickgridColumn[] = []
    for (let [reduceVal, reduceValLabel] of zip(attrs, labels)) {
        if (reduceVal == null || reduceValLabel == null) break
        columns.push({
            id: reduceVal,
            getName: (lang) => locObj(reduceValLabel!, lang),
            field: "hit_value",
            sortable: true,
            formatter: (row, cell, value, columnDef, data: Row) => {
                if (isTotalRow(data)) return "Σ"
                const output = data.formattedValue[reduceVal!] || `<span class="opacity-50">&empty;</span>`
                return `<div data-row="${data.rowId}" class="link" ${dir}>${output}</div>`
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
        getName: (lang) => loc("stats_total", lang),
        field: "total",
        sortable: true,
        defaultSortAsc: false,
        formatter: (row, cell, value, columnDef, data: Row) => {
            const out = formatFrequency(store, value)
            return `<div class="link">${out}</div>`
        },
        minWidth,
        headerCssClass: "localized-header",
        cssClass: "total-column text-right",
    })

    corpora.forEach((id) =>
        columns.push({
            id,
            getName: (lang) => locObj(settings.corpora[id.toLowerCase()].title, lang),
            field: "count",
            sortable: true,
            defaultSortAsc: false,
            formatter: (row, cell, value, columnDef, data: Row) => {
                const out = formatFrequency(store, value[id])
                return `<div class="link">${out}</div>`
            },
            minWidth,
            cssClass: "text-right",
        }),
    )

    return columns
}

type SlickgridColumn = Slick.Column<Dataset> & {
    getName?: (lang: string) => string
}
