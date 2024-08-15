/** @format */
import angular, { IController, IScope, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import kwicProxyFactory, { ApiKwic, KorpQueryParams, KorpQueryResponse, type KwicProxy } from "@/backend/kwic-proxy"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { KorpResponse, ProgressReport } from "@/backend/types"

angular.module("korpApp").directive("kwicCtrl", () => ({ controller: KwicCtrl }))

export type KwicCtrlScope = IScope & {
    $parent: {
        tabset: any
    }
    active?: boolean
    aborted?: boolean
    buildQueryOptions: (cqp: string, isPaging: boolean) => KorpQueryParams
    corpusHits?: Record<string, number>
    countCorpora?: () => number | undefined
    corpusOrder?: string[]
    cqp?: string
    error?: boolean
    getProxy?: () => KwicProxy
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage?: `${number}` | number
    ignoreAbort?: boolean
    initialSearch?: boolean
    isActive?: () => boolean
    isReadingMode?: () => boolean
    kwic: ApiKwic[]
    loading?: boolean
    makeRequest?: (isPaging?: boolean) => void
    onentry: () => void
    onexit: () => void
    onProgress: (progressObj: ProgressReport, isPaging?: boolean) => void
    page?: number
    pageChange?: (page: number) => void
    progress?: number
    proxy?: KwicProxy
    randomSeed?: number
    reading_mode?: boolean
    readingChange?: () => void
    renderCompleteResult?: (data: KorpResponse<KorpQueryResponse>, isPaging?: boolean) => void
    renderResult?: (data: KorpResponse<KorpQueryResponse>) => void
    tabindex?: number
    toggleReading?: () => void
}

export class KwicCtrl implements IController {
    location: LocationService
    scope: KwicCtrlScope
    $rootScope: RootScope
    utils: any

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
            // only set this on the initial search, not when paging
            this.scope.hitsPerPage = this.location.search()["hpp"] || settings["hits_per_page_default"]

            // reset randomSeed when doing a search, but not for the first request
            if (!this.scope.initialSearch) {
                this.scope.randomSeed = null
            } else {
                this.scope.randomSeed = Number(this.location.search()["random_seed"])
            }
            this.scope.initialSearch = false
            this.scope.makeRequest(false)
        })
    }
    constructor(
        scope: KwicCtrlScope,
        utils: any,
        $location: LocationService,
        $rootScope: RootScope,
        $timeout: ITimeoutService
    ) {
        this.utils = utils
        this.scope = scope
        this.location = $location
        this.$rootScope = $rootScope

        const s = scope

        s.initialSearch = true

        this.setupListeners()

        s.proxy = kwicProxyFactory.create()

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

        s.buildQueryOptions = (cqp, isPaging) => {
            let avoidContext, preferredContext
            const getSortParams = function () {
                const { sort } = $location.search()
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

            const params: KorpQueryParams = {
                corpus: settings.corpusListing.stringifySelected(),
                cqp: cqp || s.proxy.prevCQP,
                query_data: s.proxy.queryData,
                context,
                default_context: preferredContext,
                incremental: true,
            }

            Object.assign(params, getSortParams())
            return params
        }

        s.onProgress = (progressObj, isPaging) => {
            s.progress = Math.round(progressObj["stats"])
            if (!isPaging && progressObj["total_results"] !== null) {
                s.hitsInProgress = progressObj["total_results"]
            }
        }

        s.makeRequest = (isPaging) => {
            if (!isPaging) {
                s.page = Number($location.search().page) || 0
            }

            s.loading = true
            s.aborted = false

            s.ignoreAbort = Boolean(s.proxy.hasPending())

            const ajaxParams = s.buildQueryOptions(s.cqp, isPaging)

            const req = s.getProxy().makeRequest(
                { ajaxParams },
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
                    console.log("kwic fail")
                    if (s.ignoreAbort) {
                        console.log("stats ignoreabort")
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
            if ("ERROR" in data) return
            if (!isPaging) {
                s.hits = data.hits
                s.hitsInProgress = data.hits
                s.corpusHits = data.corpus_hits
            }
        }

        s.renderResult = (data) => {
            if ("ERROR" in data) {
                s.error = true
                return
            }
            s.error = false

            if (!data.kwic) {
                data.kwic = []
            }

            if (s.isActive()) {
                $rootScope.jsonUrl = s.proxy.prevUrl
            }

            s.corpusOrder = data.corpus_order
            s.kwic = data.kwic
        }

        s.onentry = () => {
            $rootScope.jsonUrl = s.proxy.prevUrl
            s.active = true
        }

        s.onexit = () => {
            $rootScope.jsonUrl = null
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
