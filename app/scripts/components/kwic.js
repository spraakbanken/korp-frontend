/** @format */
import angular from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import currentMode from "@/mode"
import { SelectionManager, html, setDownloadLinks } from "@/util"
import "@/components/kwic-pager"
import "@/components/kwic-word"

angular.module("korpApp").component("kwic", {
    template: html`
        <div ng-click="$ctrl.onKwicClick($event)">
            <div class="result_controls">
                <div ng-if="$ctrl.aborted && !$ctrl.loading" class="korp-warning">
                    {{'search_aborted' | loc:$root.lang}}
                </div>

                <div class="controls_n" ng-if="$ctrl.hitsInProgress != null">
                    <span>{{'num_results' | loc:$root.lang}}: </span>
                    <span class="num-result">{{ $ctrl.hitsInProgress | prettyNumber:$root.lang }}</span>
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
                                    tooltip-placement='{{$last? "left":"top"}}'
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
                <span ng-if="!$ctrl.readingMode">{{'show_reading' | loc:$root.lang}}</span>
                <span ng-if="$ctrl.readingMode">{{'show_kwic' | loc:$root.lang}}</span>
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
                                    >{{'no_context_support' | loc:$root.lang}}</span
                                >
                            </div>
                        </td>
                        <td class="empty_td"></td>
                        <td class="lnk" colspan="3" ng-if="::sentence.isLinked">
                            <kwic-word
                                ng-repeat="word in sentence.tokens"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                        <td class="left" ng-if="::!sentence.newCorpus">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectLeft(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                        <td class="match" ng-if="::!sentence.newCorpus">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectMatch(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                        <td class="right" ng-if="::!sentence.newCorpus">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectRight(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
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
                                >{{'no_context_support' | loc:$root.lang}}</span
                            ></span
                        >
                        <kwic-word
                            ng-repeat="word in sentence.tokens"
                            word="word"
                            sentence="sentence"
                            sentence-index="$parent.$index"
                        />
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
            <div ng-if="!$ctrl.loading">
                <select id="download-links" ng-if="$ctrl._settings['enable_backend_kwic_download']"></select>
                <select
                    id="frontendDownloadLinks"
                    ng-if="$ctrl._settings['enable_frontend_kwic_download']"
                    ng-change="$ctrl.download.init($ctrl.download.selected, $ctrl.hits)"
                    ng-model="$ctrl.download.selected"
                    ng-options="item.value as item.label | loc:$root.lang disable when item.disabled for item in $ctrl.download.options"
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
        hitsInProgress: "<",
        hits: "<",
        isReading: "<",
        page: "<",
        pageEvent: "<",
        contextChangeEvent: "<",
        hitsPerPage: "<",
        prevParams: "<",
        prevRequest: "<",
        corpusOrder: "<",
        /** Current page of results. */
        kwicInput: "<",
        corpusHits: "<",
    },
    controller: [
        "$location",
        "$element",
        "$timeout",
        "kwicDownload",
        function ($location, $element, $timeout, kwicDownload) {
            let $ctrl = this

            const selectionManager = new SelectionManager()

            $ctrl.$onInit = () => {
                addKeydownHandler()
            }

            $ctrl.$onChanges = (changeObj) => {
                if ("kwicInput" in changeObj && $ctrl.kwicInput != undefined) {
                    $ctrl.kwic = massageData($ctrl.kwicInput)
                    $ctrl.useContext = $ctrl.isReading || $location.search()["in_order"] != null
                    if (!$ctrl.isReading) {
                        $timeout(() => {
                            centerScrollbar()
                            $element.find(".match").children().first().click()
                        })
                    }

                    if (settings["enable_backend_kwic_download"]) {
                        setDownloadLinks($ctrl.prevRequest, {
                            kwic: $ctrl.kwic,
                            corpus_order: $ctrl.corpusOrder,
                        })
                    }

                    if (currentMode === "parallel" && !$ctrl.isReading) {
                        $timeout(() => alignParallelSentences())
                    }
                    if ($ctrl.kwic.length == 0) {
                        selectionManager.deselect()
                        statemachine.send("DESELECT_WORD")
                    }
                }
                if ("corpusHits" in changeObj && $ctrl.corpusHits) {
                    let items = _.map($ctrl.corpusOrder, (obj) => ({
                        rid: obj,
                        rtitle: settings.corpusListing.getTitleObj(obj.toLowerCase()),
                        relative: $ctrl.corpusHits[obj] / $ctrl.hits,
                        abs: $ctrl.corpusHits[obj],
                    })).filter((item) => item.abs > 0)

                    // calculate which is the first page of hits for each item
                    let index = 0
                    _.each(items, (obj) => {
                        // $ctrl.kwicInput.length == page size
                        obj.page = Math.floor(index / $ctrl.kwicInput.length)
                        index += obj.abs
                    })

                    $ctrl.hitsPictureData = items
                }

                if ("active" in changeObj) {
                    if ($ctrl.active) {
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
                        event.target.classList.contains("kwicDownloadLink") ||
                        event.target.classList.contains("hits_picture_corp")
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
                    { value: "annotations/csv", label: "download_annotations_csv", disabled: settings["parallel"] },
                    { value: "annotations/tsv", label: "download_annotations_tsv", disabled: settings["parallel"] },
                ],
                selected: "",
                init: (value, hits) => {
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
                        hits
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
                const obj = scope.word
                const sent = scope.sentence
                const word = $(event.target)

                if ($ctrl.active) {
                    statemachine.send("SELECT_WORD", {
                        sentenceData: sent.structs,
                        wordData: obj,
                        corpus: sent.corpus.toLowerCase(),
                        tokens: sent.tokens,
                        inReadingMode: false,
                    })
                }

                if (currentMode === "parallel") {
                    selectWordParallel(word, scope, sent)
                } else {
                    selectWord(word, scope)
                }
            }

            function selectWord(word, scope) {
                const obj = scope.word
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

            /** Select a given token, follow links to different languages and give linked tokens a secondary highlighting. */
            function selectWordParallel(word, scope, sentence) {
                // Select the given word.
                selectWord(word, scope)

                // Clear any previous linked-token highlighting.
                clearLinks()

                var obj = scope.word
                if (!obj.linkref) return
                var corpus = settings.corpora[sentence.corpus]
                var [mainCorpus, lang] = corpus.id.split("-")

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
                    var sent_index = scope.sentenceIndex
                    var data = getActiveData()

                    // Find main sentence, as nearest previous non-linked sentence.
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

                    // Find linked tokens in main sentence and highlight them.
                    _.each(mainSent.tokens, function (token) {
                        var refs = _.map(_.compact(token["wordlink-" + lang].split("|")), Number)
                        if (_.includes(refs, linkNum)) {
                            token._link_selected = true
                            $ctrl.parallelSelected.push(token)
                        }
                    })
                } else {
                    // Collect references to linked tokens from wordlink-(lang) values
                    var links = _.pickBy(obj, function (val, key) {
                        return _.startsWith(key, "wordlink")
                    })
                    // Follow each link and highlight linked tokens
                    _.each(links, function (val, key) {
                        var lang = key.split("-")[1]
                        _.each(_.compact(val.split("|")), function (num) {
                            const link = findRef(num, sentence.aligned[mainCorpus + "-" + lang])
                            if (!link) return
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

            /** Add offsets to align each linked sentence with its main one */
            function alignParallelSentences() {
                /** A helper to get horizontal coordinates relative to a container. */
                function getBounds($elements, $container) {
                    const container = $container.get(0).getBoundingClientRect()
                    const left = $elements.get(0).getBoundingClientRect().left - container.left
                    const right = $elements.get(-1).getBoundingClientRect().right - container.left
                    const width = right - left
                    const center = left + width / 2
                    const space = container.width - width
                    return { left, right, width, center, space }
                }

                $(".table_scrollarea > .kwic .linked_sentence").each((i, el) => {
                    const $linkedRow = $(el)
                    const $mainRow = $linkedRow.prev()
                    const linked = getBounds($linkedRow.find(".word"), $linkedRow)
                    const main = getBounds($mainRow.find(".word"), $mainRow)

                    const offset = main.center - linked.width / 2
                    // Add offset as cell padding
                    $linkedRow.find(".lnk").css("padding-left", Math.min(offset, linked.space))
                })
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
})
