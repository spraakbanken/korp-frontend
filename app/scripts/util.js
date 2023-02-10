/** @format */
import { CorpusListing } from "./corpus_listing"

const jRejectBackgroundImg = require("../img/browsers/background_browser.gif")
require("../img/browsers/browser_chrome.gif")
require("../img/browsers/browser_firefox.gif")
require("../img/browsers/browser_safari.gif")
require("../img/browsers/browser_opera.gif")

window.util = {}

window.CorpusListing = CorpusListing

// TODO never use this, remove when sure it is not used
window.search = (obj, val) => window.locationSearch(obj, val)

window.locationSearch = function (obj, val) {
    const s = angular.element("body").scope()

    const ret = safeApply(s.$root, function () {
        if (!obj) {
            return s.$root.locationSearch()
        }
        if (_.isObject(obj)) {
            obj = _.extend({}, s.$root.locationSearch(), obj)
            return s.$root.locationSearch(obj)
        } else {
            return s.$root.locationSearch(obj, val)
        }
    })

    if (val === null) {
        window.onHashChange()
    }
    return ret
}

// TODO it would be better only to load additional languages when there is a language change
window.initLocales = function () {
    const packages = ["locale", "corpora"]
    const prefix = "translations"
    const defs = []
    let loc_data = {}
    window.loc_data = loc_data
    const def = $.Deferred()
    for (let langObj of settings["languages"]) {
        const lang = langObj.value
        loc_data[lang] = {}
        for (let pkg of packages) {
            ;(function (lang, pkg) {
                let file = pkg + "-" + lang + ".json"
                file = prefix + "/" + file
                return defs.push(
                    $.ajax({
                        url: file,
                        dataType: "json",
                        cache: false,
                        success(data) {
                            return _.extend(loc_data[lang], data)
                        },
                    })
                )
            })(lang, pkg)
        }
    }

    $.when.apply($, defs).then(() => def.resolve(loc_data))

    return def
}

window.safeApply = function (scope, fn) {
    if (scope.$$phase || scope.$root.$$phase) {
        return fn(scope)
    } else {
        return scope.$apply(fn)
    }
}

util.SelectionManager = function () {
    this.selected = $()
    this.aux = $()
}

util.SelectionManager.prototype.select = function (word, aux) {
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

util.SelectionManager.prototype.deselect = function () {
    if (!this.selected.length) {
        return
    }
    this.selected.removeClass("word_selected token_selected")
    this.selected = $()
    this.aux.removeClass("word_selected aux_selected")
    this.aux = $()
}

util.SelectionManager.prototype.hasSelected = function () {
    return this.selected.length > 0
}

util.getLocaleString = (key, lang) => util.getLocaleStringUndefined(key, lang) || key

util.getLocaleStringObject = (translationObject, lang) => {
    if (!lang) {
        lang = window.lang || settings["default_language"]
    }
    if (translationObject) {
        if (typeof translationObject == "string") {
            return translationObject
        } else if (translationObject[lang]) {
            return translationObject[lang]
        } else if (translationObject[settings["default_language"]]) {
            return translationObject[settings["default_language"]]
        } else {
            // fall back to the first value if neither the selected or default langauge are available
            return translationObject.values()[0]
        }
    }
    return undefined
}

util.getLocaleStringUndefined = function (key, lang) {
    if (!lang) {
        lang = window.lang || settings["default_language"]
    }
    try {
        return window.loc_data[lang][key]
    } catch (e) {
        return undefined
    }
}

util.localize = function (root) {
    root = root || "body"
    $(root).localize()
}

util.lemgramToString = function (lemgram, appendIndex) {
    lemgram = _.trim(lemgram)
    let infixIndex = ""
    let concept = lemgram
    infixIndex = ""
    let type = ""
    if (util.isLemgramId(lemgram)) {
        const match = util.splitLemgram(lemgram)
        if (appendIndex != null && match.index !== "1") {
            infixIndex = $.format("<sup>%s</sup>", match.index)
        }
        concept = match.form.replace(/_/g, " ")
        type = match.pos.slice(0, 2)
    }
    return $.format("%s%s <span class='wordclass_suffix'>(<span rel='localize[%s]'>%s</span>)</span>", [
        concept,
        infixIndex,
        type,
        util.getLocaleString(type),
    ])
}

const numberToSuperscript = {
    1: "",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
    0: "⁰",
}

// use this function to get a pretty printed lemgram with no HTML
util.lemgramToPlainString = function (lemgram) {
    const { form, pos, index } = util.splitLemgram(_.trim(lemgram))
    const infixIndex = _.map(index, (indexPart) => numberToSuperscript[indexPart]).join("")
    const concept = form.replace(/_/g, " ")
    const type = pos.slice(0, 2)
    return `${concept}${infixIndex} (${util.getLocaleString(type)})`
}

util.saldoRegExp = /(.*?)\.\.(\d\d?)(:\d+)?$/
util.saldoToString = function (saldoId, appendIndex) {
    const match = saldoId.match(util.saldoRegExp)
    let infixIndex = ""
    if (appendIndex != null && match[2] !== "1") {
        infixIndex = $.format("<sup>%s</sup>", match[2])
    }
    return $.format("%s%s", [match[1].replace(/_/g, " "), infixIndex])
}

util.saldoToPlaceholderString = function (saldoId, appendIndex) {
    const match = saldoId.match(util.saldoRegExp)
    let infixIndex = ""
    if (appendIndex != null && match[2] !== "1") {
        infixIndex = $.format(" (%s)", match[2])
    }
    return $.format("%s%s", [match[1].replace(/_/g, " "), infixIndex])
}

util.lemgramRegexp = /\.\.\w+\.\d\d?(:\d+)?$/
util.isLemgramId = (lemgram) => lemgram.search(util.lemgramRegexp) !== -1

util.splitLemgram = function (lemgram) {
    if (!util.isLemgramId(lemgram)) {
        throw new Error(`Input to util.splitLemgram is not a lemgram: ${lemgram}`)
    }
    const keys = ["morph", "form", "pos", "index", "startIndex"]
    const splitArray = lemgram.match(/((\w+)--)?(.*?)\.\.(\w+)\.(\d\d?)(:\d+)?$/).slice(2)
    return _.zipObject(keys, splitArray)
}

// Add download links for other formats, defined in
// settings["download_formats"] (Jyrki Niemi <jyrki.niemi@helsinki.fi>
// 2014-02-26/04-30)

util.setDownloadLinks = function (xhr_settings, result_data) {
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
        // util.getLocaleString, but it would not change the
        // localizations immediately when switching languages but only
        // after reloading the page.
        // # title = util.getLocaleString('formatdescr_' + format)
        const option = $(`\
<option
    value="${format}"
    title="${util.getLocaleString(`formatdescr_${format}`)}"
    class="download_link">${format.toUpperCase()}</option>\
`)

        const download_params = {
            // query_params: JSON.stringify($.deparam.querystring(xhr_settings.url)),
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

util.searchHash = function (type, value) {
    locationSearch({
        search: type + "|" + value,
        page: 0,
    })
}

// Helper function to turn "8455999" into "8 455 999"
util.prettyNumbers = function (numstring) {
    const regex = /(\d+)(\d{3})/
    let outStrNum = numstring.toString()
    while (regex.test(outStrNum)) {
        outStrNum = outStrNum.replace(
            regex,
            `$1<span rel="localize[util_numbergroupseparator]">${util.getLocaleString(
                "util_numbergroupseparator"
            )}</span>$2`
        )
    }

    return outStrNum
}

window.regescape = (s) => s.replace(/[.|?|+|*||'|()^$]/g, "\\$&").replace(/"/g, '""')

window.unregescape = (s) => s.replace(/\\/g, "").replace(/""/g, '"')

util.formatDecimalString = function (x, mode, statsmode, stringOnly) {
    if (_.includes(x, ".")) {
        const parts = x.split(".")
        const decimalSeparator = util.getLocaleString("util_decimalseparator")
        if (stringOnly) {
            return parts[0] + decimalSeparator + parts[1]
        }
        if (mode) {
            return (
                util.prettyNumbers(parts[0]) +
                '<span rel="localize[util_decimalseparator]">' +
                decimalSeparator +
                "</span>" +
                parts[1]
            )
        } else {
            return util.prettyNumbers(parts[0]) + decimalSeparator + parts[1]
        }
    } else {
        if (statsmode) {
            return x
        } else {
            return util.prettyNumbers(x)
        }
    }
}

util.translateAttribute = (lang, translations, value) => {
    if (!lang) {
        lang = window.lang || settings["default_language"]
    }

    if (translations && translations[value]) {
        return _.isObject(translations[value]) ? translations[value][lang] : translations[value]
    } else {
        return value
    }
}

util.browserWarn = function () {
    $.reject({
        reject: {
            msie5: true,
            msie6: true,
            msie7: true,
            msie8: true,
            msie9: true,
        },

        imagePath: _.split(jRejectBackgroundImg, "/").slice(0, -1).join("/"),
        display: ["firefox", "chrome", "safari", "opera"],
        browserInfo: {
            // Settings for which browsers to display
            firefox: {
                text: "Firefox", // Text below the icon
                url: "http://www.mozilla.com/firefox/",
            }, // URL For icon/text link

            safari: {
                text: "Safari",
                url: "http://www.apple.com/safari/download/",
            },

            opera: {
                text: "Opera",
                url: "http://www.opera.com/download/",
            },

            chrome: {
                text: "Chrome",
                url: "http://www.google.com/chrome/",
            },

            msie: {
                text: "Internet Explorer",
                url: "http://www.microsoft.com/windows/Internet-explorer/",
            },
        },

        header: "Du använder en omodern webbläsare", // Header of pop-up window
        paragraph1:
            "Korp använder sig av moderna webbteknologier som inte stödjs av din webbläsare. En lista på de mest populära moderna alternativen visas nedan. Firefox rekommenderas varmt.", // Paragraph 1
        paragraph2: "", // Paragraph 2
        closeMessage:
            "Du kan fortsätta ändå – all funktionalitet är densamma – men så fort du önskar att Korp vore snyggare och snabbare är det bara att installera Firefox, det tar bara en minut.", // Message displayed below closing link
        closeLink: "Stäng varningen", // Text for closing link
        //   header: 'Did you know that your Internet Browser is out of date?', // Header of pop-up window
        //     paragraph1: 'Your browser is out of date, and may not be compatible with our website. A list of the most popular web browsers can be found below.', // Paragraph 1
        //     paragraph2: 'Just click on the icons to get to the download page', // Paragraph 2
        //     closeMessage: 'By closing this window you acknowledge that your experience on this website may be degraded', // Message displayed below closing link
        //     closeLink: 'Close This Window', // Text for closing link
        closeCookie: true, // If cookies should be used to remmember if the window was closed (see cookieSettings for more options)
        // Cookie settings are only used if closeCookie is true
        cookieSettings: {
            path: "/", // Path for the cookie to be saved on (should be root domain in most cases)
            expires: 100000,
        },
    }) // Expiration Date (in seconds), 0 (default) means it ends with the current session
}

window.__ = {}
window.__.remove = function (arr, elem) {
    const index = arr.indexOf(elem)
    if (index !== -1) {
        return arr.splice(arr.indexOf(elem), 1)
    }
}

// Add HTTP method to the HTTP configuration object conf for
// jQuery.ajax or AngularJS $http call: if the result URL would be
// longer than settings.backendURLMaxLength, use POST, otherwise GET.
// For a $http configuration, the request parameters should be in
// property "params" of conf (moved to "data" for POST), and for a
// jQuery.ajax configuration, they should be in "data".
util.httpConfAddMethod = function (conf) {
    // Return the length of baseUrl with params added
    const calcUrlLength = function (baseUrl, params) {
        return baseUrl.length + new URLSearchParams(params).toString().length + 1
    }

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

// For POST with the Angular $http service, handling data must be done a
// bit differenly to assure that the data is sent and "Form Data" and not JSON
util.httpConfAddMethodAngular = function (conf) {
    const fixedConf = util.httpConfAddMethod(conf)

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

util.collatorSort = (elems, key, lang) => {
    const comparator = new Intl.Collator(lang).compare
    return elems.slice().sort((a, b) => {
        return comparator(...[a, b].map((x) => util.translateAttribute(lang, x, key)))
    })
}
