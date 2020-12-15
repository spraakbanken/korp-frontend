/** @format */
import statisticsFormatting from "../config/statistics_config.js"
import statemachine from "./statemachine"
const korpFailImg = require("../img/korp_fail.svg")

class BaseResults {
    constructor(resultSelector, tabSelector, scope) {
        this.s = scope
        this.$tab = $(tabSelector)
        this.$result = $(resultSelector)

        this.$result.add(this.$tab).addClass("not_loading")

        this.injector = angular.injector(["ng"])

        const def = this.injector.get("$q").defer()
        this.firstResultDef = def
    }

    onProgress(progressObj) {
        return safeApply(this.s, () => {
            this.s.$parent.progress = Math.round(progressObj["stats"])
            this.s.hits_display = util.prettyNumbers(progressObj["total_results"])
        })
    }

    abort() {
        this.ignoreAbort = false
        return this.proxy.abort()
    }

    getResultTabs() {
        return $(".result_tabs > ul").scope().tabset.tabs
    }

    getActiveResultTab() {
        return $(".result_tabs").scope().activeTab
    }

    renderResult(data) {
        this.$result.find(".error_msg").remove()
        if (data.ERROR) {
            safeApply(this.s, () => {
                return this.firstResultDef.reject()
            })

            this.resultError(data)
            return false
        } else {
            return safeApply(this.s, () => {
                this.firstResultDef.resolve()
                this.hasData = true
            })
        }
    }

    resultError(data) {
        c.error("json fetch error: ", data)
        this.hidePreloader()
        this.resetView()
        return $(`<object class="korp_fail" type="image/svg+xml" data="${korpFailImg}">`)
            .append(`<img class='korp_fail' src='${korpFailImg}'>`)
            .add($("<div class='fail_text' />").localeKey("fail_text"))
            .addClass("inline_block")
            .prependTo(this.$result)
            .wrapAll("<div class='error_msg'>")
    }

    showPreloader() {
        this.s.$parent.loading = true
    }

    hidePreloader() {
        this.s.$parent.loading = false
    }

    resetView() {
        this.hasData = false
        return this.$result.find(".error_msg").remove()
    }

    countCorpora() {
        return this.proxy.prevParams && this.proxy.prevParams.corpus.split(",").length
    }

    onentry() {
        this.s.$root.jsonUrl = null
        this.firstResultDef.promise.then(() => {
            const prevUrl = this.proxy && this.proxy.prevUrl
            this.s.$apply(($scope) => ($scope.$root.jsonUrl = prevUrl))
        })
    }

    onexit() {
        this.s.$root.jsonUrl = null
    }

    isActive() {
        return this.getActiveResultTab() === this.tabindex
    }
}

view.KWICResults = class KWICResults extends BaseResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)

        this.proxy = new model.KWICProxy()
        window.kwicProxy = this.proxy

        this.tabindex = 0

        this.s = scope

        this.selectionManager = scope.selectionManager
        this.setupReadingHash()
        this.$result.click((event) => {
            if (
                event.target.id === "frontendDownloadLinks" ||
                event.target.classList.contains("kwicDownloadLink")
            ) {
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

    setupReadingHash() {
        return this.s.setupReadingHash()
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
                const l = paragraph.filter(
                    (__, item) => $(item).is(word) || $(item).is(querySentStart)
                )
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
        if (
            isSpecialKeyDown ||
            $("input, textarea, select").is(":focus") ||
            !this.$result.is(":visible")
        ) {
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
        const items_per_page = Number(hpp) || settings.hitsPerPageDefault
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
                this.selectionManager.deselect()
            } else {
                $scope.setKwicData(data)
            }
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

        if (settings.enableBackendKwicDownload) {
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
            rtitle: settings.corpusListing.getTitle(obj.toLowerCase()),
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
            preferredContext = settings.defaultReadingContext
            avoidContext = settings.defaultOverviewContext
        } else {
            preferredContext = settings.defaultOverviewContext
            avoidContext = settings.defaultReadingContext
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
            prevMatch = this.getFirstAtCoor(
                current.offset().left + current.width() / 2,
                $(searchwords),
                def
            ).click()
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
                .add(
                    current
                        .closest(".not_corpus_info")
                        .nextAll(".not_corpus_info")
                        .first()
                        .find(".word")
                )
            const def = current.parent().next().find(".word:first")
            nextMatch = this.getFirstAtCoor(
                current.offset().left + current.width() / 2,
                searchwords,
                def
            ).click()
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

    setupReadingHash() {}

    isReadingMode() {
        return this.s.exampleReadingMode
    }

    makeRequest() {
        const items_per_page = parseInt(locationSearch().hpp || settings.hitsPerPageDefault)
        const opts = this.s.$parent.kwicTab.queryParams

        this.resetView()
        // example tab cannot handle incremental = true
        opts.ajaxParams.incremental = false

        opts.ajaxParams.start = this.s.$parent.page * items_per_page
        opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

        const prev = _.pick(this.proxy.prevParams, "cqp", "command", "corpus", "source")
        _.extend(opts.ajaxParams, prev)

        let avoidContext, preferredContext
        if (this.isReadingMode()) {
            preferredContext = settings.defaultReadingContext
            avoidContext = settings.defaultOverviewContext
        } else {
            preferredContext = settings.defaultOverviewContext
            avoidContext = settings.defaultReadingContext
        }

        const context = settings.corpusListing.getContextQueryStringFromCorpusId(
            (prev.corpus || "").split(","),
            preferredContext,
            avoidContext
        )
        _.extend(opts.ajaxParams, { context, default_context: preferredContext })

        this.showPreloader()
        const progress =
            opts.command === "relations_sentences" ? $.noop : $.proxy(this.onProgress, this)
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
        const tagsetTrans = _.invert(settings.wordpictureTagset)
        unique_words = _.filter(unique_words, function (...args) {
            const [currentWd, pos] = args[0]
            return settings.wordPictureConf[tagsetTrans[pos]] != null
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
                (item) =>
                    (item.field_reverse || false) === (rel.field_reverse || false) &&
                    item.rel === rel.rel
            )
            const type = rel.field_reverse ? "head" : "dep"
            return {
                i,
                type,
            }
        }

        const tagsetTrans = _.invert(settings.wordpictureTagset)

        const res = _.map(tables, function ([token, wordClass]) {
            const getRelType = (item) => ({
                rel: tagsetTrans[item.rel.toLowerCase()],
                field_reverse: item.dep === token,
            })

            const wordClassShort = wordClass.toLowerCase()
            wordClass = _.invert(settings.wordpictureTagset)[wordClassShort]

            if (settings.wordPictureConf[wordClass] == null) {
                return
            }
            let orderArrays = [[], [], []]
            $.each(data, (index, item) => {
                $.each(settings.wordPictureConf[wordClass] || [], (i, rel_type_list) => {
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

                if (settings.wordPictureConf[wordClass][i] && unsortedList.length) {
                    const toIndex = $.inArray("_", settings.wordPictureConf[wordClass][i])
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
                cqp2 = statisticsFormatting.getCqp(
                    rowData.statsValues,
                    this.searchParams.ignoreCase
                )
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
                const parts = this.searchParams.reduceVals.map(
                    (reduceVal) => row.formattedValue[reduceVal]
                )
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

        $.when(window.timeDeferred).then(() => {
            safeApply(this.s, () => {
                this.updateGraphBtnState()
            })
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
        $("<div id='dialog' />")
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
                stats2Instance.pie_widget(
                    "newData",
                    getDataItems(this.pieChartCurrentRowId, typestring)
                )
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

view.GraphResults = class GraphResults extends BaseResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)

        this.validZoomLevels = ["year", "month", "day", "hour", "minute", "second"]
        this.granularities = {
            year: "y",
            month: "m",
            day: "d",
            hour: "h",
            minute: "n",
            second: "s",
        }

        this.zoom = "year"
        this.proxy = new model.GraphProxy()

        const [from, to] = settings.corpusListing.getMomentInterval()

        this.checkZoomLevel(from, to, true)

        $(".chart", this.$result).on("click", (event) => {
            const target = $(".chart", this.$result)
            const val = $(".detail .x_label > span", target).data("val")
            let cqp = $(".detail .item.active > span", target).data("cqp")

            if (cqp) {
                let timecqp
                cqp = CQP.expandOperators(decodeURIComponent(cqp))
                const m = moment(val * 1000)

                const datefrom = moment(m).startOf(this.zoom).format("YYYYMMDD")
                const dateto = moment(m).endOf(this.zoom).format("YYYYMMDD")
                if (this.validZoomLevels.indexOf(this.zoom) < 3) {
                    // year, month, day
                    timecqp = `[(int(_.text_datefrom) >= ${datefrom} & int(_.text_dateto) <= ${dateto}) |
                                (int(_.text_datefrom) <= ${datefrom} & int(_.text_dateto) >= ${dateto})
                               ]`
                } else {
                    // hour, minute, second
                    const timefrom = moment(m).startOf(this.zoom).format("HHmmss")
                    const timeto = moment(m).endOf(this.zoom).format("HHmmss")
                    timecqp = `[(int(_.text_datefrom) = ${datefrom} &
                                 int(_.text_timefrom) >= ${timefrom} &
                                 int(_.text_dateto) <= ${dateto} &
                                 int(_.text_timeto) <= ${timeto}) |
                                ((int(_.text_datefrom) < ${datefrom} |
                                 (int(_.text_datefrom) = ${datefrom} & int(_.text_timefrom) <= ${timefrom})
                                ) &
                                   (int(_.text_dateto) > ${dateto} |
                                    (int(_.text_dateto) = ${dateto} & int(_.text_timeto) >= ${timeto})
                                ))]`
                }

                const n_tokens = this.s.data.cqp.split("]").length - 2

                timecqp = [timecqp].concat(_.map(_.range(0, n_tokens), () => "[]")).join(" ")

                const opts = {}
                opts.ajaxParams = {
                    start: 0,
                    end: 24,
                    corpus: this.s.data.corpusListing.stringifySelected(),
                    cqp: this.s.data.cqp,
                    cqp2: timecqp,
                    expand_prequeries: false,
                }

                safeApply(this.s.$root, () => {
                    this.s.$root.kwicTabs.push({ queryParams: opts })
                })
            }
        })
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
        this.proxy.granularity = this.granularities[zoom]
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
        let newZoom = _.minBy(this.validZoomLevels, function (zoom) {
            const nPoints = to.diff(from, zoom)
            return Math.abs(idealNumHits - nPoints)
        })

        if ((newZoom && oldZoom !== newZoom) || forceSearch) {
            this.setZoom(newZoom, from, to)
        }
    }

    parseDate(zoom, time) {
        switch (zoom) {
            case "year":
                return moment(time, "YYYY")
            case "month":
                return moment(time, "YYYYMM")
            case "day":
                return moment(time, "YYYYMMDD")
            case "hour":
                return moment(time, "YYYYMMDDHH")
            case "minute":
                return moment(time, "YYYYMMDDHHmm")
            case "second":
                return moment(time, "YYYYMMDDHHmmss")
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

    getSeriesData(data, showSelectedCorporasStartDate, zoom) {
        delete data[""]
        // TODO: getTimeInterval should take the corpora of this parent tab instead of the global ones.
        // const [firstVal, lastVal] = settings.corpusListing.getMomentInterval()
        let output = []
        for (let [x, y] of _.toPairs(data)) {
            const mom = this.parseDate(this.zoom, x)
            output.push({ x: mom, y })
        }

        // if (not hasFirstValue) and showSelectedCorporasStartDate
        // if showSelectedCorporasStartDate # Don't remove first value for now
        // output.push {x : firstVal, y:0}

        // const prettyDate = item => moment(item.x).format("YYYYMMDD:HHmmss")

        output = this.fillMissingDate(output)
        output = output.sort((a, b) => a.x.unix() - b.x.unix())

        for (let tuple of output) {
            tuple.x = tuple.x.unix()
            tuple.zoom = zoom
        }

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
        const non_time = _.reduce(
            _.map(settings.corpusListing.selected, "non_time"),
            (a, b) => (a || 0) + (b || 0),
            0
        )
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
        if ($(".legend .line", this.$result).length > 1) {
            $(".legend li:last:not(.disabled) .action", this.$result).click()
            if (
                _.every(_.map($(".legend .line", this.$result), (item) => $(item).is(".disabled")))
            ) {
                $(".legend li:first .action", this.$result).click()
            }
        }
    }
    setLineMode() {}

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

        return $(".exportTimeStatsSection .btn.export", this.$result).click(() => {
            const selVal = $(".timeKindOfData option:selected", this.$result).val()
            const selType = $(".timeKindOfFormat option:selected", this.$result).val()
            const dataDelimiter = selType === "TSV" ? "\t" : ";"

            const header = [util.getLocaleString("stats_hit")]

            for (let cell of series[0].data) {
                const stampformat = this.zoomLevelToFormat(cell.zoom)
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

    zoomLevelToFormat(zoom) {
        const stampFormats = {
            second: "YYYY-MM-DD hh:mm:ss",
            minute: "YYYY-MM-DD hh:mm",
            hour: "YYYY-MM-DD hh",
            day: "YYYY-MM-DD",
            month: "YYYY-MM",
            year: "YYYY",
        }
        return stampFormats[zoom]
    }

    renderTable(series) {
        const time_table_data = []
        const time_table_columns_intermediate = {}
        for (let row of series) {
            const new_time_row = { label: row.name }
            for (let item of row.data) {
                const stampformat = this.zoomLevelToFormat(item.zoom)
                const timestamp = moment(item.x * 1000).format(stampformat) // this needs to be fixed for other resolutions
                time_table_columns_intermediate[timestamp] = {
                    name: timestamp,
                    field: timestamp,
                    formatter(row, cell, value, columnDef, dataContext) {
                        const loc = {
                            sv: "sv-SE",
                            en: "gb-EN",
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

        const time_grid = new Slick.Grid(
            $(".time_table", this.$result),
            time_table_data,
            time_table_columns,
            {
                enableCellNavigation: false,
                enableColumnReorder: false,
                forceFitColumns: false,
            }
        )
        $(".time_table", this.$result).width("100%")
        this.time_grid = time_grid
    }

    makeSeries(data, cqp, labelMapping, zoom) {
        let color, series
        const [from, to] = CQP.getTimeInterval(CQP.parse(cqp)) || [null, null]
        const showSelectedCorporasStartDate = !from
        if (_.isArray(data.combined)) {
            const palette = new Rickshaw.Color.Palette("colorwheel")
            series = []
            for (let item of data.combined) {
                color = palette.color()
                series.push({
                    data: this.getSeriesData(item.relative, showSelectedCorporasStartDate, zoom),
                    color,
                    name: item.cqp ? this.s.data.labelMapping[item.cqp] : "&Sigma;",
                    cqp: item.cqp || cqp,
                    abs_data: this.getSeriesData(
                        item.absolute,
                        showSelectedCorporasStartDate,
                        zoom
                    ),
                })
            }
        } else {
            series = [
                {
                    data: this.getSeriesData(
                        data.combined.relative,
                        showSelectedCorporasStartDate,
                        zoom
                    ),
                    color: "steelblue",
                    name: "&Sigma;",
                    cqp,
                    abs_data: this.getSeriesData(
                        data.combined.absolute,
                        showSelectedCorporasStartDate,
                        zoom
                    ),
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

        const hoverDetail = new Rickshaw.Graph.HoverDetail({
            graph,
            xFormatter: (x) => {
                const m = moment.unix(String(x))

                return `<span data-val='${x}'>${m.format("YYYY-MM-DD HH:mm:ss")}</span>`
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
        const old_ceil = time.ceil
        time.ceil = (time, unit) => {
            if (unit.name === "decade") {
                const out = Math.ceil(time / unit.seconds) * unit.seconds
                const mom = moment(out * 1000)
                if (mom.date() === 31) {
                    mom.add("day", 1)
                }
                return mom.unix()
            } else {
                return old_ceil(time, unit)
            }
        }

        const xAxis = new Rickshaw.Graph.Axis.Time({
            graph,
        })
        // timeUnit: time.unit("month") # TODO: bring back decade
        // timeFixture: new Rickshaw.Fixtures.Time()

        this.preview = new Rickshaw.Graph.RangeSlider.Preview({
            graph,
            element: $(".preview", this.$result).get(0),
        })

        $("body").on("mouseup", ".preview .middle_handle", () => {
            return this.previewPanStop()
        })

        $("body").on("mouseup", ".preview .left_handle, .preview .right_handle", () => {
            if (!this.s.loading) {
                return this.previewPanStop()
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
            var [rickshawModule, graphData] = await Promise.all([
                rickshawPromise || Rickshaw,
                reqPromise,
            ])
        } catch (e) {
            c.error("graph crash", e)
            this.resultError(data)
            this.s.loading = false
        }
        window.Rickshaw = rickshawModule
        this.renderGraph(graphData, cqp, labelMapping, currentZoom, showTotal)
    }
}
