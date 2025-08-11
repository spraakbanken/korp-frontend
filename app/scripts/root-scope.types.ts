/** @format */
import { IPromise, IRootScopeService } from "angular"
import { KorpQueryRequestOptions } from "./backend/kwic-proxy"
import { CorpusListing } from "./corpus_listing"
import { MapRequestResult } from "@/backend/backend"
import { CompareResult } from "@/backend/compare"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    compareTabs: CompareTab[]
    graphTabs: GraphTab[]
    kwicTabs: KwicTab[]
    mapTabs: MapTab[]
    textTabs: TextTab[]
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
