/** @format */
import { SavedSearch } from "@/local-storage"
import settings from "@/settings"
import { korpRequest } from "./common"
import { groupBy, range, sumBy, uniq, zip } from "lodash"
import { getStringifier, Stringifier } from "@/stringify"
import { locAttribute } from "@/i18n"
import { Attribute } from "@/settings/config.types"

export type CompareResult = {
    tables: CompareTables
    max: number
    cmp1: SavedSearch
    cmp2: SavedSearch
    reduce: string[]
    stringify: Stringifier
}

export type CompareTables = { positive: CompareItem[]; negative: CompareItem[] }

type CompareItemRaw = {
    value: string
    loglike: number
    abs: number
}

export type CompareItem = {
    /** Value of given attribute without probability suffixes */
    key: string
    /** Log-likelihood value */
    loglike: number
    /** Absolute frequency */
    abs: number
    /** Values of given attribute, as found including probability suffixes */
    elems: string[]
    tokenLists: string[][]
}

/** Note: since this is using native Promise, we must use it with something like $q or $scope.$apply for AngularJS to react when they resolve. */
export async function requestCompare(cmp1: SavedSearch, cmp2: SavedSearch, reduce: string[]): Promise<CompareResult> {
    reduce = reduce.map((item) => item.replace(/^_\./, ""))
    let cl = settings.corpusListing
    // remove all corpora which do not include all the "reduce"-attributes
    const corpora1 = cmp1.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))
    const corpora2 = cmp2.corpora.filter((corpus) => cl.corpusHasAttrs(corpus, reduce))

    const attrs = { ...cl.getCurrentAttributes(), ...cl.getStructAttrs() }
    const split = reduce.filter((r) => (attrs[r] && attrs[r].type) === "set").join(",")

    const rankedReduce = reduce.filter((item) => cl.getCurrentAttributes(cl.getReduceLang())[item]?.ranked)
    const top = rankedReduce.map((item) => item + ":1").join(",")

    const params = {
        group_by: reduce.join(","),
        set1_corpus: corpora1.join(",").toUpperCase(),
        set1_cqp: cmp1.cqp,
        set2_corpus: corpora2.join(",").toUpperCase(),
        set2_cqp: cmp2.cqp,
        max: 50,
        split,
        top,
    }

    const data = await korpRequest("loglike", params)

    const objs: CompareItemRaw[] = Object.entries(data.loglike).map(([key, value]) => ({
        value: key,
        loglike: value,
        abs: value > 0 ? data.set2[key] : data.set1[key],
    }))

    const tables = groupBy(objs, (obj) => (obj.loglike > 0 ? "positive" : "negative"))

    let max = 0
    const groupAndSum = function (table: CompareItemRaw[]) {
        // Merge items that are different only by probability suffix ":<number>"
        const groups = groupBy(table, (obj) => obj.value.replace(/(:.+?)(\/|$| )/g, "$2"))
        const res = Object.entries(groups).map(([key, items]): CompareItem => {
            // Add up similar items.
            const tokenLists = key.split("/").map((tokens) => tokens.split(" "))
            const loglike = sumBy(items, "loglike")
            const abs = sumBy(items, "abs")
            const elems = items.map((item) => item.value)
            max = Math.max(max, Math.abs(loglike))
            return { key, loglike, abs, elems, tokenLists }
        })
        return res
    }
    const positive = groupAndSum(tables.positive)
    const negative = groupAndSum(tables.negative)

    // Find value stringifier. Currently we only support one attribute to reduce/group by, so simplify by only checking first item.
    const name = reduce[0]
    let stringify: Stringifier = (x) => String(x)
    if (attrs[name]?.stringify) {
        stringify = getStringifier(attrs[name].stringify)
    } else if (attrs[name]?.translation) {
        stringify = (value) => locAttribute(attrs[name].translation, String(value))
    }

    return {
        tables: { positive, negative },
        max,
        cmp1,
        cmp2,
        reduce,
        stringify,
    }
}

export function buildItemCqp(row: CompareItem, attributes: (Attribute | undefined)[]) {
    const attrs = attributes.map((attr) => attr?.name || "word")
    const splitTokens = row.elems.map((elem) => elem.split("/").map((tokens) => tokens.split(" ")))

    // number of tokens in search
    const tokenLength = splitTokens[0][0].length

    // transform result from grouping on attribute to grouping on token place
    var tokens = range(0, tokenLength).map((tokenIdx) =>
        attrs.map((reduceAttr, attrIdx) => uniq(splitTokens.map((res) => res[attrIdx][tokenIdx])))
    )

    const cqps = tokens.map((token) => {
        const cqpAnd = range(0, token.length).map((attrI) => {
            let type: string | undefined
            let val: string
            let attrKey = attrs[attrI]
            const attrVal = token[attrI]

            if (attrKey.includes("_.")) {
                console.log("error, attribute key contains _.")
            }

            const attribute = attributes[attrI]
            if (attribute) {
                type = attribute.type
                if (attribute["is_struct_attr"]) {
                    attrKey = `_.${attrKey}`
                }
            }

            const op = type === "set" ? "contains" : "="

            if (type === "set" && attrVal.length > 1) {
                // Assemble variants for each position in the token
                const transpose = <T>(matrix: T[][]) => zip(...matrix) as T[][]
                const variantsByValue = attrVal.map((val) => val.split(":").slice(1))
                const variantsByPosition = transpose(variantsByValue).map(uniq)
                const variantsStrs = variantsByPosition.map((variants) => `:(${variants.join("|")})`)
                const key = attrVal[0].split(":")[0]
                val = key + variantsStrs.join("")
            } else {
                val = attrVal[0]
            }

            const isEmptySet = type === "set" && (val === "|" || val === "")
            return isEmptySet ? `ambiguity(${attrKey}) = 0` : `${attrKey} ${op} "${val}"`
        })

        return `[${cqpAnd.join(" & ")}]`
    })

    return cqps.join(" ")
}
