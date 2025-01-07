/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { Histogram } from "@/backend/types"
import { ajaxConfAddMethod, Factory } from "@/util"
import { AjaxSettings } from "@/jquery.types"
import { TimespanParams, TimespanResponse } from "./types/timespan"

/** Data returned after slight mangling. */
type TimeData = [
    Record<string, Histogram>, // Same as KorpTimespanResponse.corpora
    [number, number][], // Tokens per time period, as pairs ordered by time period
    number // Tokens in undated material
]

export class TimeProxy extends BaseProxy<"timespan"> {
    makeRequest(): JQueryDeferred<TimeData> {
        const data: TimespanParams = {
            granularity: "y",
            corpus: settings.corpusListing.stringifyAll(),
        }

        const dfd = $.Deferred()
        const ajaxSettings = {
            url: settings.korp_backend_url + "/timespan",
            data,
        } satisfies AjaxSettings
        const xhr = $.ajax(ajaxConfAddMethod(ajaxSettings)) as JQuery.jqXHR<TimespanResponse>

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
        let output: [number, number][] = []
        $.each(dataStruct, function (key, val) {
            if (!key || !val) {
                return
            }
            return output.push([parseInt(key), val])
        })

        output = output.sort((a, b) => a[0] - b[0])
        return output
    }

    /** Add each missing year with the previous year's value */
    expandTimeStruct(struct: Histogram): void {
        const years = Object.keys(struct)
            .filter((key) => key !== "")
            .map(Number)
        if (!years.length) return

        const minYear = Math.min(...years)
        const maxYear = Math.max(...years)

        if (_.isNaN(maxYear) || _.isNaN(minYear)) {
            console.log("expandTimestruct broken, years:", years)
            return
        }

        let prevCount = struct[`${minYear}`]
        for (const year of _.range(minYear, maxYear)) {
            if (struct[`${year}`] == undefined) struct[`${year}`] = prevCount
            else prevCount = struct[`${year}`]
        }
    }
}

const timeProxyFactory = new Factory(TimeProxy)
export default timeProxyFactory
