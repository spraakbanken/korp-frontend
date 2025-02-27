/** @format */
import _ from "lodash"
import settings from "@/settings"
import BaseProxy from "@/backend/base-proxy"
import type { Histogram } from "@/backend/types"
import { Factory } from "@/util"
import { TimespanParams } from "./types/timespan"
import { korpRequest } from "./common"

/** Data returned after slight mangling. */
type TimeData = [
    Record<string, Histogram>, // Same as KorpTimespanResponse.corpora
    [number, number][], // Tokens per time period, as pairs ordered by time period
    number // Tokens in undated material
]

export class TimeProxy extends BaseProxy {
    async makeRequest(): Promise<TimeData> {
        const params: TimespanParams = {
            granularity: "y",
            corpus: settings.corpusListing.stringifyAll(),
        }

        const data = await korpRequest("timespan", params)

        const rest = data.combined[""] || 0
        delete data.combined[""]

        this.expandTimeStruct(data.combined)
        const combined = this.compilePlotArray(data.combined)

        return [data.corpora, combined, rest]
    }

    compilePlotArray(dataStruct: Histogram) {
        let output: [number, number][] = []
        $.each(dataStruct, function (key, val) {
            if (!key || !val) return
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
