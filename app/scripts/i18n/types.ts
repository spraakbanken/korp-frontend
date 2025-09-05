/** UI strings (or something else) by localization key. */
export type LocMap<T = string> = {
    [key: string]: T
}

/** Strings (or something else) keyed by language code. */
export type LangMap<T = string> = {
    [lang: string]: T
}

/** UI strings keyed first by language and then by localization key. */
export type LangLocMap = LangMap<LocMap>

/** UI strings keyed first by localization key and then by language. */
export type LocLangMap = LocMap<LangMap>

export type LangString = string | LangMap

export type Labeled<T = string> = { label: LangString; value: T }
