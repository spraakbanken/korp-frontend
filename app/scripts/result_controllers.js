/** @format */
/* eslint-disable
    constructor-super,
    no-constant-condition,
    no-eval,
    no-return-assign,
    no-this-before-super,
    no-undef,
    no-unused-vars,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS202: Simplify dynamic range loops
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const korpApp = angular.module("korpApp")

korpApp.controller(
    "resultContainerCtrl",
    ($scope, searches, $location) => ($scope.searches = searches)
)

class KwicCtrl {
    static initClass() {
        this.$inject = ["$scope", "$timeout", "utils", "$location", "kwicDownload"]
    }
    setupHash() {
        c.log("setupHash", this.scope.$id)
        return this.utils.setupHash(this.scope, [
            {
                key: "page",
                post_change: () => {
                    c.log("post_change page hash", this.scope.page)
                    this.scope.pageObj.pager = (this.scope.page || 0) + 1
                    return c.log("@scope.pageObj.pager", this.scope.pageObj.pager)
                },
                val_in: Number
            }
        ])
    }

    initPage() {
        this.scope.pageObj = { pager: Number(this.location.search().page) + 1 || 1 }
        return (this.scope.page = this.scope.pageObj.pager - 1)
    }
    constructor(scope, timeout, utils, location, kwicDownload) {
        this.scope = scope
        this.timeout = timeout
        this.utils = utils
        this.location = location
        this.kwicDownload = kwicDownload
        const s = this.scope
        const $scope = this.scope
        c.log("kwicCtrl init", $scope.$parent)
        const $location = this.location

        s.onexit = function() {
            c.log("onexit")
            return (s.$root.sidebar_visible = false)
        }

        const punctArray = [",", ".", ";", ":", "!", "?", "..."]

        this.initPage()

        s.pageChange = function($event, page) {
            c.log("pageChange", arguments)
            $event.stopPropagation()
            return (s.page = page - 1)
        }

        this.setupHash()
        s.onPageInput = function($event, page, numPages) {
            if ($event.keyCode === 13) {
                if (page > numPages) {
                    page = numPages
                }
                if (page <= 0) {
                    page = "1"
                }
                s.gotoPage = page
                s.pageObj.pager = page
                return (s.page = Number(page) - 1)
            }
        }

        const readingChange = function() {
            if (s.instance != null ? s.instance.getProxy().pendingRequests.length : undefined) {
                window.pending = s.instance.getProxy().pendingRequests

                return $.when(...Array.from(s.instance.getProxy().pendingRequests || [])).then(
                    function() {
                        c.log("readingchange makeRequest")
                        return s.instance.makeRequest()
                    }
                )
            }
        }

        s.setupReadingHash = () => {
            return this.utils.setupHash(s, [
                {
                    key: "reading_mode",
                    post_change: isReading => {
                        c.log("change reading mode", isReading)
                        return readingChange()
                    }
                }
            ])
        }

        // used by example kwic
        s.setupReadingWatch = _.once(function() {
            c.log("setupReadingWatch")
            let init = true
            return s.$watch("reading_mode", function() {
                if (!init) {
                    readingChange()
                }
                return (init = false)
            })
        })

        s.toggleReading = function() {
            s.reading_mode = !s.reading_mode
            return s.instance.centerScrollbar()
        }

        s.hitspictureClick = function(pageNumber) {
            c.log("pageNumber", pageNumber)
            return (s.page = Number(pageNumber))
        }

        const massageData = function(hitArray) {
            let prevCorpus = ""
            const output = []

            for (let i = 0; i < hitArray.length; i++) {
                var corpus, linkCorpusId, mainCorpusId, matches
                const hitContext = hitArray[i]
                const currentStruct = {}
                if (currentMode === "parallel") {
                    mainCorpusId = hitContext.corpus.split("|")[0].toLowerCase()
                    linkCorpusId = hitContext.corpus.split("|")[1].toLowerCase()
                } else {
                    mainCorpusId = hitContext.corpus.toLowerCase()
                }

                const id = linkCorpusId || mainCorpusId

                const [matchSentenceStart, matchSentenceEnd] = Array.from(
                    findMatchSentence(hitContext)
                )

                if (!(hitContext.match instanceof Array)) {
                    matches = [{ start: hitContext.match.start, end: hitContext.match.end }]
                } else {
                    matches = hitContext.match
                }

                for (
                    let j = 0, end1 = hitContext.tokens.length, asc = end1 >= 0;
                    asc ? j < end1 : j > end1;
                    asc ? j++ : j--
                ) {
                    var structItem
                    const wd = hitContext.tokens[j]
                    wd.position = j
                    wd._open = []
                    wd._close = []
                    for (let { start, end } of Array.from(matches)) {
                        if (start <= j && j < end) {
                            _.extend(wd, { _match: true })
                        }
                    }
                    if (matchSentenceStart < j && j < matchSentenceEnd) {
                        _.extend(wd, { _matchSentence: true })
                    }
                    if (Array.from(punctArray).includes(wd.word)) {
                        _.extend(wd, { _punct: true })
                    }

                    for (structItem of Array.from(
                        (wd.structs != null ? wd.structs.open : undefined) || []
                    )) {
                        var key, val
                        const spaceIdx = structItem.indexOf(" ")
                        if (spaceIdx === -1) {
                            key = structItem
                            val = ""
                        } else {
                            key = structItem.substring(0, spaceIdx)
                            val = structItem.substring(spaceIdx + 1)
                        }
                        wd._open.push(key)
                        if (key in settings.corpora[id].attributes) {
                            currentStruct[key] = val
                        }
                    }

                    _.extend(wd, currentStruct)

                    for (structItem of Array.from(
                        (wd.structs != null ? wd.structs.close : undefined) || []
                    )) {
                        wd._close.push(structItem)
                        delete currentStruct[structItem]
                    }
                }

                if (prevCorpus !== id) {
                    corpus = settings.corpora[id]
                    const newSent = {
                        newCorpus: corpus.title,
                        noContext: _.keys(corpus.context).length === 1
                    }
                    output.push(newSent)
                }

                if (i % 2 === 0) {
                    hitContext._color = settings.primaryColor
                } else {
                    hitContext._color = settings.primaryLight
                }

                hitContext.corpus = mainCorpusId

                output.push(hitContext)
                if (hitContext.aligned) {
                    const [corpus_aligned, tokens] = Array.from(_.toPairs(hitContext.aligned)[0])
                    output.push({
                        tokens,
                        isLinked: true,
                        corpus: corpus_aligned,
                        _color: hitContext._color
                    })
                }

                prevCorpus = id
            }

            return output
        }

        var findMatchSentence = function(hitContext) {
            const span = []
            const { start, end } = hitContext.match
            let decr = start
            let incr = end
            while (decr >= 0) {
                var needle
                if (
                    ((needle = "sentence"),
                    Array.from(
                        __guard__(hitContext.tokens[decr--].structs, x => x.open) || []
                    ).includes(needle))
                ) {
                    span[0] = decr
                    break
                }
            }
            while (incr < hitContext.tokens.length) {
                var needle1
                if (
                    ((needle1 = "sentence"),
                    Array.from(
                        __guard__(hitContext.tokens[incr++].structs, x1 => x1.close) || []
                    ).includes(needle1))
                ) {
                    span[1] = incr
                    break
                }
            }

            return span
        }

        s.kwic = []
        s.contextKwic = []
        s.setContextData = function(data) {
            s.kwic = []
            s.pagerHitsPerPage = s.hitsPerPage
            return (s.contextKwic = massageData(data.kwic))
        }

        s.setKwicData = function(data) {
            s.contextKwic = []
            s.pagerHitsPerPage = s.hitsPerPage
            return (s.kwic = massageData(data.kwic))
        }

        c.log("selectionManager")
        s.selectionManager = new util.SelectionManager()

        s.selectLeft = function(sentence) {
            if (!sentence.match) {
                return
            }
            return sentence.tokens.slice(0, sentence.match.start)
        }

        s.selectMatch = function(sentence) {
            if (!sentence.match) {
                return
            }
            const from = sentence.match.start
            return sentence.tokens.slice(from, sentence.match.end)
        }

        s.selectRight = function(sentence) {
            if (!sentence.match) {
                return
            }
            const from = sentence.match.end
            const len = sentence.tokens.length
            return sentence.tokens.slice(from, len)
        }

        s.$watch(() => $location.search().hpp, hpp => (s.hitsPerPage = hpp || 25))

        s.download = {
            options: [
                { value: "", label: "download_kwic" },
                { value: "kwic/csv", label: "download_kwic_csv" },
                { value: "kwic/tsv", label: "download_kwic_tsv" },
                { value: "annotations/csv", label: "download_annotations_csv" },
                { value: "annotations/tsv", label: "download_annotations_tsv" }
            ],
            selected: "",
            init: (value, hitsDisplay) => {
                if (s.download.blobName) {
                    URL.revokeObjectURL(s.download.blobName)
                }
                if (value === "") {
                    return
                }
                const requestData = s.instance.getProxy().prevParams
                const [fileName, blobName] = Array.from(
                    this.kwicDownload.makeDownload(
                        ...Array.from(value.split("/")),
                        s.kwic,
                        requestData,
                        hitsDisplay
                    )
                )
                s.download.fileName = fileName
                s.download.blobName = blobName
                s.download.selected = ""
                return this.timeout(() => angular.element("#kwicDownloadLink")[0].click(), 0)
            }
        }
    }
}
KwicCtrl.initClass()

korpApp.directive("kwicCtrl", () => ({ controller: KwicCtrl }))

class ExampleCtrl extends KwicCtrl {
    static initClass() {
        this.$inject = ["$scope", "$timeout", "utils", "$location", "kwicDownload"]
    }
    constructor(scope, $timeout, utils, $location, kwicDownload) {
        {
            // Hack: trick Babel/TypeScript into allowing this before super.
            if (false) {
                super()
            }
            let thisFn = (() => {
                return this
            }).toString()
            let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1]
            eval(`${thisName} = this;`)
        }
        this.scope = scope
        this.kwicDownload = kwicDownload
        super(this.scope, $timeout, utils, $location, this.kwicDownload)
        const s = this.scope

        s.$root.word_selected = false

        s.newDynamicTab()

        s.hitspictureClick = function(pageNumber) {
            s.page = Number(pageNumber)
            s.pageObj.pager = Number(pageNumber + 1)
            return s.pageChange(null, pageNumber + 1)
        }

        s.pageChange = function($event, page) {
            if ($event != null) {
                $event.stopPropagation()
            }
            s.instance.current_page = page - 1
            return s.instance.makeRequest()
        }

        s.exampleReadingMode = s.kwicTab.readingMode

        s.toggleReading = function() {
            s.exampleReadingMode = !s.exampleReadingMode
            s.instance.centerScrollbar()

            if (s.instance != null ? s.instance.getProxy().pendingRequests.length : undefined) {
                window.pending = s.instance.getProxy().pendingRequests

                return $.when(...Array.from(s.instance.getProxy().pendingRequests || [])).then(() =>
                    s.instance.makeRequest()
                )
            }
        }
    }

    initPage() {
        this.scope.pageObj = { pager: 0 }
        return (this.scope.page = 0)
    }
    setupHash() {}
}
ExampleCtrl.initClass()

korpApp.directive("exampleCtrl", () => ({ controller: ExampleCtrl }))

korpApp.directive("statsResultCtrl", () => ({
    controller($scope, utils, $location, backend, searches, $rootScope) {
        const s = $scope
        s.loading = false
        s.progress = 0

        s.$watch(() => $location.search().hide_stats, val => (s.showStatistics = val == null))

        s.$watch(() => $location.search().in_order, val => (s.inOrder = val == null))

        s.shouldSearch = () => s.showStatistics && s.inOrder

        $scope.activate = function() {
            $location.search("hide_stats", null)
            const cqp = searches.getCqpExpr()
            s.showStatistics = true
            return $scope.instance.makeRequest(cqp)
        }

        s.onGraphShow = data => $rootScope.graphTabs.push(data)

        s.newMapEnabled = settings.newMapEnabled

        s.getGeoAttributes = function(corpora) {
            let attrs = {}
            for (let corpus of Array.from(settings.corpusListing.subsetFactory(corpora).selected)) {
                for (let attr of Array.from(corpus.private_struct_attributes)) {
                    if (attr.indexOf("geo" !== -1)) {
                        if (attrs[attr]) {
                            attrs[attr].corpora.push(corpus.id)
                        } else {
                            attrs[attr] = {
                                label: attr,
                                corpora: [corpus.id]
                            }
                        }
                    }
                }
            }

            attrs = _.map(attrs, val => val)
            if (attrs && attrs.length > 0) {
                attrs[0].selected = true
            }

            return (s.mapAttributes = attrs)
        }

        s.mapToggleSelected = function(index, event) {
            _.map(s.mapAttributes, attr => (attr.selected = false))

            const attr = s.mapAttributes[index]
            attr.selected = true
            return event.stopPropagation()
        }

        return (s.showMap = function() {
            const cqpExpr = CQP.expandOperators(searches.getCqpExpr())

            const cqpExprs = {}
            for (let rowIx of Array.from(s.instance.getSelectedRows())) {
                if (rowIx === 0) {
                    continue
                }
                var row = s.instance.getDataAt(rowIx)
                const { searchParams } = s.instance
                const cqp = statisticsFormatting.getCqp(row.statsValues, searchParams.ignoreCase)
                const parts = Array.from(searchParams.reduceVals).map(
                    reduceVal => row.formattedValue[reduceVal]
                )
                cqpExprs[cqp] = parts.join(", ")
            }

            const selectedAttributes = _.filter(s.mapAttributes, "selected")
            if (selectedAttributes.length > 1) {
                c.log("Warning: more than one selected attribute, choosing first")
            }
            const selectedAttribute = selectedAttributes[0]

            const within = settings.corpusListing
                .subsetFactory(selectedAttribute.corpora)
                .getWithinParameters()
            return $rootScope.mapTabs.push(
                backend.requestMapData(cqpExpr, cqpExprs, within, selectedAttribute)
            )
        })
    }
}))

korpApp.directive("wordpicCtrl", () => ({
    controller($scope, $rootScope, $location, utils, searches) {
        $scope.loading = false
        $scope.progress = 0
        $scope.word_pic = $location.search().word_pic != null
        $scope.$watch(() => $location.search().word_pic, val => ($scope.word_pic = Boolean(val)))

        $scope.activate = function() {
            $location.search("word_pic", true)
            const search = searches.activeSearch
            const searchVal = search.type === "lemgram" ? unregescape(search.val) : search.val
            return $scope.instance.makeRequest(searchVal, search.type)
        }

        $scope.settings = { showNumberOfHits: "15" }

        $scope.hitSettings = ["15"]

        $scope.minimize = table => table.slice(0, $scope.settings.showNumberOfHits)

        $scope.onClickExample = function(event, row) {
            const data = row

            const opts = {}
            opts.ajaxParams = {
                start: 0,
                end: 24,
                command: "relations_sentences",
                source: data.source.join(","),
                corpus: data.corpus
            }

            return $rootScope.kwicTabs.push({ queryParams: opts })
        }

        $scope.showWordClass = false

        $rootScope.$on("word_picture_data_available", function(event, data) {
            $scope.data = data

            let max = 0
            _.map(data, form =>
                _.map(form, function(categories) {
                    if (categories instanceof Array) {
                        return _.map(categories, cols =>
                            _.map(cols, function(col) {
                                if (col.table && col.table.length > max) {
                                    return (max = col.table.length)
                                }
                            })
                        )
                    }
                })
            )

            $scope.hitSettings = []
            if (max < 15) {
                $scope.settings = { showNumberOfHits: "1000" }
            } else {
                $scope.hitSettings.push("15")
                $scope.settings = { showNumberOfHits: "15" }
            }

            if (max > 50) {
                $scope.hitSettings.push("50")
            }
            if (max > 100) {
                $scope.hitSettings.push("100")
            }
            if (max > 500) {
                $scope.hitSettings.push("500")
            }

            return $scope.hitSettings.push("1000")
        })

        $scope.localeString = function(lang, hitSetting) {
            if (hitSetting === "1000") {
                return util.getLocaleString("word_pic_show_all", lang)
            } else {
                return (
                    util.getLocaleString("word_pic_show_some", lang) +
                    " " +
                    hitSetting +
                    " " +
                    util.getLocaleString("word_pic_hits", lang)
                )
            }
        }

        $scope.isLemgram = word => util.isLemgramId(word)

        $scope.renderTable = obj => obj instanceof Array

        $scope.parseLemgram = function(row, allLemgrams) {
            let needle
            const set = row[row.show_rel].split("|")
            const lemgram = set[0]

            const word = _.trim(lemgram)
            let infixIndex = ""
            let concept = lemgram
            infixIndex = ""
            let type = "-"

            const hasHomograph = ((needle = lemgram.slice(0, -1)),
            Array.from(allLemgrams).includes(needle))
            const prefix = row.depextra

            if (util.isLemgramId(lemgram)) {
                const match = util.splitLemgram(lemgram)
                infixIndex = match.index
                if (row.dep) {
                    concept = match.form.replace(/_/g, " ")
                } else {
                    concept = "-"
                }
                type = match.pos.slice(0, 2)
            }
            return {
                label: prefix + " " + concept,
                pos: type,
                idx: infixIndex,
                showIdx: !(infixIndex === "" || infixIndex === "1")
            }
        }

        $scope.getTableClass = (wordClass, parentIdx, idx) =>
            settings.wordPictureConf[wordClass][parentIdx][idx].css_class

        $scope.getHeaderLabel = function(header, section, idx) {
            if (header.alt_label) {
                return header.alt_label
            } else {
                return `rel_${section[idx].rel}`
            }
        }

        $scope.getHeaderClasses = function(header, token) {
            if (header !== "_") {
                return `lemgram_header_item ${header.css_class}`
            } else {
                let classes = "hit"
                if ($scope.isLemgram(token)) {
                    classes += " lemgram"
                }
                return classes
            }
        }

        $scope.renderResultHeader = function(parentIndex, section, wordClass, index) {
            const headers = settings.wordPictureConf[wordClass][parentIndex]
            return section[index] && section[index].table
        }

        $scope.getResultHeader = (index, wordClass) => settings.wordPictureConf[wordClass][index]

        return ($scope.fromLemgram = function(maybeLemgram) {
            if (util.isLemgramId(maybeLemgram)) {
                return util.splitLemgram(maybeLemgram).form
            } else {
                return maybeLemgram
            }
        })
    }
}))

korpApp.directive("graphCtrl", () => ({
    controller($scope) {
        const s = $scope
        s.newDynamicTab()

        s.mode = "line"

        s.isGraph = () => ["line", "bar"].includes(s.mode)
        return (s.isTable = () => s.mode === "table")
    }
}))

korpApp.directive("compareCtrl", () => ({
    controller($scope, $rootScope) {
        const s = $scope
        s.loading = true
        s.newDynamicTab()

        s.resultOrder = item => Math.abs(item.loglike)

        return s.promise.then(
            function(...args) {
                const [tables, max, cmp1, cmp2, reduce] = Array.from(args[0])
                const xhr = args[1]
                s.loading = false

                s.tables = tables
                s.reduce = reduce

                let cl = settings.corpusListing.subsetFactory([].concat(cmp1.corpora, cmp2.corpora))
                const attributes = _.extend({}, cl.getCurrentAttributes(), cl.getStructAttrs())

                s.stringify = _.map(
                    reduce,
                    item =>
                        __guard__(attributes[_.trimStart(item, "_.")], x => x.stringify) ||
                        angular.identity
                )

                s.max = max

                s.cmp1 = cmp1
                s.cmp2 = cmp2

                const cmps = [cmp1, cmp2]

                return (s.rowClick = function(row, cmp_index) {
                    const cmp = cmps[cmp_index]

                    const splitTokens = _.map(row.elems, elem =>
                        _.map(elem.split("/"), tokens => tokens.split(" "))
                    )

                    // number of tokens in search
                    const tokenLength = splitTokens[0][0].length

                    // transform result from grouping on attribute to grouping on token place
                    var tokens = _.map(__range__(0, tokenLength - 1, true), function(tokenIdx) {
                        tokens = _.map(reduce, (reduceAttr, attrIdx) =>
                            _.uniq(_.map(splitTokens, res => res[attrIdx][tokenIdx]))
                        )
                        return tokens
                    })

                    const cqps = _.map(tokens, function(token) {
                        const cqpAnd = _.map(__range__(0, token.length - 1, true), function(attrI) {
                            let type, val
                            let attrKey = reduce[attrI]
                            const attrVal = token[attrI]

                            if (Array.from(attrKey).includes("_.")) {
                                c.log("error, attribute key contains _.")
                            }

                            const attribute = attributes[attrKey]
                            if (attribute) {
                                ;({ type } = attribute)
                                if (attribute.isStructAttr) {
                                    attrKey = `_.${attrKey}`
                                }
                            }

                            const op = type === "set" ? "contains" : "="

                            if (type === "set" && attrVal.length > 1) {
                                let variants = []
                                _.map(attrVal, function(val) {
                                    let idx
                                    const parts = val.split(":")
                                    if (variants.length === 0) {
                                        let asc, end
                                        for (
                                            idx = 0, end = parts.length - 2, asc = end >= 0;
                                            asc ? idx <= end : idx >= end;
                                            asc ? idx++ : idx--
                                        ) {
                                            variants.push([])
                                        }
                                    }
                                    return (() => {
                                        let asc1, end1
                                        const result = []
                                        for (
                                            idx = 1, end1 = parts.length - 1, asc1 = end1 >= 1;
                                            asc1 ? idx <= end1 : idx >= end1;
                                            asc1 ? idx++ : idx--
                                        ) {
                                            result.push(variants[idx - 1].push(parts[idx]))
                                        }
                                        return result
                                    })()
                                })

                                const key = attrVal[0].split(":")[0]
                                variants = _.map(variants, variant => `:(${variant.join("|")})`)
                                val = key + variants.join("")
                            } else {
                                val = attrVal[0]
                            }

                            if (type === "set" && (val === "|" || val === "")) {
                                return `ambiguity(${attrKey}) = 0`
                            } else {
                                return `${attrKey} ${op} \"${val}\"`
                            }
                        })

                        return `[${cqpAnd.join(" & ")}]`
                    })

                    const cqp = cqps.join(" ")

                    cl = settings.corpusListing.subsetFactory(cmp.corpora)

                    const opts = {
                        start: 0,
                        end: 24,
                        ajaxParams: {
                            command: "query",
                            cqp: cmp.cqp,
                            cqp2: cqp,
                            corpus: cl.stringifySelected(),
                            show_struct: _.keys(cl.getStructAttrs()),
                            expand_prequeries: false
                        }
                    }
                    return $rootScope.kwicTabs.push({ queryParams: opts })
                })
            },
            function() {
                s.loading = false
                return (s.error = true)
            }
        )
    }
}))

function __guard__(value, transform) {
    return typeof value !== "undefined" && value !== null ? transform(value) : undefined
}
function __range__(left, right, inclusive) {
    let range = []
    let ascending = left < right
    let end = !inclusive ? right : ascending ? right + 1 : right - 1
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i)
    }
    return range
}
