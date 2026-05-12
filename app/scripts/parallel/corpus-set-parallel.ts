import settings from "@/settings"
import { AttributeOption, CorpusSet } from "@/corpora/corpus-set"
import { objectIntersection } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Attribute, CorpusParallel } from "@/settings/config.types"

type PCorpus = CorpusTransformed<CorpusParallel>

export class CorpusSetParallel extends CorpusSet {
    corpora: PCorpus[]

    /** Languages being queried, main language first */
    protected langs: string[] = []

    pick(ids: string[]): CorpusSetParallel {
        ids = ids.map((id) => id.toLowerCase())
        const cl = new CorpusSetParallel()
        cl.pickFrom(this, ids)
        cl.setLangs(this.langs)
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

    setLangs(langs: string[]): void {
        this.langs = langs
    }

    getMainCorpora(): PCorpus[] {
        return this.getCorporaWithLang(this.langs[0])
    }

    getCorporaWithLang(lang: string): PCorpus[] {
        return this.corpora.filter((item) => item.lang === lang)
    }

    getAttributes(lang?: string): Record<string, Attribute> {
        lang ??= this.langs[0]
        const corpora = this.getCorporaWithLang(lang)
        return corpora.reduce((attrs, corpus) => ({ ...attrs, ...corpus.attributes }), {} as Record<string, Attribute>)
    }

    getStructAttrs(lang?: string): Record<string, Attribute> {
        lang ??= this.langs[0]
        const corpora = this.getCorporaWithLang(lang)
        const struct = corpora.reduce(
            (attrs, corpus) => ({ ...attrs, ...corpus.struct_attributes }),
            {} as Record<string, Attribute>,
        )
        Object.values(struct).forEach((attr) => (attr.is_struct_attr = true))

        return struct
    }

    getStructAttrsIntersection(lang?: string): Record<string, Attribute> {
        lang ??= this.langs[0]
        const corpora = this.getCorporaWithLang(lang)
        const attrs = corpora.map(function (corpus) {
            for (let key in corpus["struct_attributes"]) {
                const value = corpus["struct_attributes"][key]
                value["is_struct_attr"] = true
            }

            return corpus["struct_attributes"]
        })
        return objectIntersection(attrs)
    }

    /** Get a list with the given corpus and its linked corpora */
    getLinked(corp: PCorpus) {
        const ids = corp["linked_to"] || []
        const linked = this.corpora.filter((item) => ids.includes(item.id))
        return [corp, ...linked]
    }

    /** Get lists of corpora of the given language and the linked corpora of each */
    getEnabledByLang(lang: string): PCorpus[][] {
        const corps = this.getCorporaWithLang(lang)
        return corps.map((item) => this.getLinked(item))
    }

    /** Get corpora of the first given language, and corpora that are linked from those _and_ use any of the other given languages */
    getLinksFromLangs(langs: string[] = this.langs): PCorpus[][] {
        if (langs.length === 1) {
            return this.getEnabledByLang(langs[0])
        }
        /** Corpora of the first given language */
        const mains = this.getCorporaWithLang(langs[0])

        let output: PCorpus[][] = []
        for (const lang of langs.slice(1)) {
            const others = this.getCorporaWithLang(lang)

            for (var other of others) {
                const linked = mains.filter((main) => main["linked_to"].includes(other.id))
                output.push(...linked.map((item) => [item, other]))
            }
        }

        return output
    }

    /** Get the within and context queries */
    getAttributeQuery(attr: "context" | "within"): string {
        const struct = this.getLinksFromLangs()
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
        const lists = this.getLinksFromLangs()

        if (onlyMain) {
            // Select corpora in the first search language
            const corpora = lists.flat().filter((item) => item.lang === this.langs[0])
            return corpora.map((corpus) => corpus.id.toUpperCase()).join()
        }

        // Format pairs like X-SV|X-DA,X-SV|X-EN...
        return lists
            .flatMap(([main, ...others]) => others.map((other) => `${main.id}|${other.id}`))
            .join()
            .toUpperCase()
    }

    get(corpusID: string): PCorpus {
        // Remove first part if on the form "<a>|<b>"
        return super.get(corpusID.replace(/.*\|/, "")) as PCorpus
    }

    getUnsupportedCorpora(options: AttributeOption[]): CorpusSetParallel {
        const unsupported = options.flatMap((option) => option.unsupported)
        const linked = unsupported.flatMap((id) => this.getLinked(this.get(id)).map((corpus) => corpus.id))
        return this.pick([...unsupported, ...linked])
    }
}
