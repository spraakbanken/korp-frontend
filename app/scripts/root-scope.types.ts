/** @format */
import { IDeferred, IPromise, IRootScopeService } from "angular"
import { Settings } from "./settings/settings.types"
import { LangLocMap, LocLangMap } from "@/i18n/types"
import { KorpQueryRequestOptions } from "./backend/kwic-proxy"
import { CqpQuery } from "./cqp_parser/cqp.types"
import { CorpusListing } from "./corpus_listing"
import { CompareResult, MapRequestResult } from "@/backend/backend"
import { State } from "./services/store"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    _settings: Settings
    extendedCQP: string | null
    globalFilter: CqpQuery | null
    globalFilterDef: IDeferred<never>
    searchtabs: any
    simpleCQP?: string
    show_modal: "about" | false
    compareTabs: CompareTab[]
    graphTabs: GraphTab[]
    kwicTabs: KwicTab[]
    mapTabs: MapTab[]
    textTabs: TextTab[]
    waitForLogin: boolean
    jsonUrl?: string
    lang: string
    loc_data: LangLocMap
    store: State
    openErrorModal: (options: {
        content: string
        resolvable?: boolean
        onClose?: () => void
        buttonText?: string
        translations?: LocLangMap
    }) => void
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
