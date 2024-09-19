/** @format */
import _ from "lodash"
import moment, { type Moment } from "moment"
import settings from "@/settings"
import { parse as parse_ } from "./CQPParser"
import type { Condition, CqpQuery, DateRange, OperatorKorp } from "./cqp.types"

/** Parse CQP string to syntax tree. */
// Rename to be able to add typing.
const parse: (input: string, options?: never) => CqpQuery = parse_
export { parse }

/**
 * Create CQP expression for a date interval condition.
 *
 * @param opKorp Operator to use if not using `expanded_format`
 * @param range An array like `[fromdate, todate, fromtime, totime]`
 * @param expanded_format Whether to convert to standard CQP or keep Korp-specific operators
 */
export function parseDateInterval(opKorp: OperatorKorp, range: DateRange, expanded_format?: boolean) {
    if (!expanded_format) return `$date_interval ${opKorp} '${range.join(",")}'`

    const [fromdate, todate, fromtime, totime] = range
    if (!fromdate || !todate) return ""

    const isFromDateSame = `int(_.text_datefrom) = ${fromdate}`
    const isFromDateInclusive = `int(_.text_datefrom) >= ${fromdate}`
    const isFromDateExclusive = `int(_.text_datefrom) > ${fromdate}`
    const isFromTimeInclusive = `(${isFromDateSame} & int(_.text_timefrom) >= ${fromtime})`

    const isToDateSame = `int(_.text_dateto) = ${todate}`
    const isToDateInclusive = `int(_.text_dateto) <= ${todate}`
    const isToDateExclusive = `int(_.text_dateto) < ${todate}`
    const isToTimeInclusive = `(${isToDateSame} & int(_.text_timeto) <= ${totime})`

    if (String(fromdate) == String(todate)) {
        const fromCond = fromtime == "000000" ? isFromDateSame : isFromTimeInclusive
        const toCond = totime == "235959" ? isToDateSame : isToTimeInclusive
        return `${fromCond} & ${toCond}`
    }

    const fromCond = fromtime == "000000" ? isFromDateInclusive : `(${isFromTimeInclusive} | ${isFromDateExclusive})`
    const toCond = totime == "235959" ? isToDateInclusive : `(${isToTimeInclusive} | ${isToDateExclusive})`
    return `${fromCond} & ${toCond}`
}

/**
 * Serialize syntax tree to CQP string.
 * @param cqp_obj Syntax tree
 * @param expanded_format Whether to convert to standard CQP or keep Korp-specific operators
 */
export function stringify(cqp_obj: CqpQuery, expanded_format?: boolean): string {
    if (expanded_format == null) {
        expanded_format = false
    }
    const output = []
    cqp_obj = prioSort(_.cloneDeep(cqp_obj))

    for (let token of cqp_obj) {
        if (typeof token === "string") {
            output.push(token)
            continue
        }

        if (token.struct) {
            output.push(`<${token.start ? "" : "/"}${token.struct}>`)
            continue
        }

        const outer_and_array: string[][] = []
        for (let and_array of token.and_block) {
            const or_array: string[] = []
            for (let { type, op, val, flags } of and_array) {
                var out
                if (expanded_format) {
                    ;[val, op] = ({
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
                    }[op] || [val, op]) as [string | DateRange, OperatorKorp]
                }

                let flagstr = ""
                if (flags && _.keys(flags).length) {
                    flagstr = ` %${_.keys(flags).join("")}`
                }

                if (type === "word" && val === "") {
                    out = ""
                } else if (settings.corpusListing.isDateInterval(type)) {
                    out = parseDateInterval(op, val as DateRange, expanded_format)
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

        let or_out: string[] = outer_and_array.map((x) => (x.length > 1 ? `(${x.join(" | ")})` : x.join(" | ")))

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

export const expandOperators = (cqpstr: string) => stringify(parse(cqpstr), true)

/**
 * Find first and last date in any date interval conditions.
 * @param obj Syntax tree
 * @returns `[from, to]` as Moment objects, or `undefined` if query has no intervals
 */
export function getTimeInterval(obj: CqpQuery): [Moment, Moment] | undefined {
    let froms: Moment[] = []
    let tos: Moment[] = []
    for (let token of obj) {
        for (let or_block of token.and_block) {
            for (let item of or_block) {
                if (item.type === "date_interval") {
                    froms.push(moment(`${item.val[0]}${item.val[2]}`, "YYYYMMDDhhmmss"))
                    tos.push(moment(`${item.val[1]}${item.val[3]}`, "YYYYMMDDhhmmss"))
                }
            }
        }
    }

    if (!froms.length) {
        return
    }
    const from = _.minBy(froms, (m) => m.toDate())
    const to = _.maxBy(tos, (m) => m.toDate())

    return [from, to]
}

/**
 * Sort the conditions in each token according to the `cqp_prio` setting.
 */
export function prioSort(cqpObjs: CqpQuery) {
    const getPrio = function (or_block: Condition[]) {
        const numbers = _.map(or_block, (item) => _.indexOf(settings.cqp_prio, item.type))
        return Math.min(...(numbers || []))
    }

    for (let token of cqpObjs) {
        token.and_block = (_.sortBy(token.and_block, getPrio) as Condition[][]).reverse()
    }

    return cqpObjs
}

/**
 * Create intersection of two queries.
 *
 * The second query is assumed to contain fewer tokens than the first.
 */
export function mergeCqpExprs(cqpObj1: CqpQuery, cqpObj2: CqpQuery) {
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
}

/** Check if a query has any wildcards (`[]`) */
export const hasWildcard = (cqpObjs: CqpQuery) => cqpObjs.some((token) => stringify([token]).indexOf("[]") === 0)

/** Check if a query has any tokens with repetition */
export const hasRepetition = (cqpObjs: CqpQuery) => cqpObjs.some((token) => token.repeat)

/** Check if a query has any structure boundaries, e.g. sentence start */
export const hasStruct = (cqpObjs: CqpQuery) => cqpObjs.some((token) => token.struct)

/** Determine whether a query will work with the in_order option */
export const supportsInOrder = (cqpObjs: CqpQuery) =>
    cqpObjs.length > 1 && !hasWildcard(cqpObjs) && !hasRepetition(cqpObjs) && !hasStruct(cqpObjs)
