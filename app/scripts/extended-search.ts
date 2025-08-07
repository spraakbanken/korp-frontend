/** @format */
import uniq from "lodash/uniq"
import { getAttrValues } from "./backend/attr-values"
import { AttributeOption } from "./corpus_listing"
import { loc, locAttribute } from "./i18n"
import settings from "./settings"

/** Load attribute values from backend data as selector options. */
export async function loadOptions(attr: AttributeOption, lang: string) {
    const name = attr.value
    const split = attr.type === "set"

    // check which corpora support attributes
    const corpora = settings.corpusListing.selected
        .filter((corpus) => name in corpus.struct_attributes || name in corpus.attributes)
        .map((corpus) => corpus.id)

    const data = await getAttrValues(corpora, name, split)

    return uniq(data)
        .map((item) => (item === "" ? ["", loc("empty", lang)] : [item, locAttribute(attr.translation, item, lang)]))
        .sort((a, b) => a[1].localeCompare(b[1], lang))
}
