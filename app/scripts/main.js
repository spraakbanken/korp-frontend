/** @format */
import statemachine from "@/statemachine"
import { setDefaultConfigValues } from "./settings"

const korpFailImg = require("../img/korp_fail.svg")
const deparam = require("jquery-deparam")

import jStorage from "../lib/jstorage"

window.authenticationProxy = new model.AuthenticationProxy()
window.timeProxy = new model.TimeProxy()

const creds = jStorage.get("creds")
if (creds) {
    authenticationProxy.loginObj = creds
    statemachine.send("USER_FOUND", creds)
} else {
    statemachine.send("USER_NOT_FOUND")
}

// rewriting old url format to the angular one
if (location.hash.length && location.hash[1] !== "?") {
    location.hash = `#?${_.trimStart(location.hash, "#")}`
}

$.ajaxSetup({
    dataType: "json",
    traditional: true,
})

$.ajaxPrefilter("json", function (options) {
    if (options.crossDomain && !$.support.cors) {
        return "jsonp"
    }
})

const loc_dfd = window.initLocales()
$(document).keyup(function (event) {
    if (event.keyCode === 27) {
        if (kwicResults) {
            kwicResults.abort()
        }
        if ("lemgramResults" in window) {
            lemgramResults.abort()
        }
        if (statsResults) {
            statsResults.abort()
        }
    }
})

const corpusSettingsPromise = new Promise((resolve, reject) => {
    const labParam = window.isLab ? "&include_lab" : ""
    fetch(`${settings.korpBackendURL}/corpus_config?mode=${window.currentMode}${labParam}`).then((response) => {
        response.json().then((modeSettings) => {
            function rename(obj, from, to) {
                if (obj[from]) {
                    obj[to] = obj[from]
                    delete obj[from]
                }
            }

            rename(modeSettings["attributes"], "pos_attributes", "attributes")

            // take the backend configuration format for attributes and expand it
            // TODO the internal representation should be changed to a new, more compact one.
            for (const corpusId in modeSettings["corpora"]) {
                const corpus = modeSettings["corpora"][corpusId]

                rename(corpus, "pos_attributes", "attributes")
                for (const attrType of ["attributes", "struct_attributes", "custom_attributes"]) {
                    const attrList = corpus[attrType]
                    const attrs = {}
                    for (const attrIdx in attrList) {
                        const attr = modeSettings["attributes"][attrType][attrList[attrIdx]]
                        attrs[attr.name] = attr
                    }
                    // attrs is an object of attribute settings
                    corpus[attrType] = attrs
                    // attrList is an ordered list of the preferred order of attributes
                    corpus[`_${attrType}_order`] = attrList
                }
            }

            delete modeSettings["attributes"]

            if (!modeSettings["folders"]) {
                modeSettings["folders"] = {}
            }
            resolve(modeSettings)
        })
    })
})

Promise.all([loc_dfd, corpusSettingsPromise]).then(([locData, modeSettings]) => {
    _.assign(window.settings, modeSettings)

    setDefaultConfigValues()

    const corpora = settings.corpora

    if (!window.currentModeParallel) {
        settings.corpusListing = new CorpusListing(corpora)
    } else {
        settings.corpusListing = new ParallelCorpusListing(corpora)
    }

    // rewriting old language codes to new ones
    if (location.hash.includes("lang=")) {
        const match = /lang\=(.*?)(&|$)/.exec(location.hash)
        if (match) {
            const lang = match[1]
            if (settings.isoLanguages[lang]) {
                location.hash = location.hash.replace(`lang=${lang}`, `lang=${settings.isoLanguages[lang]}`)
            }
        }
    }

    try {
        angular.bootstrap(document, ["korpApp"])
    } catch (error) {
        c.error(error)
    }

    try {
        const corpus = locationSearch()["corpus"]
        if (corpus) {
            settings.corpusListing.select(corpus.split(","))
        }
        view.updateSearchHistory()
    } catch (error1) {
        c.error("ERROR setting corpora from location", error1)
    }

    if (isLab) {
        $("body").addClass("lab")
    }

    $("body").addClass(`mode-${window.currentMode}`)
    util.browserWarn()

    $("#search_history").change(function (event) {
        const target = $(this).find(":selected")
        if (_.includes(["http://", "https:/"], target.val().slice(0, 7))) {
            location.href = target.val()
        } else if (target.is(".clear")) {
            jStorage.set("searches", [])
            view.updateSearchHistory()
        }
    })

    let prevFragment = {}
    // Note that this is _not_ window.onhashchange (lowercase only) and is not called by the browser
    window.onHashChange = function (event, isInit) {
        const hasChanged = (key) => prevFragment[key] !== locationSearch()[key]
        if (hasChanged("lang")) {
            const newLang = locationSearch().lang || settings["default_language"]
            $("body").scope().lang = newLang
            window.lang = newLang
            util.localize()

            $("#languages").radioList("select", newLang)
        }

        if (isInit) {
            util.localize()
        }

        prevFragment = _.extend({}, locationSearch())
    }

    $("#languages").radioList({
        change() {
            const currentLang = $(this).radioList("getSelected").data("mode")
            locationSearch({
                lang: currentLang !== settings["default_language"] ? currentLang : null,
            })
        },
        // TODO: this does nothing?
        selected: settings["default_language"],
    })

    setTimeout(() => window.onHashChange(null, true), 0)
    $("body").animate({ opacity: 1 }, function () {
        $(this).css("opacity", "")
    })
})
