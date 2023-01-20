/** @format */
import statisticsFormatting from "../../config/statistics_config.js"

const korpApp = angular.module("korpApp")

korpApp.directive("statsResultCtrl", () => ({
    controller($scope, $location, backend, searches, $rootScope, $timeout) {
        const s = $scope
        s.loading = false
        s.error = false
        s.progress = 0
        s.noRowsError = false

        s.tabindex = 2
        s.gridData = null

        s.doSort = true
        s.sortColumn = null

        s.proxy = new model.StatsProxy()

        $rootScope.$on("make_request", (msg, cqp) => {
            s.makeRequest(cqp)
        })

        s.$on("abort_requests", () => {
            s.proxy.abort()
        })

        s.onStatsClick = (event) => {
            if (event.target.classList.contains("arcDiagramPicture")) {
                const parts = $(event.target).attr("id").split("__")
                showPieChart(parseInt(parts[1]))
            } else if (
                event.target.classList.contains("statistics-link") ||
                (event.target.classList.contains("slick-cell") && $(event.target).find(".statistics-link").length == 1)
            ) {
                let linkElem = $(event.target)
                if (!event.target.classList.contains("statistics-link")) {
                    linkElem = linkElem.find(".statistics-link")
                }
                const rowIx = parseInt(linkElem.data("row"))
                // TODO don't loop
                let rowData
                for (let row of s.data) {
                    if (row.rowId === rowIx) {
                        rowData = row
                        break
                    }
                }
                let cqp2 = null
                // isPhraseLevelDisjunction: used for constructing cqp like: ([] | [])
                if (rowData.isPhraseLevelDisjunction) {
                    let tokens = rowData.statsValues.map((vals) =>
                        statisticsFormatting.getCqp(vals, s.searchParams.ignoreCase)
                    )
                    cqp2 = tokens.join(" | ")
                } else {
                    cqp2 = statisticsFormatting.getCqp(rowData.statsValues, s.searchParams.ignoreCase)
                }
                const { corpora } = s.searchParams

                const opts = {}
                opts.ajaxParams = {
                    start: 0,
                    end: 24,
                    corpus: corpora.join(","),
                    cqp: s.proxy.prevParams.cqp,
                    cqp2,
                    expand_prequeries: false,
                }

                $rootScope.kwicTabs.push({ queryParams: opts })
            }
        }

        $(window).resize(
            _.debounce(() => {
                return s.resizeGrid(true)
            }, 100)
        )

        $("#kindOfData,#kindOfFormat").change(() => {
            showGenerateExport()
        })

        $("#exportButton").hide()
        s.generateExport = () => {
            hideGenerateExport()
            updateExportBlob()
        }

        s.onGraphClick = () => {
            let cqp, rowIx
            if (!s.graphEnabled) {
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
                cqp = statisticsFormatting.getCqp(row.statsValues, s.searchParams.ignoreCase)
                subExprs.push(cqp)
                const parts = s.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                labelMapping[cqp] = parts.join(", ")
            }

            s.onGraphShow({
                cqp: s.proxy.prevNonExpandedCQP,
                subcqps: subExprs,
                labelMapping,
                showTotal,
                corpusListing: settings.corpusListing.subsetFactory(s.searchParams.corpora),
            })
        }

        $("body")
            .scope()
            .$watch("lang", (lang) => {
                if (s.grid) {
                    s.langChange(lang)
                }
            })

        s.onentry = () => {
            s.$root.jsonUrl = s.proxy.prevUrl
            // workaround for bug in slickgrid
            // slickgrid should add this automatically, but doesn't
            $("#myGrid").css("position", "relative")
            $(window).trigger("resize")
        }

        s.onexit = () => {
            s.$root.jsonUrl = null
        }

        s.isActive = () => {
            return s.tabindex == s.$parent.$parent.tabset.active
        }

        s.resetView = () => {
            $("myGrid").empty()
            $("#exportStatsSection").show()
            $("#exportButton").attr({
                download: null,
                href: null,
            })
            s.no_hits = false
            s.aborted = false
        }

        s.onProgress = (progressObj) => (s.progress = Math.round(progressObj["stats"]))

        s.makeRequest = (cqp) => {
            s.error = false
            const grid = document.getElementById("myGrid")
            grid.innerHTML = ""

            s.hasResult = false
            if (!s.shouldSearch()) {
                return
            }

            s.hasResult = true

            if (currentMode === "parallel") {
                cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
            }

            if (s.proxy.hasPending()) {
                s.ignoreAbort = true
            } else {
                s.ignoreAbort = false
                s.resetView()
            }

            s.loading = true
            s.proxy
                .makeRequest(cqp, (progressObj) => {
                    $timeout(() => s.onProgress(progressObj))
                })
                .then(
                    (...args) => {
                        $timeout(() => {
                            const [data, columns, searchParams] = args[0]
                            s.loading = false
                            s.data = data
                            s.searchParams = searchParams
                            s.renderResult(columns, data)
                        })
                    },
                    (textStatus, err) => {
                        $timeout(() => {
                            c.log("fail", arguments)
                            c.log(
                                "stats fail",
                                s.loading,
                                _.map(s.proxy.pendingRequests, (item) => item.readyState)
                            )
                            if (s.ignoreAbort) {
                                c.log("stats ignoreabort")
                                return
                            }
                            s.loading = false
                            if (textStatus === "abort") {
                                s.aborted = true
                            } else {
                                s.resultError(err)
                            }
                        })
                    }
                )
        }

        s.resultError = (data) => {
            c.error("json fetch error: ", data)
            s.loading = false
            s.resetView()
            s.error = true
        }

        s.renderResult = (columns, data) => {
            if (s.isActive()) {
                s.$root.jsonUrl = s.proxy.prevUrl
            }

            showGenerateExport()

            const refreshHeaders = () =>
                $(".localized-header .slick-column-name")
                    .not("[rel^=localize]")
                    .each(function () {
                        return $(this).localeKey($(this).text())
                    })

            s.gridData = data
            const resultError = data.ERROR
            if (resultError != undefined && !resultError) {
                s.resultError(data)
                return
            }

            if (data[0].total_value.absolute === 0) {
                s.no_hits = true
                return
            }

            const checkboxSelector = new Slick.CheckboxSelectColumn({
                cssClass: "slick-cell-checkboxsel",
            })

            columns = [checkboxSelector.getColumnDefinition()].concat(columns)

            updateLabels(columns, $rootScope.lang)
            const grid = new Slick.Grid($("#myGrid"), data, columns, {
                enableCellNavigation: false,
                enableColumnReorder: false,
                forceFitColumns: false,
            })

            grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }))
            grid.registerPlugin(checkboxSelector)
            s.grid = grid
            s.grid.autosizeColumns()

            s.totalNumberOfRows = s.grid.getDataLength()

            grid.onSort.subscribe((e, args) => {
                if (s.doSort) {
                    const sortColumns = grid.getSortColumns()[0]
                    s.sortColumn = sortColumns.columnId
                    s.sortAsc = sortColumns.sortAsc
                    const { sortCol } = args
                    data.sort(function (a, b) {
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

                    grid.setData(data)
                    grid.updateRowCount()
                    return grid.render()
                } else {
                    if (s.sortColumn) {
                        return grid.setSortColumn(s.sortColumn, s.sortAsc)
                    } else {
                        return grid.setSortColumns([])
                    }
                }
            })

            grid.onColumnsResized.subscribe((e, args) => {
                s.doSort = false // if sort event triggered, sorting will not occur
                s.resizeGrid(false)
                e.stopImmediatePropagation()
            })

            grid.onHeaderClick.subscribe((e, args) => {
                s.doSort = true // enable sorting again, resize is done
                e.stopImmediatePropagation()
            })

            grid.onHeaderCellRendered.subscribe((e, args) => refreshHeaders())

            refreshHeaders()
            $(".slick-row:first input", s.$result).click()
            $(window).trigger("resize")

            // TODO this must wait until after timedata is fetched
            updateGraphBtnState()

            s.getGeoAttributes(s.searchParams.corpora)

            s.loading = false
        }

        s.resizeGrid = (resizeColumns) => {
            let width
            let height = 0
            $(".slick-row").each(function () {
                height += $(this).outerHeight(true)
            })
            $("#myGrid:visible.slick-viewport").height(height)

            // adding 20 px to width if vertical scrollbar appears
            if ((s.gridData != null ? s.gridData.length : undefined) * 25 >= height) {
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

            if (s.grid != null) {
                s.grid.resizeCanvas()
                if (resizeColumns) {
                    s.grid.autosizeColumns()
                }
            }
            return s.grid != null ? s.grid.invalidate() : undefined
        }

        s.langChange = (lang) => {
            var cols = s.grid.getColumns()
            updateLabels(cols, lang)
            s.grid.setColumns(cols)
        }

        function updateLabels(cols, lang) {
            for (var i = 0, il = cols.length; i < il; i++) {
                if (cols[i].translation) {
                    cols[i].name = cols[i].translation[lang] || cols[i].translation
                }
            }
        }

        function updateExportBlob() {
            let reduceVal, val
            const selVal = $("#kindOfData option:selected").val() === "absolute" ? 0 : 1
            const selType = $("#kindOfFormat option:selected").val()
            let dataDelimiter = ";"
            if (selType === "tsv") {
                dataDelimiter = "\t"
            }
            const cl = settings.corpusListing.subsetFactory(s.searchParams.corpora)

            let header = []
            for (reduceVal of s.searchParams.reduceVals) {
                header.push(reduceVal)
            }

            header.push(util.getLocaleString("stats_total"))
            header = header.concat(_.map(cl.corpora, (corpus) => util.getLocaleStringObject(corpus["title"])))

            const fmt = (what) => what.toString()

            let output = []
            for (var row of s.data) {
                let outputRow = s.searchParams.reduceVals.map((reduceVal) => {
                    if (row.rowId === 0) {
                        return "Σ"
                    } else {
                        return row[reduceVal].join(",")
                    }
                })
                outputRow.push(fmt(row.total_value[selVal]))
                for (let corp of s.searchParams.corpora) {
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

        function getSelectedRows() {
            if (s.grid) {
                return s.grid.getSelectedRows().sort()
            } else {
                return []
            }
        }

        function getDataAt(rowIx) {
            return s.grid.getData()[rowIx]
        }

        function showGenerateExport() {
            $("#exportButton").hide()
            $("#generateExportButton").show()
        }

        function hideGenerateExport() {
            $("#exportButton").show()
            $("#generateExportButton").hide()
        }

        function updateGraphBtnState() {
            s.graphEnabled = true
            const cl = settings.corpusListing.subsetFactory(s.searchParams.corpora)
            if (!_.compact(cl.getTimeInterval()).length) {
                s.graphEnabled = false
            }
        }

        function showPieChart(rowId) {
            let statsSwitchInstance
            s.pieChartCurrentRowId = rowId

            const getDataItems = (rowId, valueType) => {
                const dataItems = []
                if (valueType === "relative") {
                    valueType = 1
                } else {
                    valueType = 0
                }
                for (let row of s.data) {
                    if (row.rowId === rowId) {
                        for (let corpus of s.searchParams.corpora) {
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
                    stats2Instance.pie_widget("newData", getDataItems(s.pieChartCurrentRowId, typestring))
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

        if (settings["statistics_search_default"]) {
            s.$watch(
                () => $location.search().hide_stats,
                (val) => (s.showStatistics = val == null)
            )
        } else {
            s.$watch(
                () => $location.search().show_stats,
                (val) => (s.showStatistics = val != null)
            )
        }

        s.$watch(
            () => $location.search().in_order,
            (val) => (s.inOrder = val == null)
        )

        s.shouldSearch = () => s.showStatistics && s.inOrder

        $scope.activate = function () {
            if (settings["statistics_search_default"]) {
                $location.search("hide_stats", null)
            } else {
                $location.search("show_stats", true)
            }
            const cqp = searches.getCqpExpr()
            s.showStatistics = true
            s.makeRequest(cqp)
        }

        s.onGraphShow = (data) => $rootScope.graphTabs.push(data)

        s.mapEnabled = settings["map_enabled"]

        s.getGeoAttributes = function (corpora) {
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

            s.mapAttributes = attrs
        }

        s.mapToggleSelected = function (index, event) {
            _.map(s.mapAttributes, (attr) => (attr.selected = false))

            const attr = s.mapAttributes[index]
            attr.selected = true
            return event.stopPropagation()
        }

        s.showMap = function () {
            const selectedRows = getSelectedRows()

            if (selectedRows.length == 0) {
                s.noRowsError = true
                return
            }
            s.noRowsError = false

            const cqpExpr = CQP.expandOperators(searches.getCqpExpr())

            const cqpExprs = {}
            for (let rowIx of selectedRows) {
                if (rowIx === 0) {
                    continue
                }
                var row = getDataAt(rowIx)
                const cqp = statisticsFormatting.getCqp(row.statsValues, s.searchParams.ignoreCase)
                const parts = s.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                cqpExprs[cqp] = parts.join(", ")
            }

            const selectedAttributes = _.filter(s.mapAttributes, "selected")
            if (selectedAttributes.length > 1) {
                c.log("Warning: more than one selected attribute, choosing first")
            }
            const selectedAttribute = selectedAttributes[0]

            const within = settings.corpusListing.subsetFactory(selectedAttribute.corpora).getWithinParameters()
            return $rootScope.mapTabs.push(backend.requestMapData(cqpExpr, cqpExprs, within, selectedAttribute))
        }

        s.countCorpora = () => {
            return s.proxy.prevParams && s.proxy.prevParams.corpus.split(",").length
        }
    },
}))
