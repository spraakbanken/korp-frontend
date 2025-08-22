/** @format */
import _ from "lodash"
import settings from "@/settings"
import { CorpusListing } from "@/corpus_listing"
import { getUrlHash } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Attribute, CorpusParallel } from "@/settings/config.types"
import { LangString } from "@/i18n/types"

export class ParallelCorpusListing extends CorpusListing {
    corpora: CorpusTransformed<CorpusParallel>[]
    selected: CorpusTransformed<CorpusParallel>[]
    struct: Record<string, CorpusTransformed<CorpusParallel>>
    activeLangs: string[]

    constructor(corpora: Record<string, CorpusTransformed<CorpusParallel>>) {
        super(corpora)

        // Cannot use Angular helpers (`locationSearchGet`) here, it's not initialized yet.
        const activeLangs = getUrlHash("parallel_corpora") || ""
        this.setActiveLangs(activeLangs.split(","))
    }

    select(idArray: string[]): void {
        this.selected = _.uniq(idArray.flatMap((id) => this.getLinked(this.struct[id])))
        this.updateAttributes()
    }

    setActiveLangs(langlist: string[]): void {
        this.activeLangs = langlist
    }

    getReduceLang(): string {
        return this.activeLangs[0]
    }

    getCurrentAttributes(lang?: string): Record<string, Attribute> {
        if (_.isEmpty(lang)) {
            lang = settings.corpusListing.getReduceLang()
        }

        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        return corpora.reduce((attrs, corpus) => ({ ...attrs, ...corpus.attributes }), {} as Record<string, Attribute>)
    }

    getStructAttrs(lang?: string): Record<string, Attribute> {
        if (_.isEmpty(lang)) {
            lang = settings.corpusListing.getReduceLang()
        }

        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        const struct = corpora.reduce(
            (attrs, corpus) => ({ ...attrs, ...corpus.struct_attributes }),
            {} as Record<string, Attribute>
        )
        Object.values(struct).forEach((attr) => (attr.is_struct_attr = true))

        return struct
    }

    getStructAttrsIntersection(lang: string): Record<string, Attribute> {
        const corpora = _.filter(this.selected, (item) => item.lang === lang)
        const attrs = _.map(corpora, function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return this._mapping_intersection(attrs)
    }

    getLinked(corp: CorpusTransformed<CorpusParallel>, only_selected?: boolean) {
        const target = only_selected ? this.selected : Object.values(this.struct)
        let output: CorpusTransformed<CorpusParallel>[] = target.filter((item) =>
            (corp["linked_to"] || []).includes(item.id)
        )
        return [corp].concat(output)
    }

    getEnabledByLang(lang: string): CorpusTransformed<CorpusParallel>[][] {
        const corps = _.filter(this.selected, (item) => item["lang"] === lang)
        return corps.map((item) => this.getLinked(item, true))
    }

    getLinksFromLangs(activeLangs: string[]): CorpusTransformed<CorpusParallel>[][] {
        if (activeLangs.length === 1) {
            return this.getEnabledByLang(activeLangs[0])
        }
        // get the languages that are enabled given a list of active languages
        const main = _.filter(this.selected, (corp) => corp.lang === activeLangs[0])

        let output: CorpusTransformed<CorpusParallel>[][] = []
        for (var lang of activeLangs.slice(1)) {
            const other = _.filter(this.selected, (corp) => corp.lang === lang)

            for (var cps of other) {
                const linked = _(main)
                    .filter((mainCorpus) => mainCorpus["linked_to"].includes(cps.id))
                    .value()

                output = output.concat(_.map(linked, (item) => [item, cps]))
            }
        }

        return output
    }

    getAttributeQuery(attr: "context" | "within"): string {
        // gets the within and context queries

        const struct = this.getLinksFromLangs(this.activeLangs)
        const output: string[][] = []
        $.each(struct, function (i, corps) {
            const mainId = corps[0].id.toUpperCase()
            const mainIsPivot = !!corps[0].pivot

            const other = corps.slice(1)

            const pair = _.map(other, function (corp) {
                const a = mainIsPivot ? _.keys(corp[attr])[0] : _.keys(corps[0][attr])[0]
                return mainId + "|" + corp.id.toUpperCase() + ":" + a
            })
            return output.push(pair)
        })

        return output.join(",")
    }

    getContextParams() {
        return {
            context: this.getAttributeQuery("context"),
            default_context: settings["default_overview_context"],
        }
    }

    getWithinParam(): string {
        return this.getAttributeQuery("within")
    }

    stringifySelected(onlyMain?: boolean): string {
        let struct = this.getLinksFromLangs(this.activeLangs)
        if (onlyMain) {
            struct = _.map(struct, (pair) => {
                return _.filter(pair, (item) => {
                    return item.lang === this.activeLangs[0]
                })
            })

            return _.map(_.flatten(struct), "id")
                .map((a) => a.toUpperCase())
                .join(",")
        }

        const output: string[][] = []
        for (let i = 0; i < struct.length; i++) {
            const item = struct[i]
            var main = item[0]

            const pair = _.map(item.slice(1), (corp) => main.id.toUpperCase() + "|" + corp.id.toUpperCase())

            output.push(pair)
        }
        return output.join(",")
    }

    get(corpusID: string): CorpusTransformed {
        return this.struct[corpusID.split("|")[1]]
    }

    getTitleObj(corpusID: string): LangString {
        return this.get(corpusID).title
    }
}
