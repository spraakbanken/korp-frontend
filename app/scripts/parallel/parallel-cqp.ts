/** @format */
import { difference, groupBy, uniq } from "lodash"
import settings from "@/settings"
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { expandOperators } from "@/cqp_parser/cqp"

export type ParallelQuery = {
    lang: string
    cqp: string
    negate: boolean
}

export function getParallelCqp(queries: ParallelQuery[]) {
    const corpusListing = settings.corpusListing as ParallelCorpusListing
    const langs = queries.map((query) => query.lang)
    const linkedCorpora = corpusListing.getLinksFromLangs(langs).flat(2)
    const [head, ...tail] = queries

    const headCqp = expand(head.cqp)
    const tailCqps = tail.map((langobj, i) => {
        const prevLangs = langs.slice(0, i)
        const corpora = linkedCorpora.filter((corpus) => !prevLangs.includes(corpus.lang))
        const langMapping = groupBy(corpora, "lang")
        const linkedCorpus = langMapping[langobj.lang].map((corpus) => corpus.id.toUpperCase()).join("|")

        const expanded = expand(langobj.cqp)
        const neg = langobj.negate ? "!" : ""
        return `:LINKED_CORPUS:${linkedCorpus} ${neg} ${expanded}`
    })

    return headCqp + tailCqps.join("")
}

function expand(cqp: string) {
    try {
        return expandOperators(cqp)
    } catch (e) {
        console.log("parallel cqp parsing error", e)
        return cqp
    }
}

export function getEnabledLangs(queries: ParallelQuery[], i?: number) {
    const corpusListing = settings.corpusListing as ParallelCorpusListing

    function getLinkedLangs(lang: string) {
        const corpora = corpusListing.getLinksFromLangs([lang]).flat(2)
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
