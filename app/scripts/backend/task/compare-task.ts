/** @format */
import { SavedSearch } from "@/services/local-storage"
import { prefixAttr } from "@/settings"
import { corpusListing, CorpusListing } from "@/corpora/corpus_listing"
import { korpRequest } from "../common"
import { groupBy, pick, range, sumBy, uniq, zip } from "lodash"
import { Attribute } from "@/settings/config.types"
import { ExampleTask } from "./example-task"
import { TaskBase } from "./task-base"

export type CompareResult = {
    tables: CompareTables
    max: number
    cmp1: SavedSearch
    cmp2: SavedSearch
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

export class CompareTask extends TaskBase<CompareResult> {
    attributes: Record<string, Attribute>
    cl: CorpusListing
    reduce: string[]

    constructor(public cmp1: SavedSearch, public cmp2: SavedSearch, reduce: string[]) {
        super()
        this.cl = corpusListing.subsetFactory([...cmp1.corpora, ...cmp2.corpora])
        this.reduce = reduce.map((item) => item.replace(/^_\./, ""))
        this.attributes = pick(this.cl.getReduceAttrs(), this.reduce)
    }

    async send(): Promise<CompareResult> {
        // remove all corpora which do not include all the "reduce"-attributes
        const corpora1 = this.cmp1.corpora.filter((corpus) => this.cl.corpusHasAttrs(corpus, this.reduce))
        const corpora2 = this.cmp2.corpora.filter((corpus) => this.cl.corpusHasAttrs(corpus, this.reduce))

        const [reduceStruct, reducePos] = this.cl.partitionAttrs(this.reduce)

        const split = this.reduce.filter((r) => this.attributes[r]?.type === "set").join(",")

        const rankedReduce = this.reduce.filter(
            (item) => this.cl.getCurrentAttributes(this.cl.getReduceLang())[item]?.ranked
        )
        const top = rankedReduce.map((item) => item + ":1").join(",")

        const params = {
            group_by: reducePos.join(),
            group_by_struct: reduceStruct.join(),
            set1_corpus: corpora1.join(",").toUpperCase(),
            set1_cqp: this.cmp1.cqp,
            set2_corpus: corpora2.join(",").toUpperCase(),
            set2_cqp: this.cmp2.cqp,
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

        return {
            tables: { positive, negative },
            max,
            cmp1: this.cmp1,
            cmp2: this.cmp2,
        }
    }

    createExampleTask(cmpI: number, row: CompareItem): ExampleTask {
        const itemCqp = this.buildItemCqp(row)
        const cmp = [this.cmp1, this.cmp2][cmpI]
        return new ExampleTask(cmp.corpora, [cmp.cqp, itemCqp])
    }

    buildItemCqp(row: CompareItem) {
        // If the grouping attribute is positional, the value is a space-separated list, otherwise it's a single value.
        const parseToken = (value: string, i: number) =>
            CorpusListing.isStruct(this.attributes[this.reduce[i]]) ? [value] : value.split(" ")

        const splitTokens = row.elems.map((elem) => elem.split("/").map(parseToken))

        // number of tokens in search
        const tokenLength = splitTokens[0][0].length

        // transform result from grouping on attribute to grouping on token place
        var tokens = range(0, tokenLength).map((tokenIdx) =>
            this.reduce.map((reduceAttr, attrIdx) => uniq(splitTokens.map((res) => res[attrIdx][tokenIdx])))
        )

        const cqps = tokens.map((token) => {
            const cqpAnd = range(0, token.length).map((attrI) => {
                let type: string | undefined
                let val: string
                let attrKey = this.reduce[attrI]
                const attrVal = token[attrI]

                if (attrKey.includes("_.")) {
                    console.log("error, attribute key contains _.")
                }

                const attribute = this.attributes[attrKey]
                if (attribute) {
                    type = attribute.type
                    attrKey = prefixAttr(attribute)
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

        return `<match> ${cqps.join(" ")} []{0,} </match>`
    }
}
