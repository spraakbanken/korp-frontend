import { difference, groupBy, uniq } from "lodash"
import settings from "@/settings"
import { CorpusSetParallel } from "@/parallel/corpus-set-parallel"
import { expandCqp } from "@/cqp_parser/cqp"
import { corpusSelection } from "@/corpora/corpus_listing"

export type ParallelQuery = {
    lang: string
    cqp: string
    negate: boolean
}

export function getParallelCqp(queries: ParallelQuery[]) {
    const cl = corpusSelection as CorpusSetParallel
    const langs = queries.map((query) => query.lang)
    const linkedCorpora = cl.getLinksFromLangs(langs).flat(2)
    const [head, ...tail] = queries

    const headCqp = expandCqp(head.cqp)
    const tailCqps = tail.map((langobj, i) => {
        const prevLangs = langs.slice(0, i)
        const corpora = linkedCorpora.filter((corpus) => !prevLangs.includes(corpus.lang))
        const langMapping = groupBy(corpora, "lang")
        const linkedCorpus = langMapping[langobj.lang].map((corpus) => corpus.id.toUpperCase()).join("|")

        const expanded = expandCqp(langobj.cqp)
        const neg = langobj.negate ? "!" : ""
        return `:LINKED_CORPUS:${linkedCorpus} ${neg} ${expanded}`
    })

    return headCqp + tailCqps.join("")
}

export function getEnabledLangs(queries: ParallelQuery[], i?: number) {
    const cl = corpusSelection as CorpusSetParallel

    function getLinkedLangs(lang: string) {
        const corpora = cl.getLinksFromLangs([lang]).flat(2)
        return uniq(corpora.map((corpus) => corpus.lang))
    }

    if (i == 0) {
        queries[0].lang ??= settings.start_lang!
        return getLinkedLangs(settings.start_lang!)
    }

    const langs = queries.map((query) => query.lang)
    if (i) delete langs[i]

    const firstlang = queries[0]?.lang || settings.start_lang!
    var other = getLinkedLangs(firstlang)
    var langResult = difference(other, langs)

    if (i && queries[i] && !queries[i].lang) {
        queries[i].lang = langResult[0]
    }
    return langResult
}
