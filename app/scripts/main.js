/** @format */
import statemachine from "@/statemachine"

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
    fetch(`${settings.korpConfigurationBackendURL}/info/${window.currentMode}`)
        .then((response) => response.json())
        .then((data) => resolve(data))
})

Promise.all([loc_dfd, corpusSettingsPromise]).then(([locData, modeSettings]) => {
    _.assign(window.settings, modeSettings)
    const corpora = settings.corpora

    if (!window.currentModeParallel) {
        settings.corpusListing = new CorpusListing(corpora)
    } else {
        settings.corpusListing = new ParallelCorpusListing(corpora)
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
            const newLang = locationSearch().lang || settings.defaultLanguage
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
                lang: currentLang !== settings.defaultLanguage ? currentLang : null,
            })
        },
        // TODO: this does nothing?
        selected: settings.defaultLanguage,
    })

    setTimeout(() => window.onHashChange(null, true), 0)
    $("body").animate({ opacity: 1 }, function () {
        $(this).css("opacity", "")
    })
})
