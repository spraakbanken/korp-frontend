import uniq from "lodash/uniq"
import { getAttrValues } from "@/backend/attr-values"
import { corpusSelection } from "@/corpora/corpus_listing"
import { AttributeOption } from "@/corpora/corpus-set"
import { loc, locAttribute } from "@/i18n"

/** Load attribute values from backend data as selector options. */
export async function loadOptions(attr: AttributeOption, lang: string): Promise<string[][]> {
    const name = attr.name
    const split = attr.type === "set"

    // check which corpora support attributes
    const corpora = corpusSelection.corpora
        .filter((corpus) => name in corpus.struct_attributes || name in corpus.attributes)
        .map((corpus) => corpus.id)

    if (!corpora.length) return []

    const data = await getAttrValues(corpora, name, split)

    return uniq(data)
        .map((item) => (item === "" ? ["", loc("empty", lang)] : [item, locAttribute(attr.translation, item, lang)]))
        .sort((a, b) => a[1].localeCompare(b[1], lang))
}
