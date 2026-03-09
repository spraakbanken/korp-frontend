import settings from "@/settings"
import { CorpusSet } from "@/corpora/corpus-set"
import { objectIntersection } from "@/util"
import { getUrlHash } from "@/urlparams"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Attribute, CorpusParallel } from "@/settings/config.types"

export class CorpusSetParallel extends CorpusSet {
    corpora: CorpusTransformed<CorpusParallel>[]
    activeLangs: string[]

    constructor(corpora: CorpusTransformed<CorpusParallel>[] = []) {
        super(corpora)

        // Cannot use Angular helpers (`locationSearchGet`) here, it's not initialized yet.
        const activeLangs = getUrlHash("parallel_corpora") || ""
        this.setActiveLangs(activeLangs.split(","))
    }

    pick(ids: string[]): CorpusSetParallel {
        ids = ids.map((id) => id.toLowerCase())
        const cl = new CorpusSetParallel()
        cl.pickFrom(this, ids)
        return cl
    }

    pickFrom(source: CorpusSetParallel, ids: string[]): void {
        // Include linked corpora, except if linked from pivot corpus
        const corpora = ids
            .flatMap((id) => id.split("|"))
            .flatMap((id) => {
                const corpus = source.get(id)
                const isPivot = corpus.linked_to.length > 1
                return isPivot ? corpus : source.getLinked(corpus)
            })
        const idsAll = corpora.map((corpus) => corpus.id)
        super.pickFrom(source, idsAll)
    }

    setActiveLangs(langlist: string[]): void {
        this.activeLangs = langlist
    }

    getReduceLang(): string {
        return this.activeLangs[0]
    }

    getAttributes(lang?: string): Record<string, Attribute> {
        if (!lang) lang = this.getReduceLang()

        const corpora = this.corpora.filter((item) => item.lang === lang)
        return corpora.reduce((attrs, corpus) => ({ ...attrs, ...corpus.attributes }), {} as Record<string, Attribute>)
    }

    getStructAttrs(lang?: string): Record<string, Attribute> {
        if (!lang) lang = this.getReduceLang()

        const corpora = this.corpora.filter((item) => item.lang === lang)
        const struct = corpora.reduce(
            (attrs, corpus) => ({ ...attrs, ...corpus.struct_attributes }),
            {} as Record<string, Attribute>,
        )
        Object.values(struct).forEach((attr) => (attr.is_struct_attr = true))

        return struct
    }

    getStructAttrsIntersection(lang: string): Record<string, Attribute> {
        const corpora = this.corpora.filter((item) => item.lang === lang)
        const attrs = corpora.map(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return objectIntersection(attrs)
    }

    getLinked(corp: CorpusTransformed<CorpusParallel>) {
        const output: CorpusTransformed<CorpusParallel>[] = this.corpora.filter((item) =>
            (corp["linked_to"] || []).includes(item.id),
        )
        return [corp].concat(output)
    }

    getEnabledByLang(lang: string): CorpusTransformed<CorpusParallel>[][] {
        const corps = this.corpora.filter((item) => item["lang"] === lang)
        return corps.map((item) => this.getLinked(item))
    }

    getLinksFromLangs(activeLangs: string[]): CorpusTransformed<CorpusParallel>[][] {
        if (activeLangs.length === 1) {
            return this.getEnabledByLang(activeLangs[0])
        }
        // get the languages that are enabled given a list of active languages
        const main = this.corpora.filter((corp) => corp.lang === activeLangs[0])

        let output: CorpusTransformed<CorpusParallel>[][] = []
        for (var lang of activeLangs.slice(1)) {
            const other = this.corpora.filter((corp) => corp.lang === lang)

            for (var cps of other) {
                const linked = main.filter((mainCorpus) => mainCorpus["linked_to"].includes(cps.id))
                output.push(...linked.map((item) => [item, cps]))
            }
        }

        return output
    }

    /** Get the within and context queries */
    getAttributeQuery(attr: "context" | "within"): string {
        const struct = this.getLinksFromLangs(this.activeLangs)
        const output: string[][] = struct.map((corps) => {
            const [main, ...others] = corps
            const isPivot = main.linked_to.length > 1
            return others.map(function (other) {
                // For pivot corpus, use the linked corpus config instead
                const corpus = isPivot ? other : main
                const value = Object.keys(corpus[attr])[0]
                return `${main.id}|${other.id}`.toUpperCase() + ":" + value
            })
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

    stringify(onlyMain?: boolean): string {
        const lists = this.getLinksFromLangs(this.activeLangs)

        if (onlyMain) {
            // Select corpora in the first search language
            const corpora = lists.flat().filter((item) => item.lang === this.activeLangs[0])
            return corpora.map((corpus) => corpus.id.toUpperCase()).join()
        }

        // Format pairs like X-SV|X-DA,X-SV|X-EN...
        return lists
            .flatMap(([main, ...others]) => others.map((other) => `${main.id}|${other.id}`))
            .join()
            .toUpperCase()
    }

    get(corpusID: string): CorpusTransformed<CorpusParallel> {
        // Remove first part if on the form "<a>|<b>"
        return super.get(corpusID.replace(/.*\|/, "")) as CorpusTransformed<CorpusParallel>
    }
}
