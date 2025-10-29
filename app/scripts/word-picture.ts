import { isEqual, once } from "lodash"
import { Relation } from "./backend/types/relations"
import { getWordPictureConfig } from "./settings"
import { WordPictureDef, WordPictureDefItem } from "./settings/app-settings.types"

export type WordType = "word" | "lemgram"

export type WordPictureData = WordPictureSection[]

export type WordPictureSection = {
    config: WordPictureDef[]
    heading: WordPictureSectionHeading
    tables: WordPictureTable[]
    max: number
}

export type WordPictureSectionHeading = { word: string; pos: string }

export type WordPictureTable = {
    config: WordPictureDef
    index: number
    columns: WordPictureColumn[]
    columnsBefore: WordPictureColumn[]
    columnsAfter: WordPictureColumn[]
    max: number
}

export type WordPictureColumn = {
    config: WordPictureDefItem
    rel: string
    rows: MatchedRelation[]
}

export type MatchedRelation = Relation & {
    /** True if the search word matches `dep` instead of `head`. */
    reverse: boolean
    /** Copy of `head` or `dep`, whichever matches the search word. */
    match: string
    matchpos: string
    /** Copy of `head` or `dep`, whichever doesn't match the search word. */
    other: string
    otherpos: string
    /** Copy of `depextra` if the search word matches `head` – a preposition or other string to show together with the related word */
    prefix?: string
}

export class WordPicture {
    readonly config = getWordPictureConfig()
    readonly items: Record<string, MatchedRelation[]> = {}
    readonly headings: WordPictureSectionHeading[] = []

    constructor(
        readonly query: string,
        readonly type: WordType,
        itemsRaw: Relation[],
    ) {
        const convertItem = (item: Relation): MatchedRelation | undefined => {
            const { head, headpos, dep, deppos, depextra } = item
            // For ordinary word search, include multi-word items beginning with the searched word
            const getMatch = (word: string) => (type == "word" ? word.replace(/_.*/, "") : word)
            if (query == getMatch(head))
                return {
                    ...item,
                    reverse: false,
                    match: head,
                    matchpos: headpos,
                    other: dep,
                    otherpos: deppos,
                    prefix: depextra,
                }
            if (query == getMatch(dep))
                return { ...item, reverse: true, match: dep, matchpos: deppos, other: head, otherpos: headpos }
            console.warn("Unmatched relations item", item)
        }

        for (const itemRaw of itemsRaw) {
            const item = convertItem(itemRaw)
            if (!item) continue
            const { match, matchpos, rel, reverse } = item
            // Store items by category
            const id = this.getColumnId(matchpos, rel, reverse)
            this.items[id] ??= []
            this.items[id].push(item)
            // Store distinct section headings
            const heading = { word: match, pos: matchpos }
            if (!this.headings.find((h) => isEqual(h, heading))) this.headings.push(heading)
        }
    }

    getData: () => WordPictureData = once(() => {
        return this.headings.map((heading) => {
            const config = this.config[heading.pos]
            const tables: WordPictureTable[] = config.map((config, index) => {
                // Split data columns into before and after the "_" placeholder in the config
                const columnsBefore: WordPictureColumn[] = []
                const columnsAfter: WordPictureColumn[] = []
                let bin = columnsBefore
                for (const col of config) {
                    if (col == "_") bin = columnsAfter
                    else {
                        const id = this.getColumnId(heading.pos, col.rel, !!col.field_reverse)
                        const rows = this.items[id]
                        if (rows) bin.push({ config: col, rel: col.rel, rows })
                    }
                }
                const columns = [...columnsBefore, ...columnsAfter]
                const max = Math.max(0, ...columns.map((col) => col.rows.length))
                return { config, index, columns, columnsBefore, columnsAfter, max }
            })
            const max = Math.max(...tables.map((table) => table.max))
            return { config, heading, tables, max }
        })
    })

    getMaxColumnLength(): number {
        return Math.max(...this.getData().map((section) => section.max))
    }

    /** Get a string for the params that identify a word picture column */
    getColumnId = (pos: string, rel: string, reverse: boolean) => `${pos}${reverse ? "+" : "-"}${rel}`
}
