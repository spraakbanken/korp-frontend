/** @format */
import isObject from "lodash/isObject"
import settings from "@/settings"
import { getService } from "@/util"
import type { LangLocMap, LangMap, LocLangMap, LocMap } from "@/i18n/types"

/** Get the current UI language. */
export function getLang(): string {
    return getService("$rootScope")["lang"] || settings.default_language
}

/**
 * Get translated string from global localization data.
 * @param key A translation key.
 * @param [lang] The code of the language to translate to. Defaults to the global current language.
 * @returns The translated string, or the value of `key` if no translation is found.
 */
export function loc(key: string, lang?: string) {
    lang = lang || getLang()
    try {
        return (getService("$rootScope")["loc_data"] as LangLocMap)[lang][key]
    } catch (e) {
        return key
    }
}

/**
 * Get translated string from a given object.
 * @param map An object of strings keyed by language codes. Alternatively, just a string.
 * @param lang The code of the language to translate to. Defaults to the global current language.
 * @returns The translated string, or undefined if no translation is found.
 */
export function locObj(map: LangMap | string, lang?: string): string | undefined {
    if (!map) return undefined
    if (typeof map == "string") return map

    lang = lang || getLang()
    if (map[lang]) {
        return map[lang]
    } else if (map[settings.default_language]) {
        return map[settings.default_language]
    }

    // fall back to the first value if neither the selected or default language are available
    return Object.values(map)[0]
}

/**
 * Translate a given key in a translations list.
 * Very similar to `locObj(translations[key], lang)` but handles edge cases differently.
 * TODO Can we merge this with locObj?
 * @param {object} translations A two-dimensional map keyed first by translation keys and secondly by language codes, with translated strings as values.
 *   Alternatively, a one-dimensional map keyed only by translation keys, with non-translated strings as values.
 * @param {string} key A translation key.
 * @param {string} [lang] The code of the language to translate to. Defaults to the global current language.
 * @returns {string} The translated string, undefined if no translation is found, or the value of `key` if `translations` is unusable.
 */
export function locAttribute(translations: LocMap | LocLangMap, key: string, lang?: string): string {
    lang = lang || getLang()
    if (translations && translations[key])
        return isObject(translations[key]) ? translations[key][lang] : translations[key]
    return key
}
