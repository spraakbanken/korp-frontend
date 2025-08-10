/** @format */
import _ from "lodash"
import angular, { IControllerService, IHttpService, ILocationService, ui, type IScope } from "angular"
import settings from "@/settings"
import { getLang, loc, locObj } from "@/i18n"
import { LangString } from "./i18n/types"
import { RootScope } from "./root-scope.types"
import { HashParams, UrlParams } from "./urlparams"
import { AttributeOption } from "./corpus_listing"
import { MaybeWithOptions, MaybeConfigurable } from "./settings/config.types"
import { AbsRelSeq } from "./statistics/statistics.types"
import { StoreService } from "./services/store"
import moment, { Moment } from "moment"

/** Use html`<div>html here</div>` to enable formatting template strings with Prettier. */
export const html = String.raw

/** The build hash, added to filenames for some asset files. */
// @ts-expect-error This magic Webpack variable is undefined, but is replaced at build time
export const BUILD_HASH = __webpack_hash__

/** Create an object from a list of keys and a function for creating corresponding values. */
export const fromKeys = <K extends keyof any, T>(keys: K[], getValue: (key: K) => T) =>
    Object.fromEntries(keys.map((key) => [key, getValue(key)]))

/** Mapping from service names to their TS types. */
type ServiceTypes = {
    $controller: IControllerService
    $http: IHttpService
    $location: LocationService
    $rootScope: RootScope
    $uibModal: ui.bootstrap.IModalService
    store: StoreService
    // Add types here as needed.
}

/** Extends the Angular Location service to assign types for supported URL hash params. */
export type LocationService = Omit<ILocationService, "search"> & {
    search(): HashParams
    search(search: HashParams): LocationService
    search<K extends keyof HashParams>(search: K, paramValue: HashParams[K] | any): LocationService
}

/** Get a parameter from the `?<key>=<value>` part of the URL. */
export const getUrlParam = <K extends keyof UrlParams>(key: K) =>
    new URLSearchParams(window.location.search).get(key) as UrlParams[K]

/**
 * Get a parameter from the `#?<key>=<value>` part of the URL.
 * It is preferred to use the Angular `$location` service to read and modify this.
 * Use this only when outside Angular context.
 */
export const getUrlHash = <K extends keyof HashParams>(key: K) =>
    new URLSearchParams(window.location.hash.slice(2)).get(key) as HashParams[K]

/** Get an Angular service from outside the Angular context. */
export const getService = <K extends keyof ServiceTypes>(name: K): ServiceTypes[K] =>
    angular.element("body").injector().get(name)

/** Wraps `scope.$apply()` to interfere less with the digest cycle (?) */
export const safeApply = <R>(scope: IScope, fn: (scope: IScope) => R): R =>
    scope.$$phase || scope.$root.$$phase ? fn(scope) : scope.$apply(fn)

/** Safely (?) use an Angular service from outside the Angular context. */
export const withService = <K extends keyof ServiceTypes, R>(name: K, fn: (service: ServiceTypes[K]) => R) =>
    safeApply(getService("$rootScope"), () => fn(getService(name)))

/**
 * Get values from the URL search string via Angular.
 * Only use this in code outside Angular. Inside, use `$location.search()`.
 */
export const locationSearchGet = <K extends keyof HashParams>(key: K): HashParams[K] =>
    withService("$location", ($location) => ($location.search() as HashParams)[key])

/**
 * Set values in the URL search string via Angular.
 * Only use this in code outside Angular. Inside, use `$location.search()`.
 */
export const locationSearchSet = <K extends keyof HashParams>(name: K, value: HashParams[K]): LocationService =>
    withService("$location", ($location) => $location.search(name, value))

/**
 * Allows a given class to be overridden before instantiation.
 *
 * Define a factory for the standard class: `fooFactory = new Factory(Foo)`
 * Then optionally override the class to be used: `fooFactory.setService(Bar)`
 * Finally instantiate: `fooFactory.create()`
 */
export class Factory<T extends new (...args: any) => InstanceType<T>> {
    private class_: T
    constructor(class_: T) {
        this.setClass(class_)
    }
    setClass(class_: T) {
        this.class_ = class_
    }
    create(...args: ConstructorParameters<T>): InstanceType<T>
    create(...args: any[]): InstanceType<T> {
        return new this.class_(...args)
    }
}

/** Create a Moment that uses the date from one Date object and the time from another. */
export function combineDateTime(date: Date, time: Date): Moment {
    const m = moment(moment(date).format("YYYY-MM-DD"))
    const m_time = moment(time)
    m.add(m_time.hour(), "hour")
    m.add(m_time.minute(), "minute")
    return m
}

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

/** FooBar -> foo-bar */
export const kebabize = (str: string): string =>
    [...str].map((x, i) => (x == x.toUpperCase() ? (i ? "-" : "") + x.toLowerCase() : x)).join("")

/** Get attribute name for use in CQP, prepended with `_.` if it is a structural attribute. */
export const valfilter = (attrobj: AttributeOption): string =>
    attrobj["is_struct_attr"] ? `_.${attrobj.value}` : attrobj.value

/**
 * Get an object from a registry with optional options.
 *
 * The definition is a name, or a name and options.
 * If the object is a function, the options are passed to it.
 */
export function getConfigurable<T>(
    registry: Record<string, MaybeConfigurable<T>>,
    definition: MaybeWithOptions
): T | undefined {
    const name = typeof definition === "string" ? definition : definition.name
    const widget = registry[name]
    if (_.isFunction(widget)) {
        const options = typeof definition == "object" ? definition.options : {}
        return widget(options)
    }
    return widget
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
 * Represent a number with superscript characters like "⁴²".
 * @param n A decimal number.
 * @returns A string of superscript numbers.
 */
export function numberToSuperscript(number: string | number): string {
    return [...String(number)].map((n) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(n)]).join("")
}

/** Format time as hh:mm:ss if hours > 0, else mm:ss */
export function transformSeconds(seconds: number) {
    const hhmmss = new Date(seconds * 1000).toISOString().substring(11, 19)
    return hhmmss.replace(/^00:/, "")
}

/** Return htmlStr with quoted references to "img/filename.ext" replaced with "img/filename.BUILD_HASH.ext". */
export function addImgHash(htmlStr: string): string {
    return htmlStr.replace(/(["']img\/[^"']+)(\.[^"'.]+["'])/g, `$1.${BUILD_HASH}$2`)
}

/** Show a basic modal with vanilla JS */
export function simpleModal(html: string) {
    const dialog = document.createElement("dialog")
    dialog.classList.add("bg-white", "p-4", "rounded-lg", "shadow-lg", "border")
    const button = '<button class="block mx-auto btn btn-primary mt-4">OK</button>'
    dialog.innerHTML = html + button
    document.body.appendChild(dialog)
    dialog.showModal()
    dialog.querySelector("button")!.addEventListener("click", () => dialog.close())
}

/** Split a string by the first occurence of a given separator */
export const splitFirst = (sep: string, s: string): [string, string] => {
    const pos = s.indexOf(sep)
    if (pos == -1) return [s, ""]
    return [s.slice(0, pos), s.slice(pos + sep.length)]
}

/** Escape special characters in a string so it can be safely inserted in a regular expression. */
export const regescape = (s: string): string => s.replace(/[.|?|+|*||'|()^$\\]/g, "\\$&").replace(/"/g, '""')

/** Unescape special characters in a regular expression – remove single backslashes and replace double with single. */
export const unregescape = (s: string): string => s.replace(/\\\\|\\/g, (match) => (match === "\\\\" ? "\\" : ""))

/**
 * Select GET or POST depending on url length.
 */
export function selectHttpMethod(url: string, params: Record<string, any>): { url: string; request: RequestInit } {
    const urlFull = buildUrl(url, params)
    return urlFull.length > settings.backendURLMaxLength
        ? { url, request: { method: "POST", body: toFormData(params) } }
        : { url: urlFull, request: {} }
}

/** Convert object to FormData */
function toFormData(obj: Record<string, any>): FormData {
    const formData = new FormData()
    Object.entries(obj).forEach(([key, value]) => formData.append(key, value))
    return formData
}

/** Append search params to url */
export function buildUrl(base: string, params: Record<string, any>): string {
    const url = new URL(base)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
    return url.toString()
}

/** URL search params as a string value for comparison. */
export const paramsString = (params: URLSearchParams | Record<string, any>) =>
    JSON.stringify([...new URLSearchParams(params).entries()].sort())

/** Trigger a download in the browser. */
export function downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
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
