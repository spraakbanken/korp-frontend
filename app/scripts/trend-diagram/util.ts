/** @format */
import { Granularity } from "@/backend/types"
import moment from "moment"

export type Level = "year" | "month" | "day" | "hour" | "minute" | "second"

/**
 * Mapping from long to short form of granularities.
 * Moment uses the long form, and Korp API uses the short form.
 */
export const GRANULARITIES: Record<Level, Granularity> = {
    year: "y",
    month: "m",
    day: "d",
    hour: "h",
    minute: "n",
    second: "s",
}

/** Granularities by descending size order */
export const LEVELS: Level[] = ["year", "month", "day", "hour", "minute", "second"]

/** How to express dates of different granularities */
export const FORMATS: Record<Level, string> = {
    second: "YYYY-MM-DD hh:mm:ss",
    minute: "YYYY-MM-DD hh:mm",
    hour: "YYYY-MM-DD hh:00",
    day: "YYYY-MM-DD",
    month: "YYYY-MM",
    year: "YYYY",
}

/** Timestamps come from backend in these shapes */
const PARSE_FORMATS: Record<Level, string> = {
    second: "YYYYMMDDHHmmss",
    minute: "YYYYMMDDHHmm",
    hour: "YYYYMMDDHH",
    day: "YYYYMMDD",
    month: "YYYYMM",
    year: "YYYY",
}

export function getTimeCqp(timeUnix: number, zoom: Level, coarseGranularity?: boolean) {
    let timecqp: string
    const m = moment(timeUnix * 1000)

    const datefrom = moment(m).startOf(zoom).format("YYYYMMDD")
    const dateto = moment(m).endOf(zoom).format("YYYYMMDD")

    /**
     * Create an expression that matches all tokens that have their from and to time data *inside* the interval
     * Or have *both* from date/time and to date/time *outside* the interval
     */

    if (coarseGranularity) {
        // year, month, day
        const dateInside = `(int(_.text_datefrom) >= ${datefrom} & int(_.text_dateto) <= ${dateto})`
        const dateOutside = `(int(_.text_datefrom) <= ${datefrom} & int(_.text_dateto) >= ${dateto})`
        timecqp = `[${dateInside} | ${dateOutside}]`
    } else {
        // hour, minute, second
        const timefrom = moment(m).startOf(zoom).format("HHmmss")
        const timeto = moment(m).endOf(zoom).format("HHmmss")
        const startsSameDate = `(int(_.text_datefrom) = ${datefrom} & int(_.text_dateto) <= ${dateto})`
        const timeInside = `(int(_.text_timefrom) >= ${timefrom} & int(_.text_timeto) <= ${timeto})`
        const startsBefore = `(int(_.text_datefrom) < ${datefrom} | (int(_.text_datefrom) = ${datefrom} & int(_.text_timefrom) <= ${timefrom}))`
        const endsAfter = `(int(_.text_dateto) > ${dateto} | (int(_.text_dateto) = ${dateto} & int(_.text_timeto) >= ${timeto}))`
        timecqp = `[(${startsSameDate} & ${timeInside}) | (${startsBefore} & ${endsAfter})]`
    }

    // In case the main query matches multiple tokens, this subquery must only match the first token in the main match.
    timecqp = `<match> ${timecqp}`
    return timecqp
}

export function parseDate(zoom: Level, time: string) {
    return moment(time, PARSE_FORMATS[zoom])
}

export function formatUnixDate(zoom: Level, time: number) {
    // TODO this should respect locale and could present whole months as August 2020 instead of 2020-08
    const m = moment.unix(time)
    return m.format(FORMATS[zoom])
}
