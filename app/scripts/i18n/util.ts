/** @format */
import { StoreService } from "@/services/store"
import { AbsRelSeq } from "@/statistics/statistics.types"
import { LangString } from "./types"
import { getLang, loc, locObj } from "."

/** Format a number like 60723 => 61K */
export function suffixedNumbers(num: number, lang: string) {
    let out = ""
    if (num < 1000) {
        // 232
        out = num.toString()
    } else if (num >= 1000 && num < 1e6) {
        // 232,21K
        out = (num / 1000).toFixed(2).toString() + "K"
    } else if (num >= 1e6 && num < 1e9) {
        // 232,21M
        out = (num / 1e6).toFixed(2).toString() + "M"
    } else if (num >= 1e9 && num < 1e12) {
        // 232,21G
        out = (num / 1e9).toFixed(2).toString() + "G"
    } else if (num >= 1e12) {
        // 232,21T
        out = (num / 1e12).toFixed(2).toString() + "T"
    }
    return out.replace(".", loc("util_decimalseparator", lang))
}

/**
 * Format a number of "relative hits" (hits per 1 million tokens), using exactly one decimal.
 * @param x Number of relative hits
 * @param lang The locale to use.
 * @returns A string with the number nicely formatted.
 */
export function formatRelativeHits(x: number | string, lang?: string) {
    lang = lang || getLang()
    return Number(x).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/**
 * Format frequency as relative or absolute using chosen mode.
 */
export function formatFrequency(store: StoreService, absrel: AbsRelSeq) {
    const [absolute, relative] = absrel
    return store.statsRelative ? formatRelativeHits(relative, store.lang) : absolute.toLocaleString(store.lang)
}

/**
 * Sort elements alphabetically by a given attribute.
 * @param elems A list of objects.
 * @param key A key that should be present in the objects.
 * @param lang The code of the language to translate to. Defaults to the global current language.
 * @returns A copy of the list, sorted.
 */
export function collatorSort<K extends keyof any, T extends Record<K, LangString>>(elems: T[], key: K, lang?: string) {
    lang = lang || getLang()
    const comparator = new Intl.Collator(lang).compare
    return elems.slice().sort((a, b) => comparator(locObj(a[key], lang), locObj(b[key], lang)))
}
