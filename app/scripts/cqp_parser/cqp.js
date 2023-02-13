/** @format */
const parseDateInterval = function (op, val, expanded_format) {
    let out
    val = _.invokeMap(val, "toString")
    if (!expanded_format) {
        return `$date_interval ${op} '${val.join(",")}'`
    }

    const [fromdate, todate, fromtime, totime] = val

    const m_from = moment(fromdate, "YYYYMMDD")
    const m_to = moment(todate, "YYYYMMDD")

    const fieldMapping = {
        text_datefrom: fromdate,
        text_dateto: todate,
        text_timefrom: fromtime,
        text_timeto: totime,
    }

    op = function (field, operator, valfield) {
        val = valfield ? fieldMapping[valfield] : fieldMapping[field]
        return `int(_.${field}) ${operator} ${val}`
    }

    const days_diff = m_from.diff(m_to, "days")

    if (days_diff === 0) {
        // same day
        out = `${op("text_datefrom", "=")} & ${op("text_timefrom", ">=")} & ${op("text_dateto", "=")} & ${op(
            "text_timeto",
            "<="
        )}`
    } else if (days_diff === -1) {
        // one day apart
        out = `((${op("text_datefrom", "=")} & ${op("text_timefrom", ">=")}) | ${op(
            "text_datefrom",
            "=",
            "text_dateto"
        )}) & (${op("text_dateto", "=", "text_datefrom")} | (${op("text_dateto", "=")} & ${op("text_timeto", "<=")}))`
    } else {
        out = `((${op("text_datefrom", "=")} & ${op("text_timefrom", ">=")}) | (${op("text_datefrom", ">")} & ${op(
            "text_datefrom",
            "<=",
            "text_dateto"
        )})) & (${op("text_dateto", "<")} | (${op("text_dateto", "=")} & ${op("text_timeto", "<=")}))`
    }

    out = out.replace(/\s+/g, " ")

    if (!fromdate || !todate) {
        out = ""
    }

    return out
}

const stringifyCqp = function (cqp_obj, expanded_format) {
    if (expanded_format == null) {
        expanded_format = false
    }
    const output = []
    cqp_obj = CQP.prioSort(_.cloneDeep(cqp_obj))

    for (let token of cqp_obj) {
        if (typeof token === "string") {
            output.push(token)
            continue
        }

        if (token.struct) {
            output.push(`<${token.start ? "" : "/"}${token.struct}>`)
            continue
        }

        const outer_and_array = []
        for (let and_array of token.and_block) {
            const or_array = []
            for (let { type, op, val, flags } of and_array) {
                var out
                if (expanded_format) {
                    ;[val, op] = {
                        "^=": [val + ".*", "="],
                        "_=": [`.*${val}.*`, "="],
                        "&=": [`.*${val}`, "="],
                        "*=": [val, "="],
                        "!*=": [val, "!="],
                        rank_contains: [val + ":.*", "contains"],
                        not_rank_contains: [val + ":.*", "not contains"],
                        highest_rank: [`\\|${val}:.*`, "="],
                        not_highest_rank: [`\\|${val}:.*`, "!="],
                        regexp_contains: [val, "contains"],
                        not_regexp_contains: [val, "not contains"],
                        starts_with_contains: [`${val}.*`, "contains"],
                        not_starts_with_contains: [`${val}.*`, "not contains"],
                        incontains_contains: [`.*?${val}.*`, "contains"],
                        not_incontains_contains: [`.*${val}.*`, "not contains"],
                        ends_with_contains: [`.*${val}`, "contains"],
                        not_ends_with_contains: [`.*${val}`, "not contains"],
                    }[op] || [val, op]
                }

                let flagstr = ""
                if (flags && _.keys(flags).length) {
                    flagstr = ` %${_.keys(flags).join("")}`
                }

                if (type === "word" && val === "") {
                    out = ""
                } else if (settings.corpusListing.isDateInterval(type)) {
                    out = parseDateInterval(op, val, expanded_format)
                } else {
                    out = `${type} ${op} \"${val}\"`
                }

                if (out) {
                    or_array.push(out + flagstr)
                }
            }
            if (!_.isEmpty(or_array)) {
                outer_and_array.push(or_array)
            }
        }

        let or_out = outer_and_array.map((x) => (x.length > 1 ? `(${x.join(" | ")})` : x.join(" | ")))

        if (token.bound) {
            or_out = _.compact(or_out)
            for (let bound of _.keys(token.bound)) {
                or_out.push(`${bound}(sentence)`)
            }
        }

        let out_token = `[${or_out.join(" & ")}]`
        if (token.repeat) {
            out_token += `{${token.repeat.length > 1 ? token.repeat.join(",") : token.repeat + ","}}`
        }

        output.push(out_token)
    }

    return output.join(" ")
}

window.CQP = {
    parse: function () {
        return CQPParser.parse(...arguments)
    },

    stringify: stringifyCqp,

    expandOperators(cqpstr) {
        return CQP.stringify(CQP.parse(cqpstr), true)
    },

    getTimeInterval(obj) {
        let from = []
        let to = []
        for (let token of obj) {
            for (let or_block of token.and_block) {
                for (let item of or_block) {
                    if (item.type === "date_interval") {
                        from.push(moment(`${item.val[0]}${item.val[2]}`, "YYYYMMDDhhmmss"))
                        to.push(moment(`${item.val[1]}${item.val[3]}`, "YYYYMMDDhhmmss"))
                    }
                }
            }
        }

        if (!from.length) {
            return
        }
        from = _.minBy(from, (mom) => mom.toDate())
        to = _.maxBy(to, (mom) => mom.toDate())

        return [from, to]
    },

    prioSort(cqpObjs) {
        const getPrio = function (and_array) {
            const numbers = _.map(and_array, (item) => _.indexOf(settings["cqp_prio"], item.type))
            return Math.min(...(numbers || []))
        }

        for (let token of cqpObjs) {
            token.and_block = _.sortBy(token.and_block, getPrio).reverse()
        }

        return cqpObjs
    },

    // assume cqpObj2 to contain fewer tokens than cqpObj1
    mergeCqpExprs(cqpObj1, cqpObj2) {
        for (let i = 0; i < cqpObj2.length; i++) {
            const token = cqpObj2[i]
            for (let j = 0; j < cqpObj1.length; j++) {
                if (cqpObj1[j].and_block) {
                    cqpObj1[j].and_block = cqpObj1[j].and_block.concat(token.and_block)
                    break
                }
            }
        }
        return cqpObj1
    },
}
