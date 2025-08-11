/** @format */
import _ from "lodash"
import settings from "@/settings"
import { MapResult, parseMapData } from "@/map"
import { korpRequest } from "./common"
import { QueryResponse } from "./types/query"
import { CountParams, CountsSplit } from "./types/count"

export type MapRequestResult = {
    corpora: string[]
    cqp: string
    within?: string
    data: MapResult[]
    attribute: MapAttribute
}

type MapAttribute = { label: string; corpora: string[] }

export async function requestMapData(
    cqp: string,
    cqpExprs: Record<string, string>,
    defaultWithin: string | undefined,
    attribute: MapAttribute,
    relative?: boolean
): Promise<MapRequestResult> {
    const cl = settings.corpusListing.subsetFactory(attribute.corpora)
    const within = cl.getWithinParam(defaultWithin)

    const params: CountParams = {
        group_by_struct: attribute.label,
        cqp,
        corpus: attribute.corpora.join(","),
        incremental: true,
        split: attribute.label,
        relative_to_struct: relative ? attribute.label : undefined,
        default_within: defaultWithin,
        within,
    }

    Object.keys(cqpExprs).forEach((cqp, i) => (params[`subcqp${i}`] = cqp))

    const data = await korpRequest("count", params)

    // Normalize data to the split format.
    const normalizedData: CountsSplit = {
        ...data,
        combined: Array.isArray(data.combined) ? data.combined : [data.combined],
        corpora: _.mapValues(data.corpora, (stats) => (Array.isArray(stats) ? stats : [stats])),
    }

    let result = parseMapData(normalizedData, cqp, cqpExprs)
    return { corpora: attribute.corpora, cqp, within: defaultWithin, data: result, attribute }
}

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
