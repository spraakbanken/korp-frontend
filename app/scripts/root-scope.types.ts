/** @format */
import { IDeferred, IRootScopeService } from "angular"
import { Settings } from "./settings/settings.types"
import { LangLocMap, LocLangMap } from "@/i18n/types"

/** Extends the Angular Root Scope interface with properties used by this app. */
export type RootScope = IRootScopeService & {
    _settings: Settings
    extendedCQP: string | null
    globalFilterDef: IDeferred<never>
    searchtabs: any
    kwicTabs: {}[]
    compareTabs: {}[]
    graphTabs: {}[]
    mapTabs: {}[]
    textTabs: {}[]
    waitForLogin: boolean
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
