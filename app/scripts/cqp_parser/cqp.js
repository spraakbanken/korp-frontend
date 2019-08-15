/* eslint-disable
    no-undef,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.c = console

const prio = settings.cqpPrio || ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word']


const parseDateInterval = function(op, val, expanded_format) {
    let out
    val = _.invokeMap(val, "toString")
    if (!expanded_format) {
        return `$date_interval ${op} '${val.join(",")}'`
    }

    const [fromdate, todate, fromtime, totime] = Array.from(val)

    const m_from = moment(fromdate, "YYYYMMDD")
    const m_to = moment(todate, "YYYYMMDD")

    const fieldMapping = {
        text_datefrom : fromdate,
        text_dateto : todate,
        text_timefrom : fromtime,
        text_timeto : totime
    }

    op = function(field, operator, valfield) {
        val = valfield ? fieldMapping[valfield] : fieldMapping[field]
        return `int(_.${field}) ${operator} ${val}`
    }


    const days_diff = m_from.diff(m_to, "days")
    c.log("days_diff", days_diff)

    if (days_diff === 0) {  // same day
        out = `${op('text_datefrom', '=')} & \
${op('text_timefrom', '>=')} & \
${op('text_dateto', '=')} & \
${op('text_timeto', '<=')}`

    } else if (days_diff === -1) { // one day apart
        out = `((${op('text_datefrom', '=')} & ${op('text_timefrom', '>=')}) | ${op('text_datefrom', '=', 'text_dateto')}) & \
(${op('text_dateto', '=', 'text_datefrom')} | (${op('text_dateto', '=')} & ${op('text_timeto', '<=')}))`


    } else {
        out = `((${op('text_datefrom', '=')} & ${op('text_timefrom', '>=')}) | \
(${op('text_datefrom', '>')} & ${op('text_datefrom', '<=', 'text_dateto')})) & \
(${op('text_dateto', '<')} | (${op('text_dateto', '=')} & ${op('text_timeto', '<=')}))`
    }


    out = out.replace(/\s+/g, " ")

    if (!fromdate || !todate) { out = "" }

    return out
}

const stringifyCqp = function(cqp_obj, expanded_format) {
    if (expanded_format == null) { expanded_format = false }
    const output = []
    cqp_obj = CQP.prioSort(_.cloneDeep(cqp_obj))

    for (let token of Array.from(cqp_obj)) {
        if (typeof token === "string") {
            output.push(token)
            continue
        }

        const outer_and_array = []
        for (let and_array of Array.from(token.and_block)) {
            const or_array = []
            for (let { type, op, val, flags } of Array.from(and_array)) {
                var out
                if (expanded_format) {
                    [val, op] = Array.from({
                        "^=" : [val + ".*", "="],
                        "_=" : [`.*${val}.*`, "="],
                        "&=" : [`.*${val}`, "="],
                        "*=" : [val, "="],
                        "!*=" : [val, "!="],
                        "rank_contains": [val + ":.*", "contains"],
                        "not_rank_contains": [val + ":.*", "not contains"],
                        "highest_rank" : [`\\|${val}:.*`, "="],
                        "not_highest_rank": [`\\|${val}:.*`, "!="]
                    }[op] || [val, op])
                }

                let flagstr = ""
                if (flags && _.keys(flags).length) {
                    flagstr = ` %${_.keys(flags).join("")}`
                }

                if ((type === "word") && (val === "")) {
                    out = ""
                } else if (type === "date_interval") {
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

        let or_out = Array.from(outer_and_array).map((x) =>
            x.length > 1
                ? `(${x.join(' | ')})`
            :                x.join(' | '))

        if (token.bound) {
            or_out = _.compact(or_out)
            for (let bound of Array.from(_.keys((token.bound)))) {
                or_out.push(`${bound}(sentence)`)
            }
        }



        let out_token = `[${or_out.join(' & ')}]`
        if (token.repeat) {
            out_token += `{${token.repeat.join(',')}}`
        }



        output.push(out_token)
    }



    return output.join(" ")
}

window.CQP = {

    parse : function() { return CQPParser.parse(...arguments) },

    stringify : stringifyCqp,

    expandOperators(cqpstr) {
        return CQP.stringify(CQP.parse(cqpstr), true)
    },

    getTimeInterval(obj) {
        let from = []
        let to = []
        for (let token of Array.from(obj)) {
            for (let or_block of Array.from(token.and_block)) {
                for (let item of Array.from(or_block)) {
                    if (item.type === "date_interval") {
                        from.push(moment(`${item.val[0]}${item.val[2]}`, "YYYYMMDDhhmmss"))
                        to.push(moment(`${item.val[1]}${item.val[3]}`, "YYYYMMDDhhmmss"))
                    }
                }
            }
        }

        if (!from.length) { return }
        from = _.minBy(from, mom => mom.toDate())
        to = _.maxBy(to, mom => mom.toDate())

        return [from, to]
    },

    prioSort(cqpObjs) {
        const getPrio = function(and_array) {
            const numbers = _.map(and_array, item => _.indexOf(prio, item.type))
            return Math.min(...Array.from(numbers || []))
        }

        for (let token of Array.from(cqpObjs)) {
            token.and_block = (_.sortBy(token.and_block, getPrio)).reverse()
        }

        return cqpObjs
    },

    // assume cqpObj2 to contain fewer tokens than cqpObj1
    mergeCqpExprs(cqpObj1, cqpObj2) {
        for (let i = 0; i < cqpObj2.length; i++) {
            const token = cqpObj2[i]
            cqpObj1[i].and_block = cqpObj1[i].and_block.concat(token.and_block)
        }
        return cqpObj1
    }
}
