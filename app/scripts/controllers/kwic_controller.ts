/** @format */
import angular, { IController, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import kwicProxyFactory, { type KwicProxy } from "@/backend/kwic-proxy"
import { ApiKwic, ProgressReport } from "@/backend/types"
import { QueryParams, QueryResponse } from "@/backend/types/query"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { UtilsService } from "@/services/utils"
import "@/services/utils"
import { TabHashScope } from "@/directives/tab-hash"

angular.module("korpApp").directive("kwicCtrl", () => ({ controller: KwicCtrl }))

export type KwicCtrlScope = TabHashScope & {
    active?: boolean
    aborted?: boolean
    buildQueryOptions: (isPaging: boolean) => QueryParams
    corpusHits?: Record<string, number>
    countCorpora?: () => number | null
    corpusOrder?: string[]
    cqp?: string
    error?: string
    getProxy: () => KwicProxy
    /** Number of total search hits, updated when a search is completed. */
    hits?: number
    /** Number of search hits, may change while search is in progress. */
    hitsInProgress?: number
    hitsPerPage?: `${number}` | number
    initialSearch?: boolean
    isReadingMode: () => boolean
    kwic?: ApiKwic[]
    loading?: boolean
    makeRequest: (isPaging?: boolean) => void
    onentry: () => void
    onexit: () => void
    onProgress: (progressObj: ProgressReport<"query">, isPaging?: boolean) => void
    page?: number
    pageChange: (page: number) => void
    progress?: number
    proxy: KwicProxy
    randomSeed?: number
    reading_mode?: boolean
    readingChange: () => void
    renderCompleteResult: (data: QueryResponse, isPaging?: boolean) => void
    renderResult: (data: QueryResponse) => void
    toggleReading: () => void
}

export class KwicCtrl implements IController {
    location: LocationService
    scope: KwicCtrlScope
    $rootScope: RootScope
    utils: UtilsService

    static initClass() {
        this.$inject = ["$scope", "utils", "$location", "$rootScope", "$timeout"]
    }

    setupHash() {
        // Sync url param for page number
        return this.utils.setupHash(this.scope, { key: "page", val_in: Number })
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
                this.scope.randomSeed = undefined
            } else {
                this.scope.randomSeed = Number(this.location.search()["random_seed"])
            }
            this.scope.initialSearch = false
            this.scope.makeRequest(false)
        })
    }
    constructor(
        scope: KwicCtrlScope,
        utils: UtilsService,
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

        this.initPage()

        s.pageChange = function (page) {
            s.page = page
            s.makeRequest(true)
        }

        this.setupHash()

        s.$on("abort_requests", () => {
            s.proxy.abort()
            if (s.loading) {
                s.aborted = true
                s.loading = false
            }
        })

        s.readingChange = function () {
            s.makeRequest(false)
        }

        s.reading_mode = $location.search().reading_mode
        s.toggleReading = function () {
            s.reading_mode = !s.reading_mode
            $location.search("reading_mode", s.reading_mode || undefined)
            s.readingChange()
        }

        s.buildQueryOptions = (isPaging) => {
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
                s.proxy.queryData = undefined
            }

            const cqp = s.cqp || s.proxy.prevCQP
            if (!cqp) throw new Error("cqp missing")

            const params: QueryParams = {
                corpus: settings.corpusListing.stringifySelected(),
                cqp,
                query_data: s.proxy.queryData,
                context,
                default_context: preferredContext,
                incremental: true,
            }

            Object.assign(params, getSortParams())
            return params
        }

        s.onProgress = (progressObj, isPaging) => {
            s.progress = Math.round(progressObj.percent)
            if (!isPaging && progressObj.hits !== null) {
                s.hitsInProgress = progressObj.hits
            }
        }

        s.makeRequest = (isPaging = false) => {
            if (!isPaging) {
                s.page = Number($location.search().page) || 0
            }

            // Abort any running request
            if (s.loading) s.proxy.abort()

            s.progress = 0
            s.loading = true
            s.aborted = false
            s.error = undefined

            const ajaxParams = s.buildQueryOptions(isPaging)

            s.getProxy()
                .makeRequest(
                    { ajaxParams },
                    s.page,
                    (progressObj) => $timeout(() => s.onProgress(progressObj, isPaging)),
                    (data) => $timeout(() => s.renderResult(data))
                )
                .then((data) =>
                    $timeout(() => {
                        s.loading = false
                        s.renderCompleteResult(data, isPaging)
                    })
                )
                .catch((error) => {
                    // AbortError is expected if a new search is made before the previous one is finished
                    if (error.name == "AbortError") return
                    console.error(error)
                    // TODO Show error
                    $timeout(() => {
                        s.error = error
                        s.loading = false
                    })
                })
        }

        s.getProxy = () => {
            return s.proxy
        }

        s.isReadingMode = () => {
            return s.reading_mode || false
        }

        s.renderCompleteResult = (data, isPaging) => {
            s.renderResult(data)
            if (!isPaging) {
                s.hits = data.hits
                s.hitsInProgress = data.hits
                s.corpusHits = data.corpus_hits
            }
        }

        s.renderResult = (data) => {
            if (!data.kwic) {
                data.kwic = []
            }

            s.corpusOrder = data.corpus_order
            s.kwic = data.kwic
        }

        s.onentry = () => {
            s.active = true
        }

        s.onexit = () => {
            s.active = false
        }

        s.countCorpora = () => {
            return s.proxy.prevParams?.corpus ? s.proxy.prevParams.corpus.split(",").length : null
        }
    }
}
KwicCtrl.initClass()
