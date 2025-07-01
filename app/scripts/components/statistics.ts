/** @format */
import angular, { IController, IScope, ui } from "angular"
import _ from "lodash"
import CSV from "comma-separated-values/csv"
import settings from "@/settings"
import { html } from "@/util"
import { loc, locObj } from "@/i18n"
import { getCqp } from "../../config/statistics_config"
import { expandOperators } from "@/cqp_parser/cqp"
import { requestMapData } from "@/backend/backend"
import "@/backend/backend"
import "@/components/corpus-distribution-chart"
import "@/components/reduce-select"
import { RootScope } from "@/root-scope.types"
import { JQueryExtended } from "@/jquery.types"
import { AbsRelSeq, Dataset, isTotalRow, Row, SearchParams, SingleRow, SlickgridColumn } from "@/statistics.types"
import { CountParams } from "@/backend/types/count"
import { LocationService } from "@/urlparams"
import { AttributeOption } from "@/corpus_listing"
import { SearchesService } from "@/services/searches"
import { getTimeData } from "@/timedata"
import { StoreService } from "@/services/store"

type StatisticsScope = IScope & {
    clipped: boolean
    reduceOnChange: (data: { selected: string[]; insensitive: string[] }) => void
    rowData: { title: string; values: AbsRelSeq }[]
    statCurrentAttrs: AttributeOption[]
    statSelectedAttrs: string[]
    statInsensitiveAttrs: string[]
    statsRelative: boolean
}

type StatisticsController = IController & {
    aborted: boolean
    columns: SlickgridColumn[]
    data: Dataset
    doSort: boolean
    error: boolean
    grid: Slick.Grid<Row>
    loading: boolean
    prevParams: CountParams
    rowCount: number
    searchParams: SearchParams
    sortColumn?: string
    warning?: string
    onStatsClick: (event: MouseEvent) => void
    onGraphClick: () => void
    resizeGrid: (resizeColumns: boolean) => void
    setGeoAttributes: (corpora: string[]) => void
    mapToggleSelected: (index: number, event: Event) => void
    generateExport: () => void
    showMap: () => void
    mapEnabled: boolean
    mapAttributes: MapAttributeOption[]
    mapRelative?: boolean
    graphEnabled: boolean
    noRowsError: boolean
}

type MapAttributeOption = {
    label: string
    corpora: string[]
    selected?: boolean
}

angular.module("korpApp").component("statistics", {
    template: html`
        <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
            <div class="flex items-center gap-1">
                <label for="reduce-select">{{ "reduce_text" | loc:$root.lang }}:</label>
                <reduce-select
                    items="statCurrentAttrs"
                    selected="statSelectedAttrs"
                    insensitive="statInsensitiveAttrs"
                    on-change="reduceOnChange"
                ></reduce-select>
            </div>
            <label>
                <input type="checkbox" ng-model="statsRelative" />
                {{"num_results_relative" | loc:$root.lang}}
                <i
                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                    uib-tooltip="{{'relative_help' | loc:$root.lang}}"
                ></i>
            </label>
        </div>

        <div ng-click="$ctrl.onStatsClick($event)" ng-show="!$ctrl.error">
            <div ng-if="$ctrl.warning" class="korp-warning" role="status">{{$ctrl.warning | loc:$root.lang}}</div>

            <div ng-if="$ctrl.aborted && !$ctrl.loading" class="korp-warning" role="status">
                {{'search_aborted' | loc:$root.lang}}
            </div>

            <div ng-show="!$ctrl.warning && !$ctrl.aborted">
                <div class="stats_header">
                    <button
                        class="btn btn-sm btn-default show-graph-btn"
                        ng-click="$ctrl.onGraphClick()"
                        ng-disabled="$ctrl.loading || !$ctrl.graphEnabled"
                        uib-tooltip="{{'material_warn' | loc:$root.lang}}"
                        tooltip-placement="right"
                        tooltip-enable="!$ctrl.graphEnabled"
                    >
                        <span class="graph_btn_icon">
                            <svg
                                height="24"
                                version="1.1"
                                width="33"
                                xmlns="http://www.w3.org/2000/svg"
                                style="overflow: hidden; position: relative"
                            >
                                <desc style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0)">
                                    Created with Raphaël 2.1.0
                                </desc>
                                <defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0)"></defs>
                                <path
                                    fill="#666666"
                                    stroke="none"
                                    d="M3.625,25.062C3.086,24.947000000000003,2.74,24.416,2.855,23.875L2.855,23.875L6.51,6.584L8.777,15.843L10.7,10.655000000000001L14.280999999999999,14.396L18.163999999999998,1.293000000000001L21.098,13.027000000000001L23.058,11.518L28.329,23.258000000000003C28.555,23.762000000000004,28.329,24.353,27.824,24.579000000000004L27.824,24.579000000000004C27.319000000000003,24.806000000000004,26.728,24.579000000000004,26.502000000000002,24.075000000000003L26.502000000000002,24.075000000000003L22.272000000000002,14.647000000000002L19.898000000000003,16.473000000000003L18.002000000000002,8.877000000000002L15.219000000000003,18.270000000000003L11.465000000000003,14.346000000000004L8.386,22.66L6.654999999999999,15.577L4.811999999999999,24.288C4.710999999999999,24.76,4.297,25.082,3.8329999999999993,25.082L3.8329999999999993,25.082C3.765,25.083,3.695,25.076,3.625,25.062L3.625,25.062Z"
                                    transform="matrix(0.6,0,0,0.6,6.2499,5.275)"
                                    stroke-width="1.6666666666666667"
                                    style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0)"
                                ></path>
                            </svg>
                        </span>
                        {{'show_diagram' | loc:$root.lang}}
                    </button>
                    <div
                        class="map-settings-container"
                        uib-dropdown
                        auto-close="outsideClick"
                        ng-show="$ctrl.mapEnabled"
                    >
                        <button
                            class="btn btn-sm btn-default"
                            uib-dropdown-toggle
                            ng-disabled="$ctrl.loading || !$ctrl.mapAttributes.length"
                            uib-tooltip="{{'map_no_data' | loc:$root.lang}}"
                            tooltip-placement="right"
                            tooltip-enable="!$ctrl.mapAttributes.length"
                        >
                            {{'show_map' | loc:$root.lang}}<span class="caret"></span>
                        </button>
                        <div uib-dropdown-menu>
                            <h3 class="map-settings-title">{{'select_attribute' | loc:$root.lang}}</h3>
                            <ul ng-if="$ctrl.mapAttributes.length != 0">
                                <li
                                    ng-repeat="attr in $ctrl.mapAttributes"
                                    ng-class="attr.selected ? 'selected':''"
                                    ng-click="$ctrl.mapToggleSelected($index, $event)"
                                >
                                    <span class="checked">✔</span>
                                    <span>{{attr.label | loc:$root.lang}}</span>
                                </li>
                            </ul>
                            <span class="empty-attribute-list" ng-show="$ctrl.mapAttributes.length == 0">
                                {{ 'no_geo_info' | loc:$root.lang}}
                            </span>
                            <div class="p-2 flex justify-end items-baseline gap-2">
                                <div class="whitespace-nowrap">
                                    <input type="checkbox" id="map-relative" ng-model="$ctrl.mapRelative" />
                                    <label for="map-relative">
                                        {{'map_relative' | loc:$root.lang}}
                                        <i
                                            class="fa fa-info-circle text-gray-400"
                                            uib-tooltip="{{'map_relative_help' | loc:$root.lang}}"
                                            tooltip-placement="bottom"
                                        ></i>
                                    </label>
                                </div>
                                <button
                                    class="btn btn-sm btn-primary"
                                    ng-disabled="$ctrl.mapAttributes.length == 0"
                                    ng-click="$ctrl.showMap()"
                                >
                                    {{'show_map' | loc:$root.lang}}
                                </button>
                            </div>
                        </div>
                        <span class="ml-3 err_msg" ng-if="$ctrl.noRowsError">
                            {{'no_row_selected_map' | loc:$root.lang}}
                        </span>
                    </div>
                    <div id="showBarPlot"></div>
                </div>
                <div ng-if="!$ctrl.loading" style="margin-bottom: 5px">
                    {{'total_rows' | loc:$root.lang}} {{$ctrl.data.length - 1 | prettyNumber:$root.lang}}
                    <span ng-if="clipped">
                        {{'stats_clipped' | loc:$root.lang}}
                        <i
                            class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                            uib-tooltip="{{'stats_clipped_help' | loc:$root.lang}}"
                        ></i>
                    </span>
                </div>
                <div id="myGrid"></div>
                <div id="exportStatsSection">
                    <br /><br />
                    <select id="kindOfData">
                        <option value="relative">{{ 'statstable_relfigures' | loc:$root.lang }}</option>
                        <option value="absolute">{{ 'statstable_absfigures' | loc:$root.lang }}</option>
                    </select>
                    <select id="kindOfFormat">
                        <option value="csv">{{ 'statstable_exp_csv' | loc:$root.lang }}</option>
                        <option value="tsv">{{ 'statstable_exp_tsv' | loc:$root.lang }}</option>
                    </select>
                    <a id="generateExportButton" ng-click="$ctrl.generateExport()">
                        <button class="btn btn-sm btn-default">{{'statstable_gen_export' | loc:$root.lang}}</button>
                    </a>
                    <a class="btn btn-sm btn-default" id="exportButton"> {{'statstable_export' | loc:$root.lang}} </a>
                </div>
            </div>
        </div>
    `,
    bindings: {
        aborted: "<",
        columns: "<",
        data: "<",
        error: "<",
        loading: "<",
        prevParams: "<",
        rowCount: "<",
        searchParams: "<",
        warning: "<",
    },
    controller: [
        "$location",
        "$rootScope",
        "$scope",
        "$uibModal",
        "searches",
        "store",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: StatisticsScope,
            $uibModal: ui.bootstrap.IModalService,
            searches: SearchesService,
            store: StoreService
        ) {
            const $ctrl = this as StatisticsController

            $ctrl.noRowsError = false
            $ctrl.doSort = true
            $ctrl.sortColumn = undefined
            $ctrl.mapRelative = true

            $ctrl.$onInit = () => {
                $(window).on(
                    "resize",
                    _.debounce(() => $ctrl.resizeGrid(true), 100)
                )

                $("#kindOfData,#kindOfFormat").change(() => {
                    showGenerateExport()
                })

                $("#exportButton").hide()
            }

            // Set initial value for stats case-insensitive, but only if reduce attr is not set
            if (!store.stats_reduce && settings["statistics_case_insensitive_default"]) {
                store.stats_reduce_insensitive = "word"
            }

            store.watch("lang", () => {
                if (!$ctrl.grid) return
                const cols = $ctrl.grid.getColumns()
                updateLabels(cols)
                $ctrl.grid.setColumns(cols)
            })

            store.watch("statsRelative", () => {
                $scope.statsRelative = store.statsRelative
                if (!$ctrl.grid) return
                // Trigger reformatting
                $ctrl.grid.setColumns($ctrl.grid.getColumns())
            })

            $scope.$watch("statsRelative", () => (store.statsRelative = $scope.statsRelative))

            $ctrl.$onChanges = (changeObj) => {
                if ("columns" in changeObj && $ctrl.columns != undefined) {
                    showGenerateExport()

                    // @ts-ignore CheckboxSelectColumn type is missing?
                    const checkboxSelector = new Slick.CheckboxSelectColumn({
                        cssClass: "slick-cell-checkboxsel",
                    })

                    $ctrl.columns = [checkboxSelector.getColumnDefinition()].concat($ctrl.columns)

                    updateLabels($ctrl.columns)

                    const grid = new Slick.Grid($("#myGrid"), $ctrl.data, $ctrl.columns, {
                        enableCellNavigation: false,
                        enableColumnReorder: false,
                        forceFitColumns: false,
                    })

                    // @ts-ignore RowSelectionModel type is missing?
                    grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }))
                    grid.registerPlugin(checkboxSelector)
                    $ctrl.grid = grid
                    $ctrl.grid.autosizeColumns()

                    grid.onSort.subscribe((e, args) => {
                        if ($ctrl.doSort) {
                            // @ts-ignore columnId is missing from type, but it's there
                            const { columnId, sortAsc, sortCol } = args
                            $ctrl.sortColumn = columnId
                            $ctrl.sortAsc = sortAsc

                            $ctrl.data.sort((a, b) => {
                                if (!sortCol) return 0

                                // Place totals row first
                                if (isTotalRow(a)) return -1
                                if (isTotalRow(b)) return 1

                                const direction = sortAsc ? 1 : -1

                                // Sort by an attribute value
                                if (sortCol.field == "hit_value") {
                                    const x = a.formattedValue[columnId]
                                    const y = b.formattedValue[columnId]
                                    return x.localeCompare(y, store.lang) * direction
                                }

                                // Sort totals column by absolute hit count
                                if (sortCol.field == "total") {
                                    return (a.total[0] - b.total[0]) * direction
                                }

                                // Sort data column by absolute hit count
                                if (sortCol.field == "count" && sortCol.id) {
                                    const x = a.count[sortCol.id][0]
                                    const y = b.count[sortCol.id][0]
                                    return (x - y) * direction
                                }

                                return 0
                            })

                            grid.setData($ctrl.data, false)
                            grid.updateRowCount()
                            grid.render()
                        } else {
                            if ($ctrl.sortColumn) {
                                grid.setSortColumn($ctrl.sortColumn, $ctrl.sortAsc)
                            } else {
                                grid.setSortColumns([])
                            }
                        }
                    })

                    grid.onColumnsResized.subscribe((e, args) => {
                        $ctrl.doSort = false // if sort event triggered, sorting will not occur
                        $ctrl.resizeGrid(false)
                        e.stopImmediatePropagation()
                    })

                    grid.onClick.subscribe((e, args) => {
                        const column = grid.getColumns()[args.cell]
                        if (column.id == "pieChart") showPieChart(args.row)
                        else if (column.field == "hit_value") onAttrValueClick(args.row)
                    })

                    grid.onHeaderClick.subscribe((e, args) => {
                        $ctrl.doSort = true // enable sorting again, resize is done
                        e.stopImmediatePropagation()
                    })

                    const refreshHeaders = () =>
                        $(".localized-header .slick-column-name")
                            .not("[rel^=localize]")
                            .each(function () {
                                ;($(this) as JQueryExtended).localeKey($(this).text())
                            })

                    grid.onHeaderCellRendered.subscribe((e, args) => refreshHeaders())

                    refreshHeaders()
                    // Select sum row
                    $(".slick-row:first input", $ctrl.$result).click()
                    $(window).trigger("resize")

                    updateGraphBtnState()

                    $ctrl.setGeoAttributes($ctrl.searchParams.corpora)
                }

                if ("rowCount" in changeObj && $ctrl.rowCount) {
                    $scope.clipped = !!settings["statistics_limit"] && $ctrl.rowCount >= settings["statistics_limit"]
                }
            }

            function updateLabels(cols: SlickgridColumn[]) {
                cols.forEach((col) => {
                    if (col.translation) col.name = locObj(col.translation, store.lang)
                })
            }

            store.watch("corpus", () => {
                const allAttrs = settings.corpusListing.getStatsAttributeGroups(settings.corpusListing.getReduceLang())
                $scope.statCurrentAttrs = _.filter(allAttrs, (item) => !item["hide_statistics"])
                $scope.statSelectedAttrs = (store.stats_reduce || "word").split(",")
                const insensitiveAttrs = store.stats_reduce_insensitive
                $scope.statInsensitiveAttrs = insensitiveAttrs ? insensitiveAttrs.split(",") : []
            })

            $scope.reduceOnChange = ({ selected, insensitive }) => {
                if (selected) $scope.statSelectedAttrs = selected
                if (insensitive) $scope.statInsensitiveAttrs = insensitive

                if ($scope.statSelectedAttrs && $scope.statSelectedAttrs.length > 0) {
                    const isModified =
                        $scope.statSelectedAttrs.length != 1 || !$scope.statSelectedAttrs.includes("word")
                    store.stats_reduce = isModified ? $scope.statSelectedAttrs.join(",") : "word"
                }

                if ($scope.statInsensitiveAttrs && $scope.statInsensitiveAttrs.length > 0) {
                    store.stats_reduce_insensitive = $scope.statInsensitiveAttrs.join(",")
                } else if ($scope.statInsensitiveAttrs) {
                    store.stats_reduce_insensitive = ""
                }

                debouncedSearch()
            }

            const debouncedSearch = _.debounce(searches.doSearch, 500)

            function onAttrValueClick(row: number) {
                const rowData = $ctrl.grid.getDataItem(row) as SingleRow
                if (isTotalRow(rowData)) return

                let cqp2 = null
                // isPhraseLevelDisjunction can be set in custom code for constructing cqp like: ([] | [])
                if ("isPhraseLevelDisjunction" in rowData && rowData.isPhraseLevelDisjunction) {
                    // In this case the statsValues array is one level deeper
                    const statsValues = rowData.statsValues as unknown as Record<string, string[]>[][]
                    const tokens = statsValues.map((vals) => getCqp(vals, $ctrl.searchParams.ignoreCase))
                    cqp2 = tokens.join(" | ")
                } else {
                    cqp2 = getCqp(rowData.statsValues, $ctrl.searchParams.ignoreCase)
                }

                // Find which corpora had any hits (uppercase ids)
                const corpora = Object.keys(rowData.count).filter((id) => rowData.count[id][0] > 0)

                $rootScope.kwicTabs.push({
                    queryParams: {
                        corpus: corpora.join(","),
                        cqp: $ctrl.prevParams.cqp,
                        cqp2,
                        expand_prequeries: false,
                    },
                })
            }

            $ctrl.onGraphClick = () => {
                const subcqps: string[] = []
                const labelMapping: Record<string, string> = {}

                const showTotal = getSelectedRows().includes(0)

                for (const rowIx of getSelectedRows()) {
                    const row = getDataAt(rowIx)
                    if (isTotalRow(row)) continue
                    const cqp = getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                    subcqps.push(cqp)
                    const parts = $ctrl.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                    labelMapping[cqp] = parts.join(", ")
                }

                $rootScope.graphTabs.push({
                    cqp: $ctrl.searchParams.prevNonExpandedCQP,
                    subcqps,
                    labelMapping,
                    showTotal,
                    corpusListing: settings.corpusListing.subsetFactory($ctrl.searchParams.corpora),
                })
            }

            $ctrl.showMap = function () {
                const selectedRows = getSelectedRows()

                if (selectedRows.length == 0) {
                    $ctrl.noRowsError = true
                    return
                }
                $ctrl.noRowsError = false

                let cqp = $ctrl.searchParams.prevNonExpandedCQP
                try {
                    cqp = expandOperators(cqp)
                } catch {}

                const cqpExprs: Record<string, string> = {}
                for (let rowIx of selectedRows) {
                    var row = getDataAt(rowIx)
                    if (isTotalRow(row)) continue
                    const cqp = getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                    const parts = $ctrl.searchParams.reduceVals.map(
                        (reduceVal) => (row as SingleRow).formattedValue[reduceVal]
                    )
                    cqpExprs[cqp] = parts.join(", ")
                }

                const selectedAttributes = _.filter($ctrl.mapAttributes, "selected")
                if (selectedAttributes.length > 1) {
                    console.log("Warning: more than one selected attribute, choosing first")
                }
                const selectedAttribute = selectedAttributes[0]
                const request = requestMapData(cqp, cqpExprs, store.within, selectedAttribute, $ctrl.mapRelative)
                $rootScope.mapTabs.push(request)
            }

            $ctrl.mapEnabled = !!settings["map_enabled"]

            $ctrl.setGeoAttributes = function (corpora) {
                const attrs: Record<string, MapAttributeOption> = {}
                for (let corpus of settings.corpusListing.subsetFactory(corpora).selected) {
                    for (let attr of corpus.private_struct_attributes) {
                        if (attr.indexOf("geo") !== -1) {
                            if (attrs[attr]) {
                                attrs[attr].corpora.push(corpus.id)
                            } else {
                                attrs[attr] = {
                                    label: attr,
                                    corpora: [corpus.id],
                                }
                            }
                        }
                    }
                }

                $ctrl.mapAttributes = Object.values(attrs)

                // Select first attribute
                if ($ctrl.mapAttributes.length) {
                    $ctrl.mapAttributes[0].selected = true
                }
            }

            $ctrl.mapToggleSelected = function (index, event) {
                _.map($ctrl.mapAttributes, (attr) => (attr.selected = false))
                $ctrl.mapAttributes[index].selected = true
                event.stopPropagation()
            }

            function showPieChart(row: number) {
                const item = $ctrl.grid.getDataItem(row)

                $scope.rowData = $ctrl.searchParams.corpora.map((corpus) => ({
                    title: locObj(settings.corpora[corpus.toLowerCase()]["title"]),
                    values: item.count[corpus],
                }))

                const modal = $uibModal.open({
                    template: html`
                        <div class="modal-header">
                            <h3 class="modal-title !w-full">{{ 'statstable_distribution' | loc }}</h3>
                        </div>
                        <div class="modal-body">
                            <corpus-distribution-chart row="$parent.rowData"></corpus-distribution-chart>
                        </div>
                    `,
                    scope: $scope,
                    windowClass: "!text-base",
                })
                // Ignore rejection from dismissing the modal
                modal.result.catch(() => {})
            }

            $ctrl.resizeGrid = (resizeColumns) => {
                let width: number
                let height = 0
                $(".slick-row").each(function () {
                    height += $(this).outerHeight(true) || 0
                })
                $("#myGrid:visible.slick-viewport").height(height)

                // adding 20 px to width if vertical scrollbar appears
                width = $ctrl.data?.length * 25 >= height ? 20 : 0

                $(".slick-header-column").each(function () {
                    width += $(this).outerWidth(true) || 0
                })
                if (width > ($(window).width() || 0) - 40) {
                    width = ($(window).width() || 0) - 40
                }
                $("#myGrid:visible.slick-viewport").width(width)

                if ($ctrl.grid != null) {
                    $ctrl.grid.resizeCanvas()
                    if (resizeColumns) {
                        $ctrl.grid.autosizeColumns()
                    }
                }
                return $ctrl.grid != null ? $ctrl.grid.invalidate() : undefined
            }

            async function updateGraphBtnState() {
                await getTimeData()
                const cl = settings.corpusListing.subsetFactory($ctrl.searchParams.corpora)
                $scope.$applyAsync(() => {
                    $ctrl.graphEnabled = _.compact(cl.getTimeInterval()).length > 0
                })
            }

            const getSelectedRows = () => ($ctrl.grid ? $ctrl.grid.getSelectedRows().sort() : [])

            function getDataAt(rowIx: number): Row {
                return $ctrl.grid.getData()[rowIx]
            }

            function updateExportBlob() {
                let reduceVal, val
                const selVal = $("#kindOfData option:selected").val() === "absolute" ? 0 : 1
                const selType = $("#kindOfFormat option:selected").val()
                const delimiter = selType == "tsv" ? "\t" : ";"
                const cl = settings.corpusListing.subsetFactory($ctrl.searchParams.corpora)

                let header = []
                for (reduceVal of $ctrl.searchParams.reduceVals) {
                    header.push(reduceVal)
                }

                header.push(loc("stats_total"))
                header = header.concat(_.map(cl.corpora, (corpus) => locObj(corpus["title"])))

                let output = []
                for (const row of $ctrl.data) {
                    // One cell per grouped attribute
                    // TODO Should isPhraseLevelDisjunction be handled here?
                    const outputRow: string[] = $ctrl.searchParams.reduceVals.map((attr) =>
                        isTotalRow(row) ? "Σ" : row.plainValue[attr]
                    )
                    outputRow.push(String(row.total[selVal]))
                    for (let corp of $ctrl.searchParams.corpora) {
                        val = row.count[corp][selVal] || 0
                        outputRow.push(String(val))
                    }
                    output.push(outputRow)
                }

                const csv = new CSV(output, { header, delimiter })

                const csvstr = csv.encode()

                const blob = new Blob([csvstr], { type: `text/${selType}` })
                const csvUrl = URL.createObjectURL(blob)

                $("#exportButton").attr({
                    download: `export.${selType}`,
                    href: csvUrl,
                })
            }

            $ctrl.generateExport = () => {
                hideGenerateExport()
                updateExportBlob()
            }

            function showGenerateExport() {
                $("#exportButton").hide()
                $("#generateExportButton").show()
            }

            function hideGenerateExport() {
                $("#exportButton").show()
                $("#generateExportButton").hide()
            }
        },
    ],
})
