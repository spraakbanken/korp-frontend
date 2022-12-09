/** @format */
import { KWICResults } from "./kwic_results.js"

export class ExampleResults extends KWICResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)
        this.proxy = new model.KWICProxy()
        if (this.s.$parent.kwicTab.queryParams) {
            this.makeRequest().then(() => {
                this.onentry()
            })
        }
        this.tabindex = this.getResultTabs().length - 1 + this.s.$parent.$index
    }

    isReadingMode() {
        return this.s.exampleReadingMode
    }

    makeRequest() {
        const items_per_page = parseInt(locationSearch().hpp || settings["hits_per_page_default"])
        const opts = this.s.$parent.kwicTab.queryParams

        this.resetView()
        // example tab cannot handle incremental = true
        opts.ajaxParams.incremental = false

        opts.ajaxParams.start = this.s.$parent.page * items_per_page
        opts.ajaxParams.end = opts.ajaxParams.start + items_per_page - 1

        let avoidContext, preferredContext
        if (this.isReadingMode()) {
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

        this.showPreloader()
        const progress = opts.command === "relations_sentences" ? $.noop : $.proxy(this.onProgress, this)
        const def = this.proxy.makeRequest(opts, null, progress, (data) => {
            this.renderResult(data, opts.cqp)
            this.renderCompleteResult(data)
            return safeApply(this.s, () => {
                return this.hidePreloader()
            })
        })

        return def.fail(function () {
            return safeApply(this.s, () => {
                return this.hidePreloader()
            })
        })
    }

    renderResult(data) {
        super.renderResult(data)
        this.s.setupReadingWatch()
    }
}