/** @format */
import angular, { IController, IScope, ui } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { downloadFile, html } from "@/util"
import { locObj } from "@/i18n"
import { expandCqp } from "@/cqp_parser/cqp"
import "@/components/corpus-distribution-chart"
import "@/components/reduce-select"
import { RootScope } from "@/root-scope.types"
import { JQueryExtended } from "@/jquery.types"
import { AbsRelSeq, Dataset, isTotalRow, Row, SearchParams } from "@/statistics/statistics.types"
import { CountParams } from "@/backend/types/count"
import { AttributeOption } from "@/corpus_listing"
import { SearchesService } from "@/services/searches"
import { getTimeData } from "@/timedata"
import { StoreService } from "@/services/store"
import { getGeoAttributes, MapAttributeOption } from "@/map"
import { StatisticsGrid } from "@/statistics-grid"
import { createStatisticsCsv, getCqp } from "@/statistics/statistics"
import { ExampleTask } from "@/backend/example-task"
import { MapTask } from "@/backend/map-task"
import { TrendTask } from "@/backend/trend-task"

type StatisticsScope = IScope & {
    clipped: boolean
    reduceOnChange: (data: { selected: string[]; insensitive: string[] }) => void
    statCurrentAttrs: AttributeOption[]
    statSelectedAttrs: string[]
    statInsensitiveAttrs: string[]
    statsRelative: boolean
}

type StatisticsController = IController & {
    aborted: boolean
    data: Dataset
    error: boolean
    loading: boolean
    prevParams: CountParams
    rowCount: number
    searchParams: SearchParams
    warning?: string
    onStatsClick: (event: MouseEvent) => void
    onGraphClick: () => void
    mapToggleSelected: (index: number, event: Event) => void
    generateExport: () => void
    showMap: () => void
    mapEnabled: boolean
    mapAttributes: MapAttributeOption[]
    mapRelative?: boolean
    graphEnabled: boolean
    noRowsError: boolean
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
                </div>
            </div>
        </div>
    `,
    bindings: {
        aborted: "<",
        data: "<",
        error: "<",
        loading: "<",
        prevParams: "<",
        rowCount: "<",
        searchParams: "<",
        warning: "<",
    },
    controller: [
        "$rootScope",
        "$scope",
        "$uibModal",
        "searches",
        "store",
        function (
            $rootScope: RootScope,
            $scope: StatisticsScope,
            $uibModal: ui.bootstrap.IModalService,
            searches: SearchesService,
            store: StoreService
        ) {
            const $ctrl = this as StatisticsController

            $ctrl.noRowsError = false
            $ctrl.mapRelative = true
            let grid: StatisticsGrid
            let corpusListing = settings.corpusListing

            $ctrl.$onInit = () => {
                $(window).on(
                    "resize",
                    _.debounce(() => {
                        grid?.resizeCanvas()
                        grid?.autosizeColumns()
                    }, 100)
                )
            }

            // Set initial value for stats case-insensitive, but only if reduce attr is not set
            if (!store.stats_reduce && settings["statistics_case_insensitive_default"]) {
                store.stats_reduce_insensitive = "word"
            }

            store.watch("lang", () => grid?.refreshColumns())

            store.watch("statsRelative", () => {
                $scope.statsRelative = store.statsRelative
                if (!grid) return
                // Trigger reformatting
                grid.setColumns(grid.getColumns())
            })

            $scope.$watch("statsRelative", () => (store.statsRelative = $scope.statsRelative))

            $ctrl.$onChanges = (changeObj) => {
                if ("searchParams" in changeObj && $ctrl.searchParams) {
                    corpusListing = settings.corpusListing.subsetFactory($ctrl.searchParams.corpora)
                }

                if ("data" in changeObj && $ctrl.data) {
                    grid = new StatisticsGrid(
                        $("#myGrid").get(0)!,
                        $ctrl.data,
                        corpusListing.corpora.map((corpus) => corpus.id.toUpperCase()),
                        $ctrl.searchParams.reduceVals,
                        store,
                        showPieChart,
                        onAttrValueClick
                    )

                    const refreshHeaders = () =>
                        $(".localized-header .slick-column-name")
                            .not("[rel^=localize]")
                            .each(function () {
                                ;($(this) as JQueryExtended).localeKey($(this).text())
                            })

                    grid.onHeaderCellRendered.subscribe((e, args) => refreshHeaders())

                    refreshHeaders()
                    // Select sum row
                    $(".slick-row:first input").click()
                    $(window).trigger("resize")

                    updateGraphBtnState()
                    $ctrl.mapAttributes = getGeoAttributes(corpusListing.corpora)
                }

                if ("rowCount" in changeObj && $ctrl.rowCount) {
                    $scope.clipped = !!settings["statistics_limit"] && $ctrl.rowCount >= settings["statistics_limit"]
                }
            }

            store.watch("corpus", () => {
                // Update list of attributes
                const reduceLang = settings.corpusListing.getReduceLang()
                $scope.statCurrentAttrs = settings.corpusListing.getAttributeGroupsStatistics(reduceLang)

                // Deselect removed attributes, fall back to word
                const names = $scope.statCurrentAttrs.map((option) => option.value)
                const selected = _.intersection(store.stats_reduce.split(","), names)
                $scope.statSelectedAttrs = selected.length > 0 ? selected : ["word"]
                store.stats_reduce = $scope.statSelectedAttrs.join()

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

            function onAttrValueClick(row: Row) {
                if (isTotalRow(row)) return

                let cqp2 = null
                // isPhraseLevelDisjunction can be set in custom code for constructing cqp like: ([] | [])
                if ("isPhraseLevelDisjunction" in row && row.isPhraseLevelDisjunction) {
                    // In this case the statsValues array is one level deeper
                    const statsValues = row.statsValues as unknown as Record<string, string[]>[][]
                    const tokens = statsValues.map((vals) => getCqp(vals, $ctrl.searchParams.ignoreCase))
                    cqp2 = tokens.join(" | ")
                } else {
                    cqp2 = getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                }

                // Find which corpora had any hits (uppercase ids)
                const corpora = Object.keys(row.count).filter((id) => row.count[id][0] > 0)

                $rootScope.kwicTabs.push(
                    new ExampleTask({
                        corpus: corpora.join(","),
                        cqp: $ctrl.prevParams.cqp,
                        cqp2,
                        expand_prequeries: false,
                    })
                )
            }

            $ctrl.onGraphClick = () => {
                const showTotal = grid.getSelectedRows().includes(0)
                const subqueries = getSubqueries()
                $rootScope.graphTabs.push(
                    new TrendTask($ctrl.searchParams.prevNonExpandedCQP, subqueries, showTotal, corpusListing)
                )
            }

            $ctrl.showMap = function () {
                if (grid.getSelectedRows().length == 0) {
                    $ctrl.noRowsError = true
                    return
                }
                $ctrl.noRowsError = false

                const cqp = expandCqp($ctrl.searchParams.prevNonExpandedCQP)
                const cqpExprs = Object.fromEntries(getSubqueries())

                const selectedAttributes = _.filter($ctrl.mapAttributes, "selected")
                if (selectedAttributes.length > 1) {
                    console.log("Warning: more than one selected attribute, choosing first")
                }
                const { label, corpora } = selectedAttributes[0]
                $rootScope.mapTabs.push(new MapTask(cqp, cqpExprs, label, corpora, store.within, $ctrl.mapRelative))
            }

            /** Create KWIC sub queries for selected table rows, as a list of `[cqp, label]` pairs. */
            function getSubqueries(): [string, string][] {
                const rowIds = grid.getSelectedRows().sort()
                const rows = rowIds.map(grid.getDataItem)
                const pairs: [string, string][] = []
                for (const row of rows) {
                    if (isTotalRow(row)) continue
                    const cqp = getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                    const label = $ctrl.searchParams.reduceVals
                        .map((reduceVal) => row.formattedValue[reduceVal])
                        .join(", ")
                    pairs.push([cqp, label])
                }
                return pairs
            }

            $ctrl.mapEnabled = !!settings["map_enabled"]

            $ctrl.mapToggleSelected = function (index, event) {
                _.map($ctrl.mapAttributes, (attr) => (attr.selected = false))
                $ctrl.mapAttributes[index].selected = true
                event.stopPropagation()
            }

            function showPieChart(row: Row) {
                const scope = $scope.$new() as IScope & {
                    rowData: { title: string; values: AbsRelSeq }[]
                }
                scope.rowData = Object.entries(row.count).map(([corpus, absrel]) => ({
                    title: locObj(settings.corpora[corpus.toLowerCase()].title, store.lang),
                    values: absrel,
                }))

                const modal = $uibModal.open({
                    template: html`
                        <div class="modal-header">
                            <h3 class="modal-title !w-full">{{ 'statstable_distribution' | loc }}</h3>
                        </div>
                        <div class="modal-body">
                            <corpus-distribution-chart row="rowData"></corpus-distribution-chart>
                        </div>
                    `,
                    scope,
                    windowClass: "!text-base",
                })
                // Ignore rejection from dismissing the modal
                modal.result.catch(() => {})
            }

            async function updateGraphBtnState() {
                // Ensure cl.getTimeInterval() is not called before time data is loaded.
                await getTimeData()
                $scope.$applyAsync(() => {
                    $ctrl.graphEnabled = !!corpusListing.getTimeInterval()
                })
            }

            $ctrl.generateExport = () => {
                const frequencyType: string = $("#kindOfData option:selected").val()
                const csvType: string = $("#kindOfFormat option:selected").val()
                const { reduceVals } = $ctrl.searchParams
                const corpora = corpusListing.corpora
                const csv = createStatisticsCsv($ctrl.data, reduceVals, corpora, frequencyType, csvType, store.lang)
                const mimeType = csvType == "tsv" ? "text/tab-separated-values" : "text/csv"
                downloadFile(csv, `korp-statistics.${csvType}`, mimeType)
            }
        },
    ],
})
