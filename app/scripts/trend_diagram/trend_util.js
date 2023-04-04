/** @format */
export function getTimeCQP(time, zoom, n_tokens, coarseGranularity) {
    let timecqp
    const m = moment(time * 1000)

    const datefrom = moment(m).startOf(zoom).format("YYYYMMDD")
    const dateto = moment(m).endOf(zoom).format("YYYYMMDD")

    /**
     * Create an expression that matches all tokens that have their from and to time data *inside* the interval
     * Or have *both* from date/time and to date/time *outside* the interval
     */

    if (coarseGranularity) {
        // year, month, day
        timecqp = `[(int(_.text_datefrom) >= ${datefrom} & int(_.text_dateto) <= ${dateto}) |
                    (int(_.text_datefrom) <= ${datefrom} & int(_.text_dateto) >= ${dateto})
                    ]`
    } else {
        // hour, minute, second
        const timefrom = moment(m).startOf(zoom).format("HHmmss")
        const timeto = moment(m).endOf(zoom).format("HHmmss")
        timecqp = `[(int(_.text_datefrom) = ${datefrom} &
                        int(_.text_timefrom) >= ${timefrom} &
                        int(_.text_dateto) <= ${dateto} &
                        int(_.text_timeto) <= ${timeto}) |
                    ((int(_.text_datefrom) < ${datefrom} |
                        (int(_.text_datefrom) = ${datefrom} & int(_.text_timefrom) <= ${timefrom})
                    ) &
                        (int(_.text_dateto) > ${dateto} |
                        (int(_.text_dateto) = ${dateto} & int(_.text_timeto) >= ${timeto})
                    ))]`
    }

    timecqp = [timecqp].concat(_.map(_.range(0, n_tokens), () => "[]")).join(" ")
    return timecqp
}

export function parseDate(zoom, time) {
    switch (zoom) {
        case "year":
            return moment(time, "YYYY")
        case "month":
            return moment(time, "YYYYMM")
        case "day":
            return moment(time, "YYYYMMDD")
        case "hour":
            return moment(time, "YYYYMMDDHH")
        case "minute":
            return moment(time, "YYYYMMDDHHmm")
        case "second":
            return moment(time, "YYYYMMDDHHmmss")
    }
}

export function formatUnixDate(zoom, time) {
    // TODO this should respect locale and could present whole months as August 2020 instead of 2020-08
    const m = moment.unix(String(time))
    switch (zoom) {
        case "year":
            return m.format("YYYY")
        case "month":
            return m.format("YYYY-MM")
        case "day":
            return m.format("YYYY-MM-DD")
        case "hour":
            return m.format("YYYY-MM-DD HH:00")
        case "minute":
            return m.format("YYYY-MM-DD HH:mm")
        case "second":
            return m.format("YYYY-MM-DD HH:mm:ss")
    }
}
