import { createCondition } from "@/cqp_parser/cqp"
import { Condition, CqpQuery } from "@/cqp_parser/cqp.types"
import { regescape } from "../util"

/** Create query from word input string. */
export function buildSimpleWordCqp(input: string, prefix = false, suffix = false, ignoreCase = false): CqpQuery {
    return input.split(/\s+/).map((word) => {
        let value = regescape(word)
        if (prefix) value = `${value}.*`
        if (suffix) value = `.*${value}`
        const condition = createCondition(value)
        if (ignoreCase) condition.flags = { c: true }
        return { and_block: [[condition]] }
    })
}

export function buildSimpleLemgramCqp(input: string, prefix = false, suffix = false): CqpQuery {
    const conditions: Condition[] = [{ type: "lex", op: "contains", val: input }]
    // The complemgram attribute is a set of strings like: <part1>+<part2>+<...>:<probability>
    if (prefix) {
        conditions.push({ type: "complemgram", op: "contains", val: `${input}\\+.*` })
    }
    if (suffix) {
        conditions.push({ type: "complemgram", op: "contains", val: `.*\\+${input}:.*` })
    }
    return [{ and_block: [conditions] }]
}
