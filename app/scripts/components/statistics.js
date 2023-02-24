/** @format */
import statisticsFormatting from "../../config/statistics_config.js"

let html = String.raw
export const statisticsComponent = {
    template: html`
        <div ng-click="$ctrl.onStatsClick($event)" ng-show="!$ctrl.error">
            <div ng-if="!$ctrl.inOrder && !$ctrl.hasResult">{{'stats_not_in_order_warn' | loc:$root.lang}}</div>
            <div ng-if="!$ctrl.showStatistics">
                {{'stats_warn' | loc:$root.lang}}
                <div>
                    <button class="btn btn-sm btn-default activate_word_pic" ng-click="$ctrl.activate()">
                        {{'word_pic_warn_btn' | loc:$root.lang}}
                    </button>
                </div>
            </div>
            <div ng-if="$ctrl.showStatistics && !$ctrl.hasResult && $ctrl.inOrder">
                <div>
                    <button class="btn btn-sm btn-default activate_word_pic" ng-click="$ctrl.activate()">
                        {{'update_btn' | loc:$root.lang}}
                    </button>
                </div>
            </div>
            <warning ng-if="$ctrl.showStatistics && $ctrl.noHits"> {{"no_stats_results" | loc:$root.lang}} </warning>
            <warning ng-if="$ctrl.showStatistics && $ctrl.aborted && !$ctrl.loading">
                {{'search_aborted' | loc:$root.lang}}
            </warning>
            <div ng-show="$ctrl.showStatistics && $ctrl.hasResult">
                <div class="stats_header">
                    <button
                        class="btn btn-sm btn-default show-graph-btn"
                        ng-click="$ctrl.onGraphClick()"
                        ng-class="{disabled: !$ctrl.graphEnabled}"
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
                        <button class="btn btn-sm btn-default" uib-dropdown-toggle>
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
                            <div class="btn-container">
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
                    {{'total_rows' | loc:$root.lang}} {{$ctrl.totalNumberOfRows}}
                </div>
                <div id="myGrid"></div>
                <div id="exportStatsSection">
                    <br /><br />
                    <select id="kindOfData">
                        <option value="relative" rel="localize[statstable_relfigures]">Relativa tal</option>
                        <option value="absolute" rel="localize[statstable_absfigures]">Absoluta tal</option>
                    </select>
                    <select id="kindOfFormat">
                        <option value="csv" rel="localize[statstable_exp_csv]">CSV (kommaseparerade värden)</option>
                        <option value="tsv" rel="localize[statstable_exp_tsv]">TSV (tabseparerade värden)</option>
                    </select>
                    <a id="generateExportButton" ng-click="generateExport()">
                        <button class="btn btn-sm btn-default">{{'statstable_gen_export' | loc:$root.lang}}</button>
                    </a>
                    <a class="btn btn-sm btn-default" id="exportButton"> {{'statstable_export' | loc:$root.lang}} </a>
                </div>
            </div>
        </div>
    `,
    bindings: {
        aborted: "<",
        activate: "<",
        columns: "<",
        data: "<",
        error: "<",
        gridData: "<",
        hasResult: "<",
        inOrder: "<",
        loading: "<",
        noHits: "<",
        prevNonExpandedCQP: "<",
        prevParams: "<",
        searchParams: "<",
        showStatistics: "<",
    },
    controller: [
        "$rootScope",
        "searches",
        "backend",
        function ($rootScope, searches, backend) {
            const $ctrl = this

            $ctrl.noRowsError = false

            $ctrl.doSort = true
            $ctrl.sortColumn = null

            $ctrl.$onInit = () => {
                $(window).resize(
                    _.debounce(() => {
                        return $ctrl.resizeGrid(true)
                    }, 100)
                )

                $("#kindOfData,#kindOfFormat").change(() => {
                    showGenerateExport()
                })

                $("#exportButton").hide()

                $("body")
                    .scope()
                    .$watch("lang", (lang) => {
                        if ($ctrl.grid) {
                            $ctrl.langChange(lang)
                        }
                    })
            }

            $ctrl.$onChanges = (changeObj) => {
                if ("columns" in changeObj && $ctrl.columns != undefined) {
                    showGenerateExport()

                    const checkboxSelector = new Slick.CheckboxSelectColumn({
                        cssClass: "slick-cell-checkboxsel",
                    })

                    $ctrl.columns = [checkboxSelector.getColumnDefinition()].concat($ctrl.columns)

                    updateLabels($ctrl.columns, $rootScope.lang)

                    const grid = new Slick.Grid($("#myGrid"), $ctrl.data, $ctrl.columns, {
                        enableCellNavigation: false,
                        enableColumnReorder: false,
                        forceFitColumns: false,
                    })

                    grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }))
                    grid.registerPlugin(checkboxSelector)
                    $ctrl.grid = grid
                    $ctrl.grid.autosizeColumns()

                    $ctrl.totalNumberOfRows = $ctrl.grid.getDataLength()

                    grid.onSort.subscribe((e, args) => {
                        if ($ctrl.doSort) {
                            const sortColumns = grid.getSortColumns()[0]
                            $ctrl.sortColumn = sortColumns.columnId
                            $ctrl.sortAsc = sortColumns.sortAsc
                            const { sortCol } = args
                            $ctrl.data.sort(function (a, b) {
                                let x, y
                                if (a.id === "row_total") {
                                    return -1
                                }
                                if (b.id === "row_total") {
                                    return -1
                                }
                                if (sortCol.field === "hit_value") {
                                    x = a[sortColumns.columnId]
                                    y = b[sortColumns.columnId]
                                } else {
                                    x = a[sortCol.field][0] || 0
                                    y = b[sortCol.field][0] || 0
                                }
                                let ret = x === y ? 0 : x > y ? 1 : -1
                                if (!args.sortAsc) {
                                    ret *= -1
                                }
                                return ret
                            })

                            grid.setData($ctrl.data)
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

                    grid.onHeaderClick.subscribe((e, args) => {
                        $ctrl.doSort = true // enable sorting again, resize is done
                        e.stopImmediatePropagation()
                    })

                    const refreshHeaders = () =>
                        $(".localized-header .slick-column-name")
                            .not("[rel^=localize]")
                            .each(function () {
                                return $(this).localeKey($(this).text())
                            })

                    grid.onHeaderCellRendered.subscribe((e, args) => refreshHeaders())

                    refreshHeaders()
                    // TODO what should this do, select first row?
                    $(".slick-row:first input", $ctrl.$result).click()
                    $(window).trigger("resize")

                    // TODO this must wait until after timedata is fetched
                    updateGraphBtnState()

                    $ctrl.setGeoAttributes($ctrl.searchParams.corpora)
                }
            }

            $ctrl.langChange = (lang) => {
                var cols = $ctrl.grid.getColumns()
                updateLabels(cols, lang)
                $ctrl.grid.setColumns(cols)
            }

            function updateLabels(cols, lang) {
                for (var i = 0, il = cols.length; i < il; i++) {
                    if (cols[i].translation) {
                        cols[i].name = cols[i].translation[lang] || cols[i].translation
                    }
                }
            }

            $ctrl.onStatsClick = (event) => {
                if (event.target.classList.contains("arcDiagramPicture")) {
                    const parts = $(event.target).attr("id").split("__")
                    showPieChart(parseInt(parts[1]))
                } else if (
                    event.target.classList.contains("statistics-link") ||
                    (event.target.classList.contains("slick-cell") &&
                        $(event.target).find(".statistics-link").length == 1)
                ) {
                    let linkElem = $(event.target)
                    if (!event.target.classList.contains("statistics-link")) {
                        linkElem = linkElem.find(".statistics-link")
                    }
                    const rowIx = parseInt(linkElem.data("row"))
                    // TODO don't loop
                    let rowData
                    for (let row of $ctrl.data) {
                        if (row.rowId === rowIx) {
                            rowData = row
                            break
                        }
                    }
                    let cqp2 = null
                    // isPhraseLevelDisjunction: used for constructing cqp like: ([] | [])
                    if (rowData.isPhraseLevelDisjunction) {
                        let tokens = rowData.statsValues.map((vals) =>
                            statisticsFormatting.getCqp(vals, $ctrl.searchParams.ignoreCase)
                        )
                        cqp2 = tokens.join(" | ")
                    } else {
                        cqp2 = statisticsFormatting.getCqp(rowData.statsValues, $ctrl.searchParams.ignoreCase)
                    }

                    const opts = {}
                    opts.ajaxParams = {
                        start: 0,
                        end: 24,
                        corpus: $ctrl.searchParams.originalCorpora,
                        cqp: $ctrl.prevParams.cqp,
                        cqp2,
                        expand_prequeries: false,
                    }

                    $rootScope.kwicTabs.push({ queryParams: opts })
                }
            }

            $ctrl.onGraphClick = () => {
                let cqp, rowIx
                if (!$ctrl.graphEnabled) {
                    return
                }

                const subExprs = []
                const labelMapping = {}

                let showTotal = false

                for (rowIx of getSelectedRows()) {
                    if (rowIx === 0) {
                        showTotal = true
                        continue
                    }

                    var row = getDataAt(rowIx)
                    cqp = statisticsFormatting.getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                    subExprs.push(cqp)
                    const parts = $ctrl.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                    labelMapping[cqp] = parts.join(", ")
                }

                $rootScope.graphTabs.push({
                    cqp: $ctrl.prevNonExpandedCQP,
                    subcqps: subExprs,
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

                // TODO this is wrong, it should use the previous search
                const cqpExpr = CQP.expandOperators(searches.getCqpExpr())

                const cqpExprs = {}
                for (let rowIx of selectedRows) {
                    if (rowIx === 0) {
                        continue
                    }
                    var row = getDataAt(rowIx)
                    const cqp = statisticsFormatting.getCqp(row.statsValues, $ctrl.searchParams.ignoreCase)
                    const parts = $ctrl.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                    cqpExprs[cqp] = parts.join(", ")
                }

                const selectedAttributes = _.filter($ctrl.mapAttributes, "selected")
                if (selectedAttributes.length > 1) {
                    c.log("Warning: more than one selected attribute, choosing first")
                }
                const selectedAttribute = selectedAttributes[0]

                const within = settings.corpusListing.subsetFactory(selectedAttribute.corpora).getWithinParameters()
                $rootScope.mapTabs.push(backend.requestMapData(cqpExpr, cqpExprs, within, selectedAttribute))
            }

            $ctrl.mapEnabled = settings["map_enabled"]

            $ctrl.setGeoAttributes = function (corpora) {
                let attrs = {}
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

                attrs = _.map(attrs, (val) => val)
                if (attrs && attrs.length > 0) {
                    attrs[0].selected = true
                }

                $ctrl.mapAttributes = attrs
            }

            $ctrl.mapToggleSelected = function (index, event) {
                _.map($ctrl.mapAttributes, (attr) => (attr.selected = false))

                const attr = $ctrl.mapAttributes[index]
                attr.selected = true
                event.stopPropagation()
            }

            function showPieChart(rowId) {
                let statsSwitchInstance
                const pieChartCurrentRowId = rowId

                const getDataItems = (rowId, valueType) => {
                    const dataItems = []
                    if (valueType === "relative") {
                        valueType = 1
                    } else {
                        valueType = 0
                    }
                    for (let row of $ctrl.data) {
                        if (row.rowId === rowId) {
                            for (let corpus of $ctrl.searchParams.corpora) {
                                const freq = row[corpus + "_value"][valueType]
                                dataItems.push({
                                    value: freq,
                                    caption:
                                        util.getLocaleStringObject(settings.corpora[corpus.toLowerCase()]["title"]) +
                                        ": " +
                                        util.formatDecimalString(freq.toString()),
                                    shape_id: rowId,
                                })
                            }
                            break
                        }
                    }
                    return dataItems
                }

                $("#dialog").remove()

                const relHitsString = util.getLocaleString("statstable_relfigures_hits")
                $("<div id='dialog'></div>")
                    .appendTo("body")
                    .append(
                        `<div id="pieDiv"><br/><div id="statistics_switch" style="text-align:center">
                        <a href="javascript:" rel="localize[statstable_relfigures]" data-mode="relative">Relativa frekvenser</a>
                        <a href="javascript:" rel="localize[statstable_absfigures]" data-mode="absolute">Absoluta frekvenser</a>
                    </div>
                    <div id="chartFrame" style="height:380"></div>
                    <p id="hitsDescription" style="text-align:center" rel="localize[statstable_absfigures_hits]">${relHitsString}</p>
                    </div>`
                    )
                    .dialog({
                        width: 400,
                        height: 500,
                        close() {
                            return $("#pieDiv").remove()
                        },
                    })
                    .css("opacity", 0)
                    .parent()
                    .find(".ui-dialog-title")
                    .localeKey("statstable_hitsheader_lemgram")

                $("#dialog").fadeTo(400, 1)
                $("#dialog").find("a").blur() // Prevents the focus of the first link in the "dialog"

                const stats2Instance = $("#chartFrame").pie_widget({
                    container_id: "chartFrame",
                    data_items: getDataItems(rowId, "relative"),
                })
                statsSwitchInstance = $("#statistics_switch").radioList({
                    change: () => {
                        let loc
                        const typestring = statsSwitchInstance.radioList("getSelected").attr("data-mode")
                        stats2Instance.pie_widget("newData", getDataItems(pieChartCurrentRowId, typestring))
                        if (typestring === "absolute") {
                            loc = "statstable_absfigures_hits"
                        } else {
                            loc = "statstable_relfigures_hits"
                        }
                        return $("#hitsDescription").localeKey(loc)
                    },
                    selected: "relative",
                })
            }

            $ctrl.resizeGrid = (resizeColumns) => {
                let width
                let height = 0
                $(".slick-row").each(function () {
                    height += $(this).outerHeight(true)
                })
                $("#myGrid:visible.slick-viewport").height(height)

                // adding 20 px to width if vertical scrollbar appears
                if (($ctrl.gridData != null ? $ctrl.gridData.length : undefined) * 25 >= height) {
                    width = 20
                } else {
                    width = 0
                }

                $(".slick-header-column").each(function () {
                    width += $(this).outerWidth(true)
                })
                if (width > $(window).width() - 40) {
                    width = $(window).width() - 40
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

            function updateGraphBtnState() {
                $ctrl.graphEnabled = true
                const cl = settings.corpusListing.subsetFactory($ctrl.searchParams.corpora)
                if (!_.compact(cl.getTimeInterval()).length) {
                    $ctrl.graphEnabled = false
                }
            }

            function getSelectedRows() {
                if ($ctrl.grid) {
                    return $ctrl.grid.getSelectedRows().sort()
                } else {
                    return []
                }
            }

            function getDataAt(rowIx) {
                return $ctrl.grid.getData()[rowIx]
            }

            function updateExportBlob() {
                let reduceVal, val
                const selVal = $("#kindOfData option:selected").val() === "absolute" ? 0 : 1
                const selType = $("#kindOfFormat option:selected").val()
                let dataDelimiter = ";"
                if (selType === "tsv") {
                    dataDelimiter = "\t"
                }
                const cl = settings.corpusListing.subsetFactory($ctrl.searchParams.corpora)

                let header = []
                for (reduceVal of $ctrl.searchParams.reduceVals) {
                    header.push(reduceVal)
                }

                header.push(util.getLocaleString("stats_total"))
                header = header.concat(_.map(cl.corpora, (corpus) => util.getLocaleStringObject(corpus["title"])))

                const fmt = (what) => what.toString()

                let output = []
                for (var row of $ctrl.data) {
                    let outputRow = $ctrl.searchParams.reduceVals.map((reduceVal) => {
                        if (row.rowId === 0) {
                            return "Σ"
                        } else {
                            return row[reduceVal].join(",")
                        }
                    })
                    outputRow.push(fmt(row.total_value[selVal]))
                    for (let corp of $ctrl.searchParams.corpora) {
                        val = row[corp + "_value"][selVal]
                        if (val) {
                            outputRow.push(fmt(val))
                        } else {
                            outputRow.push("0")
                        }
                    }
                    output.push(outputRow)
                }

                const csv = new CSV(output, {
                    header,
                    delimiter: dataDelimiter,
                })

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
}
