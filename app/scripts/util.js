/** @format */
import _ from "lodash"
import settings from "@/settings"

/** Use html`<div>html here</div>` to enable formatting template strings with Prettier. */
export const html = String.raw

window.util = {}

/**
 * Get/set values from the URL search string via Angular.
 * Only use this in code outside Angular. Inside, use `$location.search()`.
 * Note that this is sensitive to the number of arguments; omitting an argument is different from passing undefined.
 */
export function angularLocationSearch(...args) {
    const $root = angular.element("body")
    return safeApply($root.scope(), function () {
        const $location = $root.injector().get("$location")
        return $location.search(...args)
    })
}

// TODO Remove, currently used in tests
/** @deprecated */
window.locationSearch = angularLocationSearch

window.safeApply = function (scope, fn) {
    if (scope.$$phase || scope.$root.$$phase) {
        return fn(scope)
    } else {
        return scope.$apply(fn)
    }
}

export class SelectionManager {
    constructor() {
        this.selected = $()
        this.aux = $()
    }

    select(word, aux) {
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

    deselect() {
        if (!this.selected.length) {
            return
        }
        this.selected.removeClass("word_selected token_selected")
        this.selected = $()
        this.aux.removeClass("word_selected aux_selected")
        this.aux = $()
    }

    hasSelected() {
        return this.selected.length > 0
    }
}

/**
 * Get translated string from global localization data.
 * @param {string} key A translation key.
 * @param {string} [lang] The code of the language to translate to. Defaults to the global current language.
 * @returns {string} The translated string, or the value of `key` if no translation is found.
 */
export function loc(key, lang) {
    lang = lang || window.lang || settings["default_language"]
    try {
        return window.loc_data[lang][key]
    } catch (e) {
        return key
    }
}

/**
 * Get translated string from a given object.
 * @param {object | string} map An object of strings keyed by language codes. Alternatively, just a string.
 * @param {string} [lang] The code of the language to translate to. Defaults to the global current language.
 * @returns {string | undefined} The translated string, or undefined if no translation is found.
 */
export function locObj(map, lang) {
    if (!map) return undefined
    if (typeof map == "string") return map

    lang = lang || window.lang || settings["default_language"]
    if (map[lang]) {
        return map[lang]
    } else if (map[settings["default_language"]]) {
        return map[settings["default_language"]]
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
export function locAttribute(translations, key, lang) {
    lang = lang || window.lang || settings["default_language"]
    if (translations && translations[key])
        return _.isObject(translations[key]) ? translations[key][lang] : translations[key]
    return key
}

/**
 * Format a number of "relative hits" (hits per 1 million tokens), using exactly one decimal.
 * @param {number|string} x Number of relative hits
 * @param {string} lang The locale to use.
 * @returns A string with the number nicely formatted.
 */
export function formatRelativeHits(x, lang) {
    return Number(x).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/**
 * Format as `<relative> (<absolute>)` plus surrounding HTML.
 * @param {number} absolute Number of absolute hits
 * @param {number} relative Number of relative hits (hits per 1 million tokens)
 * @param {string} lang The locale to use.
 * @returns A HTML snippet.
 */
export function hitCountHtml(absolute, relative, lang) {
    const relativeHtml = `<span class='relStat'>${formatRelativeHits(relative, lang)}</span>`
    // TODO Remove outer span?
    // TODO Flexbox?
    const absoluteHtml = `<span class='absStat'>(${absolute.toLocaleString(lang)})</span>`
    return `<span>${relativeHtml} ${absoluteHtml}</span>`
}

/**
 * Render a lemgram string as pretty HTML.
 * TODO No HTML in placeholder in Extended!
 * @param {string} lemgram A lemgram string, e.g. "vara..nn.2"
 * @param {boolean} [appendIndex] Whether the numerical index should be included in output.
 * @returns {string} An HTML string.
 */
export function lemgramToHtml(lemgram, appendIndex) {
    lemgram = _.trim(lemgram)
    if (!isLemgram(lemgram)) return lemgram
    const { form, pos, index } = splitLemgram(lemgram)
    const indexHtml = appendIndex != null && index !== "1" ? `<sup>${index}</sup>` : ""
    const concept = form.replace(/_/g, " ")
    const type = pos.slice(0, 2)
    return `${concept}${indexHtml} (<span rel="localize[${type}]">${loc(type)}</span>)`
}

/**
 * Render a lemgram string in pretty plain text.
 * @param {string} lemgram A lemgram string, e.g. "vara..n.2"
 * @returns {string} A plain-text string.
 */
export function lemgramToString(lemgram) {
    const { form, pos, index } = splitLemgram(_.trim(lemgram))
    const indexSup = parseInt(index) > 1 ? numberToSuperscript(index) : ""
    const concept = form.replace(/_/g, " ")
    const type = pos.slice(0, 2)
    return `${concept}${indexSup} (${loc(type)})`
}

const lemgramRegexp = /\.\.\w+\.\d\d?(:\d+)?$/

/**
 * Determines if a string is a lemgram string, e.g. "vara..n.2"
 * @param {string} str A string to test.
 * @returns {boolean}
 */
export const isLemgram = (str) => str.search(lemgramRegexp) !== -1

/**
 * Analyze a lemgram string into its constituents.
 * @param {string} lemgram A lemgram string, e.g. "vara..n.2"
 * @returns {object} A map with the keys `morph`, `form`, `pos`, `index` and `startIndex`. Values are strings.
 * @throws If input is not a lemgram. You can test it first with `isLemgram`!
 */
export function splitLemgram(lemgram) {
    if (!isLemgram(lemgram)) {
        throw new Error(`Input to splitLemgram is not a lemgram: ${lemgram}`)
    }
    const match = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d+)(:\d+)?$/)
    return {
        morph: match[2],
        form: match[3],
        pos: match[4],
        index: match[5],
        startIndex: match[6],
    }
}

const saldoRegexp = /(.*?)\.\.(\d\d?)(:\d+)?$/

/**
 * Render a SALDO string as pretty HTML.
 * @param {string} saldoId A SALDO string, e.g. "vara..2"
 * @param {boolean} [appendIndex] Whether the numerical index should be included in output.
 * @returns {string} An HTML string.
 */
export function saldoToHtml(saldoId, appendIndex) {
    const match = saldoId.match(saldoRegexp)
    const concept = match[1].replace(/_/g, " ")
    const indexHtml = appendIndex != null && match[2] !== "1" ? `<sup>${match[2]}</sup>` : ""
    return `${concept}${indexHtml}`
}

/**
 * Render a SALDO string in pretty plain text.
 * @param {string} saldoId A SALDO string, e.g. "vara..2"
 * @returns {string} An plain-text string.
 */
export function saldoToString(saldoId) {
    const match = saldoId.match(saldoRegexp)
    const concept = match[1].replace(/_/g, " ")
    const indexSup = parseInt(match[2]) > 1 ? numberToSuperscript(match[2]) : ""
    return `${concept}${indexSup}`
}

/**
 * Represent a number with superscript characters like "⁴²".
 * @param {number | string} n A decimal number.
 * @returns A string of superscript numbers.
 */
function numberToSuperscript(number) {
    return [...String(number)].map((n) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[n]).join("")
}

// Add download links for other formats, defined in
// settings["download_formats"] (Jyrki Niemi <jyrki.niemi@helsinki.fi>
// 2014-02-26/04-30)

export function setDownloadLinks(xhr_settings, result_data) {
    // If some of the required parameters are null, return without
    // adding the download links.
    if (
        !(xhr_settings != null && result_data != null && result_data.corpus_order != null && result_data.kwic != null)
    ) {
        c.log("failed to do setDownloadLinks")
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

    c.log("setDownloadLinks data:", result_data)
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
    while (i < settings["download_formats"].length) {
        const format = settings["download_formats"][i]
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
            korp_server_url: settings["korp_backend_url"],
            corpus_config: JSON.stringify(result_corpora_settings),
            corpus_config_info_keys: ["metadata", "licence", "homepage", "compiler"].join(","),
            urn_resolver: settings.urnResolver,
        }
        if ("downloadFormatParams" in settings) {
            if ("*" in settings["download_format_params"]) {
                $.extend(download_params, settings["download_format_params"]["*"])
            }
            if (format in settings["download_format_params"]) {
                $.extend(download_params, settings["download_format_params"][format])
            }
        }
        option.appendTo("#download-links").data("params", download_params)
        i++
    }
    $("#download-links").off("change")
    $("#download-links")
        .localize()
        .click(false)
        .change(function (event) {
            const params = $(":selected", this).data("params")
            if (!params) {
                return
            }
            $.generateFile(settings["download_cgi_script"], params)
            const self = $(this)
            return setTimeout(() => self.val("init"), 1000)
        })
}

/** Escape special characters in a string so it can be safely inserted in a regular expression. */
export const regescape = (s) => s.replace(/[.|?|+|*||'|()^$\\]/g, "\\$&").replace(/"/g, '""')

/** Unescape special characters in a regular expression – remove single backslashes and replace double with single. */
export const unregescape = (s) => s.replace(/\\\\|\\/g, (match) => (match === "\\\\" ? "\\" : ""))

/** Return the length of baseUrl with params added. */
const calcUrlLength = (baseUrl, params) => baseUrl.length + new URLSearchParams(params).toString().length + 1

/**
 * Add HTTP method to the HTTP configuration object conf for jQuery.ajax or AngularJS $http call:
 * if the result URL would be longer than settings.backendURLMaxLength, use POST, otherwise GET.
 * @param {object} conf A $http or jQuery.ajax configuration object.
 *   For $http, the request parameters should be in `params` (moved to `data` for POST),
 *   and for jQuery.ajax, they should be in `data`.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethod(conf) {
    // The property to use for GET: AngularJS $http uses params for
    // GET and data for POST, whereas jQuery.ajax uses data for both
    const getDataProp = conf.params != undefined ? "params" : "data"
    const data = conf.data || conf.params
    if (calcUrlLength(conf.url, data) > settings.backendURLMaxLength) {
        conf.method = "POST"
        conf.data = data
        delete conf.params
    } else {
        conf.method = "GET"
        conf[getDataProp] = data
    }
    return conf
}

/**
 * Like `httpConfAddMethod`, but for use with $http, to ensure data is sent as form data and not JSON.
 * @param {object} conf A $http or jQuery.ajax configuration object.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethodAngular(conf) {
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
 * @param {object} conf A $http or jQuery.ajax configuration object.
 * @returns The same object, possibly modified in-place
 */
export function httpConfAddMethodFetch(conf) {
    const params = conf.params
    delete conf.params
    if (calcUrlLength(conf.url, params)) {
        conf.method = "POST"
        const form = new FormData()
        for (const key in params) {
            form.append(key, params[key])
        }
        conf.body = form
    } else {
        conf.method = "GET"
        conf.url = "?" + new URLSearchParams(params)
    }
    return conf
}

/**
 * Sort elements alphabetically by a given attribute.
 * @param {object[]} elems A list of objects.
 * @param {string | number} key A key that should be present in the objects.
 * @param {string} [lang] The code of the language to translate to. Defaults to the global current language.
 * @returns A copy of the list, sorted.
 */
export function collatorSort(elems, key, lang) {
    const comparator = new Intl.Collator(lang).compare
    return elems.slice().sort((a, b) => comparator(...[a, b].map((x) => locObj(x[key], lang))))
}
