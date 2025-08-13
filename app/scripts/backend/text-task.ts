/** @format */
import settings from "@/settings"
import { korpRequest } from "./common"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { ApiKwic, Token } from "./types"
import { omit } from "lodash"

export type TextReaderDataContainer = {
    corpus: string
    document: TextReaderData
    sentenceData: Record<string, string>
}

export type ReaderTokenContainer = { tokens: Group<ReaderToken>[] | ReaderToken[] }

type Group<T> = { attrs: Record<string, string>; tokens: T[] }

export type ReaderToken = {
    /** Original token content, plus struct attrs renamed to `(struct)_(attr)` */
    attrs: Record<string, string>
    currentSentence: Record<string, string>[]
}

export type TextReaderData = Omit<ApiKwic, "tokens"> & ReaderTokenContainer

export class TextTask {
    corpus: CorpusTransformed
    textId: string
    constructor(readonly corpusId: string, readonly sentenceData: Record<string, string>) {
        this.corpus = settings.corpusListing.get(this.corpusId)
        this.textId = this.sentenceData["text__id"]
        if (!this.textId) throw new RangeError("Sentence has no text__id")
    }

    async send(): Promise<TextReaderData> {
        const corpusId = this.corpusId.toUpperCase()

        // TODO: is this good enough?
        const show = Object.keys(this.corpus.attributes)
        const showStruct = Object.keys(this.corpus["struct_attributes"])

        // _head and _tail are needed for all corpora, so that Korp will know what whitespace to use
        // For sentence_id, we should find a more general solution, but there is one Språkbanken
        // corpus who needs sentence_id in order to map the selected sentence in the KWIC to
        // a sentence in the reading mode text.
        show.push("sentence_id", "_head", "_tail")

        const params = {
            corpus: corpusId,
            cqp: `[_.text__id = "${this.textId}" & lbound(text)]`,
            context: corpusId + ":1 text",
            show: show.join(),
            show_struct: showStruct.join(),
            within: corpusId + ":text",
            start: 0,
            end: 0,
        }

        const data = await korpRequest("query", params)

        // The data is just one long KWIC row.
        const kwic = data.kwic[0]

        const groupElement =
            typeof this.corpus.reading_mode == "object" ? this.corpus.reading_mode.group_element : undefined

        if (groupElement) {
            const groups = groupTokens(kwic.tokens, groupElement)
            const tokens = groups.map((group) => ({ ...group, tokens: convertTokens(group.tokens) }))
            return { ...kwic, tokens }
        }

        const tokens = convertTokens(kwic.tokens)
        return { ...kwic, tokens }
    }
}

/**
 * Partition a token sequence into groups corresponding to structs of the `groupElement` type.
 * The `groupElement` structs are assumed to cover the whole document, i.e. no tokens in between.
 */
function groupTokens(tokens: Token[], groupElement: string): Group<Token>[] {
    const groups: Group<Token>[] = []
    for (const token of tokens) {
        // Start a new group if this tokens opens a new struct of the groupElement type
        if (token.structs?.open) {
            const struct = token.structs.open.find((open) => open[groupElement])
            if (!struct) continue
            // Copy attrs to group
            const attrs = { ...struct[groupElement] }
            groups.push({ attrs, tokens: [] })
        }
        // Add token to current group
        groups[groups.length - 1].tokens.push(token)
    }
    return groups
}

function convertTokens(tokens: Token[]): ReaderToken[] {
    const out: ReaderToken[] = []
    let currentSentence: Record<string, string>[] = []
    /** Attributes per currently open struct */
    const open: Record<string, Record<string, string>> = {}

    for (const token of tokens) {
        // Store new struct attrs and track current sentence
        for (const openStruct of token.structs?.open || []) {
            const name = Object.keys(openStruct)[0]
            open[name] = openStruct[name]
            if (name === "sentence") currentSentence = []
        }

        // Convert and push token
        const attrs = convertToken(token, open)
        currentSentence.push(attrs)
        out.push({ attrs, currentSentence })

        // Clear closed struct attrs
        for (const name of token.structs?.close || []) {
            delete open[name]
        }
    }

    return out
}

function convertToken(token: Token, open: Record<string, Record<string, string>>): Record<string, string> {
    // Add attrs of all open structs
    const structAttrs: Record<string, string> = {}
    for (const name in open) {
        for (const attr in open[name]) {
            if (open[name][attr]) structAttrs[name + "_" + attr] = open[name][attr]
        }
    }

    const parseWhitespace = (str?: string): string =>
        str?.replace(/\\s/g, " ").replace(/\\n/g, "\n").replace(/\\t/g, "\t") || ""

    return {
        ...omit(token, "structs"),
        ...structAttrs,
        head: parseWhitespace(token._head),
        tail: parseWhitespace(token._tail),
    }
}
