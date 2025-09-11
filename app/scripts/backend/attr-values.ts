import memoize from "lodash/memoize"
import { AttrValuesResponseDeep, AttrValuesResponseFlat, RecursiveRecord } from "./types/attr-values"
import { korpRequest } from "./common"

/** Find which unique values occur and count them. */
export const countAttrValues: (
    corpora: string[],
    attrs: string[],
    /** Attributes whose values should be split by "|" */
    split?: string[],
) => Promise<RecursiveRecord<number>> = memoize(
    async (corpora, attrs, split = []) => {
        // Join attributes as a hierarchical path that shapes the response
        const attributePath = attrs.join(">")
        const data = (await korpRequest("attr_values", {
            corpus: corpora.join(","),
            attr: attributePath,
            count: true,
            per_corpus: false,
            split: split.join(",") || undefined,
        })) as AttrValuesResponseDeep
        return data.combined[attributePath]
    },
    // Memoize based on the values of all arguments
    (...args) => JSON.stringify(args),
)

/** Find which unique values occur for a given attribute. */
export const getAttrValues: (
    corpora: string[],
    attr: string,
    /** Whether values should be split by "|" */
    split?: boolean,
) => Promise<string[]> = memoize(
    async (corpora, attr, split) => {
        const data = (await korpRequest("attr_values", {
            corpus: corpora.join(","),
            attr: attr,
            per_corpus: false,
            split: split ? attr : undefined,
        })) as AttrValuesResponseFlat
        return data.combined[attr]
    },
    // Memoize based on the values of all arguments
    (...args) => JSON.stringify(args),
)
