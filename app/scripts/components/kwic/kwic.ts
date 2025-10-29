import angular, { IController, IScope, ITimeoutService } from "angular"
import { compact, debounce } from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { makeDownload } from "@/kwic/kwic_download"
import { html } from "@/util"
import "./kwic-pager"
import "./kwic-word"
import { KwicWordScope } from "./kwic-word"
import { SelectWordEvent } from "@/statemachine/types"
import { ApiKwic, Token } from "@/backend/types"
import { StoreService } from "@/services/store"
import { QueryParams, QueryParamSort, QueryResponse } from "@/backend/types/query"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { JQueryExtended, JQueryStaticExtended } from "@/jquery.types"
import { loc } from "@/i18n"
import { calculateHitsPicture, HitsPictureItem, isKwic, isLinkedKwic, massageData, Row } from "@/kwic/kwic"
import { corpusSelection } from "@/corpora/corpus_listing"
import { RelationsSentencesParams } from "@/backend/types/relations-sentences"

type KwicController = IController & {
    // Bindings
    aborted: boolean
    loading: boolean
    active: boolean
    hitsInProgress: number
    hits: number
    context: boolean
    onContextChange: () => void
    page: number
    pageEvent: (page: number) => void
    hitsPerPage: number
    params: QueryParams | RelationsSentencesParams
    response?: QueryResponse
    corpusOrder: string[]
    /** Current page of results. */
    kwicInput: ApiKwic[]
    corpusHits: Record<string, number>
    // Locals
    kwic: Row[]
    useContext: boolean
    hitsPictureData: HitsPictureItem[]
    _settings: any
    download: {
        options: { value: string; label: string; disabled?: boolean }[]
        selected: string
        init: (value: string, hits: number) => void
        blobName?: string
        fileName?: string
    }
    /** Hpp and sort are app-wide options, only makes sense in main KWIC. */
    // TODO Instead, move change handling to parent component.
    showSearchOptions: boolean
    selectLeft: (sentence: any) => any[]
    selectMatch: (sentence: any) => any[]
    selectRight: (sentence: any) => any[]
    parallelSelected: Token[]
    onKwicClick(event: Event): void
    onUpdateSearch: () => void
}

type KwicScope = IScope & {
    dir?: string
    hpp: string
    hppOptions: string[]
    updateHpp: () => void
    context: boolean
    updateContext: () => void
    relativeFrequency?: number
    sort: QueryParamSort
    sortOptions: Record<QueryParamSort, string>
    updateSort: () => void
}

const UPDATE_DELAY = 500

angular.module("korpApp").component("kwic", {
    template: html`
        <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
            <label>
                <input type="checkbox" ng-model="context" ng-value="false" ng-change="updateContext()" />
                {{'show_context' | loc:$root.lang}}
                <i
                    class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                    uib-tooltip="{{'show_context_help' | loc:$root.lang}}"
                ></i>
            </label>
            <div ng-show="$ctrl.showSearchOptions">
                <label>
                    {{ "hits_per_page" | loc:$root.lang }}:
                    <select ng-change="updateHpp()" ng-model="hpp" ng-options="x for x in hppOptions"></select>
                </label>
            </div>
            <div ng-show="$ctrl.showSearchOptions">
                <label>
                    {{ "sort_default" | loc:$root.lang }}:
                    <select
                        ng-change="updateSort()"
                        ng-model="sort"
                        ng-options="k as v | loc:$root.lang for (k, v) in sortOptions"
                    ></select>
                </label>
            </div>
        </div>

        <div ng-if="$ctrl.aborted && !$ctrl.loading" class="korp-warning" role="status">
            {{'search_aborted' | loc:$root.lang}}
        </div>

        <div ng-if="!$ctrl.aborted || $ctrl.loading" ng-click="$ctrl.onKwicClick($event)">
            <div class="flex gap-8 pb-2" ng-class="{'opacity-50 italic': $ctrl.loading}">
                <div ng-if="$ctrl.hitsInProgress != null">
                    {{'num_results' | loc:$root.lang}}: {{ $ctrl.hitsInProgress | prettyNumber:$root.lang }}
                </div>
                <div ng-if="relativeFrequency != null">
                    {{'num_results_relative' | loc:$root.lang}}: {{ relativeFrequency | formatRelativeHits:$root.lang }}
                    <i
                        class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                        uib-tooltip="{{'relative_help' | loc:$root.lang}}"
                    ></i>
                </div>
                <table
                    ng-if="$ctrl.hitsPictureData.length > 1"
                    class="hits_picture_table flex-1 h-5 border m-0 p-0 cursor-pointer"
                    role="navigation"
                >
                    <tbody>
                        <tr>
                            <td
                                class="hits_picture_corp"
                                ng-repeat="corpus in $ctrl.hitsPictureData"
                                ng-style='{width : corpus.relative + "%"}'
                                ng-click="$ctrl.pageEvent(corpus.page)"
                                uib-tooltip="{{corpus.rtitle | locObj:$root.lang}}: {{corpus.abs}}"
                                tooltip-placement='{{$last? "left":"top"}}'
                                append-to-body="false"
                            ></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <kwic-pager
                ng-if="$ctrl.hits"
                total-hits="$ctrl.hits"
                current-page="$ctrl.page"
                page-change="$ctrl.pageEvent(page)"
                hits-per-page="$ctrl.hitsPerPage"
            ></kwic-pager>
            <div class="table_scrollarea">
                <table class="results_table kwic" ng-if="!$ctrl.useContext" cellspacing="0" dir="{{ dir }}">
                    <tr
                        class="sentence"
                        ng-repeat="sentence in $ctrl.kwic"
                        ng-class="{corpus_info : sentence.newCorpus, linked_sentence : sentence.isLinked, even : $even, odd : $odd}"
                    >
                        <td ng-if="::sentence.newCorpus" />
                        <td ng-if="::sentence.newCorpus" colspan="2" class="text-gray-600 uppercase">
                            <div class="w-0">
                                {{sentence.newCorpus | locObj:$root.lang}}
                                <span class="normal-case" ng-if="::sentence.noContext">
                                    ({{'no_context_support' | loc:$root.lang}})
                                </span>
                            </div>
                        </td>

                        <td ng-if="::sentence.isLinked" colspan="3" class="lnk">
                            <kwic-word
                                ng-repeat="word in sentence.tokens"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>

                        <td ng-if="::!sentence.newCorpus && !sentence.isLinked" class="before-match">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectLeft(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                        <td ng-if="::!sentence.newCorpus && !sentence.isLinked" class="match">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectMatch(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                        <td ng-if="::!sentence.newCorpus && !sentence.isLinked" class="after-match">
                            <kwic-word
                                ng-repeat="word in $ctrl.selectRight(sentence)"
                                word="word"
                                sentence="sentence"
                                sentence-index="$parent.$index"
                            />
                        </td>
                    </tr>
                </table>
                <div class="results_table reading" ng-if="$ctrl.useContext" dir="{{ dir }}">
                    <p
                        class="sentence"
                        ng-repeat="sentence in $ctrl.kwic"
                        ng-class="{corpus_info : sentence.newCorpus, linked_sentence : sentence.isLinked, even : $even, odd : $odd}"
                    >
                        <span ng-if="sentence.newCorpus" class="corpus_title text-3xl">
                            {{sentence.newCorpus | locObj:$root.lang}}
                            <span class="corpus_title_warn block text-base" ng-if="::sentence.noContext">
                                ({{'no_context_support' | loc:$root.lang}})
                            </span>
                        </span>
                        <kwic-word
                            ng-if="!sentence.newCorpus"
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

            <div ng-if="!$ctrl.loading" class="flex gap-4 justify-end">
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
                <json-button ng-if="$ctrl.response" endpoint="query" data="$ctrl.response"></json-button>
            </div>
        </div>
    `,
    bindings: {
        aborted: "<",
        context: "<",
        loading: "<",
        active: "<",
        hitsInProgress: "<",
        hits: "<",
        onContextChange: "<",
        page: "<",
        pageEvent: "<",
        hitsPerPage: "<",
        params: "<",
        corpusOrder: "<",
        kwicInput: "<",
        corpusHits: "<",
        response: "<",
        showSearchOptions: "<",
        onUpdateSearch: "&",
    },
    controller: [
        "$element",
        "$scope",
        "$timeout",
        "store",
        function ($element: JQLite, $scope: KwicScope, $timeout: ITimeoutService, store: StoreService) {
            let $ctrl = this as KwicController
            $ctrl.parallelSelected = []

            $scope.dir = settings["dir"]
            $scope.sortOptions = {
                "": "appearance_context",
                keyword: "word_context",
                left: "left_context",
                right: "right_context",
                random: "random_context",
            }
            $scope.hppOptions = settings["hits_per_page_values"].map(String)

            const selectionManager = new SelectionManager()

            $ctrl.$onInit = () => {
                addKeydownHandler()
                $scope.hpp = String(store.hpp)
                $scope.sort = store.sort
            }

            $ctrl.$onChanges = (changeObj) => {
                if (changeObj.kwicInput?.currentValue) {
                    $ctrl.kwic = massageData($ctrl.kwicInput)
                    $ctrl.useContext = $ctrl.context || !store.in_order
                    if (!$ctrl.context) {
                        $timeout(() => {
                            $element.find(".match .word").first().trigger("click")
                            centerScrollbar()
                        })
                    }

                    if (settings["enable_backend_kwic_download"] && $ctrl.params) {
                        setDownloadLinks($ctrl.params, {
                            kwic: $ctrl.kwic,
                            corpus_order: $ctrl.corpusOrder,
                        })
                    }

                    // TODO Do this when shown the first time (e.g. not if loading with stats tab active)
                    if (settings.parallel && !$ctrl.context) {
                        $timeout(() => alignParallelSentences())
                    }
                    if ($ctrl.kwic.length == 0) {
                        selectionManager.deselect()
                        statemachine.send("DESELECT_WORD")
                    }
                }

                if ("hitsInProgress" in changeObj) {
                    const totalTokens = corpusSelection.corpora
                        .map((corpus) => corpus.tokens || 0)
                        .reduce((sum, t) => sum + t, 0)
                    $scope.relativeFrequency =
                        $ctrl.hitsInProgress && totalTokens ? ($ctrl.hitsInProgress / totalTokens) * 1e6 : undefined
                }

                if ("corpusHits" in changeObj && $ctrl.corpusHits && $ctrl.corpusOrder) {
                    const pageSize = $ctrl.kwicInput.length
                    $ctrl.hitsPictureData = calculateHitsPicture($ctrl.corpusOrder, $ctrl.corpusHits, pageSize)
                }

                if ("active" in changeObj) {
                    if ($ctrl.active) {
                        $timeout(() => $element.find(".token_selected").click(), 0)
                    } else {
                        statemachine.send("DESELECT_WORD")
                    }
                }

                if ("context" in changeObj) $scope.context = !!$ctrl.context
            }

            $ctrl.$onDestroy = () => {
                statemachine.send("DESELECT_WORD")
            }

            $ctrl.onKwicClick = (event) => {
                if (!event.target) return
                const target = event.target as HTMLElement
                if (target.classList.contains("word")) {
                    onWordClick(event)
                } else {
                    if (
                        target.id === "frontendDownloadLinks" ||
                        target.classList.contains("kwicDownloadLink") ||
                        target.classList.contains("hits_picture_corp")
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

            store.watch("hpp", () => ($scope.hpp = String(store.hpp)))
            store.watch("sort", () => ($scope.sort = store.sort))

            $scope.updateContext = debounce(() => {
                if ($scope.context != $ctrl.context) $ctrl.onContextChange()
            }, UPDATE_DELAY)

            $scope.updateHpp = () => {
                store.hpp = Number($scope.hpp)
                updateSearch()
            }

            $scope.updateSort = () => {
                store.sort = $scope.sort
                updateSearch()
            }

            $ctrl._settings = settings

            const updateSearch = debounce(() => $ctrl.onUpdateSearch(), UPDATE_DELAY)

            $ctrl.download = {
                options: [
                    { value: "", label: "download_kwic" },
                    { value: "kwic/csv", label: "download_kwic_csv" },
                    { value: "kwic/tsv", label: "download_kwic_tsv" },
                    { value: "annotations/csv", label: "download_annotations_csv", disabled: settings.parallel },
                    { value: "annotations/tsv", label: "download_annotations_tsv", disabled: settings.parallel },
                ],
                selected: "",
                init: (value, hits) => {
                    if ($ctrl.download.blobName) {
                        URL.revokeObjectURL($ctrl.download.blobName)
                    }
                    if (value === "") {
                        return
                    }
                    const [dataType, fileType] = value.split("/") as ["annotations" | "kwic", "csv" | "tsv"]
                    const [fileName, blobName] = makeDownload(dataType, fileType, $ctrl.kwic, $ctrl.params, hits)
                    $ctrl.download.fileName = fileName
                    $ctrl.download.blobName = blobName
                    $ctrl.download.selected = ""
                    $timeout(() => ($element[0].getElementsByClassName("kwicDownloadLink")[0] as HTMLElement).click())
                },
                blobName: undefined,
                fileName: undefined,
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

            function onWordClick(event: Event) {
                // A kwicWord component was clicked
                event.stopPropagation()
                const element = event.target as HTMLElement
                const scope: KwicWordScope = $(element).scope()
                const word = $(element)

                if ($ctrl.active) {
                    statemachine.send("SELECT_WORD", {
                        sentenceData: scope.sentence.structs,
                        wordData: scope.word,
                        corpus: scope.sentence.corpus.toLowerCase(),
                        tokens: scope.sentence.tokens,
                        inReadingMode: false,
                    } as SelectWordEvent)
                }

                if (settings.parallel) {
                    selectWordParallel(word)
                } else {
                    selectWord(word)
                }
            }

            function selectWord(word: JQLite): void {
                const aux = getDepheadToken(word)
                selectionManager.select(word, aux)
            }

            /** Find the related (dephead) token of a given token */
            function getDepheadToken(word: JQLite): JQLite | undefined {
                const scope: KwicWordScope = word.scope()
                if (scope.word.dephead == null) return
                // The row can contain multiple sentences,
                // and the dephead value is a token index within the sentence,
                // so add it to the index of the first token of the same sentence
                const paragraph = word.closest(".sentence").find(".word")
                let sent_start = 0
                const querySentStart = ".open_sentence"
                if (word.is(querySentStart)) {
                    sent_start = paragraph.index(word)
                } else {
                    const l = paragraph.filter((__, item) => $(item).is(word) || $(item).is(querySentStart))
                    sent_start = paragraph.index(l.eq(l.index(word) - 1))
                }
                const dephead = Number(scope.word.dephead)
                const el = paragraph.get(sent_start + dephead - 1)
                if (el) return $(el)
            }

            /** Select a given token, follow links to different languages and give linked tokens a secondary highlighting. */
            function selectWordParallel(word: JQLite) {
                const scope: KwicWordScope = word.scope()
                const sentence = scope.sentence

                // Select the given word.
                selectWord(word)

                // Clear any previous linked-token highlighting.
                clearLinks()

                if (!scope.word.linkref) return
                const [mainCorpus, lang] = settings.corpora[sentence.corpus].id.split("-")

                if (isLinkedKwic(sentence)) {
                    // a secondary language was clicked
                    // Find main sentence, as nearest previous non-linked sentence.
                    const mainSent = $ctrl.kwic.slice(0, scope.sentenceIndex).reverse().find(isKwic) as ApiKwic
                    const linkref = Number(scope.word.linkref)

                    // Find linked tokens in main sentence and highlight them.
                    mainSent!.tokens.forEach((token) => {
                        const refs = compact(token["wordlink-" + lang].split("|")).map(Number)
                        if (refs.includes(linkref)) {
                            token._link_selected = true
                            $ctrl.parallelSelected.push(token)
                        }
                    })
                } else {
                    // A token in the primary language was clicked
                    // Collect references to linked tokens from wordlink-(lang) values
                    const linkKeys = Object.keys(scope.word).filter((key) => key.indexOf("wordlink-") === 0)
                    for (const key of linkKeys) {
                        // Follow each link and highlight linked tokens
                        const lang = key.split("-")[1]
                        // The value is a pipe-separated list of token indices
                        const refs = (scope.word[key] as string).split("|").filter(Boolean).map(Number)
                        for (const ref of refs) {
                            const linkedSentence: Token[] = sentence.aligned[`${mainCorpus}-${lang}`]
                            const link = linkedSentence.find((token) => token.linkref == ref)
                            if (!link) {
                                console.error(`Could not find token with linkref "${ref}"`)
                                return
                            }
                            link._link_selected = true
                            $ctrl.parallelSelected.push(link)
                        }
                    }
                }
            }

            function clearLinks() {
                $ctrl.parallelSelected.forEach((word) => delete word._link_selected)
                $ctrl.parallelSelected = []
            }

            /** Scroll KWIC container to center the match column. */
            function centerScrollbar() {
                const area = $element.get(0)?.querySelector(".table_scrollarea")
                const match = area?.querySelector(".match")
                if (!area || !match) return
                const matchBox = match.getBoundingClientRect()
                const areaBox = area.getBoundingClientRect()
                const scrollLeft = area.scrollLeft + matchBox.left + matchBox.width / 2 - areaBox.width / 2
                // After setting `.scrollLeft`, it corrects itself to a value within range,
                // so this works also with RTL where `scrollLeft` is negative in some browsers.
                area.scrollLeft = -1e10
                area.scrollLeft += scrollLeft
            }

            /** Add offsets to align each linked sentence with its main one */
            function alignParallelSentences() {
                /** A helper to get horizontal coordinates relative to a container. */
                function getBounds($elements: JQLite, $container: JQLite) {
                    const container = $container.get(0)!.getBoundingClientRect()
                    const left = $elements.get(0)!.getBoundingClientRect().left - container.left
                    const right = $elements.get(-1)!.getBoundingClientRect().right - container.left
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
                // Keep it on document to capture page navigation even if no token is selected
                $(document).on("keydown", (event) => {
                    // Only capture simple key presses
                    if (event.shiftKey || event.ctrlKey || event.metaKey) return
                    // Do not interfere with text input
                    if ($("input, textarea, select").is(":focus")) return
                    // Only act when KWIC is showing
                    if (!$element.is(":visible")) return

                    // Go to prev/next page
                    if (event.key == "n") {
                        $ctrl.pageEvent($ctrl.page + 1)
                        // Return false to prevent default behavior
                        return false
                    }
                    if (event.key == "f") {
                        if ($ctrl.page === 0) return
                        $ctrl.pageEvent($ctrl.page - 1)
                        return false
                    }

                    // Navigate selected word
                    if (!selectionManager.hasSelected()) return
                    const getNextToken = (): JQLite | undefined => {
                        if (event.key == "ArrowUp") return selectUp()
                        if (event.key == "ArrowDown") return selectDown()
                        if (event.key == "ArrowLeft") return $scope.dir == "rtl" ? selectNext() : selectPrev()
                        if (event.key == "ArrowRight") return $scope.dir == "rtl" ? selectPrev() : selectNext()
                    }
                    const next = getNextToken()
                    if (next) {
                        next.trigger("click")
                        next.get(0)?.scrollIntoView({ block: "nearest", inline: "nearest" })
                        // Return false to prevent default behavior
                        return false
                    }
                })
            }

            const selectNext = () => stepWord(1)
            const selectPrev = () => stepWord(-1)

            function stepWord(diff: number): JQLite | undefined {
                const $words = $element.find(".word")
                const $current = $element.find(".token_selected").first()
                const currentIndex = $words.index($current)
                const wouldWrap = (diff < 0 && currentIndex == 0) || (diff > 0 && currentIndex == $words.length - 1)
                if (wouldWrap) return
                const next = $words.get(currentIndex + diff)
                return next && $(next)
            }

            function selectUp() {
                const $prevSentence = selectionManager.selected
                    .closest(".sentence")
                    .prevAll(":not(.corpus_info)")
                    .first()
                const searchwords = selectionManager.selected
                    .prevAll(".word")
                    .get()
                    .concat($prevSentence.find(".word").get().reverse())
                return selectUpOrDown($prevSentence, $(searchwords))
            }

            function selectDown() {
                const $nextSentence = selectionManager.selected
                    .closest(".sentence")
                    .nextAll(":not(.corpus_info)")
                    .first()
                const $searchwords = selectionManager.selected.nextAll(".word").add($nextSentence.find(".word"))
                return selectUpOrDown($nextSentence, $searchwords)
            }

            function selectUpOrDown($neighborSentence: JQLite, $searchwords: JQLite): JQLite {
                const fallback = $neighborSentence.find(".word:last")
                const currentX = selectionManager.selected.offset()!.left + selectionManager.selected.width()! / 2
                return $ctrl.context
                    ? getFirstAtCoor(currentX, $searchwords, fallback)
                    : getWordAt(currentX, $neighborSentence)
            }

            function getFirstAtCoor(x: number, words: JQLite, fallback: JQLite) {
                /** Check if the x coordinate is within the word */
                // Allow a margin of 2 in order to match something when coordinate is between two words
                const isHit = (word: HTMLElement) =>
                    x > $(word).offset()!.left - 2 && x < $(word).offset()!.left + $(word).width()! + 2
                // Find the first word that x is within
                const hit = words.get().find(isHit)
                return hit ? $(hit) : fallback
            }

            function getWordAt(xCoor: number, $row: JQLite) {
                let output = $()
                $row.find(".word").each(function () {
                    output = $(this)
                    const thisLeft = $(this).offset()!.left
                    const thisRight = $(this).offset()!.left + $(this).width()!
                    if ((xCoor > thisLeft && xCoor < thisRight) || thisLeft > xCoor) {
                        return false
                    }
                })

                return output
            }
        },
    ],
})

/** Toggles class names for selected word elements in KWIC. */
class SelectionManager {
    selected: JQuery<HTMLElement>
    aux: JQuery<HTMLElement>

    constructor() {
        this.selected = $()
        this.aux = $()
    }

    select(word: JQuery<HTMLElement>, aux?: JQuery<HTMLElement>): void {
        if (!word?.length) return
        this.deselect()

        this.selected = word
        this.selected.addClass("word_selected token_selected")
        this.aux = aux || $()
        this.aux.addClass("word_selected aux_selected")
    }

    deselect(): void {
        if (!this.selected.length) return

        this.selected.removeClass("word_selected token_selected")
        this.selected = $()
        this.aux.removeClass("word_selected aux_selected")
        this.aux = $()
    }

    hasSelected(): boolean {
        return this.selected.length > 0
    }
}

// Add download links for other formats, defined in
// settings["download_formats"] (Jyrki Niemi <jyrki.niemi@helsinki.fi>
// 2014-02-26/04-30)
export function setDownloadLinks(params: any, result_data: { kwic: Row[]; corpus_order: string[] }): void {
    // If some of the required parameters are null, return without
    // adding the download links.
    if (!(params != null && result_data != null && result_data.corpus_order != null && result_data.kwic != null)) {
        console.log("failed to do setDownloadLinks")
        return
    }

    if (result_data.kwic.length == 0) {
        $("#download-links").hide()
        return
    }

    $("#download-links").show()

    // Get the number (index) of the corpus of the query result hit
    // number hit_num in the corpus order information of the query
    // result.
    const get_corpus_num = (hit_num: number) =>
        result_data.corpus_order.indexOf(result_data.kwic[hit_num].corpus.toUpperCase())

    console.log("setDownloadLinks data:", result_data)
    $("#download-links").empty()
    // Corpora in the query result
    const result_corpora = result_data.corpus_order.slice(
        get_corpus_num(0),
        get_corpus_num(result_data.kwic.length - 1) + 1,
    )
    // Settings of the corpora in the result, to be passed to the
    // download script
    const result_corpora_settings: Record<string, CorpusTransformed> = {}
    let i = 0
    while (i < result_corpora.length) {
        const corpus_ids = result_corpora[i].toLowerCase().split("|")
        let j = 0
        while (j < corpus_ids.length) {
            const corpus_id = corpus_ids[j]
            result_corpora_settings[corpus_id] = settings.corpora[corpus_id]
            j++
        }
        i++
    }
    $("#download-links").append("<option value='init' rel='localize[download_kwic]'></option>")
    i = 0
    while (i < settings.download_formats.length) {
        const format = settings.download_formats[i]
        // NOTE: Using attribute rel="localize[...]" to localize the
        // title attribute requires a small change to
        // lib/jquery.localize.js. Without that, we could use
        // `loc`, but it would not change the
        // localizations immediately when switching languages but only
        // after reloading the page.
        // # title = loc('formatdescr_' + format)
        const option = $(`\
<option
    value="${format}"
    title="${loc(`formatdescr_${format}`)}"
    class="download_link">${format.toUpperCase()}</option>\
`)

        const query_params = JSON.stringify(Object.fromEntries(new URLSearchParams(params)))

        const download_params = {
            query_params,
            format,
            korp_url: window.location.href,
            korp_server_url: settings.korp_backend_url,
            corpus_config: JSON.stringify(result_corpora_settings),
            corpus_config_info_keys: ["metadata", "licence", "homepage", "compiler"].join(","),
            urn_resolver: settings.urnResolver,
        }
        if ("download_format_params" in settings) {
            if ("*" in settings.download_format_params) {
                $.extend(download_params, settings.download_format_params["*"])
            }
            if (format in settings.download_format_params) {
                $.extend(download_params, settings.download_format_params[format])
            }
        }
        option.appendTo("#download-links").data("params", download_params)
        i++
    }
    $("#download-links").off("change")
    ;($("#download-links") as JQueryExtended)
        .localize()
        .click(false)
        .change(function () {
            const params = $(":selected", this).data("params")
            if (!params) {
                return
            }
            ;($ as JQueryStaticExtended).generateFile(settings.download_cgi_script!, params)
            const self = $(this)
            return setTimeout(() => self.val("init"), 1000)
        })
}
