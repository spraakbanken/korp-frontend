/** @format */
import statemachine from "../statemachine"

let html = String.raw

// show no hits
// $element.addClass("zero_results").click()
// return $element.find(".hits_picture").html("")

// // If an error occurred or the result is otherwise empty,
// // deselect word and hide the sidebar
// if (!this.hasData || !data.kwic || !data.kwic.length) {
//     selectionManager.deselect()
//     statemachine.send("DESELECT_WORD")
// }

export const kwicComponent = {
    template: html`
        <div ng-click="$ctrl.onKwicClick($event)">
            <div class="result_controls">
                <warning ng-if="$ctrl.aborted && !$ctrl.loading">{{'search_aborted' | loc:lang}}</warning>
                <div class="controls_n" ng-show="$ctrl.hitsDisplay">
                    <span>{{'num_results' | loc:lang}}: </span>
                    <span ng-bind-html="$ctrl.hitsDisplay | trust"></span>
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
                                    ng-click="$ctrl.pageChange(corpus.page)"
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
                page-change="$ctrl.pageChange(page)"
                hits-per-page="$ctrl.hitsPerPage"
            ></kwic-pager>
            <span
                ng-if="!$ctrl.readingMode"
                class="reading_btn link"
                ng-hide="$ctrl.loading"
                ng-click="$ctrl.toggleReading()"
            >
                {{'show_reading' | loc:lang}}
            </span>
            <span
                ng-if="$ctrl.readingMode"
                class="reading_btn link"
                ng-hide="$ctrl.loading"
                ng-click="$ctrl.toggleReading()"
            >
                {{'show_kwic' | loc:lang}}
            </span>
            <div class="table_scrollarea">
                <table class="results_table kwic" ng-if="$ctrl.kwic.length > 0" cellspacing="0">
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
                <div class="results_table reading" ng-if="$ctrl.contextKwic.length > 0">
                    <p
                        class="sentence"
                        ng-repeat="sentence in $ctrl.contextKwic"
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
                page-change="$ctrl.pageChange(page)"
                hits-per-page="$ctrl.hitsPerPage"
            ></kwic-pager>
            <div id="download-links-container">
                <select id="download-links" ng-if="_settings['enable_backend_kwic_download']"></select>
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
        hitsDisplay: "<",
        hitsPictureData: "<",
        hits: "<",
        kwic: "<",
        contextKwic: "<",
        isReading: "<",
        pageEvent: "<",
        contextChangeEvent: "<",
        hitsPerPage: "<",
        prevParams: "<",
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
                if ("kwic" in changeObj) {
                    $ctrl.page = Number($location.search().page) || 0

                    if (!$ctrl.isReading) {
                        centerScrollbar()
                        $element.find(".match").children().first().click()
                    }
                }
                // TODO backend download, make sure it still works, maybe rewrite to angular
                // if (settings["enable_backend_kwic_download"]) {
                //     util.setDownloadLinks(this.proxy.prevRequest, data)
                // }
                if (currentMode === "parallel" && !$ctrl.isReading) {
                    centerScrollbarParallel()
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

            $ctrl.pageChange = (page) => {
                $ctrl.page = page
                $ctrl.pageEvent(page)
            }

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
                        $ctrl.kwic.length > 0 ? $ctrl.kwic : $ctrl.contextKwic,
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
                if ($ctrl.readingMode) {
                    return $ctrl.contextKwic
                } else {
                    return $ctrl.kwic
                }
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
                            $ctrl.pageChange($ctrl.page + 1)
                            return false
                        case 70: // f
                            if ($ctrl.page === 0) {
                                return
                            }
                            $ctrl.pageChange($ctrl.page - 1)
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
                const current = getActiveData
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
