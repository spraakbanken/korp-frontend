/** @format */
const korpFailImg = require("../img/korp_fail.svg")

export class BaseResults {
    constructor(selector, scope) {
        this.s = scope

        this.$result = $(selector)
        this.$result.add($(selector)).addClass("not_loading")

        this.injector = angular.injector(["ng"])

        const def = this.injector.get("$q").defer()
        this.firstResultDef = def
    }

    onProgress(progressObj) {
        return safeApply(this.s, () => {
            this.s.$parent.progress = Math.round(progressObj["stats"])
        })
    }

    abort() {
        this.ignoreAbort = false
        return this.proxy.abort()
    }

    getResultTabs() {
        return $(".result_tabs > ul").scope().tabset.tabs
    }

    getActiveResultTab() {
        return $(".result_tabs").scope().activeTab
    }

    renderResult(data) {
        this.$result.find(".error_msg").remove()
        if (data.ERROR) {
            safeApply(this.s, () => {
                return this.firstResultDef.reject()
            })

            this.resultError(data)
            return false
        } else {
            return safeApply(this.s, () => {
                this.firstResultDef.resolve()
                this.hasData = true
            })
        }
    }

    resultError(data) {
        c.error("json fetch error: ", data)
        this.hidePreloader()
        this.resetView()
        return $(`<object class="korp_fail" type="image/svg+xml" data="${korpFailImg}">`)
            .append(`<img class='korp_fail' src='${korpFailImg}'>`)
            .add($("<div class='fail_text'></div>").localeKey("fail_text"))
            .addClass("inline_block")
            .prependTo(this.$result)
            .wrapAll("<div class='error_msg'>")
    }

    showPreloader() {
        this.s.$parent.loading = true
    }

    hidePreloader() {
        this.s.$parent.loading = false
    }

    resetView() {
        this.hasData = false
        return this.$result.find(".error_msg").remove()
    }

    countCorpora() {
        return this.proxy.prevParams && this.proxy.prevParams.corpus.split(",").length
    }

    onentry() {
        this.s.$root.jsonUrl = null
        this.firstResultDef.promise.then(() => {
            const prevUrl = this.proxy && this.proxy.prevUrl
            this.s.$apply(($scope) => ($scope.$root.jsonUrl = prevUrl))
        })
    }

    onexit() {
        this.s.$root.jsonUrl = null
    }

    isActive() {
        return this.getActiveResultTab() === this.tabindex
    }
}
