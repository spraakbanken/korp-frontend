/** @format */
import { BaseResults } from "../results/base_results.js"
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

export class GraphResults extends BaseResults {
    constructor(selector, scope) {
        super(selector, scope)

        this.zoom = "year"
        this.proxy = new model.GraphProxy()

        const [from, to] = this.s.data.corpusListing.getMomentInterval()

        this.checkZoomLevel(from, to, true)

        $(".chart", this.$result).on("click", this.graphClickHandler(this))
    }

    graphClickHandler(that) {
        return () => {
            const target = $(".chart", that.$result)
            const time = $(".detail .x_label > span", target).data("val")
            let cqp = $(".detail .item.active > span", target).data("cqp")
            const zoom = that.zoom

            if (!cqp) {
                return
            }

            const nTokens = that.s.data.cqp.split("]").length - 2
            const timecqp = trendUtil.getTimeCQP(time, zoom, nTokens, validZoomLevels.indexOf(zoom) < 3)
            const decodedCQP = decodeURIComponent(cqp)
            const opts = {
                ajaxParams: {
                    start: 0,
                    end: 24,
                    corpus: that.s.data.corpusListing.stringifySelected(),
                    cqp: that.s.data.cqp,
                    cqp2: CQP.expandOperators(decodedCQP),
                    cqp3: timecqp,
                    expand_prequeries: false,
                },
            }

            safeApply(that.s.$root, () => {
                that.s.$root.kwicTabs.push({ queryParams: opts })
            })
        }
    }

    drawPreloader(from, to) {
        let left, width
        if (this.graph) {
            left = this.graph.x(from.unix())
            width = this.graph.x(to.unix()) - left
        } else {
            left = 0
            width = "100%"
        }

        $(".preloader", this.$result).css({
            left,
            width,
        })
    }

    setZoom(zoom, from, to) {
        this.zoom = zoom
        const fmt = "YYYYMMDDHHmmss"

        this.drawPreloader(from, to)
        this.proxy.granularity = granularities[zoom]
        this.makeRequest(
            this.s.data.cqp,
            this.s.data.subcqps,
            this.s.data.corpusListing,
            this.s.data.labelMapping,
            this.s.data.showTotal,
            from.format(fmt),
            to.format(fmt)
        )
    }

    checkZoomLevel(from, to, forceSearch) {
        if (from == null) {
            let domain = this.graph.renderer.domain()
            from = moment.unix(domain.x[0])
            to = moment.unix(domain.x[1])
        }

        const oldZoom = this.zoom

        const idealNumHits = 1000
        let newZoom = _.minBy(validZoomLevels, function (zoom) {
            const nPoints = to.diff(from, zoom)
            return Math.abs(idealNumHits - nPoints)
        })

        if ((newZoom && oldZoom !== newZoom) || forceSearch) {
            this.setZoom(newZoom, from, to)
        }
    }

    fillMissingDate(data) {
        const dateArray = _.map(data, "x")
        const min = _.minBy(dateArray, (mom) => mom.toDate())
        const max = _.maxBy(dateArray, (mom) => mom.toDate())

        min.startOf(this.zoom)
        max.endOf(this.zoom)

        const n_diff = moment(max).diff(min, this.zoom)

        const momentMapping = _.fromPairs(
            _.map(data, (item) => {
                const mom = moment(item.x)
                mom.startOf(this.zoom)
                return [mom.unix(), item.y]
            })
        )

        const newMoments = []
        for (let i of _.range(0, n_diff + 1)) {
            var lastYVal
            const newMoment = moment(min).add(i, this.zoom)

            const maybeCurrent = momentMapping[newMoment.unix()]
            if (typeof maybeCurrent !== "undefined") {
                lastYVal = maybeCurrent
            } else {
                newMoments.push({ x: newMoment, y: lastYVal })
            }
        }

        return [].concat(data, newMoments)
    }

    getSeriesData(data, zoom) {
        delete data[""]

        let output = []
        for (let [x, y] of _.toPairs(data)) {
            const mom = trendUtil.parseDate(this.zoom, x)
            output.push({ x: mom, y })
        }

        output = this.fillMissingDate(output)

        for (let tuple of output) {
            tuple.x = tuple.x.unix()
            tuple.zoom = zoom
        }

        output = output.sort((a, b) => a.x - b.x)

        return output
    }

    hideNthTick(graphDiv) {
        return $(".x_tick:visible", graphDiv)
            .hide()
            .filter((n) => (n % 2 || n % 3 || n % 5) === 0)
            .show()
    }

    updateTicks() {
        const ticks = $(".chart .title:visible", this.$result)
        const firstTick = ticks.eq(0)
        const secondTick = ticks.eq(1)

        const margin = 5

        if (!firstTick.length || !secondTick.length) {
            return
        }
        if (firstTick.offset().left + firstTick.width() + margin > secondTick.offset().left) {
            this.hideNthTick($(".chart", this.$result))
            return this.updateTicks()
        }
    }

    getNonTime() {
        // TODO: move settings.corpusListing.selected to the subview
        const non_time = _.reduce(_.map(settings.corpusListing.selected, "non_time"), (a, b) => (a || 0) + (b || 0), 0)
        const sizelist = _.map(settings.corpusListing.selected, (item) => Number(item.info.Size))
        const totalsize = _.reduce(sizelist, (a, b) => a + b)
        return (non_time / totalsize) * 100
    }

    getEmptyIntervals(data) {
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

    drawIntervals(graph) {
        const { emptyIntervals } = graph.series[0]
        this.s.hasEmptyIntervals = emptyIntervals.length
        let obj = graph.renderer.domain()
        let [from, to] = obj.x

        const unitSpan = moment.unix(to).diff(moment.unix(from), this.zoom)
        const unitWidth = graph.width / unitSpan

        $(".empty_area", this.$result).remove()
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

    setBarMode() {
        /**
         * This code enables the first series in the legend if there are none selected (except sum)
         * It then disables the sum data series since that data does not make sense in bar mode
         * If the sum data series is disabled first, it will not work
         */
        if ($(".legend .line", this.$result).length > 1) {
            const allNonSumSeries = $(".legend li.line:not(:last-child)", this.$result)
            if (allNonSumSeries.toArray().some((item) => $(item).is(".disabled"))) {
                $(".legend li:first .action", this.$result).click()
            }
            $(".legend li:last:not(.disabled) .action", this.$result).click()
        }
    }

    setTableMode(series) {
        $(".chart,.legend", this.$result).hide()
        $(".time_table", this.$result.parent()).show()
        const nRows = series.length || 2
        let h = nRows * 2 + 4
        h = Math.min(h, 40)
        $(".time_table:visible", this.$result).height(`${h}.1em`)
        if (this.time_grid != null) {
            this.time_grid.resizeCanvas()
        }
        $(".exportTimeStatsSection", this.$result).show()

        $(".exportTimeStatsSection .btn.export", this.$result).click(() => {
            const selVal = $(".timeKindOfData option:selected", this.$result).val()
            const selType = $(".timeKindOfFormat option:selected", this.$result).val()
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

    renderTable(series) {
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

        const time_grid = new Slick.Grid($(".time_table", this.$result), time_table_data, time_table_columns, {
            enableCellNavigation: false,
            enableColumnReorder: false,
            forceFitColumns: false,
        })
        $(".time_table", this.$result).width("100%")
        this.time_grid = time_grid
    }

    makeSeries(data, cqp, labelMapping, zoom) {
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
                    data: this.getSeriesData(item.relative, zoom),
                    color,
                    name: item.cqp ? this.s.data.labelMapping[item.cqp] : "&Sigma;",
                    cqp: item.cqp || cqp,
                    abs_data: this.getSeriesData(item.absolute, zoom),
                })
            }
        } else {
            series = [
                {
                    data: this.getSeriesData(data.combined.relative, zoom),
                    color: "steelblue",
                    name: "&Sigma;",
                    cqp,
                    abs_data: this.getSeriesData(data.combined.absolute, zoom),
                },
            ]
        }
        Rickshaw.Series.zeroFill(series)

        const emptyIntervals = this.getEmptyIntervals(series[0].data)
        series[0].emptyIntervals = emptyIntervals

        for (let s of series) {
            s.data = _.filter(s.data, (item) => item.y !== null)
            s.abs_data = _.filter(s.abs_data, (item) => item.y !== null)
        }

        return series
    }

    spliceData(newSeries) {
        for (let seriesIndex = 0; seriesIndex < this.graph.series.length; seriesIndex++) {
            const seriesObj = this.graph.series[seriesIndex]
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

    previewPanStop() {
        const visibleData = this.graph.stackData()

        const count = _.countBy(visibleData[0], (coor) => coor.zoom)

        const grouped = _.groupBy(visibleData[0], "zoom")

        for (let zoomLevel in grouped) {
            const points = grouped[zoomLevel]
            if (zoomLevel !== this.zoom) {
                const from = moment.unix(points[0].x)
                from.startOf(this.zoom)
                const to = moment.unix(_.last(points).x)
                to.endOf(this.zoom)
                this.setZoom(this.zoom, from, to)
            }
        }
    }

    renderGraph(data, cqp, labelMapping, currentZoom, showTotal) {
        let series

        const done = () => {
            this.hidePreloader()
            safeApply(this.s, () => {
                this.s.loading = false
            })

            return $(window).trigger("resize")
        }

        if (data.ERROR) {
            this.resultError(data)
            return
        }

        if (this.graph) {
            series = this.makeSeries(data, cqp, labelMapping, currentZoom)
            this.spliceData(series)
            this.drawIntervals(this.graph)
            this.graph.render()
            done()
            return
        }

        const nontime = this.getNonTime()

        if (nontime) {
            $(".non_time", this.$result)
                .empty()
                .text(nontime.toFixed(2) + "%")
                .parent()
                .localize()
        } else {
            $(".non_time_div", this.$result).hide()
        }

        series = this.makeSeries(data, cqp, labelMapping, currentZoom)

        const graph = new Rickshaw.Graph({
            element: $(".chart", this.$result).empty().get(0),
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
        window._graph = this.graph = graph

        this.drawIntervals(graph)

        $(window).on(
            "resize",
            _.throttle(() => {
                if (this.$result.is(":visible")) {
                    width = $(".tab-pane").width()
                    graph.setSize()
                    this.preview.configure({ width })
                    this.preview.render()
                    return graph.render()
                }
            }, 200)
        )

        $(".form_switch", this.$result).click((event) => {
            const val = this.s.mode
            for (let cls of this.$result.attr("class").split(" ")) {
                if (cls.match(/^form-/)) {
                    this.$result.removeClass(cls)
                }
            }
            this.$result.addClass(`form-${val}`)
            $(".chart,.legend", this.$result.parent()).show()
            $(".time_table", this.$result.parent()).hide()
            if (val === "bar") {
                this.setBarMode()
            } else if (val === "table") {
                this.renderTable(series)
                this.setTableMode(series)
            }

            if (val !== "table") {
                graph.setRenderer(val)
                graph.render()
                $(".exportTimeStatsSection", this.$result).hide()
            }
        })

        const legend = new Rickshaw.Graph.Legend({
            element: $(".legend", this.$result).get(0),
            graph,
        })

        const shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
            graph,
            legend,
        })

        if (!showTotal && $(".legend .line", this.$result).length > 1) {
            $(".legend .line:last .action", this.$result).click()
        }

        const that = this
        new Rickshaw.Graph.HoverDetail({
            // xFormatter and yFormatter are called once for every data series per "hover detail creation"
            // formatter is only called once per per "hover detail creation"
            graph,
            xFormatter(x) {
                return `<span data-val='${x}'>${trendUtil.formatUnixDate(that.zoom, x)}</span>`
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

        this.preview = new Rickshaw.Graph.RangeSlider.Preview({
            graph,
            element: $(".preview", this.$result).get(0),
        })

        $("body").on("mouseup", ".preview .middle_handle", () => {
            this.previewPanStop()
        })

        $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
            if (!this.s.loading) {
                this.previewPanStop()
            }
        })

        window._xaxis = xAxis

        const old_render = xAxis.render
        xAxis.render = _.throttle(
            () => {
                old_render.call(xAxis)
                this.drawIntervals(graph)
                return this.checkZoomLevel()
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

    async makeRequest(cqp, subcqps, corpora, labelMapping, showTotal, from, to) {
        this.s.loading = true
        if (!window.Rickshaw) {
            var rickshawPromise = import(/* webpackChunkName: "rickshaw" */ "rickshaw")
        }
        this.showPreloader()
        const currentZoom = this.zoom
        let reqPromise = this.proxy
            .makeRequest(cqp, subcqps, corpora.stringifySelected(), from, to)
            .progress((data) => {
                return this.onProgress(data)
            })

        try {
            var [rickshawModule, graphData] = await Promise.all([rickshawPromise || Rickshaw, reqPromise])
        } catch (e) {
            c.error("graph crash", e)
            this.resultError(data)
            this.s.loading = false
        }
        window.Rickshaw = rickshawModule
        this.renderGraph(graphData, cqp, labelMapping, currentZoom, showTotal)
    }
}
