/** @format */
"use strict"
import jStorage from "../lib/jstorage"
window.model = {}

model.normalizeStatsData = function (data) {
    if (!_.isArray(data.combined)) {
        data.combined = [data.combined]
    }

    for (let [corpusID, obj] of _.toPairs(data.corpora)) {
        if (!_.isArray(obj)) {
            data.corpora[corpusID] = [obj]
        }
    }
}

class BaseProxy {
    constructor() {
        this.prev = ""
        this.chunkCache = ""
        this.progress = 0
        this.total = null
        this.total_results = 0
        this.pendingRequests = []
    }

    expandCQP(cqp) {
        try {
            return CQP.expandOperators(cqp)
        } catch (e) {
            c.warn("CQP expansion failed", cqp, e)
            return cqp
        }
    }

    makeRequest() {
        this.abort()
        this.prev = ""
        this.chunkCache = ""
        this.progress = 0
        this.total_results = 0
        this.total = null
    }

    // Return a URL with baseUrl base and data encoded as URL parameters.
    // If baseUrl already contains URL parameters, return it as is.
    //
    // Note that this function is now largely redundant: when called
    // for GET URLs already containing URL parameters, it does
    // nothing, whereas the GET URL returned by it for a POST URL
    // typically results in an "URI too long" error, if
    // settings.backendURLMaxLength is configured appropriately for
    // the Web server on which the backend runs.
    makeUrlWithParams(baseUrl, data) {
        if (baseUrl.indexOf("?") != -1) {
            return baseUrl
        }
        return (
            baseUrl +
            "?" +
            _.toPairs(data)
                .map(function ([key, val]) {
                    val = encodeURIComponent(val)
                    return key + "=" + val
                })
                .join("&")
        )
    }

    abort() {
        if (this.pendingRequests.length) {
            return _.invokeMap(this.pendingRequests, "abort")
        }
        this.cleanup()
    }

    cleanup() {
        this.prev = ""
    }

    hasPending() {
        return _.some(_.map(this.pendingRequests, (req) => req.readyState !== 4 && req.readyState !== 0))
    }

    parseJSON(data) {
        try {
            let json = data
            if (json[0] !== "{") {
                json = `{${json}`
            }
            if (json.match(/,\s*$/)) {
                json = json.replace(/,\s*$/, "") + "}"
            }
            const out = JSON.parse(json)
            return out
        } catch (e) {
            return JSON.parse(data)
        }
    }

    addAuthorizationHeader(req) {
        const pairs = _.toPairs(authenticationProxy.getAuthorizationHeader())
        if (pairs.length) {
            return req.setRequestHeader(...(pairs[0] || []))
        }
    }

    calcProgress(e) {
        const newText = e.target.responseText.slice(this.prev.length)
        let struct = {}

        try {
            // try to parse a chunk from the progress object
            // combined with previous chunks that were not parseable
            struct = this.parseJSON(this.chunkCache + newText)
            // if parse succceeds, we don't care about the content of previous progress events anymore
            this.chunkCache = ""
        } catch (error) {
            // if we fail to parse a chunk, combine it with previous failed chunks
            this.chunkCache += newText
        }

        $.each(struct, (key, val) => {
            if (key !== "progress_corpora" && key.split("_")[0] === "progress") {
                const currentCorpus = val.corpus || val
                const sum = _(currentCorpus.split("|"))
                    .map((corpus) => Number(settings.corpora[corpus.toLowerCase()].info.Size))
                    .reduce((a, b) => a + b, 0)
                this.progress += sum
                this.total_results += parseInt(val.hits)
            }
        })

        const stats = (this.progress / this.total) * 100

        if (this.total == null && struct.progress_corpora && struct.progress_corpora.length) {
            const tmp = $.map(struct["progress_corpora"], function (corpus) {
                if (!corpus.length) {
                    return
                }

                return _(corpus.split("|"))
                    .map((corpus) => parseInt(settings.corpora[corpus.toLowerCase()].info.Size))
                    .reduce((a, b) => a + b, 0)
            })
            this.total = _.reduce(tmp, (val1, val2) => val1 + val2, 0)
        }

        this.prev = e.target.responseText
        return {
            struct,
            stats,
            total_results: this.total_results,
        }
    }
}

model.KWICProxy = class KWICProxy extends BaseProxy {
    constructor() {
        super()
        this.prevRequest = null
        this.queryData = null
        this.prevAjaxParams = null
        this.foundKwic = false
    }

    makeRequest(options, page, progressCallback, kwicCallback) {
        const self = this
        this.foundKwic = false
        super.makeRequest()
        if (!kwicCallback) {
            console.error("No callback for query result")
            return
        }
        self.progress = 0
        var progressObj = {
            progress(data, e) {
                progressObj = self.calcProgress(e)
                if (progressObj == null) {
                    return
                }

                progressCallback(progressObj)
                if (progressObj["struct"].kwic) {
                    this.foundKwic = true
                    return kwicCallback(progressObj["struct"])
                }
            },
        }

        if (!options.ajaxParams.within) {
            _.extend(options.ajaxParams, settings.corpusListing.getWithinParameters())
        }

        const data = {
            default_context: settings["default_overview_context"],
            show: [],
            show_struct: [],
        }

        function getPageInterval(page) {
            const hpp = locationSearch().hpp
            const itemsPerPage = Number(hpp) || settings["hits_per_page_default"]
            page = Number(page)
            const output = {}
            output.start = (page || 0) * itemsPerPage
            output.end = output.start + itemsPerPage - 1
            return output
        }

        $.extend(data, getPageInterval(page), options.ajaxParams)
        for (let corpus of settings.corpusListing.selected) {
            for (let key in corpus.within) {
                // val = corpus.within[key]
                data.show.push(_.last(key.split(" ")))
            }
            for (let key in corpus.attributes) {
                // val = corpus.attributes[key]
                data.show.push(key)
            }

            if (corpus["struct_attributes"] != null) {
                $.each(corpus["struct_attributes"], function (key, val) {
                    if ($.inArray(key, data.show_struct) === -1) {
                        return data.show_struct.push(key)
                    }
                })
                if (corpus["reading_mode"]) {
                    data.show_struct.push("text__id")
                }
            }
        }

        if (data.cqp) {
            data.cqp = this.expandCQP(data.cqp)
        }
        this.prevCQP = data.cqp
        data.show = _.uniq(["sentence"].concat(data.show)).join(",")
        data.show_struct = _.uniq(data.show_struct).join(",")

        if (locationSearch()["in_order"] != null) {
            data.in_order = false
        }

        this.prevRequest = data
        this.prevParams = data
        const command = data.command || "query"
        delete data.command
        const def = $.ajax(
            util.httpConfAddMethod({
                url: settings["korp_backend_url"] + "/" + command,
                data,
                beforeSend(req, settings) {
                    self.prevRequest = settings
                    self.addAuthorizationHeader(req)
                    self.prevUrl = self.makeUrlWithParams(this.url, data)
                },

                success(data, status, jqxhr) {
                    self.queryData = data.query_data
                    self.cleanup()
                    if (data.incremental === false || !this.foundKwic) {
                        return kwicCallback(data)
                    }
                },

                progress: progressObj.progress,
            })
        )
        this.pendingRequests.push(def)
        return def
    }
}

model.LemgramProxy = class LemgramProxy extends BaseProxy {
    makeRequest(word, type, callback) {
        super.makeRequest()
        const self = this
        const params = {
            word,
            corpus: settings.corpusListing.stringifySelected(),
            incremental: true,
            type,
            max: 1000,
        }
        this.prevParams = params
        const def = $.ajax(
            util.httpConfAddMethod({
                url: settings["korp_backend_url"] + "/relations",
                data: params,

                success() {
                    self.prevRequest = params
                    self.cleanup()
                },

                progress(data, e) {
                    const progressObj = self.calcProgress(e)
                    if (progressObj == null) {
                        return
                    }
                    return callback(progressObj)
                },

                beforeSend(req, settings) {
                    self.prevRequest = settings
                    self.addAuthorizationHeader(req)
                    self.prevUrl = self.makeUrlWithParams(this.url, params)
                },
            })
        )
        this.pendingRequests.push(def)
        return def
    }
}

model.StatsProxy = class StatsProxy extends BaseProxy {
    constructor() {
        super()
        this.prevRequest = null
        this.prevParams = null
    }

    makeParameters(reduceVals, cqp, ignoreCase) {
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        const groupBy = []
        const groupByStruct = []
        for (let reduceVal of reduceVals) {
            if (
                structAttrs[reduceVal] &&
                (structAttrs[reduceVal]["group_by"] || "group_by_struct") == "group_by_struct"
            ) {
                groupByStruct.push(reduceVal)
            } else {
                groupBy.push(reduceVal)
            }
        }
        const parameters = {
            group_by: groupBy.join(","),
            group_by_struct: groupByStruct.join(","),
            cqp: this.expandCQP(cqp),
            corpus: settings.corpusListing.stringifySelected(true),
            incremental: true,
        }
        _.extend(parameters, settings.corpusListing.getWithinParameters())
        if (ignoreCase) {
            _.extend(parameters, { ignore_case: "word" })
        }
        return parameters
    }

    makeRequest(cqp, callback) {
        const self = this
        super.makeRequest()
        const reduceval = locationSearch().stats_reduce || "word"
        const reduceVals = reduceval.split(",")

        const ignoreCase = locationSearch().stats_reduce_insensitive != null

        const reduceValLabels = _.map(reduceVals, function (reduceVal) {
            if (reduceVal === "word") {
                return settings["word_label"]
            }
            const maybeReduceAttr = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())[
                reduceVal
            ]
            if (maybeReduceAttr) {
                return maybeReduceAttr.label
            } else {
                return settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())[reduceVal].label
            }
        })

        const data = this.makeParameters(reduceVals, cqp, ignoreCase)
        // this is needed so that the statistics view will know what the original LINKED corpora was in parallel
        const originalCorpora = settings.corpusListing.stringifySelected(false)

        const wordAttrs = settings.corpusListing.getCurrentAttributes(settings.corpusListing.getReduceLang())
        const structAttrs = settings.corpusListing.getStructAttrs(settings.corpusListing.getReduceLang())
        data.split = _.filter(reduceVals, (reduceVal) => {
            return (
                (wordAttrs[reduceVal] && wordAttrs[reduceVal].type == "set") ||
                (structAttrs[reduceVal] && structAttrs[reduceVal].type == "set")
            )
        }).join(",")

        const rankedReduceVals = _.filter(reduceVals, (reduceVal) => {
            if (wordAttrs[reduceVal]) {
                return wordAttrs[reduceVal].ranked
            }
        })
        data.top = _.map(rankedReduceVals, (reduceVal) => reduceVal + ":1").join(",")

        this.prevNonExpandedCQP = cqp
        this.prevParams = data
        const def = $.Deferred()
        this.pendingRequests.push(
            $.ajax(
                util.httpConfAddMethod({
                    url: settings["korp_backend_url"] + "/count",
                    data,
                    beforeSend(req, settings) {
                        self.prevRequest = settings
                        self.addAuthorizationHeader(req)
                        self.prevUrl = self.makeUrlWithParams(this.url, data)
                    },

                    error(jqXHR, textStatus, errorThrown) {
                        c.log(`gettings stats error, status: ${textStatus}`)
                        return def.reject(textStatus, errorThrown)
                    },

                    progress(data, e) {
                        const progressObj = self.calcProgress(e)
                        if (progressObj == null) {
                            return
                        }
                        if (typeof callback === "function") {
                            callback(progressObj)
                        }
                    },

                    success: (data) => {
                        self.cleanup()
                        if (data.ERROR != null) {
                            c.log("gettings stats failed with error", data.ERROR)
                            def.reject(data)
                            return
                        }
                        model.normalizeStatsData(data)
                        statisticsService.processData(
                            def,
                            originalCorpora,
                            data,
                            reduceVals,
                            reduceValLabels,
                            ignoreCase
                        )
                    },
                })
            )
        )

        return def.promise()
    }
}

model.TimeProxy = class TimeProxy extends BaseProxy {
    makeRequest() {
        const dfd = $.Deferred()

        const xhr = $.ajax(
            util.httpConfAddMethod({
                url: settings["korp_backend_url"] + "/timespan",
                data: {
                    granularity: "y",
                    corpus: settings.corpusListing.stringifyAll(),
                },
            })
        )

        xhr.done((data) => {
            if (data.ERROR) {
                c.error("timespan error", data.ERROR)
                dfd.reject(data.ERROR)
                return
            }

            const rest = data.combined[""]
            delete data.combined[""]

            this.expandTimeStruct(data.combined)
            const combined = this.compilePlotArray(data.combined)

            if (_.keys(data).length < 2 || data.ERROR) {
                dfd.reject()
                return
            }

            return dfd.resolve([data.corpora, combined, rest])
        })

        xhr.fail(function () {
            c.log("timeProxy.makeRequest failed", arguments)
            return dfd.reject()
        })

        return dfd
    }

    compilePlotArray(dataStruct) {
        let output = []
        $.each(dataStruct, function (key, val) {
            if (!key || !val) {
                return
            }
            return output.push([parseInt(key), val])
        })

        output = output.sort((a, b) => a[0] - b[0])
        return output
    }

    expandTimeStruct(struct) {
        const years = _.map(_.toPairs(_.omit(struct, "")), (item) => Number(item[0]))
        if (!years.length) {
            return
        }
        const minYear = _.min(years)
        const maxYear = _.max(years)

        if (_.isNaN(maxYear) || _.isNaN(minYear)) {
            c.log("expandTimestruct broken, years:", years)
            return
        }

        let prevVal = null
        for (let y of _.range(minYear, maxYear + 1)) {
            let thisVal = struct[y]
            if (typeof thisVal == "undefined") {
                struct[y] = prevVal
            } else {
                prevVal = thisVal
            }
        }
    }
}

model.GraphProxy = class GraphProxy extends BaseProxy {
    constructor() {
        super()
        this.prevParams = null
    }

    expandSubCqps(subArray) {
        const padding = _.fill(new Array(subArray.length.toString().length), "0")
        const result = []
        for (let i = 0; i < subArray.length; i++) {
            const cqp = subArray[i]
            const p = padding.slice(i.toString().length).join("")
            result.push([`subcqp${p}${i}`, cqp])
        }
        return _.fromPairs(result)
    }

    makeRequest(cqp, subcqps, corpora, from, to) {
        super.makeRequest()
        const self = this
        const params = {
            cqp: this.expandCQP(cqp),
            corpus: corpora,
            granularity: this.granularity,
            incremental: true,
            per_corpus: false,
        }

        if (from) {
            params.from = from
        }
        if (to) {
            params.to = to
        }

        // TODO: fix this for struct attrs
        _.extend(params, this.expandSubCqps(subcqps))
        this.prevParams = params
        const def = $.Deferred()

        $.ajax(
            util.httpConfAddMethod({
                url: settings["korp_backend_url"] + "/count_time",
                dataType: "json",
                data: params,

                beforeSend: (req, settings) => {
                    this.prevRequest = settings
                    this.addAuthorizationHeader(req)
                },

                progress: (data, e) => {
                    const progressObj = this.calcProgress(e)
                    if (progressObj == null) {
                        return
                    }
                    def.notify(progressObj)
                },

                error(jqXHR, textStatus, errorThrown) {
                    def.reject(textStatus)
                },
                success(data) {
                    def.resolve(data)
                    self.cleanup()
                },
            })
        )

        return def.promise()
    }
}
