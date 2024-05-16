/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy, { AjaxSettings, KorpResponse } from "@/korp-api/base-proxy"
import { httpConfAddMethod } from "@/util"

export default class TimeProxy extends BaseProxy {
    makeRequest() {
        const data: KorpTimespanParams = {
            granularity: "y",
            corpus: settings.corpusListing.stringifyAll(),
        }

        const dfd = $.Deferred()
        const ajaxSettings: AjaxSettings = {
            url: settings["korp_backend_url"] + "/timespan",
            data,
        }
        const xhr = $.ajax(httpConfAddMethod(ajaxSettings)) as JQuery.jqXHR<KorpTimespanResponse>

        xhr.done((data) => {
            if ("ERROR" in data) {
                console.error("timespan error", data.ERROR)
                dfd.reject(data.ERROR)
                return
            }

            const rest = data.combined[""]
            delete data.combined[""]

            this.expandTimeStruct(data.combined)
            const combined = this.compilePlotArray(data.combined)

            if (_.keys(data).length < 2) {
                dfd.reject()
                return
            }

            return dfd.resolve([data.corpora, combined, rest])
        })

        xhr.fail(function () {
            console.log("timeProxy.makeRequest failed", arguments)
            return dfd.reject()
        })

        return dfd
    }

    compilePlotArray(dataStruct: Histogram) {
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

    expandTimeStruct(struct: Histogram) {
        const years = _.map(_.toPairs(_.omit(struct, "")), (item) => Number(item[0]))
        if (!years.length) {
            return
        }
        const minYear = _.min(years)
        const maxYear = _.max(years)

        if (_.isNaN(maxYear) || _.isNaN(minYear)) {
            console.log("expandTimestruct broken, years:", years)
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

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1timespan/get */
type KorpTimespanParams = {
    corpus: string
    granularity?: "y" | "m" | "d" | "h" | "n" | "s"
    from?: `${number}`
    to?: `${number}`
    strategy?: 1 | 2 | 3
    per_corpus?: boolean
    combined?: boolean
    incremental?: boolean
}

/** @see https://ws.spraakbanken.gu.se/docs/korp#tag/Statistics/paths/~1timespan/get */
type KorpTimespanResponse = KorpResponse<{
    /** An object with corpus names as keys and time statistics objects as values */
    corpora: Record<string, Histogram>
    /** Number of tokens per time period */
    combined: Histogram
    /** Execution time in seconds */
    time: number
}>

type NumericString = `${number}`
type Histogram = Record<NumericString | "", number>
