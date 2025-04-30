/** @format */
import { IPromise, IRootScopeService } from "angular"
import { LangLocMap } from "@/i18n/types"
import { KorpQueryRequestOptions } from "./backend/kwic-proxy"
import { CqpQuery } from "./cqp_parser/cqp.types"
import { CorpusListing } from "./corpus_listing"
import { CompareResult, MapRequestResult } from "@/backend/backend"
import { RelationsParams } from "@/backend/types/relations"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    getActiveCqp(): string | undefined
    /** CQP fragment built from selected filter values. */
    globalFilter: CqpQuery | null
    compareTabs: CompareTab[]
    graphTabs: GraphTab[]
    kwicTabs: KwicTab[]
    mapTabs: MapTab[]
    textTabs: TextTab[]
    wordpicSortProp: RelationsParams["sort"]
    loc_data: LangLocMap
}

export type DynamicTabName = "compareTabs" | "graphTabs" | "kwicTabs" | "mapTabs" | "textTabs"

export type CompareTab = IPromise<CompareResult>

export type GraphTab = {
    cqp: string
    subcqps: string[]
    labelMapping: Record<string, string>
    showTotal: boolean
    corpusListing: CorpusListing
}

export type KwicTab = {
    queryParams: KorpQueryRequestOptions
    readingMode?: boolean
}

export type MapTab = IPromise<MapRequestResult | void>

export type TextTab = {
    corpus: string
    sentenceData: Record<string, string>
}
