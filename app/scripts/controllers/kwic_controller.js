/** @format */
const korpApp = angular.module("korpApp")

export class KwicCtrl {
    static initClass() {
        this.$inject = ["$scope", "utils", "$location", "$rootScope", "$timeout"]
    }
    setupHash() {
        return this.utils.setupHash(this.scope, [
            {
                key: "page",
                val_in: Number,
            },
        ])
    }

    initPage() {
        this.scope.page = Number(this.location.search().page) || 0
    }
    setupListeners() {
        this.$rootScope.$on("kwic_make_request", (msg, cqp) => {
            this.scope.cqp = cqp
            // only set this on the inital search, not when paging
            this.scope.hitsPerPage = this.location.search()["hpp"] || settings["hits_per_page_default"]
            this.scope.makeRequest(false)
        })
    }
    constructor(scope, utils, $location, $rootScope, $timeout) {
        this.utils = utils
        this.scope = scope
        this.location = $location
        this.$rootScope = $rootScope

        const s = scope

        this.setupListeners()

        s.proxy = new model.KWICProxy()

        // there can be only one global kwicproxy
        if (!window.kwicProxy) {
            window.kwicProxy = s.proxy
        }

        s.tabindex = 0

        const punctArray = [",", ".", ";", ":", "!", "?", "..."]

        this.initPage()

        s.pageChange = function (page) {
            s.page = page
            s.makeRequest(true)
        }

        this.setupHash()

        s.$on("abort_requests", () => {
            s.proxy.abort()
        })

        s.readingChange = function () {
            if (s.getProxy().pendingRequests.length) {
                // If the requests passed to $.when contain rejected
                // (aborted) requests, .then is not executed, so
                // filter those out
                // TODO: Remove at least rejected requests from
                // pendingRequests somewhere
                const nonRejectedRequests = (s.getProxy().pendingRequests || []).filter(
                    (req) => req.state() != "rejected"
                )
                return $.when(...nonRejectedRequests).then(function () {
                    return s.makeRequest(false)
                })
            }
        }

        s.reading_mode = $location.search().reading_mode
        s.toggleReading = function () {
            s.reading_mode = !s.reading_mode
            if (s.reading_mode) {
                $location.search("reading_mode", true)
            } else {
                $location.search("reading_mode", undefined)
            }
            s.readingChange()
        }

        const massageData = function (hitArray) {
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
                        const attrs = _.toPairs(structItem[structKey]).map(([key, val]) => [structKey + "_" + key, val])
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

        var findMatchSentence = function (hitContext) {
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

        s.kwic = []
        s.contextKwic = []
        s.setContextData = function (data) {
            s.kwic = []
            s.contextKwic = massageData(data.kwic)
        }

        s.setKwicData = function (data) {
            s.contextKwic = []
            s.kwic = massageData(data.kwic)
        }

        s.selectionManager = new util.SelectionManager()

        s.buildQueryOptions = (cqp, isPaging) => {
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

            if (s.isReadingMode()) {
                preferredContext = settings["default_reading_context"]
                avoidContext = settings["default_overview_context"]
            } else {
                preferredContext = settings["default_overview_context"]
                avoidContext = settings["default_reading_context"]
            }

            const context = settings.corpusListing.getContextQueryString(preferredContext, avoidContext)

            if (!isPaging) {
                s.proxy.queryData = null
            }

            opts.ajaxParams = {
                corpus: settings.corpusListing.stringifySelected(),
                cqp: cqp || s.proxy.prevCQP,
                query_data: s.proxy.queryData,
                context,
                default_context: preferredContext,
                incremental: true,
            }

            _.extend(opts.ajaxParams, getSortParams())
            return opts
        }

        s.onProgress = (progressObj, isPaging) => {
            s.progress = Math.round(progressObj["stats"])
            if (!isPaging) {
                s.hits_display = util.prettyNumbers(progressObj["total_results"])
            }
        }

        s.makeRequest = (isPaging) => {
            if (!isPaging) {
                s.page = Number($location.search().page) || 0
            }

            s.loading = true
            s.aborted = false

            s.ignoreAbort = Boolean(s.proxy.hasPending())

            const params = s.buildQueryOptions(s.cqp, isPaging)

            const req = s.getProxy().makeRequest(
                params,
                s.page,
                (progressObj) => {
                    $timeout(() => s.onProgress(progressObj, isPaging))
                },
                (data) => {
                    $timeout(() => s.renderResult(data))
                }
            )
            req.done((data) => {
                $timeout(() => {
                    s.loading = false
                    s.renderCompleteResult(data, isPaging)
                })
            })

            req.fail((jqXHR, status, errorThrown) => {
                $timeout(() => {
                    c.log("kwic fail")
                    if (s.ignoreAbort) {
                        c.log("stats ignoreabort")
                        return
                    }
                    s.loading = false

                    if (status === "abort") {
                        s.aborted = true
                    } else {
                        s.error = true
                    }
                })
            })
        }

        s.getProxy = () => {
            return s.proxy
        }

        s.isReadingMode = () => {
            return s.reading_mode
        }

        s.renderCompleteResult = (data, isPaging) => {
            s.loading = false
            if (!isPaging) {
                s.hits = data.hits
                s.hits_display = util.prettyNumbers(data.hits)
                if (!data.hits) {
                    c.log("no kwic results")
                    s.hitsPictureData = null
                } else {
                    s.renderHitsPicture(data)
                }
            }
        }

        s.renderHitsPicture = (data) => {
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

            s.hitsPictureData = items
        }

        s.renderResult = (data) => {
            if (data.ERROR) {
                s.error = true
                return
            } else {
                s.error = false
            }

            if (!data.kwic) {
                data.kwic = []
            }
            const isReading = s.isReadingMode()

            if (s.isActive()) {
                s.$root.jsonUrl = s.proxy.prevUrl
            }

            const useContextData = locationSearch()["in_order"] != null
            if (isReading || useContextData) {
                s.setContextData(data)
            } else {
                s.setKwicData(data)
            }
            s.corpusOrder = data.corpus_order
        }

        s.onentry = () => {
            s.$root.jsonUrl = s.proxy.prevUrl
        }

        s.onexit = () => {
            s.$root.jsonUrl = null
        }

        s.isActive = () => {
            return s.tabindex == s.$parent.tabset.active
        }

        s.countCorpora = () => {
            return s.proxy.prevParams && s.proxy.prevParams.corpus.split(",").length
        }
    }
}
KwicCtrl.initClass()

korpApp.directive("kwicCtrl", () => ({ controller: KwicCtrl }))
