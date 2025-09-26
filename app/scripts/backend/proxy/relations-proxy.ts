import ProxyBase from "./proxy-base"
import { unregescape } from "@/util"
import { RelationsParams, RelationsSort } from "../types/relations"
import { parse } from "@/cqp_parser/cqp"
import { CqpQuery } from "@/cqp_parser/cqp.types"
import { corpusSelection } from "@/corpora/corpus_listing"
import { WordPicture, WordType } from "@/word-picture"

export type RelationsQuery = {
    type: WordType
    word: string
}

export class RelationsProxy extends ProxyBase<"relations"> {
    protected readonly endpoint = "relations"

    /** Parse a Check if a query can be used for word picture. */
    static parseCqp(cqp: string): RelationsQuery {
        const tokens = parse<CqpQuery>(cqp)

        if (tokens.length != 1) throw new RelationsParseError("Must be single token")
        const conditions = tokens[0].and_block
        if (conditions?.length != 1 || conditions[0].length != 1)
            throw new RelationsParseError("Must have a single condition")
        const condition = conditions[0][0]

        const isWord = condition.type == "word" && condition.op == "="
        const isLemgram = condition.type == "lex" && condition.op == "contains"
        if (!isWord && !isLemgram) throw new RelationsParseError(`Attribute/operator not allowed`)

        if (!condition.val) throw new RelationsParseError("Condition value must not be empty")

        return {
            type: isWord ? "word" : "lemgram",
            word: condition.val as string,
        }
    }

    buildParams(type: WordType, word: string, sort: RelationsSort, splitTime = false): RelationsParams {
        return {
            type,
            word,
            corpus: corpusSelection.stringify(),
            incremental: true,
            sort,
            split_time: splitTime || undefined,
            max: 1000,
        }
    }

    async makeRequest(type: WordType, word: string, sort: RelationsSort, splitTime = false): Promise<WordPicture> {
        if (type == "lemgram") word = unregescape(word)
        const params = this.buildParams(type, word, sort, splitTime)
        const data = await this.send(params)
        if (!data.relations) throw new RelationsEmptyError("No relation data in response")
        const items = Array.isArray(data.relations) ? { all: data.relations } : data.relations
        const result = new WordPicture(word, type, items)
        return result
    }
}

export class RelationsEmptyError extends Error {}
export class RelationsParseError extends Error {}
