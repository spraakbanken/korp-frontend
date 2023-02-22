/** @format */
import statemachine from "@/statemachine"

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
        this.$rootScope.$on("make_request", (msg, cqp) => {
            this.scope.cqp = cqp
            // only set this on the inital search, not when paging
            this.scope.hitsPerPage = this.location.search()["hpp"] || settings["hits_per_page_default"]

            // reset randomSeed when doing a search, but not for the first request
            if (!this.scope.initialSearch) {
                this.scope.randomSeed = null
            } else {
                this.scope.randomSeed = this.location.search()["random_seed"]
            }
            this.scope.initialSearch = false
            this.scope.makeRequest(false)
        })
    }
    constructor(scope, utils, $location, $rootScope, $timeout) {
        this.utils = utils
        this.scope = scope
        this.location = $location
        this.$rootScope = $rootScope

        const s = scope

        s.initialSearch = true

        this.setupListeners()

        s.proxy = new model.KWICProxy()

        s.tabindex = 0

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
                    if (!isPaging && !s.randomSeed) {
                        s.randomSeed = Math.ceil(Math.random() * 10000000)
                        $location.search("random_seed", s.randomSeed)
                    }
                    return {
                        sort,
                        random_seed: s.randomSeed,
                    }
                } else {
                    $location.search("random_seed", null)
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
                s.data = data
            }
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

            if (s.isActive()) {
                s.$root.jsonUrl = s.proxy.prevUrl
            }

            s.corpusOrder = data.corpus_order
        }

        s.onentry = () => {
            s.$root.jsonUrl = s.proxy.prevUrl
            s.active = true
        }

        s.onexit = () => {
            s.$root.jsonUrl = null
            s.active = false
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
