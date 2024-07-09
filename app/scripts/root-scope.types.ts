/** @format */
import { IDeferred, IRootScopeService } from "angular"
import { Settings } from "./settings/settings.types"
import { LangLocMap } from "./i18n/types"

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
    }) => void
}
