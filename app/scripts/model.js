/** @format */
"use strict"
import _ from "lodash"
import settings from "@/settings"
import { httpConfAddMethod } from "@/util"
import BaseProxy from "@/korp-api/base-proxy"
import KwicProxy from "@/korp-api/kwic-proxy"
import LemgramProxy from "@/korp-api/lemgram-proxy"
import StatsProxy from "@/korp-api/stats-proxy"
import TimeProxy from "@/korp-api/time-proxy"

const model = {}
export default model

model.KwicProxy = KwicProxy

model.LemgramProxy = LemgramProxy

model.StatsProxy = StatsProxy

model.TimeProxy = TimeProxy

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
