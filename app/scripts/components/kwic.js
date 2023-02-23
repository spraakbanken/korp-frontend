/** @format */
import statemachine from "../statemachine"

let html = String.raw

export const kwicComponent = {
    template: html`
        <div ng-click="$ctrl.onKwicClick($event)">
            <div class="result_controls">
                <warning ng-if="$ctrl.aborted && !$ctrl.loading">{{'search_aborted' | loc:lang}}</warning>
                <div class="controls_n" ng-show="$ctrl.hitsDisplay">
                    <span>{{'num_results' | loc:lang}}: </span>
                    <span class="num-result" ng-bind-html="$ctrl.hitsDisplay | trust"></span>
                </div>
                <div class="hits_picture" ng-if="$ctrl.hitsPictureData.length > 1">
                    <table class="hits_picture_table">
                        <tbody>
                            <tr>
                                <td
                                    class="hits_picture_corp"
                                    ng-repeat="corpus in $ctrl.hitsPictureData"
                                    ng-style='{width : corpus.relative + "%"}'
                                    ng-class="{odd : $index % 2 != 0, even : $index % 2 == 0}"
                                    ng-click="$ctrl.pageEvent(corpus.page)"
                                    uib-tooltip="{{corpus.rtitle | locObj:lang}}: {{corpus.abs}}"
                                    uib-tooltip-placement='{{$last? "left":"top"}}'
                                    append-to-body="false"
                                ></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <kwic-pager
                ng-if="$ctrl.hits"
                total-hits="$ctrl.hits"
                current-page="$ctrl.page"
                page-change="$ctrl.pageEvent(page)"
                hits-per-page="$ctrl.hitsPerPage"
            ></kwic-pager>
            <span ng-if="$ctrl.hits" class="reading_btn link" ng-click="$ctrl.toggleReading()">
                <span ng-if="!$ctrl.readingMode">{{'show_reading' | loc:lang}}</span>
                <span ng-if="$ctrl.readingMode">{{'show_kwic' | loc:lang}}</span>
            </span>
            <div class="table_scrollarea">
                <table class="results_table kwic" ng-if="!$ctrl.useContext" cellspacing="0">
                    <tr
                        class="sentence"
                        ng-repeat="sentence in $ctrl.kwic"
                        ng-class="{corpus_info : sentence.newCorpus, not_corpus_info : !sentence.newCorpus, linked_sentence : sentence.isLinked, even : $even, odd : $odd}"
                    >
                        <td class="empty_td"></td>
                        <td class="corpus_title text-gray-600 uppercase text-sm" colspan="3">
                            <div>
                                {{sentence.newCorpus | locObj:lang}}
                                <span class="corpus_title_warn" ng-if="::sentence.noContext"
                                    >{{'no_context_support' | loc:lang}}</span
                                >
                            </div>
                        </td>
                        <td class="empty_td"></td>
                        <td class="lnk" colspan="3" ng-if="::sentence.isLinked">
                            <span kwic-word="kwic-word" ng-repeat="wd in sentence.tokens"></span>
                        </td>
                        <td class="left" ng-if="::!sentence.newCorpus">
                            <span kwic-word="kwic-word" ng-repeat="wd in $ctrl.selectLeft(sentence)"></span>
                        </td>
                        <td class="match" ng-if="::!sentence.newCorpus">
                            <span kwic-word="kwic-word" ng-repeat="wd in $ctrl.selectMatch(sentence)"></span>
                        </td>
                        <td class="right" ng-if="::!sentence.newCorpus">
                            <span kwic-word="kwic-word" ng-repeat="wd in $ctrl.selectRight(sentence)"> </span>
                        </td>
                    </tr>
                </table>
                <div class="results_table reading" ng-if="$ctrl.useContext">
                    <p
                        class="sentence"
                        ng-repeat="sentence in $ctrl.kwic"
                        ng-class="{corpus_info : sentence.newCorpus, not_corpus_info : !sentence.newCorpus, linked_sentence : sentence.isLinked,         even : $even,         odd : $odd}"
                    >
                        <span class="corpus_title" colspan="0"
                            >{{sentence.newCorpus | locObj:lang}}<span
                                class="corpus_title_warn"
                                ng-if="::sentence.noContext"
                                >{{'no_context_support' | loc:lang}}</span
                            ></span
                        >
                        <span ng-repeat="wd in sentence.tokens" kwic-word="kwic-word"></span>
                    </p>
                </div>
            </div>
            <kwic-pager
                ng-if="$ctrl.hits"
                total-hits="$ctrl.hits"
                current-page="$ctrl.page"
                page-change="$ctrl.pageEvent(page)"
                hits-per-page="$ctrl.hitsPerPage"
            ></kwic-pager>
            <div id="download-links-container">
                <select id="download-links" ng-if="$ctrl._settings['enable_backend_kwic_download']"></select>
                <select
                    id="frontendDownloadLinks"
                    ng-if="$ctrl._settings['enable_frontend_kwic_download']"
                    ng-change="$ctrl.download.init($ctrl.download.selected, $ctrl.hitsDisplay)"
                    ng-model="$ctrl.download.selected"
                    ng-options="item.value as item.label | loc:lang disable when item.disabled for item in $ctrl.download.options"
                ></select>
                <a
                    class="kwicDownloadLink"
                    ng-if="$ctrl._settings['enable_frontend_kwic_download']"
                    href="{{$ctrl.download.blobName}}"
                    download="{{$ctrl.download.fileName}}"
                    target="_self"
                    style="display: none;"
                ></a>
            </div>
        </div>
    `,
    bindings: {
        aborted: "<",
        loading: "<",
        active: "<",
        hitsDisplay: "<",
        hits: "<",
        isReading: "<",
        page: "<",
        pageEvent: "<",
        contextChangeEvent: "<",
        hitsPerPage: "<",
        prevParams: "<",
        prevRequest: "<",
        corpusOrder: "<",
        data: "<",
    },
    controller: [
        "$location",
        "$element",
        "$timeout",
        "kwicDownload",
        function ($location, $element, $timeout, kwicDownload) {
            let $ctrl = this

            const selectionManager = new util.SelectionManager()

            $ctrl.$onInit = () => {
                addKeydownHandler()
            }

            $ctrl.$onChanges = (changeObj) => {
                if ("data" in changeObj && $ctrl.data != undefined) {
                    $ctrl.useContext = $ctrl.isReading || locationSearch()["in_order"] != null

                    $ctrl.kwic = massageData($ctrl.data.kwic)

                    if (!$ctrl.isReading) {
                        $timeout(() => centerScrollbar())
                        $element.find(".match").children().first().click()
                    }

                    let items = _.map($ctrl.corpusOrder, (obj) => ({
                        rid: obj,
                        rtitle: settings.corpusListing.getTitleObj(obj.toLowerCase()),
                        relative: $ctrl.data.corpus_hits[obj] / $ctrl.hits,
                        abs: $ctrl.data.corpus_hits[obj],
                    })).filter((item) => item.abs > 0)

                    // calculate which is the first page of hits for each item
                    let index = 0
                    _.each(items, (obj) => {
                        obj.page = Math.floor(index / $ctrl.data.kwic.length)
                        index += obj.abs
                    })

                    $ctrl.hitsPictureData = items
                }

                if (settings["enable_backend_kwic_download"] && $ctrl.hitsDisplay) {
                    // using hitsDisplay here, since hits is not set until request is complete
                    util.setDownloadLinks($ctrl.prevRequest, {
                        kwic: $ctrl.kwic,
                        corpus_order: $ctrl.corpusOrder,
                    })
                }
                if (currentMode === "parallel" && !$ctrl.isReading) {
                    centerScrollbarParallel()
                }
                if ($ctrl.kwic && $ctrl.kwic.length == 0) {
                    selectionManager.deselect()
                    statemachine.send("DESELECT_WORD")
                }
                if ("active" in changeObj) {
                    if ($ctrl.active) {
                        centerScrollbar()
                        $timeout(() => $element.find(".token_selected").click(), 0)
                    } else {
                        statemachine.send("DESELECT_WORD")
                    }
                }
            }

            $ctrl.onKwicClick = (event) => {
                if (event.target.classList.contains("word")) {
                    onWordClick(event)
                } else {
                    if (
                        event.target.id === "frontendDownloadLinks" ||
                        event.target.classList.contains("kwicDownloadLink")
                    ) {
                        return
                    }
                    if (!selectionManager.hasSelected()) {
                        return
                    }
                    selectionManager.deselect()
                    statemachine.send("DESELECT_WORD")
                }
            }

            $ctrl._settings = settings

            const isParallelMode = window.currentModeParallel

            $ctrl.toggleReading = () => {
                $ctrl.readingMode = !$ctrl.readingMode
                $ctrl.contextChangeEvent()
            }

            $ctrl.readingMode = $location.search().reading_mode

            $ctrl.download = {
                options: [
                    { value: "", label: "download_kwic" },
                    { value: "kwic/csv", label: "download_kwic_csv" },
                    { value: "kwic/tsv", label: "download_kwic_tsv" },
                    { value: "annotations/csv", label: "download_annotations_csv", disabled: isParallelMode },
                    { value: "annotations/tsv", label: "download_annotations_tsv", disabled: isParallelMode },
                ],
                selected: "",
                init: (value, hitsDisplay) => {
                    if ($ctrl.download.blobName) {
                        URL.revokeObjectURL($ctrl.download.blobName)
                    }
                    if (value === "") {
                        return
                    }
                    const [fileName, blobName] = kwicDownload.makeDownload(
                        ...value.split("/"),
                        $ctrl.kwic,
                        $ctrl.prevParams,
                        hitsDisplay
                    )
                    $ctrl.download.fileName = fileName
                    $ctrl.download.blobName = blobName
                    $ctrl.download.selected = ""
                    $timeout(() => $element[0].getElementsByClassName("kwicDownloadLink")[0].click(), 0)
                },
            }

            $ctrl.selectLeft = function (sentence) {
                if (!sentence.match) {
                    return
                }
                return sentence.tokens.slice(0, sentence.match.start)
            }

            $ctrl.selectMatch = function (sentence) {
                if (!sentence.match) {
                    return
                }
                const from = sentence.match.start
                return sentence.tokens.slice(from, sentence.match.end)
            }

            $ctrl.selectRight = function (sentence) {
                if (!sentence.match) {
                    return
                }
                const from = sentence.match.end
                const len = sentence.tokens.length
                return sentence.tokens.slice(from, len)
            }

            function massageData(hitArray) {
                const punctArray = [",", ".", ";", ":", "!", "?", "..."]

                let prevCorpus = ""
                const output = []

                for (let i = 0; i < hitArray.length; i++) {
                    var corpus, linkCorpusId, mainCorpusId, matches
                    const hitContext = hitArray[i]
                    if (currentMode === "parallel") {
                        mainCorpusId = hitContext.corpus.split("|")[0].toLowerCase()
                        linkCorpusId = hitContext.corpus.split("|")[1].toLowerCase()
                    } else {
                        mainCorpusId = hitContext.corpus.toLowerCase()
                    }

                    const id = linkCorpusId || mainCorpusId

                    const [matchSentenceStart, matchSentenceEnd] = findMatchSentence(hitContext)

                    if (!(hitContext.match instanceof Array)) {
                        matches = [{ start: hitContext.match.start, end: hitContext.match.end }]
                    } else {
                        matches = hitContext.match
                    }

                    const currentStruct = {}
                    for (let i in _.range(0, hitContext.tokens.length)) {
                        const wd = hitContext.tokens[i]
                        wd.position = i

                        for (let { start, end } of matches) {
                            if (start <= i && i < end) {
                                _.extend(wd, { _match: true })
                            }
                        }

                        if (matchSentenceStart <= i && i <= matchSentenceEnd) {
                            _.extend(wd, { _matchSentence: true })
                        }
                        if (punctArray.includes(wd.word)) {
                            _.extend(wd, { _punct: true })
                        }

                        wd.structs = wd.structs || {}

                        for (let structItem of wd.structs.open || []) {
                            const structKey = _.keys(structItem)[0]
                            if (structKey == "sentence") {
                                wd._open_sentence = true
                            }

                            currentStruct[structKey] = {}
                            const attrs = _.toPairs(structItem[structKey]).map(([key, val]) => [
                                structKey + "_" + key,
                                val,
                            ])
                            for (let [key, val] of _.concat([[structKey, ""]], attrs)) {
                                if (key in settings.corpora[id].attributes) {
                                    currentStruct[structKey][key] = val
                                }
                            }
                        }

                        const attrs = _.reduce(_.values(currentStruct), (val, ack) => _.merge(val, ack), {})
                        _.extend(wd, attrs)

                        for (let structItem of wd.structs.close || []) {
                            delete currentStruct[structItem]
                        }
                    }

                    if (prevCorpus !== id) {
                        corpus = settings.corpora[id]
                        const newSent = {
                            newCorpus: corpus.title,
                            noContext: _.keys(corpus.context).length === 1,
                        }
                        output.push(newSent)
                    }

                    hitContext.corpus = mainCorpusId

                    output.push(hitContext)
                    if (hitContext.aligned) {
                        // just check for sentence opened, no other structs
                        const alignedTokens = Object.values(hitContext.aligned)[0]
                        for (let wd of alignedTokens) {
                            if (wd.structs && wd.structs.open) {
                                for (let structItem of wd.structs.open) {
                                    if (_.keys(structItem)[0] == "sentence") {
                                        wd._open_sentence = true
                                    }
                                }
                            }
                        }

                        const [corpus_aligned, tokens] = _.toPairs(hitContext.aligned)[0]
                        output.push({
                            tokens,
                            isLinked: true,
                            corpus: corpus_aligned,
                        })
                    }

                    prevCorpus = id
                }

                return output
            }

            function findMatchSentence(hitContext) {
                const span = []
                const { start, end } = hitContext.match
                let decr = start
                let incr = end
                while (decr >= 0) {
                    const token = hitContext.tokens[decr]
                    const sentenceOpen = _.filter((token.structs && token.structs.open) || [], (attr) => attr.sentence)
                    if (sentenceOpen.length > 0) {
                        span[0] = decr
                        break
                    }
                    decr--
                }
                while (incr < hitContext.tokens.length) {
                    const token = hitContext.tokens[incr]
                    const closed = (token.structs && token.structs.close) || []
                    if (closed.includes("sentence")) {
                        span[1] = incr
                        break
                    }
                    incr++
                }

                return span
            }

            function onWordClick(event) {
                event.stopPropagation()
                const scope = $(event.target).scope()
                const obj = scope.wd
                const sent = scope.sentence
                const word = $(event.target)

                statemachine.send("SELECT_WORD", {
                    sentenceData: sent.structs,
                    wordData: obj,
                    corpus: sent.corpus.toLowerCase(),
                    tokens: sent.tokens,
                    inReadingMode: false,
                })
                if (currentMode === "parallel") {
                    selectWordParallel(word, scope, sent)
                } else {
                    selectWord(word, scope)
                }
            }

            function selectWord(word, scope) {
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
                selectionManager.select(word, aux)
            }

            function selectWordParallel(word, scope, sentence) {
                selectWord(word, scope)
                clearLinks()
                var obj = scope.wd
                if (!obj.linkref) return
                var corpus = settings.corpora[sentence.corpus]

                function findRef(ref, sentence) {
                    var out = null
                    _.each(sentence, function (word) {
                        if (word.linkref == ref.toString()) {
                            out = word
                            return false
                        }
                    })
                    return out
                }

                if (sentence.isLinked) {
                    // a secondary language was clicked
                    var sent_index = scope.$parent.$index
                    var data = getActiveData()
                    var mainSent = null
                    while (data[sent_index]) {
                        var sent = data[sent_index]
                        if (!sent.isLinked) {
                            mainSent = sent
                            break
                        }
                        sent_index--
                    }

                    var linkNum = Number(obj.linkref)
                    var lang = corpus.id.split("-")[1]

                    _.each(mainSent.tokens, function (token) {
                        var refs = _.map(_.compact(token["wordlink-" + lang].split("|")), Number)
                        if (_.includes(refs, linkNum)) {
                            token._link_selected = true
                            $ctrl.parallelSelected.push(token)
                        }
                    })
                } else {
                    var links = _.pickBy(obj, function (val, key) {
                        return _.startsWith(key, "wordlink")
                    })
                    _.each(links, function (val, key) {
                        _.each(_.compact(val.split("|")), function (num) {
                            var lang = key.split("-")[1]
                            var mainCorpus = corpus.id.split("-")[0]

                            var link = findRef(num, sentence.aligned[mainCorpus + "-" + lang])
                            link._link_selected = true
                            $ctrl.parallelSelected.push(link)
                        })
                    })
                }
            }

            function getActiveData() {
                return $ctrl.kwic
            }

            function clearLinks() {
                _.each($ctrl.parallelSelected, function (word) {
                    delete word._link_selected
                })
                $ctrl.parallelSelected = []
            }

            function centerScrollbar() {
                const m = $element.find(".match:first")
                if (!m.length) {
                    return
                }
                const area = $element.find(".table_scrollarea").scrollLeft(0)
                const match = m.first().position().left + m.width() / 2
                const sidebarWidth = $("#sidebar").outerWidth() || 0
                area.stop(true, true).scrollLeft(match - ($("body").innerWidth() - sidebarWidth) / 2)
            }

            function centerScrollbarParallel() {
                const scrollLeft = $(".table_scrollarea", $element).scrollLeft() || 0
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

            function addKeydownHandler() {
                $(document).keydown((event) => {
                    let next
                    const isSpecialKeyDown = event.shiftKey || event.ctrlKey || event.metaKey
                    if (isSpecialKeyDown || $("input, textarea, select").is(":focus")) {
                        // TODO || !$element.is(":visible")) {
                        return
                    }

                    switch (event.which) {
                        case 78: // n
                            $ctrl.pageEvent($ctrl.page + 1)
                            return false
                        case 70: // f
                            if ($ctrl.page === 0) {
                                return
                            }
                            $ctrl.pageEvent($ctrl.page - 1)
                            return false
                    }
                    if (!selectionManager.hasSelected()) {
                        return
                    }
                    switch (event.which) {
                        case 38: // up
                            next = selectUp()
                            break
                        case 39: // right
                            next = selectNext()
                            break
                        case 37: // left
                            next = selectPrev()
                            break
                        case 40: // down
                            next = selectDown()
                            break
                    }

                    if (next) {
                        scrollToShowWord($(next))
                        return false
                    }
                })
            }

            function selectNext() {
                let next
                if (!$ctrl.readingMode) {
                    const i = getCurrentRow().index($element.find(".token_selected").get(0))
                    next = getCurrentRow().get(i + 1)
                    if (next == null) {
                        return
                    }
                    $(next).click()
                } else {
                    next = $element.find(".token_selected").next().click()
                }
                return next
            }

            function selectPrev() {
                let prev
                if (!$ctrl.readingMode) {
                    const i = getCurrentRow().index($element.find(".token_selected").get(0))
                    if (i === 0) {
                        return
                    }
                    prev = getCurrentRow().get(i - 1)
                    $(prev).click()
                } else {
                    prev = $element.find(".token_selected").prev().click()
                }
                return prev
            }

            function selectUp() {
                let prevMatch
                const current = selectionManager.selected
                if (!$ctrl.readingMode) {
                    prevMatch = getWordAt(
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
                    prevMatch = getFirstAtCoor(current.offset().left + current.width() / 2, $(searchwords), def).click()
                }

                return prevMatch
            }

            function selectDown() {
                let nextMatch
                const current = selectionManager.selected
                if (!$ctrl.readingMode) {
                    nextMatch = getWordAt(
                        current.offset().left + current.width() / 2,
                        current.closest("tr").nextAll(".not_corpus_info").first()
                    )
                    nextMatch.click()
                } else {
                    const searchwords = current
                        .nextAll(".word")
                        .add(current.closest(".not_corpus_info").nextAll(".not_corpus_info").first().find(".word"))
                    const def = current.parent().next().find(".word:first")
                    nextMatch = getFirstAtCoor(current.offset().left + current.width() / 2, searchwords, def).click()
                }
                return nextMatch
            }

            function getCurrentRow() {
                const tr = $element.find(".token_selected").closest("tr")
                if ($element.find(".token_selected").parent().is("td")) {
                    return tr.find("td > .word")
                } else {
                    return tr.find("div > .word")
                }
            }

            function getFirstAtCoor(xCoor, wds, default_word) {
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

            function getWordAt(xCoor, $row) {
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

            function scrollToShowWord(word) {
                if (!word.length) {
                    return
                }
                const offset = 200
                const wordTop = word.offset().top
                let newY = window.scrollY
                if (wordTop > $(window).height() + window.scrollY) {
                    newY += offset$r
                } else if (wordTop < window.scrollY) {
                    newY -= offset
                }
                $("html, body").stop(true, true).animate({ scrollTop: newY })
                const wordLeft = word.offset().left
                const area = $element.find(".table_scrollarea")
                let newX = Number(area.scrollLeft())
                if (wordLeft > area.offset().left + area.width()) {
                    newX += offset
                } else if (wordLeft < area.offset().left) {
                    newX -= offset
                }
                area.stop(true, true).animate({ scrollLeft: newX })
            }
        },
    ],
}
