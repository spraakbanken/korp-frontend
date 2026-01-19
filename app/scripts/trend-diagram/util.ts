import { Granularity, Histogram } from "@/backend/types"
import { loc } from "@/i18n"
import { maxBy, minBy, range, sortedIndexOf } from "lodash"
import moment, { Moment } from "moment"

export type Series = {
    data: SeriesPoint[]
    abs_data: SeriesPoint[]
    color: string
    name: string
    cqp: string
    emptyIntervals?: SeriesPoint[][]
}

type Point = { x: Moment; y: number }

export type SeriesPoint = {
    /** Unix timestamp */
    x: number
    y: number
    zoom: Level
}

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

export const PALETTE = [
    "#ca472f",
    "#0b84a5",
    "#f6c85f",
    "#9dd866",
    "#ffa056",
    "#8dddd0",
    "#df9eaa",
    "#6f4e7c",
    "#544e4d",
    "#0e6e16",
    "#975686",
]

/** Find a date granularity level that gives a good number of time units in a given range. */
export function findOptimalLevel(from: Moment, to: Moment): Level {
    // Preferred number of x points in a graph (less is uninformative, more is messy)
    const idealPoints = 1000
    // Find what granularity (years, months etc) gives us closest to the ideal number of points
    // E.g. between 1900 and 2000, use months.
    return minBy(LEVELS, (level) => {
        const points = to.diff(from, level)
        return Math.abs(idealPoints - points)
    })!
}

/** Transform a count-by-date map to a range-covering, sorted list of points. */
export function getSeriesData(data: Histogram, zoom: Level): SeriesPoint[] {
    delete data[""]
    const points: Point[] = Object.entries(data).map(([date, y]) => ({ x: parseDate(zoom, date), y }))
    const pointsFilled = fillMissingDate(points, zoom)
    const output: SeriesPoint[] = pointsFilled.map((point) => ({
        x: point.x.unix(),
        y: point.y,
        zoom,
    }))
    output.sort((a, b) => a.x - b.x)
    return output
}

/** Fill missing time units with the value of the last previous count. Result is not sorted. */
export function fillMissingDate(data: Point[], level: Level): Point[] {
    const dateArray = data.map((point) => point.x)
    // Round range boundaries, e.g. [June 5, Sep 18] => [June 1, Sep 30]
    const min = minBy(dateArray)?.startOf(level)
    const max = maxBy(dateArray)?.endOf(level)
    if (!min || !max) return data

    // Number of time units between min and max
    const n_diff = moment(max).diff(min, level)

    // Create a mapping from unix timestamps to counts
    const momentMapping: Record<number, number> = Object.fromEntries(
        data.map((point) => [point.x.startOf(level).unix(), point.y]),
    )

    // Step through the range and fill in missing timestamps
    /** Copied counts for unseen timestamps in the range */
    const newMoments: Point[] = []
    let lastYVal: number = 0
    for (const i of range(0, n_diff + 1)) {
        // Get timestamp at current iteration step
        const newMoment = moment(min).add(i, level)
        const count = momentMapping[newMoment.unix()]
        // If this timestamp has been counted, don't fill this timestamp but remember the count
        // Distinguish between null (no text at timestamp) and undefined (timestamp has not been counted)
        if (count !== undefined) lastYVal = count
        // If there's no count here, fill this timestamp with the last seen count
        else newMoments.push({ x: newMoment, y: lastYVal })
    }

    // Merge actual counts with filled ones
    return [...data, ...newMoments]
}

/** Find intervals within the full timespan where no material is dated. */
export function getEmptyIntervals(data: SeriesPoint[]): SeriesPoint[][] {
    const intervals: SeriesPoint[][] = []
    let i = 0

    // TODO Last point is always (?) null, so we'll get a pointless empty interval at the end. Shouldn't we remove the empty last point?
    while (i < data.length) {
        let item = data[i]

        if (item.y === null) {
            const interval = [{ ...item }]
            let breaker = true
            while (breaker) {
                i++
                item = data[i]
                if ((item != null ? item.y : undefined) === null) {
                    interval.push({ ...item })
                } else {
                    intervals.push(interval)
                    breaker = false
                }
            }
        }
        i++
    }

    return intervals
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
    timecqp = `<match> ${timecqp} []{0,} </match>`
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

export function createTrendTableCsv(series: Series[], relative: boolean): (string | number)[][] {
    // Create header row
    const formatHeader = (cell: SeriesPoint): string => moment(cell.x * 1000).format(FORMATS[cell.zoom])
    const dateHeaders = series[0].data.map(formatHeader)
    const header = [loc("stats_hit"), ...dateHeaders]

    // Create data rows
    const formatCell = (row: Series, cell: SeriesPoint): number => {
        if (relative) return cell.y
        else {
            const i = sortedIndexOf(
                row.abs_data.map((point) => point.x),
                cell.x,
            )
            return row.abs_data[i].y
        }
    }
    const data = series.map((row) => [row.name, ...row.data.map((cell) => formatCell(row, cell))])

    return [header, ...data]
}
