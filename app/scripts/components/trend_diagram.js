/** @format */
import * as trendUtil from "../trend_diagram/trend_util"

const granularities = {
    year: "y",
    month: "m",
    day: "d",
    hour: "h",
    minute: "n",
    second: "s",
}

const zoomLevelToFormat = {
    second: "YYYY-MM-DD hh:mm:ss",
    minute: "YYYY-MM-DD hh:mm",
    hour: "YYYY-MM-DD hh",
    day: "YYYY-MM-DD",
    month: "YYYY-MM",
    year: "YYYY",
}

const validZoomLevels = Object.keys(granularities)

let html = String.raw
export const trendDiagramComponent = {
    template: html`
        <korp-error ng-show="$ctrl.error"></korp-error>
        <div class="graph_tab" ng-show="!$ctrl.error">
            <div class="graph_header">
                <div class="controls">
                    <div class="btn-group form_switch">
                        <label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'line'"
                            >{{'line' | loc:lang}}</label
                        ><label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'bar'"
                            >{{'bar' | loc:lang}}</label
                        ><label class="btn btn-default btn-sm" ng-model="$ctrl.mode" uib-btn-radio="'table'"
                            >{{'table' | loc:lang}}</label
                        >
                    </div>
                    <div class="non_time_div">
                        <span rel="localize[non_time_before]"></span><span class="non_time"></span
                        ><span rel="localize[non_time_after]"></span>
                    </div>
                </div>
                <div class="legend" ng-style='{visibility : !$ctrl.loading && $ctrl.isGraph() ? "visible" : "hidden"}'>
                    <div
                        class="line"
                        ng-show="$ctrl.hasEmptyIntervals"
                        uib-tooltip="{{'graph_material_tooltip' | loc:lang}}"
                    >
                        <a class="action"></a>
                        <div class="swatch" style="background-color: #999"></div>
                        <span class="label"> <em>{{'graph_material' | loc:lang}} </em></span>
                    </div>
                </div>
                <div style="clear: both;"></div>
            </div>
            <div class="chart_container">
                <div class="preloader" ng-class="{loading: $ctrl.loading}">
                    <i class="fa fa-spinner fa-spin fa-5x"></i>
                </div>
                <div class="chart" ng-show="$ctrl.isGraph()" ng-click="$ctrl.graphClickHandler()"></div>
            </div>
            <div class="preview"></div>
            <div class="time_table" style="margin-top:20px" ng-show="$ctrl.isTable()"></div>
            <div class="exportTimeStatsSection" ng-show="$ctrl.isTable()">
                <select class="timeKindOfData">
                    <option value="relative">{{'statstable_relfigures' | loc:lang}}</option>
                    <option value="absolute">{{'statstable_absfigures' | loc:lang}}</option></select
                ><select class="timeKindOfFormat">
                    <option value="TSV">{{'statstable_exp_tsv' | loc:lang}}</option>
                    <option value="CSV">{{'statstable_exp_csv' | loc:lang}}</option></select
                ><a class="export btn btn-default btn-sm">{{'statstable_export' | loc:lang}}</a>
            </div>
        </div>
    `,
    bindings: {
        data: "<",
        onProgress: "<",
        updateLoading: "<",
    },
    controller: [
        "$rootScope",
        "$timeout",
        "$element",
        function ($rootScope, $timeout, $element) {
            const $ctrl = this
            $ctrl.zoom = "year"
            $ctrl.proxy = new model.GraphProxy()
            $ctrl.$result = $element.find(".graph_tab")
            $ctrl.mode = "line"
            $ctrl.error = false

            $ctrl.$onInit = () => {
                const [from, to] = $ctrl.data.corpusListing.getMomentInterval()
                checkZoomLevel(from, to, true)
            }

            $ctrl.isGraph = () => ["line", "bar"].includes($ctrl.mode)
            $ctrl.isTable = () => $ctrl.mode === "table"

            $ctrl.graphClickHandler = () => {
                const target = $(".chart", $ctrl.$result)
                const time = $(".detail .x_label > span", target).data("val")
                let cqp = $(".detail .item.active > span", target).data("cqp")
                const zoom = $ctrl.zoom

                if (!cqp) {
                    return
                }

                const nTokens = $ctrl.data.cqp.split("]").length - 2
                const timecqp = trendUtil.getTimeCQP(time, zoom, nTokens, validZoomLevels.indexOf(zoom) < 3)
                const decodedCQP = decodeURIComponent(cqp)
                const opts = {
                    ajaxParams: {
                        start: 0,
                        end: 24,
                        corpus: $ctrl.data.corpusListing.stringifySelected(),
                        cqp: $ctrl.data.cqp,
                        cqp2: CQP.expandOperators(decodedCQP),
                        cqp3: timecqp,
                        expand_prequeries: false,
                    },
                }

                $rootScope.kwicTabs.push({ queryParams: opts })
            }

            $ctrl.localUpdateLoading = (loading) => {
                $ctrl.updateLoading(loading)
                $ctrl.loading = loading
            }

            function drawPreloader(from, to) {
                let left, width
                if ($ctrl.graph) {
                    left = $ctrl.graph.x(from.unix())
                    width = $ctrl.graph.x(to.unix()) - left
                } else {
                    left = 0
                    width = "100%"
                }

                $(".preloader", $ctrl.$result).css({
                    left,
                    width,
                })
            }

            function setZoom(zoom, from, to) {
                $ctrl.zoom = zoom
                const fmt = "YYYYMMDDHHmmss"

                drawPreloader(from, to)
                $ctrl.proxy.granularity = granularities[zoom]
                makeRequest(
                    $ctrl.data.cqp,
                    $ctrl.data.subcqps,
                    $ctrl.data.corpusListing,
                    $ctrl.data.labelMapping,
                    $ctrl.data.showTotal,
                    from.format(fmt),
                    to.format(fmt)
                )
            }

            function checkZoomLevel(from, to, forceSearch) {
                if (from == null) {
                    let domain = $ctrl.graph.renderer.domain()
                    from = moment.unix(domain.x[0])
                    to = moment.unix(domain.x[1])
                }

                const oldZoom = $ctrl.zoom

                const idealNumHits = 1000
                let newZoom = _.minBy(validZoomLevels, function (zoom) {
                    const nPoints = to.diff(from, zoom)
                    return Math.abs(idealNumHits - nPoints)
                })

                if ((newZoom && oldZoom !== newZoom) || forceSearch) {
                    setZoom(newZoom, from, to)
                }
            }

            function fillMissingDate(data) {
                const dateArray = _.map(data, "x")
                const min = _.minBy(dateArray, (mom) => mom.toDate())
                const max = _.maxBy(dateArray, (mom) => mom.toDate())

                min.startOf($ctrl.zoom)
                max.endOf($ctrl.zoom)

                const n_diff = moment(max).diff(min, $ctrl.zoom)

                const momentMapping = _.fromPairs(
                    _.map(data, (item) => {
                        const mom = moment(item.x)
                        mom.startOf($ctrl.zoom)
                        return [mom.unix(), item.y]
                    })
                )

                const newMoments = []
                for (let i of _.range(0, n_diff + 1)) {
                    var lastYVal
                    const newMoment = moment(min).add(i, $ctrl.zoom)

                    const maybeCurrent = momentMapping[newMoment.unix()]
                    if (typeof maybeCurrent !== "undefined") {
                        lastYVal = maybeCurrent
                    } else {
                        newMoments.push({ x: newMoment, y: lastYVal })
                    }
                }

                return [].concat(data, newMoments)
            }

            function getSeriesData(data, zoom) {
                delete data[""]

                let output = []
                for (let [x, y] of _.toPairs(data)) {
                    const mom = trendUtil.parseDate($ctrl.zoom, x)
                    output.push({ x: mom, y })
                }

                output = fillMissingDate(output)

                for (let tuple of output) {
                    tuple.x = tuple.x.unix()
                    tuple.zoom = zoom
                }

                output = output.sort((a, b) => a.x - b.x)

                return output
            }

            function getNonTime() {
                // TODO: move settings.corpusListing.selected to the subview
                const non_time = _.reduce(
                    _.map(settings.corpusListing.selected, "non_time"),
                    (a, b) => (a || 0) + (b || 0),
                    0
                )
                const sizelist = _.map(settings.corpusListing.selected, (item) => Number(item.info.Size))
                const totalsize = _.reduce(sizelist, (a, b) => a + b)
                return (non_time / totalsize) * 100
            }

            function getEmptyIntervals(data) {
                const intervals = []
                let i = 0

                while (i < data.length) {
                    let item = data[i]

                    if (item.y === null) {
                        const interval = [_.clone(item)]
                        let breaker = true
                        while (breaker) {
                            i++
                            item = data[i]
                            if ((item != null ? item.y : undefined) === null) {
                                interval.push(_.clone(item))
                            } else {
                                intervals.push(interval)
                                breaker = false
                            }
                        }
                    }
                    i++
                }

                return intervals
            }

            function drawIntervals(graph) {
                const { emptyIntervals } = graph.series[0]
                $ctrl.hasEmptyIntervals = emptyIntervals.length
                let obj = graph.renderer.domain()
                let [from, to] = obj.x

                const unitSpan = moment.unix(to).diff(moment.unix(from), $ctrl.zoom)
                const unitWidth = graph.width / unitSpan

                $(".empty_area", $ctrl.$result).remove()
                for (let list of emptyIntervals) {
                    const max = _.maxBy(list, "x")
                    const min = _.minBy(list, "x")
                    from = graph.x(min.x)
                    to = graph.x(max.x)

                    $("<div>", { class: "empty_area" })
                        .css({
                            left: from - unitWidth / 2,
                            width: to - from + unitWidth,
                        })
                        .appendTo(graph.element)
                }
            }

            function setBarMode() {
                /**
                 * This code enables the first series in the legend if there are none selected (except sum)
                 * It then disables the sum data series since that data does not make sense in bar mode
                 * If the sum data series is disabled first, it will not work
                 */
                if ($(".legend .line", $ctrl.$result).length > 1) {
                    const allNonSumSeries = $(".legend li.line:not(:last-child)", $ctrl.$result)
                    if (allNonSumSeries.toArray().some((item) => $(item).is(".disabled"))) {
                        $(".legend li:first .action", $ctrl.$result).click()
                    }
                    $(".legend li:last:not(.disabled) .action", $ctrl.$result).click()
                }
            }

            function setTableMode(series) {
                $(".chart,.legend", $ctrl.$result).hide()
                $(".time_table", $ctrl.$result.parent()).show()
                const nRows = series.length || 2
                let h = nRows * 2 + 4
                h = Math.min(h, 40)
                $(".time_table:visible", $ctrl.$result).height(`${h}.1em`)
                if ($ctrl.time_grid != null) {
                    $ctrl.time_grid.resizeCanvas()
                }
                $(".exportTimeStatsSection", $ctrl.$result).show()

                $(".exportTimeStatsSection .btn.export", $ctrl.$result).click(() => {
                    const selVal = $(".timeKindOfData option:selected", $ctrl.$result).val()
                    const selType = $(".timeKindOfFormat option:selected", $ctrl.$result).val()
                    const dataDelimiter = selType === "TSV" ? "\t" : ";"

                    const header = [util.getLocaleString("stats_hit")]

                    for (let cell of series[0].data) {
                        const stampformat = zoomLevelToFormat[cell.zoom]
                        header.push(moment(cell.x * 1000).format(stampformat))
                    }

                    const output = [header]

                    for (let row of series) {
                        const cells = [row.name === "&Sigma;" ? "Σ" : row.name]
                        for (let cell of row.data) {
                            if (selVal === "relative") {
                                cells.push(cell.y)
                            } else {
                                const i = _.sortedIndexOf(_.map(row.abs_data, "x"), cell.x)
                                cells.push(row.abs_data[i].y)
                            }
                        }
                        output.push(cells)
                    }

                    const csv = new CSV(output, {
                        delimiter: dataDelimiter,
                    })

                    const csvstr = csv.encode()
                    const blob = new Blob([csvstr], { type: `text/${selType}` })
                    const csvUrl = URL.createObjectURL(blob)

                    const a = document.createElement("a")
                    a.href = csvUrl
                    a.download = `export.${selType}`
                    a.style.display = "none"
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    window.URL.revokeObjectURL(csvUrl)
                })
            }

            function renderTable(series) {
                const time_table_data = []
                const time_table_columns_intermediate = {}
                for (let row of series) {
                    const new_time_row = { label: row.name }
                    for (let item of row.data) {
                        const stampformat = zoomLevelToFormat[item.zoom]
                        const timestamp = moment(item.x * 1000).format(stampformat) // this needs to be fixed for other resolutions
                        time_table_columns_intermediate[timestamp] = {
                            name: timestamp,
                            field: timestamp,
                            formatter(row, cell, value, columnDef, dataContext) {
                                const loc = {
                                    swe: "sv-SE",
                                    eng: "gb-EN",
                                }[$("body").scope().lang]
                                const fmt = function (valTup) {
                                    if (typeof valTup[0] === "undefined") {
                                        return ""
                                    }
                                    return (
                                        "<span>" +
                                        "<span class='relStat'>" +
                                        Number(valTup[1].toFixed(1)).toLocaleString(loc) +
                                        "</span> " +
                                        "<span class='absStat'>(" +
                                        valTup[0].toLocaleString(loc) +
                                        ")</span> " +
                                        "<span>"
                                    )
                                }
                                return fmt(value)
                            },
                        }
                        const i = _.sortedIndexOf(_.map(row.abs_data, "x"), item.x)
                        new_time_row[timestamp] = [item.y, row.abs_data[i].y]
                    }
                    time_table_data.push(new_time_row)
                }
                // Sort columns
                const time_table_columns = [
                    {
                        name: "Hit",
                        field: "label",
                        formatter(row, cell, value, columnDef, dataContext) {
                            return value
                        },
                    },
                ]
                for (let key of _.keys(time_table_columns_intermediate).sort()) {
                    time_table_columns.push(time_table_columns_intermediate[key])
                }

                const time_grid = new Slick.Grid($(".time_table", $ctrl.$result), time_table_data, time_table_columns, {
                    enableCellNavigation: false,
                    enableColumnReorder: false,
                    forceFitColumns: false,
                })
                $(".time_table", $ctrl.$result).width("100%")
                $ctrl.time_grid = time_grid
            }

            function makeSeries(data, cqp, labelMapping, zoom) {
                let color, series

                if (_.isArray(data.combined)) {
                    const palette = [
                        "#ca472f",
                        "#0b84a5",
                        "#f6c85f",
                        "#9dd866",
                        "#ffa056",
                        "#8dddd0",
                        "#df9eaa",
                        "#6f4e7c",
                        "#544e4d",
                        "#0e6e16",
                        "#975686",
                    ]
                    let colorIdx = 0
                    series = []
                    for (let item of data.combined) {
                        color = palette[colorIdx % palette.length]
                        colorIdx += 1
                        series.push({
                            data: getSeriesData(item.relative, zoom),
                            color,
                            name: item.cqp ? $ctrl.data.labelMapping[item.cqp] : "&Sigma;",
                            cqp: item.cqp || cqp,
                            abs_data: getSeriesData(item.absolute, zoom),
                        })
                    }
                } else {
                    series = [
                        {
                            data: getSeriesData(data.combined.relative, zoom),
                            color: "steelblue",
                            name: "&Sigma;",
                            cqp,
                            abs_data: getSeriesData(data.combined.absolute, zoom),
                        },
                    ]
                }
                Rickshaw.Series.zeroFill(series)

                const emptyIntervals = getEmptyIntervals(series[0].data)
                series[0].emptyIntervals = emptyIntervals

                for (let s of series) {
                    s.data = _.filter(s.data, (item) => item.y !== null)
                    s.abs_data = _.filter(s.abs_data, (item) => item.y !== null)
                }

                return series
            }

            function spliceData(newSeries) {
                for (let seriesIndex = 0; seriesIndex < $ctrl.graph.series.length; seriesIndex++) {
                    const seriesObj = $ctrl.graph.series[seriesIndex]
                    const first = newSeries[seriesIndex].data[0].x
                    const last = _.last(newSeries[seriesIndex].data).x
                    let startSplice = false
                    let from = 0
                    let n_elems = seriesObj.data.length + newSeries[seriesIndex].data.length
                    for (let i = 0; i < seriesObj.data.length; i++) {
                        var j
                        const { x } = seriesObj.data[i]
                        if (x >= first && !startSplice) {
                            startSplice = true
                            from = i
                            j = 0
                        }
                        if (startSplice) {
                            if (x >= last) {
                                n_elems = j + 1
                                break
                            }
                            j++
                        }
                    }

                    seriesObj.data.splice(from, n_elems, ...newSeries[seriesIndex].data)
                    seriesObj.abs_data.splice(from, n_elems, ...newSeries[seriesIndex].abs_data)
                }
            }

            function previewPanStop() {
                const visibleData = $ctrl.graph.stackData()

                const count = _.countBy(visibleData[0], (coor) => coor.zoom)

                const grouped = _.groupBy(visibleData[0], "zoom")

                for (let zoomLevel in grouped) {
                    const points = grouped[zoomLevel]
                    if (zoomLevel !== $ctrl.zoom) {
                        const from = moment.unix(points[0].x)
                        from.startOf($ctrl.zoom)
                        const to = moment.unix(_.last(points).x)
                        to.endOf($ctrl.zoom)
                        setZoom($ctrl.zoom, from, to)
                    }
                }
            }

            function renderGraph(data, cqp, labelMapping, currentZoom, showTotal) {
                let series

                const done = () => {
                    $ctrl.localUpdateLoading(false)
                    $(window).trigger("resize")
                }

                if (data.ERROR) {
                    $ctrl.error = true
                    return
                }

                if ($ctrl.graph) {
                    series = makeSeries(data, cqp, labelMapping, currentZoom)
                    spliceData(series)
                    drawIntervals($ctrl.graph)
                    $ctrl.graph.render()
                    done()
                    return
                }

                const nontime = getNonTime()

                if (nontime) {
                    $(".non_time", $ctrl.$result)
                        .empty()
                        .text(nontime.toFixed(2) + "%")
                        .parent()
                        .localize()
                } else {
                    $(".non_time_div", $ctrl.$result).hide()
                }

                series = makeSeries(data, cqp, labelMapping, currentZoom)

                const graph = new Rickshaw.Graph({
                    element: $(".chart", $ctrl.$result).empty().get(0),
                    renderer: "line",
                    interpolation: "linear",
                    series,
                    padding: {
                        top: 0.1,
                        right: 0.01,
                    },
                })
                let width = $(".tab-pane").width()
                graph.setSize({ width })
                graph.render()
                window._graph = $ctrl.graph = graph

                drawIntervals(graph)

                $(window).on(
                    "resize",
                    _.throttle(() => {
                        if ($ctrl.$result.is(":visible")) {
                            width = $(".tab-pane").width()
                            graph.setSize()
                            $ctrl.preview.configure({ width })
                            $ctrl.preview.render()
                            return graph.render()
                        }
                    }, 200)
                )

                $(".form_switch", $ctrl.$result).click(() => {
                    const val = $ctrl.mode
                    for (let cls of $ctrl.$result.attr("class").split(" ")) {
                        if (cls.match(/^form-/)) {
                            $ctrl.$result.removeClass(cls)
                        }
                    }
                    $ctrl.$result.addClass(`form-${val}`)
                    $(".chart,.legend", $ctrl.$result.parent()).show()
                    $(".time_table", $ctrl.$result.parent()).hide()
                    if (val === "bar") {
                        setBarMode()
                    } else if (val === "table") {
                        renderTable(series)
                        setTableMode(series)
                    }

                    if (val !== "table") {
                        graph.setRenderer(val)
                        graph.render()
                        $(".exportTimeStatsSection", $ctrl.$result).hide()
                    }
                })

                const legend = new Rickshaw.Graph.Legend({
                    element: $(".legend", $ctrl.$result).get(0),
                    graph,
                })

                const shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                    graph,
                    legend,
                })

                if (!showTotal && $(".legend .line", $ctrl.$result).length > 1) {
                    $(".legend .line:last .action", $ctrl.$result).click()
                }

                new Rickshaw.Graph.HoverDetail({
                    // xFormatter and yFormatter are called once for every data series per "hover detail creation"
                    // formatter is only called once per per "hover detail creation"
                    graph,
                    xFormatter(x) {
                        return `<span data-val='${x}'>${trendUtil.formatUnixDate($ctrl.zoom, x)}</span>`
                    },

                    yFormatter(y) {
                        const val = util.formatDecimalString(y.toFixed(2), false, true, true)

                        return (
                            `<br><span rel='localize[rel_hits_short]'>${util.getLocaleString(
                                "rel_hits_short"
                            )}</span> ` + val
                        )
                    },
                    formatter(series, x, y, formattedX, formattedY, d) {
                        let abs_y
                        const i = _.sortedIndexOf(_.map(series.data, "x"), x)
                        try {
                            abs_y = series.abs_data[i].y
                        } catch (e) {
                            c.log("i", i, x)
                        }

                        const rel = series.name + ":&nbsp;" + formattedY
                        return `<span data-cqp="${encodeURIComponent(series.cqp)}">
                                ${rel}
                                <br>
                                ${util.getLocaleString("abs_hits_short")}: ${abs_y}
                            </span>`
                    },
                })

                // [first, last] = settings.corpusListing.getTimeInterval()
                // [firstVal, lastVal] = settings.corpusListing.getMomentInterval()

                // TODO: fix decade again
                // timeunit = if last - first > 100 then "decade" else @zoom

                const toDate = (sec) => moment(sec * 1000).toDate()

                const time = new Rickshaw.Fixtures.Time()
                // Fix time.ceil for decades: Rickshaw.Fixtures.Time.ceil
                // returns one decade too small values for 1900 and before.
                // (The root cause may be Rickshaw's approximate handling of
                // leap years: 1900 was not a leap year.)
                const old_ceil = time.ceil
                time.ceil = (time, unit) => {
                    if (unit.name === "decade") {
                        const out = Math.ceil(time / unit.seconds) * unit.seconds
                        const mom = moment(out * 1000)
                        const monthDay = mom.date()
                        // If the day of the month is not 1, it is within the
                        // previous month (December), so add enough days to
                        // move the date to the expected month (January).
                        if (monthDay !== 1) {
                            mom.add(32 - monthDay, "day")
                        }
                        return mom.unix()
                    } else {
                        return old_ceil(time, unit)
                    }
                }

                const xAxis = new Rickshaw.Graph.Axis.Time({
                    graph,
                    // Use the fixed .ceil for decades
                    timeFixture: time,
                    // timeUnit: time.unit("month") # TODO: bring back decade
                })

                $ctrl.preview = new Rickshaw.Graph.RangeSlider.Preview({
                    graph,
                    element: $(".preview", $ctrl.$result).get(0),
                })

                $("body").on("mouseup", ".preview .middle_handle", () => {
                    previewPanStop()
                })

                $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
                    if (!$ctrl.loading) {
                        previewPanStop()
                    }
                })

                window._xaxis = xAxis

                const old_render = xAxis.render
                xAxis.render = _.throttle(
                    () => {
                        old_render.call(xAxis)
                        drawIntervals(graph)
                        checkZoomLevel()
                    },

                    20
                )

                xAxis.render()

                const yAxis = new Rickshaw.Graph.Axis.Y({
                    graph,
                })

                yAxis.render()

                done()
            }

            function onProgress(progressObj) {
                $ctrl.onProgress(Math.round(progressObj["stats"]))
            }

            async function makeRequest(cqp, subcqps, corpora, labelMapping, showTotal, from, to) {
                if (!window.Rickshaw) {
                    var rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
                }
                $ctrl.localUpdateLoading(true)
                $ctrl.error = false
                const currentZoom = $ctrl.zoom
                let reqPromise = $ctrl.proxy
                    .makeRequest(cqp, subcqps, corpora.stringifySelected(), from, to)
                    .progress((data) => {
                        $timeout(() => onProgress(data))
                    })

                try {
                    var [rickshawModule, graphData] = await Promise.all([rickshawPromise || Rickshaw, reqPromise])
                    window.Rickshaw = rickshawModule
                    $timeout(() => renderGraph(graphData, cqp, labelMapping, currentZoom, showTotal))
                } catch (e) {
                    $timeout(() => {
                        c.error("graph crash", e)
                        $ctrl.localUpdateLoading(false)
                        $ctrl.error = true
                    })
                }
            }
        },
    ],
}
