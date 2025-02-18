/** @format */
import { IDeferred, IPromise, IRootScopeService } from "angular"
import { LangLocMap } from "@/i18n/types"
import { KorpQueryRequestOptions } from "./backend/kwic-proxy"
import { CqpQuery } from "./cqp_parser/cqp.types"
import { CorpusListing } from "./corpus_listing"
import { CompareResult, MapRequestResult } from "@/backend/backend"
import { Attribute } from "./settings/config.types"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    activeSearch: {
        /** "word", "lemgram" or "cqp" */
        type: string
        val: string
    } | null
    extendedCQP: string | null
    /** Filter data by attribute name */
    globalFilterData: Record<string, FilterData>
    globalFilter: CqpQuery | null
    /** This deferred is used to signal that the filter feature is ready */
    globalFilterDef: IDeferred<never>
    /** This deferred is resolved when parallel search controller is loaded */
    langDef: IDeferred<never>
    simpleCQP?: string
    show_modal: "about" | false
    compareTabs: CompareTab[]
    graphTabs: GraphTab[]
    kwicTabs: KwicTab[]
    mapTabs: MapTab[]
    textTabs: TextTab[]
    waitForLogin: boolean
    lang: string
    loc_data: LangLocMap
    $on: (name: "corpuschooserchange", handler: (event: any, selected: string[]) => void) => void
}

export type FilterData = {
    attribute: Attribute
    /** Selected values */
    value: string[]
    /** Sorted list of options with counts */
    options: [string, number][]
}

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
