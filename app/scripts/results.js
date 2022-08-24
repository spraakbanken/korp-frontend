/** @format */
import statisticsFormatting from "../config/statistics_config.js"
import statemachine from "./statemachine"
import { BaseResults } from "./base_results.js"

const korpFailImg = require("../img/korp_fail.svg")

window.view = {}

view.KWICResults = class KWICResults extends BaseResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)

        this.proxy = new model.KWICProxy()

        // there can be only one global kwicproxy
        if (!window.kwicProxy) {
            window.kwicProxy = this.proxy
        }

        this.tabindex = 0

        this.s = scope

        this.selectionManager = scope.selectionManager
        this.$result.click((event) => {
            if (event.target.id === "frontendDownloadLinks" || event.target.classList.contains("kwicDownloadLink")) {
                return
            }
            if (!this.selectionManager.hasSelected()) {
                return
            }
            this.selectionManager.deselect()
            statemachine.send("DESELECT_WORD")
        })

        $(document).keydown($.proxy(this.onKeydown, this))

        this.$result.on("click", ".word", (event) => this.onWordClick(event))
    }

    onWordClick(event) {
        if (this.isActive()) {
        }
        const scope = $(event.currentTarget).scope()
        const obj = scope.wd
        const sent = scope.sentence
        event.stopPropagation()
        const word = $(event.target)

        statemachine.send("SELECT_WORD", {
            sentenceData: sent.structs,
            wordData: obj,
            corpus: sent.corpus.toLowerCase(),
            tokens: sent.tokens,
            inReadingMode: false,
        })
        // if ($("#sidebar").data()["korpSidebar"]) {
        // s.$broadcast("wordSelected", sent.structs, obj, sent.corpus.toLowerCase(), sent.tokens)
        // $("#sidebar").sidebar(
        //     "updateContent",
        //     sent.structs,
        //     obj,
        //     sent.corpus.toLowerCase(),
        //     sent.tokens
        // )
        // }

        this.selectWord(word, scope, sent)
    }

    selectWord(word, scope) {
        const obj = scope.wd
        let aux = null
        if (obj.dephead != null) {
            const i = Number(obj.dephead)

            const paragraph = word.closest(".sentence").find(".word")
            let sent_start = 0
            const querySentStart = ".open_sentence"
            if (word.is(querySentStart)) {
                sent_start = paragraph.index(word)
            } else {
                const l = paragraph.filter((__, item) => $(item).is(word) || $(item).is(querySentStart))
                sent_start = paragraph.index(l.eq(l.index(word) - 1))
            }
            aux = $(paragraph.get(sent_start + i - 1))
        }
        scope.selectionManager.select(word, aux)
    }

    resetView() {
        super.resetView()
    }

    getProxy() {
        return this.proxy
    }

    isReadingMode() {
        return this.s.reading_mode
    }

    onentry() {
        super.onentry()

        this.$result.find(".token_selected").click()
        _.defer(() => this.centerScrollbar())
    }

    onexit() {
        super.onexit()
        statemachine.send("DESELECT_WORD")
    }

    onKeydown(event) {
        let next
        const isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey
        if (isSpecialKeyDown || $("input, textarea, select").is(":focus") || !this.$result.is(":visible")) {
            return
        }

        switch (event.which) {
            case 78: // n
                safeApply(this.s, () => {
                    this.s.$parent.pageChange(this.s.$parent.page + 1)
                })
                return false
            case 70: // f
                if (this.s.$parent.page === 0) {
                    return
                }
                safeApply(this.s, () => {
                    this.s.$parent.pageChange(this.s.$parent.page - 1)
                })
                return false
        }
        if (!this.selectionManager.hasSelected()) {
            return
        }
        switch (event.which) {
            case 38: // up
                next = this.selectUp()
                break
            case 39: // right
                next = this.selectNext()
                break
            case 37: // left
                next = this.selectPrev()
                break
            case 40: // down
                next = this.selectDown()
                break
        }

        if (next) {
            this.scrollToShowWord($(next))
            return false
        }
    }

    getPageInterval(page) {
        const hpp = locationSearch().hpp
        const items_per_page = Number(hpp) || settings["hits_per_page_default"]
        page = Number(page)
        const output = {}
        output.start = (page || 0) * items_per_page
        output.end = output.start + items_per_page - 1
        return output
    }

    renderCompleteResult(data) {
        safeApply(this.s, () => {
            this.hidePreloader()
            this.s.hits = data.hits
            this.s.hits_display = util.prettyNumbers(data.hits)
        })
        if (!data.hits) {
            c.log("no kwic results")
            this.showNoResults()
            return
        }
        this.$result.removeClass("zero_results")
        this.renderHitsPicture(data)
    }

    renderResult(data) {
        const resultError = super.renderResult(data)
        // If an error occurred or the result is otherwise empty,
        // deselect word and hide the sidebar
        if (!this.hasData || !data.kwic || !data.kwic.length) {
            this.selectionManager.deselect()
            statemachine.send("DESELECT_WORD")
        }
        if (resultError === false) {
            return
        }
        if (!data.kwic) {
            data.kwic = []
        }
        const isReading = this.isReadingMode()

        if (this.isActive()) {
            this.s.$root.jsonUrl = this.proxy.prevUrl
        }

        this.s.$apply(($scope) => {
            const useContextData = locationSearch()["in_order"] != null
            if (isReading || useContextData) {
                $scope.setContextData(data)
            } else {
                $scope.setKwicData(data)
            }
            // Deselect the possibly selected word, so that a word
            // will be selected in the new result and the sidebar
            // content will be updated
            this.selectionManager.deselect()
        })

        if (currentMode === "parallel" && !isReading) {
            const scrollLeft = $(".table_scrollarea", this.$result).scrollLeft() || 0
            let changed = true
            const prevValues = []

            // loop until the placement of linked sentences have settled
            while (changed) {
                changed = false
                let i = 0
                for (let linked of $(".table_scrollarea > .kwic .linked_sentence").get()) {
                    const mainrow = $(linked).prev()
                    if (!mainrow.length) {
                        continue
                    }
                    let firstWord = mainrow.find(".left .word:first")
                    if (!firstWord.length) {
                        firstWord = mainrow.find(".match .word:first")
                    }
                    const offset = Math.round(firstWord.position().left + scrollLeft - 25)
                    $(linked).find(".lnk").css("padding-left", offset)

                    const threshold = 25
                    if (offset - (prevValues[i] || 0) > threshold) {
                        changed = true
                    }

                    prevValues[i] = offset
                    i++
                }
            }
        }

        if (settings["enable_backend_kwic_download"]) {
            util.setDownloadLinks(this.proxy.prevRequest, data)
        }

        this.$result.localize()
        this.centerScrollbar()
        if (this.isActive() && !this.selectionManager.hasSelected() && !isReading) {
            this.$result.find(".match").children().first().click()
        }
    }

    showNoResults() {
        this.hidePreloader()
        this.$result.addClass("zero_results").click()
        return this.$result.find(".hits_picture").html("")
    }

    renderHitsPicture(data) {
        let items = _.map(data.corpus_order, (obj) => ({
            rid: obj,
            rtitle: settings.corpusListing.getTitleObj(obj.toLowerCase()),
            relative: data.corpus_hits[obj] / data.hits,
            abs: data.corpus_hits[obj],
        }))
        items = _.filter(items, (item) => item.abs > 0)
        // calculate which is the first page of hits for each item
        let index = 0
        _.each(items, (obj) => {
            obj.page = Math.floor(index / data.kwic.length)
            index += obj.abs
        })

        this.s.$apply(($scope) => ($scope.hitsPictureData = items))
    }

    scrollToShowWord(word) {
        if (!word.length) {
            return
        }
        const offset = 200
        const wordTop = word.offset().top
        let newY = window.scrollY
        if (wordTop > $(window).height() + window.scrollY) {
            newY += offset
        } else if (wordTop < window.scrollY) {
            newY -= offset
        }
        $("html, body").stop(true, true).animate({ scrollTop: newY })
        const wordLeft = word.offset().left
        const area = this.$result.find(".table_scrollarea")
        let newX = Number(area.scrollLeft())
        if (wordLeft > area.offset().left + area.width()) {
            newX += offset
        } else if (wordLeft < area.offset().left) {
            newX -= offset
        }
        return area.stop(true, true).animate({ scrollLeft: newX })
    }

    buildQueryOptions(cqp, isPaging) {
        let avoidContext, preferredContext
        const opts = {}
        const getSortParams = function () {
            const { sort } = locationSearch()
            if (!sort) {
                return {}
            }
            if (sort === "random") {
                let rnd
                if (locationSearch().random_seed) {
                    rnd = locationSearch().random_seed
                } else {
                    rnd = Math.ceil(Math.random() * 10000000)
                    locationSearch({ random_seed: rnd })
                }

                return {
                    sort,
                    random_seed: rnd,
                }
            }
            return { sort }
        }

        if (this.isReadingMode()) {
            preferredContext = settings["default_reading_context"]
            avoidContext = settings["default_overview_context"]
        } else {
            preferredContext = settings["default_overview_context"]
            avoidContext = settings["default_reading_context"]
        }

        const context = settings.corpusListing.getContextQueryString(preferredContext, avoidContext)

        if (!isPaging) {
            this.proxy.queryData = null
        }

        opts.ajaxParams = {
            corpus: settings.corpusListing.stringifySelected(),
            cqp: cqp || this.proxy.prevCQP,
            query_data: this.proxy.queryData,
            context,
            default_context: preferredContext,
            incremental: true,
        }

        _.extend(opts.ajaxParams, getSortParams())
        return opts
    }

    makeRequest(cqp, isPaging) {
        const page = Number(locationSearch().page) || 0
        this.s.$parent.page = page

        this.showPreloader()
        this.s.aborted = false

        if (this.proxy.hasPending()) {
            this.ignoreAbort = true
        } else {
            this.ignoreAbort = false
        }

        const params = this.buildQueryOptions(cqp, isPaging)
        const progressCallback = $.proxy(this.onProgress, this)

        const req = this.getProxy().makeRequest(params, page, progressCallback, (data) => {
            return this.renderResult(data)
        })
        req.done((data) => {
            this.hidePreloader()
            return this.renderCompleteResult(data)
        })
        return req.fail((jqXHR, status, errorThrown) => {
            c.log("kwic fail")
            if (this.ignoreAbort) {
                c.log("stats ignoreabort")
                return
            }
            if (status === "abort") {
                return safeApply(this.s, () => {
                    this.hidePreloader()
                    this.s.aborted = true
                })
            }
        })
    }

    getActiveData() {
        if (this.isReadingMode()) {
            return this.s.contextKwic
        } else {
            return this.s.kwic
        }
    }

    centerScrollbar() {
        const m = this.$result.find(".match:first")
        if (!m.length) {
            return
        }
        const area = this.$result.find(".table_scrollarea").scrollLeft(0)
        const match = m.first().position().left + m.width() / 2
        const sidebarWidth = $("#sidebar").outerWidth() || 0
        area.stop(true, true).scrollLeft(match - ($("body").innerWidth() - sidebarWidth) / 2)
    }

    getCurrentRow() {
        const tr = this.$result.find(".token_selected").closest("tr")
        if (this.$result.find(".token_selected").parent().is("td")) {
            return tr.find("td > .word")
        } else {
            return tr.find("div > .word")
        }
    }

    selectNext() {
        let next
        if (!this.isReadingMode()) {
            const i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0))
            next = this.getCurrentRow().get(i + 1)
            if (next == null) {
                return
            }
            $(next).click()
        } else {
            next = this.$result.find(".token_selected").next().click()
        }
        return next
    }

    selectPrev() {
        let prev
        if (!this.isReadingMode()) {
            const i = this.getCurrentRow().index(this.$result.find(".token_selected").get(0))
            if (i === 0) {
                return
            }
            prev = this.getCurrentRow().get(i - 1)
            $(prev).click()
        } else {
            prev = this.$result.find(".token_selected").prev().click()
        }
        return prev
    }

    selectUp() {
        let prevMatch
        const current = this.selectionManager.selected
        if (!this.isReadingMode()) {
            prevMatch = this.getWordAt(
                current.offset().left + current.width() / 2,
                current.closest("tr").prevAll(".not_corpus_info").first()
            )
            prevMatch.click()
        } else {
            const searchwords = current
                .prevAll(".word")
                .get()
                .concat(
                    current
                        .closest(".not_corpus_info")
                        .prevAll(".not_corpus_info")
                        .first()
                        .find(".word")
                        .get()
                        .reverse()
                )
            const def = current.parent().prev().find(".word:last")
            prevMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click()
        }

        return prevMatch
    }

    selectDown() {
        let nextMatch
        const current = this.selectionManager.selected
        if (!this.isReadingMode()) {
            nextMatch = this.getWordAt(
                current.offset().left + current.width() / 2,
                current.closest("tr").nextAll(".not_corpus_info").first()
            )
            nextMatch.click()
        } else {
            const searchwords = current
                .nextAll(".word")
                .add(current.closest(".not_corpus_info").nextAll(".not_corpus_info").first().find(".word"))
            const def = current.parent().next().find(".word:first")
            nextMatch = this.getFirstAtCoor(current.offset().left + current.width() / 2, searchwords, def).click()
        }
        return nextMatch
    }

    getFirstAtCoor(xCoor, wds, default_word) {
        let output = null
        wds.each(function (i, item) {
            const thisLeft = $(this).offset().left
            const thisRight = $(this).offset().left + $(this).width()
            if (xCoor > thisLeft && xCoor < thisRight) {
                output = $(this)
                return false
            }
        })

        return output || default_word
    }

    getWordAt(xCoor, $row) {
        let output = $()
        $row.find(".word").each(function () {
            output = $(this)
            const thisLeft = $(this).offset().left
            const thisRight = $(this).offset().left + $(this).width()
            if ((xCoor > thisLeft && xCoor < thisRight) || thisLeft > xCoor) {
                return false
            }
        })

        return output
    }
}

view.ExampleResults = class ExampleResults extends view.KWICResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)
        this.proxy = new model.KWICProxy()
        if (this.s.$parent.kwicTab.queryParams) {
            this.makeRequest().then(() => {
                this.onentry()
            })
        }
        this.tabindex = this.getResultTabs().length - 1 + this.s.$parent.$index
    }

    isReadingMode() {
        return this.s.exampleReadingMode
    }

    makeRequest() {
        const items_per_page = parseInt(locationSearch().hpp || settings["hits_per_page_default"])
        const opts = this.s.$parent.kwicTab.queryParams

        this.resetView()
        // example tab cannot handle incremental = true
        opts.ajaxParams.incremental = false

        opts.ajaxParams.start = this.s.$parent.page * items_per_page
        opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

        let avoidContext, preferredContext
        if (this.isReadingMode()) {
            preferredContext = settings["default_reading_context"]
            avoidContext = settings["default_overview_context"]
        } else {
            preferredContext = settings["default_overview_context"]
            avoidContext = settings["default_reading_context"]
        }

        const context = settings.corpusListing.getContextQueryStringFromCorpusId(
            (opts.ajaxParams.corpus || "").split(","),
            preferredContext,
            avoidContext
        )
        _.extend(opts.ajaxParams, { context, default_context: preferredContext })

        this.showPreloader()
        const progress = opts.command === "relations_sentences" ? $.noop : $.proxy(this.onProgress, this)
        const def = this.proxy.makeRequest(opts, null, progress, (data) => {
            this.renderResult(data, opts.cqp)
            this.renderCompleteResult(data)
            return safeApply(this.s, () => {
                return this.hidePreloader()
            })
        })

        return def.fail(function () {
            return safeApply(this.s, () => {
                return this.hidePreloader()
            })
        })
    }

    renderResult(data) {
        super.renderResult(data)
        this.s.setupReadingWatch()
    }
}

view.LemgramResults = class LemgramResults extends BaseResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)
        this.s = scope
        this.tabindex = 3
        this.proxy = new model.LemgramProxy()
    }

    resetView() {
        super.resetView()
        safeApply(this.s, () => {
            this.s.$parent.aborted = false
            this.s.$parent.no_hits = false
        })
    }

    makeRequest(word, type) {
        // if a global filter is set, do not generate a word picture
        if (this.s.$root.globalFilter) {
            this.hasData = false
            return
        }

        if (this.proxy.hasPending()) {
            this.ignoreAbort = true
        } else {
            this.ignoreAbort = false
            this.resetView()
        }

        this.showPreloader()
        const def = this.proxy.makeRequest(word, type, (...args) => {
            this.onProgress(...(args || []))
        })

        def.done((data) => {
            safeApply(this.s, () => {
                return this.renderResult(data, word)
            })
        })
        def.fail((jqXHR, status, errorThrown) => {
            c.log("def fail", status)
            if (this.ignoreAbort) {
                return
            }
            if (status === "abort") {
                return safeApply(this.s, () => {
                    this.hidePreloader()
                    this.s.$parent.aborted = true
                })
            }
        })
    }

    renderResult(data, query) {
        const resultError = super.renderResult(data)
        this.hidePreloader()
        this.s.$parent.progress = 100
        if (resultError === false) {
            return
        }
        if (!data.relations) {
            this.s.$parent.no_hits = true
        } else if (util.isLemgramId(query)) {
            this.renderTables(query, data.relations)
        } else {
            this.renderWordTables(query, data.relations)
        }
    }

    renderWordTables(word, data) {
        const wordlist = $.map(data, function (item) {
            const output = []
            if (item.head.split("_")[0] === word) {
                output.push([item.head, item.headpos.toLowerCase()])
            }
            if (item.dep.split("_")[0] === word) {
                output.push([item.dep, item.deppos.toLowerCase()])
            }
            return output
        })
        let unique_words = _.uniqBy(wordlist, function (...args) {
            let [word, pos] = args[0]
            return word + pos
        })
        const tagsetTrans = _.invert(settings["word_picture_tagset"])
        unique_words = _.filter(unique_words, function (...args) {
            const [currentWd, pos] = args[0]
            return settings["word_picture_conf"][tagsetTrans[pos]] != null
        })
        if (!unique_words.length) {
            this.showNoResults()
            return
        }

        this.drawTables(unique_words, data)
        return this.hidePreloader()
    }

    renderTables(lemgram, data) {
        let wordClass
        if (data[0].head === lemgram) {
            wordClass = data[0].headpos
        } else {
            wordClass = data[0].deppos
        }
        this.drawTables([[lemgram, wordClass]], data)
        return this.hidePreloader()
    }

    drawTables(tables, data) {
        const inArray = function (rel, orderList) {
            const i = _.findIndex(
                orderList,
                (item) => (item.field_reverse || false) === (rel.field_reverse || false) && item.rel === rel.rel
            )
            const type = rel.field_reverse ? "head" : "dep"
            return {
                i,
                type,
            }
        }

        const tagsetTrans = _.invert(settings["word_picture_tagset"])

        const res = _.map(tables, function ([token, wordClass]) {
            const getRelType = (item) => ({
                rel: tagsetTrans[item.rel.toLowerCase()],
                field_reverse: item.dep === token,
            })

            const wordClassShort = wordClass.toLowerCase()
            wordClass = _.invert(settings["word_picture_tagset"])[wordClassShort]

            if (settings["word_picture_conf"][wordClass] == null) {
                return
            }
            let orderArrays = [[], [], []]
            $.each(data, (index, item) => {
                $.each(settings["word_picture_conf"][wordClass] || [], (i, rel_type_list) => {
                    const list = orderArrays[i]
                    const rel = getRelType(item)

                    if (!rel) {
                        return
                    }
                    const ret = inArray(rel, rel_type_list)
                    if (ret.i === -1) {
                        return
                    }
                    if (!list[ret.i]) {
                        list[ret.i] = []
                    }
                    item.show_rel = ret.type
                    list[ret.i].push(item)
                })
            })

            $.each(orderArrays, function (i, unsortedList) {
                $.each(unsortedList, function (_, list) {
                    if (list) {
                        list.sort((first, second) => second.mi - first.mi)
                    }
                })

                if (settings["word_picture_conf"][wordClass][i] && unsortedList.length) {
                    const toIndex = $.inArray("_", settings["word_picture_conf"][wordClass][i])
                    if (util.isLemgramId(token)) {
                        unsortedList[toIndex] = { word: token.split("..")[0].replace(/_/g, " ") }
                    } else {
                        unsortedList[toIndex] = { word: util.lemgramToString(token) }
                    }
                }

                unsortedList = _.filter(unsortedList, (item, index) => Boolean(item))
            })

            orderArrays = _.map(orderArrays, (section, i) =>
                _.map(section, function (table, j) {
                    if (table && table[0]) {
                        const { rel } = table[0]
                        const { show_rel } = table[0]
                        const all_lemgrams = _.uniq(
                            _.map(_.map(table, show_rel), function (item) {
                                if (util.isLemgramId(item)) {
                                    return item.slice(0, -1)
                                } else {
                                    return item
                                }
                            })
                        )
                        return { table, rel, show_rel, all_lemgrams }
                    } else {
                        return { table }
                    }
                })
            )

            return {
                token: token,
                wordClass: wordClass,
                wordClassShort: wordClassShort,
                data: orderArrays,
            }
        })

        return this.s.$root.$broadcast("word_picture_data_available", res)
    }

    onentry() {
        super.onentry()
    }

    onexit() {
        super.onexit()
        clearTimeout(self.timeout)
    }

    showNoResults() {
        this.hidePreloader()
    }
}

view.StatsResults = class StatsResults extends BaseResults {
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

            const activeCorpora = []
            // TODO: what is this rowIx reference?
            const totalRow = this.getDataAt(rowIx)
            for (let corpus of this.searchParams.corpora) {
                if (totalRow[corpus + "_value"][0] > 0) {
                    activeCorpora.push(corpus)
                }
            }

            this.s.$apply(() => {
                this.s.onGraphShow({
                    cqp: this.proxy.prevNonExpandedCQP,
                    subcqps: subExprs,
                    labelMapping,
                    showTotal,
                    corpusListing: settings.corpusListing.subsetFactory(activeCorpora),
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
        header = header.concat(_.map(cl.corpora, "title"))

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
                                settings.corpora[corpus.toLowerCase()]["title"] +
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
