import { pageToRange } from "../common"
import ProxyBase from "./proxy-base"
import { RelationsSentencesResponse } from "../types/relations-sentences"
import { corpusSelection } from "@/corpora/corpus_listing"

export class RelationsTimeSentencesProxy extends ProxyBase<"relations_time_sentences"> {
    protected readonly endpoint = "relations_time_sentences"

    makeRequest(source: string, page: number, hpp: number): Promise<RelationsSentencesResponse> {
        const { start, end } = pageToRange(page || 0, hpp)

        return this.send({
            source,
            start,
            end,
            ...corpusSelection.buildShowParams(),
        })
    }
}
