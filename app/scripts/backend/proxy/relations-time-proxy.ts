import { unregescape } from "@/util"
import ProxyBase from "./proxy-base"
import { WordPicture, WordType } from "@/word-picture"
import { RelationsTimeParams } from "../types/relations-time"
import { RelationsSort } from "../types/relations"
import { corpusSelection } from "@/corpora/corpus_listing"
import { mapValues } from "lodash"

export class RelationsTimeProxy extends ProxyBase<"relations_time"> {
    protected readonly endpoint = "relations_time"

    buildParams(type: WordType, word: string, sort: RelationsSort, periodSize: number): RelationsTimeParams {
        return {
            type,
            word,
            corpus: corpusSelection.stringify(),
            incremental: true,
            sort,
            period_size: periodSize,
            max: 1000,
        }
    }

    async makeRequest(
        type: WordType,
        word: string,
        sort: RelationsSort,
        periodSize: number = 10,
    ): Promise<Record<string, WordPicture>> {
        if (type == "lemgram") word = unregescape(word)
        const params = this.buildParams(type, word, sort, periodSize)
        const data = await this.send(params)
        const result = mapValues(data.relations_time, (period) => new WordPicture(word, type, period))
        return result
    }
}
