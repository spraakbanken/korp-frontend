/** @format */
"use strict"
import _ from "lodash"
import settings from "@/settings"
import { angularLocationSearch, httpConfAddMethod } from "@/util"
import { statisticsService } from "@/statistics"
import BaseProxy from "@/korp-api/base-proxy"
import KwicProxy from "@/korp-api/kwic-proxy"

const model = {}
export default model

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

model.KwicProxy = KwicProxy

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
            httpConfAddMethod({
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
        const reduceval = angularLocationSearch().stats_reduce || "word"
        const reduceVals = reduceval.split(",")

        const ignoreCase = angularLocationSearch().stats_reduce_insensitive != null

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

        this.prevParams = data
        const def = $.Deferred()
        this.pendingRequests.push(
            $.ajax(
                httpConfAddMethod({
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
                            ignoreCase,
                            cqp
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
            httpConfAddMethod({
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
            httpConfAddMethod({
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
