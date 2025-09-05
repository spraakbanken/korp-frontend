import { pageToRange } from "../common"
import ProxyBase from "./proxy-base"
import { RelationsSentencesResponse } from "../types/relations-sentences"
import { corpusListing } from "@/corpora/corpus_listing"

export class RelationsSentencesProxy extends ProxyBase<"relations_sentences"> {
    protected readonly endpoint = "relations_sentences"

    makeRequest(source: string, page: number, hpp: number): Promise<RelationsSentencesResponse> {
        const { start, end } = pageToRange(page || 0, hpp)

        return this.send({
            source,
            start,
            end,
            ...corpusListing.buildShowParams(),
        })
    }
}
