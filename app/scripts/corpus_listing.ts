/** @format */
import _ from "lodash"
import moment, { type Moment } from "moment"
import settings from "@/settings"
import { locObj } from "@/i18n"
import { Attribute } from "./settings/config.types"
import { CorpusTransformed } from "./settings/config-transformed.types"
import { LangString } from "./i18n/types"

export type AttributeOption = Partial<Attribute> & {
    group: "word" | "word_attr" | "sentence_attr"
    value: string
    label: LangString
}

/** How to join attribute lists of different corpora */
export type SetOperator = "union" | "intersection"

export class CorpusListing {
    corpora: CorpusTransformed[]
    selected: CorpusTransformed[]
    struct: Record<string, CorpusTransformed>
    structAttributes: Record<string, Attribute>
    commonAttributes: Record<string, Attribute>
    _wordGroup: AttributeOption

    constructor(corpora: Record<string, CorpusTransformed>) {
        this.struct = corpora
        this.corpora = _.values(corpora)
        this.selected = []
    }

    get(key: string) {
        return this.struct[key]
    }

    list() {
        return this.corpora
    }

    map<T>(func: (corpus: CorpusTransformed) => T): T[] {
        return _.map(this.corpora, func)
    }

    subsetFactory(idArray: string[]) {
        // returns a new CorpusListing instance from an id subset.
        idArray = _.invokeMap(idArray, "toLowerCase")
        const cl = new CorpusListing(_.pick(this.struct, ...idArray))
        cl.selected = cl.corpora
        cl.updateAttributes()
        return cl
    }

    // only applicable for parallel corpora
    getReduceLang(): string {
        return ""
    }

    // Returns an array of all the selected corpora's IDs in uppercase
    getSelectedCorpora() {
        return _.map(this.selected, "id")
    }

    select(idArray: string[]): void {
        this.selected = idArray.map((id) => this.struct[id])
        this.updateAttributes()
    }

    mapSelectedCorpora<T>(f: (corpus: CorpusTransformed) => T): T[] {
        return _.map(this.selected, f)
    }

    // takes an array of mapping objs and returns their intersection
    _mapping_intersection<T extends {}>(mappingArray: T[]): T {
        return (
            _.reduce(mappingArray, function (a: T, b: T) {
                const keys_intersect = _.intersection(_.keys(a), _.keys(b)) as (keyof T)[]
                const to_mergea = _.pick(a, ...keys_intersect)
                const to_mergeb = _.pick(b, ...keys_intersect)
                return _.merge({}, to_mergea, to_mergeb)
            }) || ({} as T)
        )
    }

    _mapping_union<T extends {}>(mappingArray: T[]): T {
        return _.reduce(mappingArray, (a, b) => _.merge(a, b), {} as T)
    }

    getCurrentAttributes(lang?: string) {
        // lang not used here, only in parallel mode
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)
        return this._invalidateAttrs(attrs)
    }

    getCurrentAttributesIntersection() {
        const attrs = this.mapSelectedCorpora((corpus) => corpus.attributes)

        return this._mapping_intersection(attrs)
    }

    getStructAttrsIntersection(lang?: string): Record<string, Attribute> {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return this._mapping_intersection(attrs)
    }

    getStructAttrs(lang?: string): Record<string, Attribute> {
        return this.structAttributes
    }

    _getStructAttrs(): Record<string, Attribute> {
        const attrs = this.mapSelectedCorpora(function (corpus) {
            // Set the is_struct_attr flag for all struct attributes
            Object.values(corpus["struct_attributes"]).forEach((attr) => (attr["is_struct_attr"] = true))
            // if a position attribute is declared as structural, include here
            const posAttrs = _.pickBy(corpus.attributes, (val, key) => val["is_struct_attr"])
            return { ...posAttrs, ...corpus["struct_attributes"] }
        })
        const rest = this._invalidateAttrs(attrs)

        // TODO this code merges datasets from attributes with the same name and
        // should be moved to the code for extended controller "datasetSelect"
        const withDataset: [string, Attribute][] = _.toPairs(rest).filter((item) => item[1].dataset)
        $.each(withDataset, function (i, item) {
            const key = item[0]
            const val = item[1]
            return $.each(attrs, function (j, origStruct) {
                if (origStruct[key] && origStruct[key].dataset) {
                    let ds = origStruct[key].dataset
                    if ($.isArray(ds)) {
                        ds = _.zipObject(ds, ds)
                    }

                    if (_.isArray(val.dataset)) {
                        val.dataset = _.zipObject(val.dataset, val.dataset)
                    }
                    return $.extend(val.dataset, ds)
                }
            })
        })

        return $.extend(rest, _.fromPairs(withDataset))
    }
    // End TODO

    getReduceAttrs(): Record<string, Attribute> {
        const allAttrs = {
            ...this.getCurrentAttributes(this.getReduceLang()),
            ...this.getStructAttrs(this.getReduceLang()),
        }
        return _.pickBy(allAttrs, (attribute) => attribute["display_type"] !== "hidden")
    }

    /** Compile list of filters applicable to all selected corpora. */
    getDefaultFilters(): Record<string, Attribute> {
        // Collect filters common to all selected corpora
        const attrs = _.intersection(...this.selected.map((corpus) => corpus["attribute_filters"] || []))
        return _.pick(this.structAttributes, ...attrs)
    }

    _invalidateAttrs(attrs: Record<string, Attribute>[]) {
        const union = this._mapping_union(attrs)
        const intersection = this._mapping_intersection(attrs)
        $.each(union, function (key, value) {
            if (intersection[key] == null) {
                value["disabled"] = true
            } else {
                return delete value["disabled"]
            }
        })

        return union
    }

    // returns true if coprus has all attrs, else false
    corpusHasAttrs(corpus: string, attrs: string[]): boolean {
        for (let attr of attrs) {
            if (
                attr !== "word" &&
                !(attr in $.extend({}, this.struct[corpus].attributes, this.struct[corpus]["struct_attributes"]))
            ) {
                return false
            }
        }
        return true
    }

    stringifySelected(onlyMain?: boolean): string {
        return _.map(this.selected, "id")
            .map((a) => a.toUpperCase())
            .join(",")
    }

    stringifyAll(): string {
        return _.map(this.corpora, "id")
            .map((a) => a.toUpperCase())
            .join(",")
    }

    getWithinKeys(): string[] {
        const struct = _.map(this.selected, (corpus) => _.keys(corpus.within))
        return _.union(...struct)
    }

    getContextParam(isReading: boolean) {
        const prefer = isReading ? settings["default_reading_context"] : settings["default_overview_context"]
        const avoid = isReading ? settings["default_overview_context"] : settings["default_reading_context"]
        // Use specified corpora or fall back to selected
        const output: string[] = []
        for (let corpus of this.selected) {
            const contexts = _.keys(corpus.context)
            if (!contexts.includes(prefer)) {
                if (contexts.length > 1 && contexts.includes(avoid)) {
                    contexts.splice(contexts.indexOf(avoid), 1)
                }
                output.push(corpus.id.toUpperCase() + ":" + contexts[0])
            }
        }
        return {
            context: _.compact(output).join(),
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
            _.pickBy(allWithins[0], (val, within) => {
                // ignore withins that start with numbers, such as "5 sentence"
                return !within.match(/^[0-9]/)
            })
        )
        if (_.isEmpty(withins)) {
            return { sentence: "sentence" }
        }
        return withins
    }

    getTimeInterval(): [number, number] | undefined {
        const all = _(this.selected)
            .map("time")
            .filter((item) => item != null)
            .map(_.keys)
            .flatten()
            .map(Number)
            .sort((a, b) => a - b)
            .value()

        const from = all[0]
        const to = all.pop()
        return from && to ? [from, to] : undefined
    }

    getMomentInterval(): [Moment, Moment] | undefined {
        const infoGetter = (prop: "FirstDate" | "LastDate") => {
            return _(this.selected)
                .map("info")
                .map(prop)
                .compact()
                .map((item) => moment(item))
                .value()
        }

        const froms = infoGetter("FirstDate")
        const tos = infoGetter("LastDate")

        const from = _.minBy(froms, (item) => item.unix())
        const to = _.maxBy(tos, (item) => item.unix())
        return from && to ? [from, to] : undefined
    }

    getTitleObj(corpus: string): LangString {
        return this.struct[corpus].title
    }

    /*
     * Avoid triggering watches etc. by only creating this object once.
     */
    getWordGroup(): AttributeOption {
        if (!this._wordGroup) {
            this._wordGroup = {
                group: "word",
                value: "word",
                label: settings["word_label"],
            }
        }
        return this._wordGroup
    }

    getWordAttributeGroups(setOperator: SetOperator, lang?: string): AttributeOption[] {
        const allAttrs =
            setOperator === "union" ? this.getCurrentAttributes(lang) : this.getCurrentAttributesIntersection()

        const attrs: AttributeOption[] = []
        for (let key in allAttrs) {
            const obj = allAttrs[key]
            if (obj["display_type"] !== "hidden") {
                attrs.push({ group: "word_attr", value: key, ...obj })
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
                sentAttrs.push({ group: "sentence_attr", value: key, ...obj })
            }
        }

        sentAttrs = _.sortBy(sentAttrs, (item) => locObj(item.label))

        return sentAttrs
    }

    getAttributeGroups(wordOp: SetOperator, structOp: SetOperator, lang?: string): AttributeOption[] {
        const word = this.getWordGroup()
        const attrs = this.getWordAttributeGroups(wordOp, lang)
        const sentAttrs = this.getStructAttributeGroups(structOp, lang)
        return [word].concat(attrs, sentAttrs)
    }

    getAttributeGroupsExtended(lang?: string): AttributeOption[] {
        return this.getAttributeGroups("union", "union", lang).filter((attr) => !attr["hide_extended"])
    }

    getAttributeGroupsCompare(lang?: string): AttributeOption[] {
        return this.getAttributeGroups("intersection", "intersection", lang).filter((attr) => !attr["hide_compare"])
    }

    getAttributeGroupsStatistics(lang?: string): AttributeOption[] {
        const wordOp = settings["reduce_word_attribute_selector"] || "union"
        const structOp = settings["reduce_struct_attribute_selector"] || "union"
        return this.getAttributeGroups(wordOp, structOp, lang).filter((attr) => !attr["hide_statistics"])
    }

    /** Get list of morphology ids used by currently selected corpora. */
    getMorphologies(): string[] {
        const morphologies = this.mapSelectedCorpora((corpus) => (corpus.morphology || "").split("|")).flat()
        return _.uniq(_.compact(morphologies))
    }

    // update attributes so that we don't need to check them multiple times
    // currently done only for common and struct attributes, but code for
    // positional could be added here, but is tricky because parallel mode lang might be needed
    updateAttributes(): void {
        const common_keys = _.compact(_.flatten(_.map(this.selected, (corp) => _.keys(corp.common_attributes))))
        this.commonAttributes = _.pick(settings["common_struct_types"], ...common_keys) as Record<string, Attribute>
        this.structAttributes = this._getStructAttrs()
    }

    isDateInterval(type: string): boolean {
        if (_.isEmpty(type)) {
            return false
        }
        const attribute = type.split("_.").slice(-1)[0]
        return (
            this.commonAttributes[attribute]?.["extended_component"] == "dateInterval" ||
            this.structAttributes[attribute]?.["extended_component"] == "dateInterval"
        )
    }
}
