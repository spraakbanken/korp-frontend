/** @format */
import "slickgrid/lib/jquery.event.drag-2.3.0"
import "slickgrid/slick.core"
import "slickgrid/slick.grid"
import "slickgrid/plugins/slick.checkboxselectcolumn"
import "slickgrid/plugins/slick.rowselectionmodel"
import "slickgrid/slick.interactions.js"
import "slickgrid/slick.grid.css"
import { Dataset, isTotalRow, Row, SingleRow, SlickgridColumn } from "./statistics.types"

export class StatisticsGrid extends Slick.Grid<Row> {
    constructor(
        el: HTMLElement,
        data: Dataset,
        columns: SlickgridColumn[],
        getLang: () => string,
        showPieChart: (row: Row) => void,
        onAttrValueClick: (row: SingleRow) => void
    ) {
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
        this.autosizeColumns()

        this.onSort.subscribe((e, args) => {
            const { sortCol, sortAsc } = args

            if (!(sortCol?.field && sortCol.id)) return
            const sorter = getSorter(sortCol.field, sortCol.id, getLang())

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

        this.onClick.subscribe((e, args) => {
            const column = this.getColumns()[args.cell]
            const row = this.getDataItem(args.row)
            if (column.id == "pieChart") showPieChart(row)
            else if (column.field == "hit_value" && !isTotalRow(row)) onAttrValueClick(row)
        })
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
