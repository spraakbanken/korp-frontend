/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { makeDownload } from "@/kwic_download"
import { SelectionManager, html, setDownloadLinks } from "@/util"
import "@/components/kwic-pager"
import "@/components/kwic-word"
import { LangString } from "@/i18n/types"
import { KwicWordScope } from "@/components/kwic-word"
import { SelectWordEvent } from "@/statemachine/types"
import { ApiKwic, Token } from "@/backend/types"
import { SearchesService } from "@/services/searches"
import { StoreService } from "@/services/store"
import { QueryParamSort } from "@/backend/types/query"

export type Row = ApiKwic | LinkedKwic | CorpusHeading

/** Row from a secondary language in parallel mode. */
export type LinkedKwic = {
    tokens: ApiKwic["tokens"]
    isLinked: true
    corpus: string
}

/** A row introducing the next corpus in the hit listing. */
export type CorpusHeading = {
    corpus: string
    newCorpus: LangString
    noContext?: boolean
}

export const isKwic = (row: Row): row is ApiKwic => "tokens" in row && !isLinkedKwic(row)
export const isLinkedKwic = (row: Row): row is LinkedKwic => "isLinked" in row
export const isCorpusHeading = (row: Row): row is CorpusHeading => "newCorpus" in row

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
    prevParams: any
    prevUrl?: string
    corpusOrder: string[]
    /** Current page of results. */
    kwicInput: ApiKwic[]
    corpusHits: any
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
}

type KwicScope = IScope & {
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

type HitsPictureItem = {
    page: number
    relative: number
    abs: number
    rtitle: string
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
                <table class="results_table kwic" ng-if="!$ctrl.useContext" cellspacing="0">
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

                        <td ng-if="::!sentence.newCorpus && !sentence.isLinked" class="left">
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
                        <td ng-if="::!sentence.newCorpus && !sentence.isLinked" class="right">
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
        context: "<",
        loading: "<",
        active: "<",
        hitsInProgress: "<",
        hits: "<",
        onContextChange: "<",
        page: "<",
        pageEvent: "<",
        hitsPerPage: "<",
        prevParams: "<",
        prevUrl: "<",
        corpusOrder: "<",
        kwicInput: "<",
        corpusHits: "<",
        showSearchOptions: "<",
    },
    controller: [
        "$element",
        "$scope",
        "$timeout",
        "searches",
        "store",
        function (
            $element: JQLite,
            $scope: KwicScope,
            $timeout: ITimeoutService,
            searches: SearchesService,
            store: StoreService
        ) {
            let $ctrl = this as KwicController

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
                if ("kwicInput" in changeObj && $ctrl.kwicInput != undefined) {
                    $ctrl.kwic = massageData($ctrl.kwicInput)
                    $ctrl.useContext = $ctrl.context || !store.in_order
                    if (!$ctrl.context) {
                        $timeout(() => {
                            centerScrollbar()
                            $element.find(".match").children().first().click()
                        })
                    }

                    if (settings["enable_backend_kwic_download"] && $ctrl.prevParams) {
                        setDownloadLinks($ctrl.prevParams, {
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
                    const totalTokens = settings.corpusListing
                        .mapSelectedCorpora((corpus) => corpus.tokens || 0)
                        .reduce((sum, t) => sum + t, 0)
                    $scope.relativeFrequency = totalTokens ? ($ctrl.hitsInProgress / totalTokens) * 1e6 : undefined
                }

                if ("corpusHits" in changeObj && $ctrl.corpusHits) {
                    const items = _.map(
                        $ctrl.corpusOrder,
                        (obj) =>
                            <HitsPictureItem>{
                                rid: obj,
                                rtitle: settings.corpusListing.getTitleObj(obj.toLowerCase()),
                                relative: $ctrl.corpusHits[obj] / $ctrl.hits,
                                abs: $ctrl.corpusHits[obj],
                                page: -1, // this is properly set below
                            }
                    ).filter((item) => item.abs > 0)

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

                if ("context" in changeObj) $scope.context = !!$ctrl.context
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

            $scope.updateContext = _.debounce(() => {
                if ($scope.context != $ctrl.context) $ctrl.onContextChange()
            }, UPDATE_DELAY)

            $scope.updateHpp = () => {
                store.hpp = Number($scope.hpp)
                debouncedSearch()
            }

            $scope.updateSort = () => {
                store.sort = $scope.sort
                debouncedSearch()
            }

            $ctrl._settings = settings

            const debouncedSearch = _.debounce(searches.doSearch, UPDATE_DELAY)

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
                    const [fileName, blobName] = makeDownload(dataType, fileType, $ctrl.kwic, $ctrl.prevParams, hits)
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

            // TODO Create new tokens instead of modifying the existing ones
            function massageData(hitArray: ApiKwic[]): Row[] {
                const punctArray = [",", ".", ";", ":", "!", "?", "..."]

                let prevCorpus = ""
                const output: Row[] = []

                for (const hitContext of hitArray) {
                    const mainCorpusId = settings.parallel
                        ? hitContext.corpus.split("|")[0].toLowerCase()
                        : hitContext.corpus.toLowerCase()

                    const id = (settings.parallel && hitContext.corpus.split("|")[1].toLowerCase()) || mainCorpusId

                    const [matchSentenceStart, matchSentenceEnd] = findMatchSentence(hitContext)
                    const isMatchSentence = (i: number) =>
                        matchSentenceStart && matchSentenceEnd && matchSentenceStart <= i && i <= matchSentenceEnd

                    // When using `in_order=false`, there are multiple matches
                    // Otherwise, cast single match to array for consistency
                    const matches = !(hitContext.match instanceof Array) ? [hitContext.match] : hitContext.match
                    const isMatch = (i: number) => matches.some(({ start, end }) => start <= i && i < end)

                    // Copy struct attributes to tokens
                    /** Currently open structural elements (e.g. `<ne>`) */
                    const currentStruct: Record<string, Record<string, string>> = {}
                    for (const [i, wd] of hitContext.tokens.entries()) {
                        wd.position = i

                        if (isMatch(i)) wd._match = true
                        if (isMatchSentence(i)) wd._matchSentence = true
                        if (punctArray.includes(wd.word)) wd._punct = true

                        wd.structs ??= {}

                        // For each new structural element this token opens, add it to currentStruct
                        for (const structItem of wd.structs.open || []) {
                            // structItem is an object with a single key
                            const structKey = _.keys(structItem)[0]
                            if (structKey == "sentence") wd._open_sentence = true

                            // Store structural attributes with a qualified name e.g. "ne_type"
                            // Also set a dummy value for the struct itself, e.g. `"ne": ""`
                            currentStruct[structKey] = {}
                            const attrs = _.toPairs(structItem[structKey]).map(([key, val]) => [
                                structKey + "_" + key,
                                val,
                            ])
                            for (const [key, val] of [[structKey, ""], ...attrs]) {
                                if (key in settings.corpora[id].attributes) {
                                    currentStruct[structKey][key] = val
                                }
                            }
                        }

                        // Copy structural attributes to token
                        // The keys of currentStruct are included in the names of each attribute
                        Object.values(currentStruct).forEach((attrs) => Object.assign(wd, attrs))

                        // For each struct this token closes, remove it from currentStruct
                        for (let structItem of wd.structs.close || []) delete currentStruct[structItem]
                    }

                    // At the start of each new corpus, add a row with the corpus title
                    if (prevCorpus !== id) {
                        const corpus = settings.corpora[id]
                        const newSent = {
                            corpus: id,
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

            /** Find span of sentence containing the match */
            // This is used in reading mode (when free order is not used) to highlight the sentence.
            function findMatchSentence(hitContext: ApiKwic): [number?, number?] {
                if (Array.isArray(hitContext.match)) return []
                const span: [number?, number?] = []
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
                        const refs = _.map(_.compact(token["wordlink-" + lang].split("|")), Number)
                        if (_.includes(refs, linkref)) {
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
                _.each($ctrl.parallelSelected, (word) => delete word._link_selected)
                $ctrl.parallelSelected = []
            }

            function centerScrollbar() {
                const m = $element.find(".match:first")
                if (!m.length) return

                const area = $element.find(".table_scrollarea").scrollLeft(0)
                const match = m.first().position().left + m.width()! / 2
                const sidebarWidth = $("#sidebar").outerWidth() || 0
                area.stop(true, true).scrollLeft(match - ($("body").innerWidth()! - sidebarWidth) / 2)
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
                        if (event.key == "ArrowLeft") return selectPrev()
                        if (event.key == "ArrowRight") return selectNext()
                    }
                    const next = getNextToken()
                    if (next) {
                        next.trigger("click")
                        scrollToShowWord(next)
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
                const $prevSentence = selectionManager.selected.closest(".sentence").prev(":not(.corpus_info)")
                const searchwords = selectionManager.selected
                    .prevAll(".word")
                    .get()
                    .concat($prevSentence.find(".word").get().reverse())
                return selectUpOrDown($prevSentence, $(searchwords))
            }

            function selectDown() {
                const $nextSentence = selectionManager.selected.closest(".sentence").next(":not(.corpus_info)")
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

            function scrollToShowWord(word: JQLite) {
                if (!word.length) return
                const offset = 200

                if (word.offset()!.top + word.height()! > window.scrollY + $(window).height()!) {
                    $("html, body")
                        .stop(true, true)
                        .animate({ scrollTop: window.scrollY + offset })
                } else if (word.offset()!.top < window.scrollY) {
                    $("html, body")
                        .stop(true, true)
                        .animate({ scrollTop: window.scrollY - offset })
                }

                const area = $element.find(".table_scrollarea")
                if (word.offset()!.left + word.width()! > area.offset()!.left + area.width()!) {
                    area.stop(true, true).animate({ scrollLeft: area.scrollLeft()! + offset })
                } else if (word.offset()!.left < area.offset()!.left) {
                    area.stop(true, true).animate({ scrollLeft: area.scrollLeft()! - offset })
                }
            }
        },
    ],
})
