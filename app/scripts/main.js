/** @format */
import { setDefaultConfigValues } from "./settings"
import { updateSearchHistory } from "@/history"

const deparam = require("jquery-deparam")

import jStorage from "../lib/jstorage"

window.authenticationProxy = require("./components/auth/auth.js")

const loc_dfd = window.initLocales()

let initAuth

const corpusSettingsPromise = new Promise((resolve, reject) => {
    const createSplashScreen = () => {
        const korpLogo = require("../img/korplogo_block.svg")
        const splash = document.getElementById("preload")
        splash.innerHTML = `<img class="splash" height="300" width="300" src="${korpLogo}" />`
    }

    const createErrorScreen = () => {
        const korpFail = require("../img/korp_fail.svg")
        const elem = document.getElementById("preload")
        elem.innerHTML = `
            <div class="absolute top-1/3 text-center">
                <img class="block" height="300" width="300" src="${korpFail}" />
                Sorry, Korp doesn't seem to work right now
            </div>
        `
    }

    createSplashScreen()

    initAuth = authenticationProxy.init()

    const labParam = window.isLab ? "&include_lab" : ""
    fetch(`${settings["korp_backend_url"]}/corpus_config?mode=${window.currentMode}${labParam}`)
        .then((response) => {
            if (!response.ok) {
                console.error("Something wrong with corpus config", response.statusText)
                createErrorScreen()
            }

            response.json().then((modeSettings) => {
                window.currentModeParallel = modeSettings.parallel
                // only if the current mode is parallel, we load the special code required
                if (window.currentModeParallel) {
                    require("./parallel/corpus_listing.js")
                    require("./parallel/stats_proxy.js")
                }

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
                        const newAttrList = []
                        for (const attrIdx in attrList) {
                            const attr = modeSettings["attributes"][attrType][attrList[attrIdx]]
                            attrs[attr.name] = attr
                            newAttrList.push(attr.name)
                        }
                        // attrs is an object of attribute settings
                        corpus[attrType] = attrs
                        // attrList is an ordered list of the preferred order of attributes
                        corpus[`_${attrType}_order`] = newAttrList
                    }
                    // TODO use the new format instead
                    // remake the new format of witihns and contex to the old
                    const sortingArr = ["sentence", "paragraph", "text", "1 sentence", "1 paragraph", "1 text"]
                    function contextWithinFix(list) {
                        // sort the list so that sentence is before paragraph
                        list.sort((a, b) => sortingArr.indexOf(a.value) - sortingArr.indexOf(b.value))
                        const res = {}
                        for (const elem of list) {
                            res[elem.value] = elem.value
                        }
                        return res
                    }
                    corpus["within"] = contextWithinFix(corpus["within"])
                    corpus["context"] = contextWithinFix(corpus["context"])
                }

                delete modeSettings["attributes"]

                if (!modeSettings["folders"]) {
                    modeSettings["folders"] = {}
                }
                resolve(modeSettings)
                document.getElementById("preload").remove()
            })
        })
        .catch(() => createErrorScreen())
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

    // Need to wait for authentication before Angular.js is started, otherwise we can't if
    // login needs to be reinforced
    ;(async () => {
        await initAuth
    })()

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
        updateSearchHistory()
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
            updateSearchHistory()
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

    // this is to hide all ugly markup before Angular is fully loaded
    $("#main").css("display", "block")
    $("#main").animate({ opacity: 1 }, function () {
        $(this).css("opacity", "")
    })
})
