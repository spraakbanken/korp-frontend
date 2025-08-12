/** @format */
import _ from "lodash"
import settings from "@/settings"
import { korpRequest } from "./common"
import { QueryResponse } from "./types/query"

export async function getDataForReadingMode(inputCorpus: string, textId: string): Promise<QueryResponse> {
    const corpus = inputCorpus.toUpperCase()
    const corpusSettings = settings.corpusListing.get(inputCorpus)

    // TODO: is this good enough?
    const show = _.keys(corpusSettings.attributes)
    const showStruct = _.keys(corpusSettings["struct_attributes"])

    const params = {
        corpus: corpus,
        cqp: `[_.text__id = "${textId}" & lbound(text)]`,
        context: corpus + ":1 text",
        // _head and _tail are needed for all corpora, so that Korp will know what whitespace to use
        // For sentence_id, we should find a more general solution, but here is one Språkbanken
        // corpus who needs sentence_id in order to map the selected sentence in the KWIC to
        // a sentence in the reading mode text.
        show: show.join(",") + ",sentence_id,_head,_tail",
        show_struct: showStruct.join(","),
        within: corpus + ":text",
        start: 0,
        end: 0,
    }

    return korpRequest("query", params)
}
