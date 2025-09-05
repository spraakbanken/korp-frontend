import settings from "@/settings"
import ProxyBase from "./proxy-base"
import { unregescape } from "@/util"
import { ApiRelation, RelationsParams, RelationsSort } from "../types/relations"
import { WordPictureDefItem } from "@/settings/app-settings.types"
import { invert, isEqual } from "lodash"
import { Lemgram } from "@/lemgram"
import { parse } from "@/cqp_parser/cqp"
import { CqpQuery } from "@/cqp_parser/cqp.types"
import { corpusListing } from "@/corpora/corpus_listing"

/** A relation item modified for showing. */
export type ShowableApiRelation = ApiRelation & {
    /** Direction of relation */
    show_rel: "head" | "dep"
}

export type TableData = {
    table: ApiRelation[] | { word: string }
    rel?: string
    show_rel?: string
}

export type TableDrawData = {
    token: string
    wordClass: string
    wordClassShort: string
    data: TableData[][]
}

export type RelationsQuery = {
    type: WordType
    word: string
}

type WordType = "word" | "lemgram"

export class RelationsProxy extends ProxyBase<"relations"> {
    protected readonly endpoint = "relations"
    readonly config = settings["word_picture_conf"] || {}
    /** Mapping from pos tag to identifiers used in word_picture_conf */
    readonly tagset = invert(settings["word_picture_tagset"] || {})

    /** Parse a Check if a query can be used for word picture. */
    static parseCqp(cqp: string): RelationsQuery {
        const tokens = parse<CqpQuery>(cqp)

        if (tokens.length != 1) throw new RelationsParseError("Must be single token")
        const conditions = tokens[0].and_block
        if (conditions?.length != 1 || conditions[0].length != 1)
            throw new RelationsParseError("Must have a single condition")
        const condition = conditions[0][0]

        const isWord = condition.type == "word" && condition.op == "="
        const isLemgram = condition.type == "lex" && condition.op == "contains"
        if (!isWord && !isLemgram) throw new RelationsParseError(`Attribute/operator not allowed`)

        if (!condition.val) throw new RelationsParseError("Condition value must not be empty")

        return {
            type: isWord ? "word" : "lemgram",
            word: condition.val as string,
        }
    }

    buildParams(type: WordType, word: string, sort: RelationsSort): RelationsParams {
        return {
            type,
            word,
            corpus: corpusListing.stringifySelected(),
            incremental: true,
            sort,
            max: 1000,
        }
    }

    async makeRequest(type: WordType, word: string, sort: RelationsSort): Promise<TableDrawData[]> {
        if (type == "lemgram") word = unregescape(word)
        const params = this.buildParams(type, word, sort)
        const data = await this.send(params)
        if (!data.relations) throw new RelationsEmptyError("No relation data in response")
        return this.drawTables(type, word, data.relations)
    }

    protected drawTables(type: WordType, query: string, data: ApiRelation[]): TableDrawData[] {
        const headings = type == "lemgram" ? this.getLemgramHeadings(query, data) : this.getWordHeadings(query, data)

        /** Find a given relation in the wordpic config structure. */
        const inArray = function (
            rel: WordPictureDefItem,
            orderList: (WordPictureDefItem | "_")[],
        ): { i: number; type: "head" | "dep" } {
            const i = orderList.findIndex(
                (item) =>
                    item != "_" &&
                    (item.field_reverse || false) === (rel.field_reverse || false) &&
                    item.rel === rel.rel,
            )
            const type = rel.field_reverse ? "head" : "dep"
            return { i, type }
        }

        const res: TableDrawData[] = []

        for (const heading of headings) {
            const token = heading[0]
            const wordClassShort = heading[1].toLowerCase()
            const wordClass = this.tagset[wordClassShort]

            if (this.config[wordClass] == null) {
                continue
            }

            // Sort the list of relations according to configuration.
            // Up to three sections. Each section is one or a few tables, each table has a number of rows.
            const sections: ShowableApiRelation[][][] = [[], [], []]
            data.forEach((item) => {
                this.config[wordClass].forEach((rel_type_list, i) => {
                    const section = sections[i]
                    const rel = {
                        rel: this.tagset[item.rel.toLowerCase()],
                        field_reverse: item.dep === token,
                    }

                    const ret = inArray(rel, rel_type_list)
                    if (ret.i === -1) {
                        return
                    }
                    if (!section[ret.i]) {
                        section[ret.i] = []
                    }
                    const itemModified = {
                        ...item,
                        show_rel: ret.type,
                    }
                    section[ret.i].push(itemModified)
                })
            })

            // In this iteration, one element in each section is the search word, not a table of relations.
            const sectionsWithSearchWord: (ShowableApiRelation[] | { word: string })[][] = []
            sections.forEach((section, i) => {
                sectionsWithSearchWord[i] = section

                if (this.config[wordClass][i] && section.length) {
                    const toIndex = this.config[wordClass][i].indexOf("_")
                    sectionsWithSearchWord[i][toIndex] = {
                        word: Lemgram.parse(token)?.toString() || token,
                    }
                }

                sectionsWithSearchWord[i] = section.filter(Boolean)
            })

            // Convert each table to an object and add info about the relation type
            const dataOut: TableData[][] = sectionsWithSearchWord.map((section) =>
                section.map((table) => {
                    if (Array.isArray(table) && table[0]) {
                        const { rel, show_rel } = table[0]
                        return { table, rel, show_rel }
                    } else {
                        return { table }
                    }
                }),
            )

            res.push({
                token,
                wordClass,
                wordClassShort,
                data: dataOut,
            })
        }

        return res
    }

    getWordHeadings(query: string, data: ApiRelation[]): [string, string][] {
        const pairs: [string, string][] = []

        /** Adds word to the list if unique and supported by config */
        const add = (word: string, pos: string) => {
            if (!this.isPosSupported(pos)) return
            const pair: [string, string] = [word, pos]
            if (pairs.some((existing) => isEqual(existing, pair))) return
            pairs.push(pair)
        }

        for (const item of data) {
            if (item.head.split("_")[0] === query) add(item.head, item.headpos.toLowerCase())
            else if (item.dep.split("_")[0] === query) add(item.dep, item.deppos.toLowerCase())
        }

        return pairs
    }

    getLemgramHeadings(lemgram: string, data: ApiRelation[]): [string, string][] {
        const pos = data[0].head === lemgram ? data[0].headpos : data[0].deppos
        return [[lemgram, pos]]
    }

    isPosSupported(pos: string) {
        return this.config[this.tagset[pos]]
    }
}

export class RelationsEmptyError extends Error {}
export class RelationsParseError extends Error {}
