/** @format */
import angular, { IRepeatScope, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { KwicCtrl, KwicCtrlScope } from "./kwic_controller"
import { LocationService } from "@/urlparams"
import { KwicTab, RootScope } from "@/root-scope.types"
import { KorpResponse, ProgressReport } from "@/backend/types"
import { KorpQueryResponse } from "@/backend/kwic-proxy"
import { UtilsService } from "@/services/utils"
import "@/services/utils"

const korpApp = angular.module("korpApp")

type ScopeBase = Omit<KwicCtrlScope, "makeRequest"> & IRepeatScope

type ExampleCtrlScope = ScopeBase & {
    $parent: { $parent: any }
    closeTab: (idx: number, e: Event) => void
    hitsPictureData?: any
    hitspictureClick?: (page: number) => void
    kwicTab: KwicTab
    makeRequest: (isPaging?: boolean) => JQuery.jqXHR<KorpResponse<KorpQueryResponse>>
    onExampleProgress: (progressObj: ProgressReport, isPaging?: boolean) => void
    setupReadingWatch: () => void
    superRenderResult: (data: KorpResponse<KorpQueryResponse>) => void
    newDynamicTab: any // TODO Defined in tabHash (services.js)
    closeDynamicTab: any // TODO Defined in tabHash (services.js)
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
        s.hits = null
        s.hitsInProgress = null
        s.page = 0
        s.error = false
        s.hitsPictureData = null
        s.kwic = null
        s.corpusHits = null
        s.aborted = false

        s.tabindex = s.$parent.$parent.$parent.tabset.tabs.length - 1 + s.$index

        s.newDynamicTab()

        s.isReadingMode = () => {
            return s.kwicTab.readingMode
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
            if (s.getProxy().pendingRequests.length) {
                return $.when(...(s.getProxy().pendingRequests || [])).then(() => s.makeRequest())
            }
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

            opts.ajaxParams.start = s.page * items_per_page
            opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

            let avoidContext, preferredContext
            if (s.isReadingMode()) {
                preferredContext = settings["default_reading_context"]
                avoidContext = settings["default_overview_context"]
            } else {
                preferredContext = settings["default_overview_context"]
                avoidContext = settings["default_reading_context"]
            }

            const context = settings.corpusListing.getContextQueryStringFromCorpusId(
                (opts.ajaxParams.corpus || "").split(","),
                preferredContext,
                avoidContext
            )
            _.extend(opts.ajaxParams, { context, default_context: preferredContext })

            s.loading = true
            if (opts.ajaxParams.command == "relations_sentences") {
                s.onExampleProgress = () => {}
            } else {
                s.onExampleProgress = s.onProgress
            }

            const def = s.proxy.makeRequest(
                opts,
                null,
                (progressObj) => $timeout(() => s.onExampleProgress(progressObj)),
                (data) => {
                    $timeout(() => {
                        s.renderResult(data)
                        s.renderCompleteResult(data)
                        s.loading = false
                    })
                }
            )

            def.fail(() => {
                $timeout(() => {
                    // TODO it could be abort
                    s.error = true
                    s.loading = false
                })
            })

            return def
        }

        s.isActive = () => {
            return s.tabindex == s.$parent.$parent.$parent.tabset.active
        }

        if (s.kwicTab.queryParams) {
            s.makeRequest().then(() => {
                // s.onentry()
            })
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
