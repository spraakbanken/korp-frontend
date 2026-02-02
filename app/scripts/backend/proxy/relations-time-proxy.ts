import { unregescape } from "@/util"
import ProxyBase from "./proxy-base"
import { WordPicture, WordType } from "@/word-picture"
import { RelationsTimeParams } from "../types/relations-time"
import { RelationsSort } from "../types/relations"
import { corpusSelection } from "@/corpora/corpus_listing"
import { sortBy } from "lodash"

export type PeriodWordPicture = { range: string; data: WordPicture }

export class RelationsTimeProxy extends ProxyBase<"relations_time"> {
    protected readonly endpoint = "relations_time"

    buildParams(
        type: WordType,
        word: string,
        sort: RelationsSort,
        periodSize: number,
        periodAsc = false,
    ): RelationsTimeParams {
        return {
            type,
            word,
            corpus: corpusSelection.stringify(),
            incremental: true,
            sort,
            period_align: periodAsc ? "oldest" : undefined,
            period_size: periodSize,
            max: 1000,
        }
    }

    async makeRequest(
        type: WordType,
        word: string,
        sort: RelationsSort,
        periodSize: number = 10,
        periodAsc = false,
    ): Promise<PeriodWordPicture[]> {
        if (type == "lemgram") word = unregescape(word)
        const params = this.buildParams(type, word, sort, periodSize, periodAsc)
        const data = await this.send(params)

        // Sort periods
        const ranges = sortBy(Object.keys(data.relations_time), parseInt)
        if (!periodAsc) ranges.reverse()
        // Process each period's data
        return ranges.map((range) => ({
            range,
            data: new WordPicture(word, type, data.relations_time[range]),
        }))
    }
}
