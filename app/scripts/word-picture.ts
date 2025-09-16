import { compact, mapKeys } from "lodash"
import { Relation } from "./backend/types/relations"
import settings from "./settings"
import { WordPictureDef, WordPictureDefItem } from "./settings/app-settings.types"
import { uniqDeep } from "./util"

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
    readonly tagset = settings["word_picture_tagset"] || {}
    readonly config = mapKeys(settings["word_picture_conf"] || {}, (_, long) => this.tagset[long].toUpperCase())
    readonly items: MatchedRelation[]
    readonly headings: WordPictureSectionHeading[]
    protected data: WordPictureData

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

        this.items = compact(itemsRaw.map(convertItem))

        const headings = uniqDeep(this.items.map((item) => ({ word: item.match, pos: item.matchpos })))
        this.headings = headings.filter((heading) => heading.pos in this.config)
    }

    getData(): WordPictureData {
        if (!this.data) this.data = this.buildData()
        return this.data
    }

    protected buildData() {
        return this.headings.map((heading) => {
            const config = this.config[heading.pos]
            const tables: WordPictureTable[] = config.map((config, index) => {
                // Split data columns into before and after the "_" placeholder in the config
                const columnsBefore: WordPictureColumn[] = []
                const columnsAfter: WordPictureColumn[] = []
                let bin = columnsBefore
                for (const column of config) {
                    if (column == "_") bin = columnsAfter
                    else bin.push(this.getColumn(column, heading.pos))
                }
                const max = Math.max(...[...columnsBefore, ...columnsAfter].map((col) => col.rows.length))
                return { config, index, columnsBefore, columnsAfter, max }
            })
            const max = Math.max(...tables.map((table) => table.max))
            return { config, heading, tables, max }
        })
    }

    getMaxColumnLength(): number {
        return Math.max(...this.getData().map((section) => section.max))
    }

    /** Filter items matching a column config. */
    getColumn(config: WordPictureDefItem, matchpos: string): WordPictureColumn {
        const rel = this.tagset[config.rel].toUpperCase()
        const rows = this.items.filter(
            (item) => item.matchpos == matchpos && item.rel == rel && item.reverse == !!config.field_reverse,
        )
        return { config, rel, rows }
    }
}
