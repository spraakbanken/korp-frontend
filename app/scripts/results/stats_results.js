/** @format */
import statisticsFormatting from "../../config/statistics_config.js"
import { BaseResults } from "./base_results.js"

export class StatsResults extends BaseResults {
    constructor(resultSelector, tabSelector, scope) {
        super(resultSelector, tabSelector, scope)
        const self = this
        this.tabindex = 2
        this.gridData = null

        this.doSort = true
        this.sortColumn = null

        this.proxy = new model.StatsProxy()
        window.statsProxy = this.proxy
        this.$result.on("click", ".arcDiagramPicture", (event) => {
            const parts = $(event.currentTarget).attr("id").split("__")
            return this.showPieChart(parseInt(parts[1]))
        })

        this.$result.on("click", ".slick-cell .statistics-link", (e) => {
            let rowData
            const rowIx = $(e.currentTarget).data("row")
            // TODO don't loop
            for (let row of this.data) {
                if (row.rowId === parseInt(rowIx)) {
                    rowData = row
                    break
                }
            }
            let cqp2 = null
            // isPhraseLevelDisjunction: used for constructing cqp like: ([] | [])
            if (rowData.isPhraseLevelDisjunction) {
                let tokens = rowData.statsValues.map((vals) =>
                    statisticsFormatting.getCqp(vals, this.searchParams.ignoreCase)
                )
                cqp2 = tokens.join(" | ")
            } else {
                cqp2 = statisticsFormatting.getCqp(rowData.statsValues, this.searchParams.ignoreCase)
            }
            const { corpora } = this.searchParams

            const opts = {}
            opts.ajaxParams = {
                start: 0,
                end: 24,
                corpus: corpora.join(","),
                cqp: self.proxy.prevParams.cqp,
                cqp2,
                expand_prequeries: false,
            }

            return safeApply(scope.$root, () => scope.$root.kwicTabs.push({ queryParams: opts }))
        })

        $(window).resize(
            _.debounce(() => {
                return this.resizeGrid(true)
            }, 100)
        )

        $("#kindOfData,#kindOfFormat").change(() => {
            return this.showGenerateExport()
        })

        $("#exportButton").hide()
        $("#generateExportButton")
            .unbind("click")
            .click(() => {
                this.hideGenerateExport()
                this.updateExportBlob()
            })

        if ($("html.msie7,html.msie8").length) {
            $("#showGraph").hide()
            return
        }

        $("#showGraph").on("click", () => {
            let cqp, rowIx
            if ($("#showGraph").is(".disabled")) {
                return
            }

            const subExprs = []
            const labelMapping = {}

            let showTotal = false

            for (rowIx of this.getSelectedRows()) {
                if (rowIx === 0) {
                    showTotal = true
                    continue
                }

                var row = this.getDataAt(rowIx)
                cqp = statisticsFormatting.getCqp(row.statsValues, this.searchParams.ignoreCase)
                subExprs.push(cqp)
                const parts = this.searchParams.reduceVals.map((reduceVal) => row.formattedValue[reduceVal])
                labelMapping[cqp] = parts.join(", ")
            }

            this.s.$apply(() => {
                this.s.onGraphShow({
                    cqp: this.proxy.prevNonExpandedCQP,
                    subcqps: subExprs,
                    labelMapping,
                    showTotal,
                    corpusListing: settings.corpusListing.subsetFactory(this.searchParams.corpora),
                })
            })
        })

        const that = this
        $("body")
            .scope()
            .$watch("lang", (lang) => {
                if (that.grid) {
                    that.langChange(lang)
                }
            })
    }

    langChange(lang) {
        var cols = this.grid.getColumns()
        this.updateLabels(cols, lang)
        this.grid.setColumns(cols)
    }

    updateLabels(cols, lang) {
        for (var i = 0, il = cols.length; i < il; i++) {
            if (cols[i].translation) {
                cols[i].name = cols[i].translation[lang] || cols[i].translation
            }
        }
    }

    updateExportBlob() {
        let reduceVal, val
        const selVal = $("#kindOfData option:selected").val() === "absolute" ? 0 : 1
        const selType = $("#kindOfFormat option:selected").val()
        let dataDelimiter = ";"
        if (selType === "tsv") {
            dataDelimiter = "\t"
        }
        const cl = settings.corpusListing.subsetFactory(this.searchParams.corpora)

        let header = []
        for (reduceVal of this.searchParams.reduceVals) {
            header.push(reduceVal)
        }

        header.push(util.getLocaleString("stats_total"))
        header = header.concat(_.map(cl.corpora, (corpus) => util.getLocaleStringObject(corpus["title"])))

        const fmt = (what) => what.toString()

        let output = []
        for (var row of this.data) {
            let outputRow = this.searchParams.reduceVals.map((reduceVal) => {
                if (row.rowId === 0) {
                    return "Σ"
                } else {
                    return row[reduceVal].join(",")
                }
            })
            outputRow.push(fmt(row.total_value[selVal]))
            for (let corp of this.searchParams.corpora) {
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

        $("#exportButton", this.$result).attr({
            download: `export.${selType}`,
            href: csvUrl,
        })
    }

    makeRequest(cqp) {
        const grid = document.getElementById("myGrid")
        grid.innerHTML = ""

        this.s.hasResult = false
        if (!this.s.shouldSearch()) {
            return
        }

        this.s.hasResult = true

        if (currentMode === "parallel") {
            cqp = cqp.replace(/\:LINKED_CORPUS.*/, "")
        }

        if (this.proxy.hasPending()) {
            this.ignoreAbort = true
        } else {
            this.ignoreAbort = false
            this.resetView()
        }

        this.showPreloader()
        this.proxy
            .makeRequest(cqp, (...args) => this.onProgress(...(args || [])))
            .then(
                (...args) => {
                    const [data, columns, searchParams] = args[0]
                    safeApply(this.s, () => {
                        return this.hidePreloader()
                    })
                    this.data = data
                    this.searchParams = searchParams
                    return this.renderResult(columns, data)
                },
                (textStatus, err) => {
                    c.log("fail", arguments)
                    c.log(
                        "stats fail",
                        this.s.$parent.loading,
                        _.map(this.proxy.pendingRequests, (item) => item.readyState)
                    )
                    if (this.ignoreAbort) {
                        c.log("stats ignoreabort")
                        return
                    }
                    safeApply(this.s, () => {
                        this.hidePreloader()
                        if (textStatus === "abort") {
                            this.s.aborted = true
                        } else {
                            this.resultError(err)
                        }
                    })
                }
            )
    }

    getSelectedRows() {
        if (this.grid) {
            return this.grid.getSelectedRows().sort()
        } else {
            return []
        }
    }

    getDataAt(rowIx) {
        return this.grid.getData()[rowIx]
    }

    showGenerateExport() {
        $("#exportButton").hide()
        $("#generateExportButton").show()
    }

    hideGenerateExport() {
        $("#exportButton").show()
        $("#generateExportButton").hide()
    }

    renderResult(columns, data) {
        if (this.isActive()) {
            this.s.$root.jsonUrl = this.proxy.prevUrl
        }

        this.showGenerateExport()

        const refreshHeaders = () =>
            $(".localized-header .slick-column-name")
                .not("[rel^=localize]")
                .each(function () {
                    return $(this).localeKey($(this).text())
                })

        this.gridData = data
        const resultError = super.renderResult(data)
        if (resultError === false) {
            return
        }

        if (data[0].total_value.absolute === 0) {
            safeApply(this.s, () => {
                this.s.no_hits = true
            })
            return
        }

        const checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass: "slick-cell-checkboxsel",
        })

        columns = [checkboxSelector.getColumnDefinition()].concat(columns)

        this.updateLabels(columns, $("body").scope().lang)
        const grid = new Slick.Grid($("#myGrid"), data, columns, {
            enableCellNavigation: false,
            enableColumnReorder: false,
            forceFitColumns: false,
        })

        grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }))
        grid.registerPlugin(checkboxSelector)
        this.grid = grid
        this.grid.autosizeColumns()

        this.s.totalNumberOfRows = this.grid.getDataLength()

        grid.onSort.subscribe((e, args) => {
            if (this.doSort) {
                const sortColumns = grid.getSortColumns()[0]
                this.sortColumn = sortColumns.columnId
                this.sortAsc = sortColumns.sortAsc
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
                if (this.sortColumn) {
                    return grid.setSortColumn(this.sortColumn, this.sortAsc)
                } else {
                    return grid.setSortColumns([])
                }
            }
        })

        grid.onColumnsResized.subscribe((e, args) => {
            this.doSort = false // if sort event triggered, sorting will not occur
            this.resizeGrid(false)
            return e.stopImmediatePropagation()
        })

        grid.onHeaderClick.subscribe((e, args) => {
            this.doSort = true // enable sorting again, resize is done
            return e.stopImmediatePropagation()
        })

        grid.onHeaderCellRendered.subscribe((e, args) => refreshHeaders())

        refreshHeaders()
        $(".slick-row:first input", this.$result).click()
        $(window).trigger("resize")

        safeApply(this.s, () => {
            // TODO this must wait until after timedata is fetched
            this.updateGraphBtnState()
        })

        this.s.getGeoAttributes(this.searchParams.corpora)

        safeApply(this.s, () => {
            this.hidePreloader()
        })
    }

    updateGraphBtnState() {
        this.s.graphEnabled = true
        const cl = settings.corpusListing.subsetFactory(this.searchParams.corpora)
        if (!_.compact(cl.getTimeInterval()).length) {
            this.s.graphEnabled = false
        }
    }

    resizeGrid(resizeColumns) {
        let width
        let height = 0
        $(".slick-row").each(function () {
            height += $(this).outerHeight(true)
        })
        $("#myGrid:visible.slick-viewport").height(height)

        // adding 20 px to width if vertical scrollbar appears
        if ((this.gridData != null ? this.gridData.length : undefined) * 25 >= height) {
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

        if (this.grid != null) {
            this.grid.resizeCanvas()
            if (resizeColumns) {
                this.grid.autosizeColumns()
            }
        }
        return this.grid != null ? this.grid.invalidate() : undefined
    }

    showPieChart(rowId) {
        let statsSwitchInstance
        this.pieChartCurrentRowId = rowId

        const getDataItems = (rowId, valueType) => {
            const dataItems = []
            if (valueType === "relative") {
                valueType = 1
            } else {
                valueType = 0
            }
            for (let row of this.data) {
                if (row.rowId === rowId) {
                    for (let corpus of this.searchParams.corpora) {
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
                stats2Instance.pie_widget("newData", getDataItems(this.pieChartCurrentRowId, typestring))
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

    onentry() {
        // workaround for bug in slickgrid
        // slickgrid should add this automatically, but doesn't
        $("#myGrid").css("position", "relative")

        super.onentry()
        $(window).trigger("resize")
    }

    resetView() {
        super.resetView()
        $("myGrid").empty()
        $("#exportStatsSection").show()
        $("#exportButton").attr({
            download: null,
            href: null,
        })
        this.s.no_hits = false
        this.s.aborted = false
    }
}