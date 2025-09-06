import {
    compact,
    get,
    intersection,
    isEmpty,
    maxBy,
    minBy,
    partition,
    pick,
    pickBy,
    sortBy,
    sum,
    union,
    uniq,
    zipObject,
} from "lodash"
import moment, { type Moment } from "moment"
import settings, { normalizeDataset } from "@/settings"
import { locObj } from "@/i18n"
import { Attribute } from "@/settings/config.types"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { LangString } from "@/i18n/types"
import { objectIntersection, objectUnion } from "@/util"

export type AttributeOption = Attribute & {
    group: "word" | "word_attr" | "sentence_attr"
}

/** How to join attribute lists of different corpora */
export type SetOperator = "union" | "intersection"

export let corpusListing: CorpusListing
export function setCorpusListing(cl: CorpusListing): void {
    if (corpusListing) throw new Error("Cannot reset global corpusListing")
    corpusListing = cl
}

export class CorpusListing {
    corpora: CorpusTransformed[]
    selected: CorpusTransformed[]
    struct: Record<string, CorpusTransformed>
    structAttributes: Record<string, Attribute> = {}
    commonAttributes: Record<string, Attribute> = {}
    _wordGroup: AttributeOption = {
        group: "word",
        name: "word",
        label: settings["word_label"],
    }

    constructor(corpora: Record<string, CorpusTransformed>) {
        this.struct = corpora
        this.corpora = Object.values(corpora)
        this.selected = []
    }

    get(key: string) {
        return this.struct[key]
    }

    list() {
        return this.corpora
    }

    map<T>(func: (corpus: CorpusTransformed) => T): T[] {
        return this.corpora.map(func)
    }

    /** Creates a new CorpusListing instance from an id subset */
    subsetFactory(ids: string[]) {
        ids = ids.map((id) => id.toLowerCase())
        const cl = new CorpusListing(pick(this.struct, ...ids))
        cl.select(ids)
        return cl
    }

    // only applicable for parallel corpora
    getReduceLang(): string {
        return ""
    }

    // Returns an array of all the selected corpora's IDs in uppercase
    getSelectedCorpora() {
        return this.selected.map((corpus) => corpus.id)
    }

    select(idArray: string[]): void {
        this.selected = idArray.map((id) => this.struct[id]).filter(Boolean)
        this.updateAttributes()
    }

    mapSelectedCorpora<T>(f: (corpus: CorpusTransformed) => T): T[] {
        return this.selected.map(f)
    }

    getCurrentAttributes(lang?: string) {
        // lang not used here, only in parallel mode
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)
        return this._invalidateAttrs(attrs)
    }

    getCurrentAttributesIntersection() {
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)

        return objectIntersection(attrs)
    }

    getStructAttrsIntersection(lang?: string): Record<string, Attribute> {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return objectIntersection(attrs)
    }

    getStructAttrs(lang?: string): Record<string, Attribute> {
        return this.structAttributes
    }

    _getStructAttrs(): Record<string, Attribute> {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            // Set the is_struct_attr flag for all struct attributes
            Object.values(corpus["struct_attributes"]).forEach((attr) => (attr["is_struct_attr"] = true))
            // if a position attribute is declared as structural, include here
            const posAttrs = pickBy(corpus.attributes, (val, key) => val["is_struct_attr"])
            return { ...posAttrs, ...corpus["struct_attributes"] }
        })
        const rest = this._invalidateAttrs(attrs)

        // Merge datasets from attributes with the same name across all selected corpora
        for (const name in rest) {
            if (rest[name].dataset) {
                const sameNameDatasets = attrs
                    .map((attrs2) => attrs2[name]?.dataset)
                    .filter(Boolean)
                    .map((d) => normalizeDataset(d!))
                rest[name].dataset = Object.assign(normalizeDataset(rest[name].dataset!), ...sameNameDatasets)
            }
        }

        return rest
    }

    getReduceAttrs(): Record<string, Attribute> {
        const allAttrs = {
            ...this.getCurrentAttributes(this.getReduceLang()),
            ...this.getStructAttrs(this.getReduceLang()),
        }
        return pickBy(allAttrs, (attribute) => attribute["display_type"] !== "hidden")
    }

    /** Partition attributes by whether they should be used as structural for grouping or not. */
    partitionAttrs(whitelist?: string[]): [string[], string[]] {
        const attrs = this.getReduceAttrs()
        const names = whitelist || Object.keys(attrs)
        return partition(names, (name) => CorpusListing.isStruct(attrs[name]))
    }

    static isStruct = (attr?: Attribute): boolean => !!attr?.["is_struct_attr"] && attr?.["group_by"] != "group_by"

    /** Compile list of filters applicable to all selected corpora. */
    getDefaultFilters(): Record<string, Attribute> {
        // Collect filters common to all selected corpora
        const attrs = intersection(...this.selected.map((corpus) => corpus["attribute_filters"] || []))
        return pick(this.structAttributes, ...attrs)
    }

    _invalidateAttrs(attrs: Record<string, Attribute>[]) {
        const union = objectUnion(attrs)
        const intersection = objectIntersection(attrs)

        // Mark attributes as disabled if not common to all attribute sets.
        Object.entries(union).forEach(([key, value]) => {
            if (!intersection[key]) value["disabled"] = true
            else delete value["disabled"]
        })

        return union
    }

    /** Whether the given corpus has all given attributes. */
    corpusHasAttrs(corpusId: string, attrs: string[]): boolean {
        const corpus = this.struct[corpusId]
        return attrs.every((attr) => attr == "word" || attr in corpus.attributes || attr in corpus["struct_attributes"])
    }

    stringifySelected(onlyMain?: boolean): string {
        return this.selected
            .map((corpus) => corpus.id)
            .map((a) => a.toUpperCase())
            .join(",")
    }

    stringifyAll(): string {
        return this.corpora
            .map((corpus) => corpus.id)
            .map((a) => a.toUpperCase())
            .join(",")
    }

    getWithinKeys(): string[] {
        const struct = this.selected.map((corpus) => Object.keys(corpus.within))
        return union(...struct)
    }

    getContextParams(isReading: boolean) {
        const prefer = isReading ? settings["default_reading_context"] : settings["default_overview_context"]
        const avoid = isReading ? settings["default_overview_context"] : settings["default_reading_context"]
        // Use specified corpora or fall back to selected
        const output: string[] = []
        for (let corpus of this.selected) {
            const contexts = Object.keys(corpus.context)
            if (!contexts.includes(prefer)) {
                if (contexts.length > 1 && contexts.includes(avoid)) {
                    contexts.splice(contexts.indexOf(avoid), 1)
                }
                output.push(corpus.id.toUpperCase() + ":" + contexts[0])
            }
        }
        return {
            context: compact(output).join(),
            default_context: prefer,
        }
    }

    /**
     * Calculate `within` parameter for selected corpora, as a comma-separated list of corpora differing from the
     * given default.
     */
    getWithinParam(defaultWithin?: string): string | undefined {
        const output: string[] = []
        for (const corpus of this.selected) {
            const withins = Object.keys(corpus.within)
            if (!defaultWithin || !withins.includes(defaultWithin)) {
                output.push(corpus.id.toUpperCase() + ":" + withins[0])
            }
        }
        return output.join() || undefined
    }

    getCommonWithins(): Record<string, string> {
        // only return withins that are available in every selected corpus
        const allWithins = this.selected.map((corp) => corp.within)
        const withins = allWithins.reduce(
            (acc, curr) => {
                for (const key in acc) {
                    if (!curr[key]) {
                        delete acc[key]
                    }
                }
                return acc
            },
            pickBy(allWithins[0], (val, within) => {
                // ignore withins that start with numbers, such as "5 sentence"
                return !within.match(/^[0-9]/)
            }),
        )
        if (isEmpty(withins)) {
            return { sentence: "sentence" }
        }
        return withins
    }

    buildShowParams() {
        const show: string[] = ["sentence"]
        const show_struct: string[] = []

        for (const corpus of this.selected) {
            show.push(...Object.keys(corpus.within).map((key) => key.split(" ").pop()!))
            show.push(...Object.keys(corpus.attributes))

            show_struct.push(...Object.keys(corpus["struct_attributes"]))
            if (corpus["reading_mode"]) show_struct.push("text__id")
        }

        return {
            show: uniq(show).join(),
            show_struct: uniq(show_struct).join(),
        }
    }

    getTimeInterval(): [number, number] | undefined {
        const all = this.selected
            .map((corpus) => corpus.time)
            .filter((item) => item != null)
            .map(Object.keys)
            .flat()
            .map(Number)
            .sort((a, b) => a - b)

        const from = all[0]
        const to = all.pop()
        return from && to ? [from, to] : undefined
    }

    getMomentInterval(): [Moment, Moment] | undefined {
        const infoGetter = (prop: "FirstDate" | "LastDate") => {
            return compact(this.selected.map((corpus) => corpus.info[prop])).map((item) => moment(item))
        }

        const froms = infoGetter("FirstDate")
        const tos = infoGetter("LastDate")

        const from = minBy(froms, (item) => item.unix())
        const to = maxBy(tos, (item) => item.unix())
        return from && to ? [from, to] : undefined
    }

    /** Percentage of selected material that is undated. */
    getUndatedRatio(): number {
        const non_time = sum(this.selected.map((corpus) => corpus.non_time || 0))
        const totalsize = sum(this.selected.map((corpus) => Number(corpus.info.Size) || 0))
        return non_time / totalsize
    }

    getTitleObj(corpus: string): LangString {
        return this.struct[corpus].title
    }

    getWordAttributeGroups(setOperator: SetOperator, lang?: string): AttributeOption[] {
        const allAttrs =
            setOperator === "union" ? this.getCurrentAttributes(lang) : this.getCurrentAttributesIntersection()

        const attrs: AttributeOption[] = []
        for (let key in allAttrs) {
            const obj = allAttrs[key]
            if (obj["display_type"] !== "hidden") {
                attrs.push({ group: "word_attr", ...obj })
            }
        }

        return attrs
    }

    getWordAttribute(attribute: string, lang?: string): Attribute {
        const attributes = this.getCurrentAttributes(lang)
        return attributes[attribute]
    }

    getStructAttributeGroups(setOperator: SetOperator, lang?: string): AttributeOption[] {
        const allAttrs = setOperator === "union" ? this.getStructAttrs(lang) : this.getStructAttrsIntersection(lang)

        const common = this.commonAttributes

        let sentAttrs: AttributeOption[] = []
        const object = { ...common, ...allAttrs }
        for (let key in object) {
            const obj = object[key]
            if (obj["display_type"] !== "hidden") {
                sentAttrs.push({ group: "sentence_attr", ...obj })
            }
        }

        sentAttrs = sortBy(sentAttrs, (item) => locObj(item.label))

        return sentAttrs
    }

    getAttributeGroups(wordOp: SetOperator, structOp: SetOperator, lang?: string): AttributeOption[] {
        const attrs = this.getWordAttributeGroups(wordOp, lang)
        const sentAttrs = this.getStructAttributeGroups(structOp, lang)
        return [this._wordGroup, ...attrs, ...sentAttrs]
    }

    getAttributeGroupsExtended(lang?: string): AttributeOption[] {
        return this.getAttributeGroups("union", "union", lang).filter((attr) => !get(attr, "hide_extended"))
    }

    getAttributeGroupsCompare(lang?: string): AttributeOption[] {
        return this.getAttributeGroups("intersection", "intersection", lang).filter(
            (attr) => !get(attr, "hide_compare"),
        )
    }

    getAttributeGroupsStatistics(lang?: string): AttributeOption[] {
        const wordOp = settings["reduce_word_attribute_selector"] || "union"
        const structOp = settings["reduce_struct_attribute_selector"] || "union"
        return this.getAttributeGroups(wordOp, structOp, lang).filter((attr) => !get(attr, "hide_statistics"))
    }

    /** Get list of morphology ids used by currently selected corpora. */
    getMorphologies(): string[] {
        const morphologies = this.mapSelectedCorpora((corpus) => (corpus.morphology || "").split("|")).flat()
        return uniq(compact(morphologies))
    }

    // update attributes so that we don't need to check them multiple times
    // currently done only for common and struct attributes, but code for
    // positional could be added here, but is tricky because parallel mode lang might be needed
    updateAttributes(): void {
        const common_keys = compact(this.selected.flatMap((corp) => Object.keys(corp.common_attributes || {})))
        this.commonAttributes = pick(settings["common_struct_types"], ...common_keys) as Record<string, Attribute>
        Object.entries(this.commonAttributes).forEach(([name, attr]) => (attr.name = name))
        this.structAttributes = this._getStructAttrs()
    }

    isDateInterval(type: string): boolean {
        if (!type) {
            return false
        }
        const attribute = type.split("_.").slice(-1)[0]
        return (
            this.commonAttributes[attribute]?.["extended_component"] == "dateInterval" ||
            this.structAttributes[attribute]?.["extended_component"] == "dateInterval"
        )
    }
}
