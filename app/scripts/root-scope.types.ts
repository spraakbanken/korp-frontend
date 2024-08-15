/** @format */
import { IDeferred, IRootScopeService } from "angular"
import { Settings } from "./settings/settings.types"
import { LangLocMap, LocLangMap } from "@/i18n/types"
import { KorpQueryRequestOptions } from "./backend/kwic-proxy"
import { CqpQuery } from "./cqp_parser/cqp.types"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    _settings: Settings
    extendedCQP: string | null
    globalFilter: CqpQuery | null
    globalFilterDef: IDeferred<never>
    searchtabs: any
    kwicTabs: KwicTab[]
    compareTabs: {}[]
    graphTabs: {}[]
    mapTabs: {}[]
    textTabs: {}[]
    waitForLogin: boolean
    jsonUrl?: string
    lang: string
    loc_data: LangLocMap
    openErrorModal: (options: {
        content: string
        resolvable?: boolean
        onClose?: () => void
        buttonText?: string
        translations?: LocLangMap
    }) => void
}

export type KwicTab = {
    queryParams: KorpQueryRequestOptions
    readingMode?: boolean
}
