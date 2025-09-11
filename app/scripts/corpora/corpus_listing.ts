import { CorpusSet } from "./corpus-set"

/** All corpora in the current mode. */
export let corpusListing: CorpusSet

/** Currently selected corpora. */
export let corpusSelection: CorpusSet

/** Initialize global corpus sets `corpusListing` and `corpusSelection`. */
export function setCorpusListing(cl: CorpusSet): void {
    if (corpusListing) throw new Error("Cannot reset global corpusListing")
    corpusListing = cl
    corpusSelection = cl.pick([])

    if (process.env.ENVIRONMENT != "production") {
        window.corpusListing = corpusListing
        window.corpusSelection = corpusSelection
    }
}

declare global {
    interface Window {
        corpusListing: CorpusSet
        corpusSelection: CorpusSet
    }
}
