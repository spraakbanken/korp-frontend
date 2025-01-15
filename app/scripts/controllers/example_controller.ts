/** @format */
import angular, { IRepeatScope, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { KwicCtrl, KwicCtrlScope } from "./kwic_controller"
import { LocationService } from "@/urlparams"
import { KwicTab, RootScope } from "@/root-scope.types"
import { Response } from "@/backend/types"
import { QueryResponse } from "@/backend/types/query"
import { UtilsService } from "@/services/utils"
import "@/services/utils"
import { TabHashScope } from "@/directives/tab-hash"

const korpApp = angular.module("korpApp")

type ScopeBase = Omit<KwicCtrlScope, "makeRequest"> & IRepeatScope & TabHashScope

type ExampleCtrlScope = ScopeBase & {
    closeTab: (idx: number, e: Event) => void
    hitsPictureData?: any
    hitspictureClick?: (page: number) => void
    kwicTab: KwicTab
    makeRequest: (isPaging?: boolean) => void
    setupReadingWatch: () => void
    superRenderResult: (data: Response<QueryResponse>) => void
}

class ExampleCtrl extends KwicCtrl {
    scope: ExampleCtrlScope

    static initClass() {
        this.$inject = ["$scope", "utils", "$location", "$rootScope", "$timeout"]
    }
    constructor(
        scope: ExampleCtrlScope,
        utils: UtilsService,
        $location: LocationService,
        $rootScope: RootScope,
        $timeout: ITimeoutService
    ) {
        super(scope, utils, $location, $rootScope, $timeout)
        const s = this.scope
        const r = this.$rootScope

        // ugly, but because the kwic-tab-scope is parent of this scope it needs to be done
        s.hits = undefined
        s.hitsInProgress = undefined
        s.page = 0
        s.error = undefined
        s.hitsPictureData = null
        s.kwic = undefined
        s.corpusHits = undefined
        s.aborted = false

        s.newDynamicTab()

        s.isReadingMode = () => {
            return s.kwicTab.readingMode || false
        }

        s.hitspictureClick = function (pageNumber) {
            s.pageChange(Number(pageNumber))
        }

        s.pageChange = function (page) {
            s.page = page
            s.makeRequest()
        }

        s.toggleReading = function () {
            s.kwicTab.readingMode = !s.kwicTab.readingMode
            s.makeRequest()
        }

        s.closeTab = function (idx, e) {
            e.preventDefault()
            r.kwicTabs.splice(idx, 1)
            s.closeDynamicTab()
        }

        s.setupReadingWatch = _.once(function () {
            let init = true
            return s.$watch("reading_mode", function () {
                if (!init) {
                    s.readingChange()
                }
                init = false
            })
        })

        s.superRenderResult = s.renderResult
        s.renderResult = (data) => {
            s.superRenderResult(data)
            s.setupReadingWatch()
        }

        s.makeRequest = () => {
            const items_per_page = Number($location.search().hpp || settings["hits_per_page_default"])
            const opts = s.kwicTab.queryParams

            // example tab cannot handle incremental = true
            opts.ajaxParams.incremental = false

            opts.ajaxParams.start = (s.page || 0) * items_per_page
            opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

            const preferredContext = s.isReadingMode()
                ? settings["default_reading_context"]
                : settings["default_overview_context"]
            const avoidContext = s.isReadingMode()
                ? settings["default_overview_context"]
                : settings["default_reading_context"]

            const corpora = opts.ajaxParams.corpus ? opts.ajaxParams.corpus.split(",") : []
            const context = settings.corpusListing.getContextQueryStringFromCorpusId(
                corpora,
                preferredContext,
                avoidContext
            )
            _.extend(opts.ajaxParams, { context, default_context: preferredContext })

            // Abort any running request
            if (s.loading) s.proxy.abort()

            s.loading = true
            s.proxy
                .makeRequest(opts, undefined)
                .then((data) =>
                    $timeout(() => {
                        s.renderResult(data)
                        s.renderCompleteResult(data)
                    })
                )
                .catch((error) => {
                    // AbortError is expected if a new search is made before the previous one is finished
                    if (error.name == "AbortError") return
                    console.error(error)
                    // TODO Show error
                    $timeout(() => (s.error = error))
                })
                .finally(() => $timeout(() => (s.loading = false)))
        }

        if (s.kwicTab.queryParams) {
            s.makeRequest()
        }
    }

    initPage() {
        this.scope.page = 0
    }
    setupListeners() {}
    setupHash() {}
}
ExampleCtrl.initClass()

korpApp.directive("exampleCtrl", () => ({ controller: ExampleCtrl }))
