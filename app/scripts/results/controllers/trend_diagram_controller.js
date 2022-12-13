/** @format */
import * as trendUtil from "../trend_diagram/trend_util"

const korpApp = angular.module("korpApp")

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

korpApp.directive("graphCtrl", () => ({
    controller($scope, $rootScope) {
        const s = $scope

        s.zoom = "year"
        s.proxy = new model.GraphProxy()

        const [from, to] = s.data.corpusListing.getMomentInterval()

        checkZoomLevel(from, to, true)

        // TODO angular click handler
        // $(".chart", s.$result).on("click", s.graphClickHandler)

        s.graphClickHandler = () => {
            const target = $(".chart", s.$result)
            const time = $(".detail .x_label > span", target).data("val")
            let cqp = $(".detail .item.active > span", target).data("cqp")
            const zoom = s.zoom
    
            if (!cqp) {
                return
            }
    
            const nTokens = s.data.cqp.split("]").length - 2
            const timecqp = trendUtil.getTimeCQP(time, zoom, nTokens, validZoomLevels.indexOf(zoom) < 3)
            const decodedCQP = decodeURIComponent(cqp)
            const opts = {
                ajaxParams: {
                    start: 0,
                    end: 24,
                    corpus: s.data.corpusListing.stringifySelected(),
                    cqp: s.data.cqp,
                    cqp2: CQP.expandOperators(decodedCQP),
                    cqp3: timecqp,
                    expand_prequeries: false,
                },
            }
    
            $rootScope.kwicTabs.push({ queryParams: opts })
        }

        s.newDynamicTab()

        s.mode = "line"

        s.isGraph = () => ["line", "bar"].includes(s.mode)
        s.isTable = () => s.mode === "table"

        s.closeTab = function (idx, e) {
            e.preventDefault()
            s.graphTabs.splice(idx, 1)
            s.closeDynamicTab()
        }

        s.drawPreloader = (from, to) => {
            let left, width
            if (s.graph) {
                left = s.graph.x(from.unix())
                width = s.graph.x(to.unix()) - left
            } else {
                left = 0
                width = "100%"
            }
    
            $(".preloader", s.$result).css({
                left,
                width,
            })
        }

        function setZoom(zoom, from, to) {
            s.zoom = zoom
            const fmt = "YYYYMMDDHHmmss"
    
            s.drawPreloader(from, to)
            s.proxy.granularity = granularities[zoom]
            makeRequest(
                s.data.cqp,
                s.data.subcqps,
                s.data.corpusListing,
                s.data.labelMapping,
                s.data.showTotal,
                from.format(fmt),
                to.format(fmt)
            )
        }

        function checkZoomLevel (from, to, forceSearch) {
            if (from == null) {
                let domain = s.graph.renderer.domain()
                from = moment.unix(domain.x[0])
                to = moment.unix(domain.x[1])
            }
    
            const oldZoom = s.zoom
    
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
    
            min.startOf(s.zoom)
            max.endOf(s.zoom)
    
            const n_diff = moment(max).diff(min, s.zoom)
    
            const momentMapping = _.fromPairs(
                _.map(data, (item) => {
                    const mom = moment(item.x)
                    mom.startOf(s.zoom)
                    return [mom.unix(), item.y]
                })
            )
    
            const newMoments = []
            for (let i of _.range(0, n_diff + 1)) {
                var lastYVal
                const newMoment = moment(min).add(i, s.zoom)
    
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
                const mom = trendUtil.parseDate(s.zoom, x)
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
            const non_time = _.reduce(_.map(settings.corpusListing.selected, "non_time"), (a, b) => (a || 0) + (b || 0), 0)
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
            s.hasEmptyIntervals = emptyIntervals.length
            let obj = graph.renderer.domain()
            let [from, to] = obj.x
    
            const unitSpan = moment.unix(to).diff(moment.unix(from), s.zoom)
            const unitWidth = graph.width / unitSpan
    
            $(".empty_area", s.$result).remove()
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
            if ($(".legend .line", s.$result).length > 1) {
                const allNonSumSeries = $(".legend li.line:not(:last-child)", s.$result)
                if (allNonSumSeries.toArray().some((item) => $(item).is(".disabled"))) {
                    $(".legend li:first .action", s.$result).click()
                }
                $(".legend li:last:not(.disabled) .action", s.$result).click()
            }
        }
    
        function setTableMode(series) {
            $(".chart,.legend", s.$result).hide()
            $(".time_table", s.$result.parent()).show()
            const nRows = series.length || 2
            let h = nRows * 2 + 4
            h = Math.min(h, 40)
            $(".time_table:visible", s.$result).height(`${h}.1em`)
            if (s.time_grid != null) {
                s.time_grid.resizeCanvas()
            }
            $(".exportTimeStatsSection", s.$result).show()
    
            $(".exportTimeStatsSection .btn.export", s.$result).click(() => {
                const selVal = $(".timeKindOfData option:selected", s.$result).val()
                const selType = $(".timeKindOfFormat option:selected", s.$result).val()
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
    
            const time_grid = new Slick.Grid($(".time_table", s.$result), time_table_data, time_table_columns, {
                enableCellNavigation: false,
                enableColumnReorder: false,
                forceFitColumns: false,
            })
            $(".time_table", s.$result).width("100%")
            s.time_grid = time_grid
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
                        name: item.cqp ? s.data.labelMapping[item.cqp] : "&Sigma;",
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
            for (let seriesIndex = 0; seriesIndex < s.graph.series.length; seriesIndex++) {
                const seriesObj = s.graph.series[seriesIndex]
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
            const visibleData = s.graph.stackData()
    
            const count = _.countBy(visibleData[0], (coor) => coor.zoom)
    
            const grouped = _.groupBy(visibleData[0], "zoom")
    
            for (let zoomLevel in grouped) {
                const points = grouped[zoomLevel]
                if (zoomLevel !== s.zoom) {
                    const from = moment.unix(points[0].x)
                    from.startOf(s.zoom)
                    const to = moment.unix(_.last(points).x)
                    to.endOf(s.zoom)
                    setZoom(s.zoom, from, to)
                }
            }
        }
    
        function renderGraph(data, cqp, labelMapping, currentZoom, showTotal) {
            let series
    
            const done = () => {
                s.loading = false
                $(window).trigger("resize")
            }
    
            if (data.ERROR) {
                s.resultError(data)
                return
            }
    
            if (s.graph) {
                series = makeSeries(data, cqp, labelMapping, currentZoom)
                spliceData(series)
                drawIntervals(s.graph)
                s.graph.render()
                done()
                return
            }
    
            const nontime = getNonTime()
    
            if (nontime) {
                $(".non_time", s.$result)
                    .empty()
                    .text(nontime.toFixed(2) + "%")
                    .parent()
                    .localize()
            } else {
                $(".non_time_div", s.$result).hide()
            }
    
            series = makeSeries(data, cqp, labelMapping, currentZoom)
    
            const graph = new Rickshaw.Graph({
                element: $(".chart", s.$result).empty().get(0),
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
            window._graph = s.graph = graph
    
            drawIntervals(graph)
    
            $(window).on(
                "resize",
                _.throttle(() => {
                    if (s.$result.is(":visible")) {
                        width = $(".tab-pane").width()
                        graph.setSize()
                        s.preview.configure({ width })
                        s.preview.render()
                        return graph.render()
                    }
                }, 200)
            )
    
            $(".form_switch", s.$result).click((event) => {
                const val = s.mode
                for (let cls of s.$result.attr("class").split(" ")) {
                    if (cls.match(/^form-/)) {
                        s.$result.removeClass(cls)
                    }
                }
                s.$result.addClass(`form-${val}`)
                $(".chart,.legend", s.$result.parent()).show()
                $(".time_table", s.$result.parent()).hide()
                if (val === "bar") {
                    setBarMode()
                } else if (val === "table") {
                    renderTable(series)
                    setTableMode(series)
                }
    
                if (val !== "table") {
                    graph.setRenderer(val)
                    graph.render()
                    $(".exportTimeStatsSection", s.$result).hide()
                }
            })
    
            const legend = new Rickshaw.Graph.Legend({
                element: $(".legend", s.$result).get(0),
                graph,
            })
    
            const shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                graph,
                legend,
            })
    
            if (!showTotal && $(".legend .line", s.$result).length > 1) {
                $(".legend .line:last .action", s.$result).click()
            }
    
            const that = this
            new Rickshaw.Graph.HoverDetail({
                // xFormatter and yFormatter are called once for every data series per "hover detail creation"
                // formatter is only called once per per "hover detail creation"
                graph,
                xFormatter(x) {
                    return `<span>${trendUtil.formatUnixDate(that.zoom, x)}</span>`
                },
    
                yFormatter(y) {
                    const val = util.formatDecimalString(y.toFixed(2), false, true, true)
    
                    return (
                        `<br><span rel='localize[rel_hits_short]'>${util.getLocaleString("rel_hits_short")}</span> ` + val
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
    
            s.preview = new Rickshaw.Graph.RangeSlider.Preview({
                graph,
                element: $(".preview", s.$result).get(0),
            })
    
            $("body").on("mouseup", ".preview .middle_handle", () => {
                previewPanStop()
            })
    
            $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
                if (!s.loading) {
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
    
        async function makeRequest(cqp, subcqps, corpora, labelMapping, showTotal, from, to) {
            s.loading = true
            if (!window.Rickshaw) {
                var rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
            }
            s.loading = true
            const currentZoom = s.zoom
            let reqPromise = s.proxy
                .makeRequest(cqp, subcqps, corpora.stringifySelected(), from, to)
                .progress((data) => {
                    return s.onProgress(data)
                })
    
            try {
                var [rickshawModule, graphData] = await Promise.all([rickshawPromise || Rickshaw, reqPromise])
            } catch (e) {
                c.error("graph crash", e)
                s.resultError(data)
                s.loading = false
            }
            window.Rickshaw = rickshawModule
            renderGraph(graphData, cqp, labelMapping, currentZoom, showTotal)
        }
    },
}))
