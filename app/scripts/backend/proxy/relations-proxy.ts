import ProxyBase from "./proxy-base"
import { unregescape } from "@/util"
import { ApiRelation, RelationsParams, RelationsSort } from "../types/relations"
import { parse } from "@/cqp_parser/cqp"
import { CqpQuery } from "@/cqp_parser/cqp.types"
import { corpusSelection } from "@/corpora/corpus_listing"
import { WordPicture, WordType } from "@/word-picture"

/** A relation item modified for showing. */
export type ShowableApiRelation = ApiRelation & {
    /** Direction of relation */
    show_rel: "head" | "dep"
}

export type TableData = {
    table: ApiRelation[] | { word: string }
    rel?: string
    show_rel?: string
}

export type TableDrawData = {
    token: string
    wordClass: string
    wordClassShort: string
    data: TableData[][]
}

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

    buildParams(type: WordType, word: string, sort: RelationsSort): RelationsParams {
        return {
            type,
            word,
            corpus: corpusSelection.stringify(),
            incremental: true,
            sort,
            max: 1000,
        }
    }

    async makeRequest(type: WordType, word: string, sort: RelationsSort): Promise<WordPicture> {
        if (type == "lemgram") word = unregescape(word)
        const params = this.buildParams(type, word, sort)
        const data = await this.send(params)
        if (!data.relations) throw new RelationsEmptyError("No relation data in response")
        const result = new WordPicture(word, type, data.relations)
        return result
    }
}

export class RelationsEmptyError extends Error {}
export class RelationsParseError extends Error {}
