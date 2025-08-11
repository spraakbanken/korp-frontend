/** @format */
import { ApiKwic } from "@/backend/types"
import { LangString } from "@/i18n/types"
import settings from "@/settings"
import { sum } from "lodash"

export type Row = ApiKwic | LinkedKwic | CorpusHeading

/** Row from a secondary language in parallel mode. */
export type LinkedKwic = {
    tokens: ApiKwic["tokens"]
    isLinked: true
    corpus: string
}

/** A row introducing the next corpus in the hit listing. */
export type CorpusHeading = {
    corpus: string
    newCorpus: LangString
    noContext?: boolean
}

export const isKwic = (row: Row): row is ApiKwic => "tokens" in row && !isLinkedKwic(row)
export const isLinkedKwic = (row: Row): row is LinkedKwic => "isLinked" in row
export const isCorpusHeading = (row: Row): row is CorpusHeading => "newCorpus" in row

export type HitsPictureItem = {
    page: number
    relative: number
    abs: number
    rtitle: LangString
}

// TODO Create new tokens instead of modifying the existing ones
export function massageData(hitArray: ApiKwic[]): Row[] {
    const punctArray = [",", ".", ";", ":", "!", "?", "..."]

    let prevCorpus = ""
    const output: Row[] = []

    for (const hitContext of hitArray) {
        const mainCorpusId = settings.parallel
            ? hitContext.corpus.split("|")[0].toLowerCase()
            : hitContext.corpus.toLowerCase()

        const id = (settings.parallel && hitContext.corpus.split("|")[1].toLowerCase()) || mainCorpusId

        const [matchSentenceStart, matchSentenceEnd] = findMatchSentence(hitContext)
        const isMatchSentence = (i: number) =>
            matchSentenceStart && matchSentenceEnd && matchSentenceStart <= i && i <= matchSentenceEnd

        // When using `in_order=false`, there are multiple matches
        // Otherwise, cast single match to array for consistency
        const matches = !(hitContext.match instanceof Array) ? [hitContext.match] : hitContext.match
        const isMatch = (i: number) => matches.some(({ start, end }) => start <= i && i < end)

        // Copy struct attributes to tokens
        /** Currently open structural elements (e.g. `<ne>`) */
        const currentStruct: Record<string, Record<string, string>> = {}
        for (const [i, wd] of hitContext.tokens.entries()) {
            wd.position = i

            if (isMatch(i)) wd._match = true
            if (isMatchSentence(i)) wd._matchSentence = true
            if (punctArray.includes(wd.word)) wd._punct = true

            wd.structs ??= {}

            // For each new structural element this token opens, add it to currentStruct
            for (const structItem of wd.structs.open || []) {
                // structItem is an object with a single key
                const structKey = Object.keys(structItem)[0]
                if (structKey == "sentence") wd._open_sentence = true

                // Store structural attributes with a qualified name e.g. "ne_type"
                // Also set a dummy value for the struct itself, e.g. `"ne": ""`
                currentStruct[structKey] = {}
                const attrs = Object.entries(structItem[structKey]).map(([key, val]) => [structKey + "_" + key, val])
                for (const [key, val] of [[structKey, ""], ...attrs]) {
                    if (key in settings.corpora[id].attributes) {
                        currentStruct[structKey][key] = val
                    }
                }
            }

            // Copy structural attributes to token
            // The keys of currentStruct are included in the names of each attribute
            Object.values(currentStruct).forEach((attrs) => Object.assign(wd, attrs))

            // For each struct this token closes, remove it from currentStruct
            for (let structItem of wd.structs.close || []) delete currentStruct[structItem]
        }

        // At the start of each new corpus, add a row with the corpus title
        if (prevCorpus !== id) {
            const corpus = settings.corpora[id]
            const newSent = {
                corpus: id,
                newCorpus: corpus.title,
                noContext: Object.keys(corpus.context).length === 1,
            }
            output.push(newSent)
        }

        hitContext.corpus = mainCorpusId

        output.push(hitContext)
        if (hitContext.aligned) {
            // just check for sentence opened, no other structs
            const alignedTokens = Object.values(hitContext.aligned)[0]
            for (let wd of alignedTokens) {
                if (wd.structs && wd.structs.open) {
                    for (let structItem of wd.structs.open) {
                        if (Object.keys(structItem)[0] == "sentence") {
                            wd._open_sentence = true
                        }
                    }
                }
            }

            const [corpus_aligned, tokens] = Object.entries(hitContext.aligned)[0]
            output.push({
                tokens,
                isLinked: true,
                corpus: corpus_aligned,
            })
        }

        prevCorpus = id
    }

    return output
}

/** Find span of sentence containing the match */
// This is used in reading mode (when free order is not used) to highlight the sentence.
function findMatchSentence(hitContext: ApiKwic): [number?, number?] {
    if (Array.isArray(hitContext.match)) return []
    const span: [number?, number?] = []
    const { start, end } = hitContext.match
    let decr = start
    let incr = end
    while (decr >= 0) {
        const token = hitContext.tokens[decr]
        const sentenceOpen = (token.structs?.open || []).filter((attr) => attr.sentence)
        if (sentenceOpen.length > 0) {
            span[0] = decr
            break
        }
        decr--
    }
    while (incr < hitContext.tokens.length) {
        const token = hitContext.tokens[incr]
        const closed = (token.structs && token.structs.close) || []
        if (closed.includes("sentence")) {
            span[1] = incr
            break
        }
        incr++
    }

    return span
}

export function calculateHitsPicture(
    corpusOrder: string[],
    corpusHits: Record<string, number>,
    pageSize: number
): HitsPictureItem[] {
    const total = sum(Object.values(corpusHits))
    const items: HitsPictureItem[] = corpusOrder
        .map((id) => ({
            rtitle: settings.corpusListing.getTitleObj(id.toLowerCase()),
            relative: corpusHits[id] / total,
            abs: corpusHits[id],
            page: -1, // this is properly set below
        }))
        .filter((item) => item.abs > 0)

    // calculate which is the first page of hits for each item
    let index = 0
    items.forEach((item) => {
        item.page = Math.floor(index / pageSize)
        index += item.abs
    })

    return items
}
