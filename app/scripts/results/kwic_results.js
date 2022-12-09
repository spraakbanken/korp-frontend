/** @format */
import statemachine from "../statemachine"
import { BaseResults } from "./base_results.js"

export class KWICResults extends BaseResults {
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