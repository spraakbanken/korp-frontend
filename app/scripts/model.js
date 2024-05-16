/** @format */
"use strict"
import _ from "lodash"
import settings from "@/settings"
import { httpConfAddMethod } from "@/util"
import BaseProxy from "@/korp-api/base-proxy"
import KwicProxy from "@/korp-api/kwic-proxy"
import LemgramProxy from "./korp-api/lemgram-proxy"
import StatsProxy from "./korp-api/stats-proxy"

const model = {}
export default model

model.KwicProxy = KwicProxy

model.LemgramProxy = LemgramProxy

model.StatsProxy = StatsProxy

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
        this.resetRequest()
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
