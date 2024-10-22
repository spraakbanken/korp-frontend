/** @format */
import _ from "lodash"
import angular, { IControllerService, IHttpService, type IRequestConfig, type IScope } from "angular"
import settings from "@/settings"
import { getLang, loc, locObj } from "@/i18n"
import { LangString } from "./i18n/types"
import { RootScope } from "./root-scope.types"
import { JQueryExtended, JQueryStaticExtended } from "./jquery.types"
import { HashParams, LocationService, UrlParams } from "./urlparams"
import { AttributeOption } from "./corpus_listing"

/** Use html`<div>html here</div>` to enable formatting template strings with Prettier. */
export const html = String.raw

/** Create an object from a list of keys and a function for creating corresponding values. */
export const fromKeys = <K extends keyof any, T>(keys: K[], getValue: (key: K) => T) =>
    Object.fromEntries(keys.map((key) => [key, getValue(key)]))

/** Mapping from service names to their TS types. */
type ServiceTypes = {
    $controller: IControllerService
    $http: IHttpService
    $location: LocationService
    $rootScope: RootScope
    // Add types here as needed.
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

/** Toggles class names for selected word elements in KWIC. */
export class SelectionManager {
    selected: JQuery<HTMLElement>
    aux: JQuery<HTMLElement>

    constructor() {
        this.selected = $()
        this.aux = $()
    }

    select(word: JQuery<HTMLElement>, aux: JQuery<HTMLElement>): void {
        if (word == null || !word.length) {
            return
        }
        if (this.selected.length) {
            this.selected.removeClass("word_selected token_selected")
            this.aux.removeClass("word_selected aux_selected")
        }
        this.selected = word
        this.aux = aux || $()
        this.aux.addClass("word_selected aux_selected")
        word.addClass("word_selected token_selected")
    }

    deselect(): void {
        if (!this.selected.length) {
            return
        }
        this.selected.removeClass("word_selected token_selected")
        this.selected = $()
        this.aux.removeClass("word_selected aux_selected")
        this.aux = $()
    }

    hasSelected(): boolean {
        return this.selected.length > 0
    }
}

export const getCqpAttribute = (option: AttributeOption): string =>
    option.is_struct_attr ? `_.${option.value}` : option.value

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
 * Format as `<relative> (<absolute>)` plus surrounding HTML.
 * @param absolute Number of absolute hits
 * @param relative Number of relative hits (hits per 1 million tokens)
 * @param lang The locale to use.
 * @returns A HTML snippet.
 */
export function hitCountHtml(absolute: number, relative: number, lang?: string) {
    lang = lang || getLang()
    const relativeHtml = `<span class='relStat'>${formatRelativeHits(relative, lang)}</span>`
    // TODO Remove outer span?
    // TODO Flexbox?
    const absoluteHtml = `<span class='absStat'>(${absolute.toLocaleString(lang)})</span>`
    return `<span>${relativeHtml} ${absoluteHtml}</span>`
}

/**
 * Render a lemgram string as pretty HTML.
 * TODO No HTML in placeholder in Extended!
 * @param lemgram A lemgram string, e.g. "vara..nn.2"
 * @param appendIndex Whether the numerical index should be included in output.
 * @returns An HTML string.
 */
export function lemgramToHtml(lemgram: string, appendIndex?: boolean): string {
    lemgram = _.trim(lemgram)
    if (!isLemgram(lemgram)) return lemgram
    const { form, pos, index } = splitLemgram(lemgram)
    const indexHtml = appendIndex && index !== "1" ? `<sup>${index}</sup>` : ""
    const concept = form.replace(/_/g, " ")
    const type = pos.slice(0, 2)
    return `${concept}${indexHtml} (<span rel="localize[${type}]">${loc(type)}</span>)`
}

/**
 * Render a lemgram string in pretty plain text.
 * @param lemgram A lemgram string, e.g. "vara..n.2"
 * @returns A plain-text string.
 */
export function lemgramToString(lemgram: string): string {
    const { form, pos, index } = splitLemgram(_.trim(lemgram))
    const indexSup = parseInt(index) > 1 ? numberToSuperscript(index) : ""
    const concept = form.replace(/_/g, " ")
    const type = pos.slice(0, 2)
    return `${concept}${indexSup} (${loc(type)})`
}

const lemgramRegexp = /\.\.\w+\.\d\d?(:\d+)?$/

/**
 * Determines if a string is a lemgram string, e.g. "vara..n.2"
 */
export const isLemgram = (str: string): boolean => str.search(lemgramRegexp) !== -1

/**
 * Analyze a lemgram string into its constituents.
 * @param lemgram A lemgram string, e.g. "vara..n.2"
 * @throws If input is not a lemgram. You can test it first with `isLemgram`!
 */
export function splitLemgram(lemgram: string): LemgramSplit {
    if (!isLemgram(lemgram)) {
        throw new Error(`Input to splitLemgram is not a lemgram: ${lemgram}`)
    }
    const match = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d+)(:\d+)?$/)!
    return {
        morph: match[2],
        form: match[3],
        pos: match[4],
        index: match[5],
        startIndex: match[6],
    }
}

type LemgramSplit = {
    morph: string
    form: string
    pos: string
    index: string
    startIndex: string
}

const saldoRegexp = /(.*?)\.\.(\d\d?)(:\d+)?$/

/**
 * Render a SALDO string as pretty HTML.
 * @param saldoId A SALDO string, e.g. "vara..2"
 * @param appendIndex Whether the numerical index should be included in output.
 * @returns An HTML string. If `saldoId` cannot be parsed as SALDO, it is returned as is.
 */
export function saldoToHtml(saldoId: string, appendIndex?: boolean): string {
    const match = saldoId.match(saldoRegexp)
    if (!match) return saldoId
    const concept = match[1].replace(/_/g, " ")
    const indexHtml = appendIndex && match[2] !== "1" ? `<sup>${match[2]}</sup>` : ""
    return `${concept}${indexHtml}`
}

/**
 * Render a SALDO string in pretty plain text.
 * @param saldoId A SALDO string, e.g. "vara..2"
 * @returns An plain-text string. If `saldoId` cannot be parsed as SALDO, it is returned as is.
 */
export function saldoToString(saldoId: string): string {
    const match = saldoId.match(saldoRegexp)
    if (!match) return saldoId
    const concept = match[1].replace(/_/g, " ")
    const indexSup = parseInt(match[2]) > 1 ? numberToSuperscript(match[2]) : ""
    return `${concept}${indexSup}`
}

/**
 * Represent a number with superscript characters like "⁴²".
 * @param n A decimal number.
 * @returns A string of superscript numbers.
 */
function numberToSuperscript(number: string | number): string {
    return [...String(number)].map((n) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[n]).join("")
}

// Add download links for other formats, defined in
// settings["download_formats"] (Jyrki Niemi <jyrki.niemi@helsinki.fi>
// 2014-02-26/04-30)

export function setDownloadLinks(xhr_settings: JQuery.AjaxSettings, result_data): void {
    // If some of the required parameters are null, return without
    // adding the download links.
    if (
        !(xhr_settings != null && result_data != null && result_data.corpus_order != null && result_data.kwic != null)
    ) {
        console.log("failed to do setDownloadLinks")
        return
    }

    if (result_data.kwic.length == 0) {
        $("#download-links").hide()
        return
    }

    $("#download-links").show()

    // Get the number (index) of the corpus of the query result hit
    // number hit_num in the corpus order information of the query
    // result.
    const get_corpus_num = (hit_num) => result_data.corpus_order.indexOf(result_data.kwic[hit_num].corpus)

    console.log("setDownloadLinks data:", result_data)
    $("#download-links").empty()
    // Corpora in the query result
    const result_corpora = result_data.corpus_order.slice(
        get_corpus_num(0),
        get_corpus_num(result_data.kwic.length - 1) + 1
    )
    // Settings of the corpora in the result, to be passed to the
    // download script
    const result_corpora_settings = {}
    let i = 0
    while (i < result_corpora.length) {
        const corpus_ids = result_corpora[i].toLowerCase().split("|")
        let j = 0
        while (j < corpus_ids.length) {
            const corpus_id = corpus_ids[j]
            result_corpora_settings[corpus_id] = settings.corpora[corpus_id]
            j++
        }
        i++
    }
    $("#download-links").append("<option value='init' rel='localize[download_kwic]'></option>")
    i = 0
    while (i < settings.download_formats.length) {
        const format = settings.download_formats[i]
        // NOTE: Using attribute rel="localize[...]" to localize the
        // title attribute requires a small change to
        // lib/jquery.localize.js. Without that, we could use
        // `loc`, but it would not change the
        // localizations immediately when switching languages but only
        // after reloading the page.
        // # title = loc('formatdescr_' + format)
        const option = $(`\
<option
    value="${format}"
    title="${loc(`formatdescr_${format}`)}"
    class="download_link">${format.toUpperCase()}</option>\
`)

        const download_params = {
            query_params: xhr_settings.url,
            format,
            korp_url: window.location.href,
            korp_server_url: settings.korp_backend_url,
            corpus_config: JSON.stringify(result_corpora_settings),
            corpus_config_info_keys: ["metadata", "licence", "homepage", "compiler"].join(","),
            urn_resolver: settings.urnResolver,
        }
        if ("downloadFormatParams" in settings) {
            if ("*" in settings.download_format_params) {
                $.extend(download_params, settings.download_format_params["*"])
            }
            if (format in settings.download_format_params) {
                $.extend(download_params, settings.download_format_params[format])
            }
        }
        option.appendTo("#download-links").data("params", download_params)
        i++
    }
    $("#download-links").off("change")
    ;($("#download-links") as JQueryExtended)
        .localize()
        .click(false)
        .change(function (event) {
            const params = $(":selected", this).data("params")
            if (!params) {
                return
            }
            ;($ as JQueryStaticExtended).generateFile(settings.download_cgi_script!, params)
            const self = $(this)
            return setTimeout(() => self.val("init"), 1000)
        })
}

/** Escape special characters in a string so it can be safely inserted in a regular expression. */
export const regescape = (s: string): string => s.replace(/[.|?|+|*||'|()^$\\]/g, "\\$&").replace(/"/g, '""')

/** Unescape special characters in a regular expression – remove single backslashes and replace double with single. */
export const unregescape = (s: string): string => s.replace(/\\\\|\\/g, (match) => (match === "\\\\" ? "\\" : ""))

/** Return the length of baseUrl with params added. */
const calcUrlLength = (baseUrl: string, params: any): number =>
    baseUrl.length + new URLSearchParams(params).toString().length + 1

/**
 * Add HTTP method to the HTTP configuration object conf for jQuery.ajax or AngularJS $http call:
 * if the result URL would be longer than settings.backendURLMaxLength, use POST, otherwise GET.
 * @param conf A $http or jQuery.ajax configuration object.
 *   For $http, the request parameters should be in `params` (moved to `data` for POST),
 *   and for jQuery.ajax, they should be in `data`.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethod<T extends JQuery.AjaxSettings | IRequestConfig>(conf: T): T {
    // The property to use for GET: AngularJS $http uses params for
    // GET and data for POST, whereas jQuery.ajax uses data for both
    const data = "params" in conf ? conf.params : conf.data
    if (calcUrlLength(conf.url!, data) > settings.backendURLMaxLength) {
        conf.method = "POST"
        conf.data = data
        if ("params" in conf) delete conf.params
    } else {
        conf.method = "GET"
        conf["params" in conf ? "params" : "data"] = data
    }
    return conf
}

/**
 * Like `httpConfAddMethod`, but for use with $http, to ensure data is sent as form data and not JSON.
 * @param {object} conf A $http or jQuery.ajax configuration object.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethodAngular<T extends JQuery.AjaxSettings | IRequestConfig>(conf: T & { url: string }): T {
    const fixedConf = httpConfAddMethod(conf)

    if (fixedConf.method == "POST") {
        const formDataParams = new FormData()
        for (var key in fixedConf.data) {
            formDataParams.append(key, fixedConf.data[key])
        }
        fixedConf.data = formDataParams

        if (!fixedConf.headers) {
            fixedConf.headers = {}
        }
        // will be set correct automatically by Angular
        fixedConf.headers["Content-Type"] = undefined
    }

    return fixedConf
}

/**
 * Like `httpConfAddMethod`, but for use with native `fetch()`.
 * @param conf A $http or jQuery.ajax configuration object.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethodFetch(
    url: string,
    params: Record<string, string>
): { url: string; request: RequestInit } {
    if (calcUrlLength(url, params) > settings.backendURLMaxLength) {
        const body = new FormData()
        for (const key in params) {
            body.append(key, params[key])
        }
        return { url, request: { method: "POST", body } }
    } else {
        return { url: url + "?" + new URLSearchParams(params), request: {} }
    }
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
