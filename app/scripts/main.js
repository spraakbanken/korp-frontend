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
            function changeLangCode(obj, key) {
                if (typeof obj[key] === "object" && obj[key] !== null && obj[key]["swe"]) {
                    obj[key] = { en: obj[key]["eng"], sv: obj[key]["swe"] }
                }
            }

            function rename(obj, from, to) {
                if (obj[from]) {
                    obj[to] = obj[from]
                    delete obj[from]
                }
            }

            rename(modeSettings["attributes"], "pos_attributes", "attributes")
            rename(modeSettings["attributes"], "struct_attributes", "structAttributes")
            rename(modeSettings["attributes"], "custom_attributes", "customAttributes")

            for (const attrType of ["attributes", "structAttributes", "customAttributes"]) {
                for (const attrId in modeSettings["attributes"][attrType]) {
                    const attr = modeSettings["attributes"][attrType][attrId]
                    changeLangCode(attr, "label")
                    rename(attr, "extended_component", "extendedComponent")
                    rename(attr, "sidebar_component", "sidebarComponent")
                    rename(attr, "external_search", "externalSearch")
                    rename(attr, "display_type", "displayType")
                    rename(attr, "group_by", "groupBy")
                    rename(attr, "hide_sidebar", "hideSidebar")
                    rename(attr, "hide_statistics", "hideStatistics")
                    rename(attr, "hide_extended", "hideExtended")
                    rename(attr, "hide_compare", "hideCompare")
                    rename(attr, "extended_template", "extendedTemplate")
                    rename(attr, "sidebar_info_url", "sidebarInfoUrl")
                    rename(attr, "internal_search", "internalSearch")
                    rename(attr, "is_struct_attr", "isStructAttr")
                    rename(attr, "custom_type", "customType")
                }
            }

            // take the backend configuration format for attributes and expand it
            // TODO the internal representation should be changed to a new, more compact one.
            for (const corpusId in modeSettings["corpora"]) {
                const corpus = modeSettings["corpora"][corpusId]

                changeLangCode(corpus, "title")
                changeLangCode(corpus, "description")

                rename(corpus, "pos_attributes", "attributes")
                rename(corpus, "struct_attributes", "structAttributes")
                rename(corpus, "custom_attributes", "customAttributes")
                rename(corpus, "linked_to", "linkedTo")
                rename(corpus, "limited_access", "limitedAccess")
                rename(corpus, "reading_mode", "readingMode")

                // These are not used in our backend configuration, but it should be possible?
                rename(corpus, "default_language", "defaultLanguage")

                // These should not be done in the backend probably
                rename(corpus, "visible_modes", "visibleModes")
                rename(corpus, "mode_config", "modeConfig")

                // TODO the error is that the attributes should be fixed once, while traversing the top level "attributes"-object
                // Then expand format for each corpus

                for (const attrType of ["attributes", "structAttributes", "customAttributes"]) {
                    const attrList = corpus[attrType]
                    const attrs = {}
                    for (const attrIdx in attrList) {
                        const attr = modeSettings["attributes"][attrType][attrList[attrIdx]]
                        attrs[attr.name] = attr
                    }
                    // attrs is an object of attribute settings
                    corpus[attrType] = attrs
                    // attrList is an ordered list of the preferred order of attributes
                    corpus[attrType + "Order"] = attrList
                }
            }

            delete modeSettings["attributes"]

            rename(modeSettings, "folders", "corporafolders")
            rename(modeSettings, "preselected_corpora", "preselectedCorpora")
            rename(modeSettings, "start_lang", "startLang")
            rename(modeSettings, "default_overview_context", "defaultOverviewContext")
            rename(modeSettings, "default_reading_context", "defaultReadingContext")
            rename(modeSettings, "default_within", "defaultWithin")
            rename(modeSettings, "hits_per_page_default", "hitsPerPageDefault")
            rename(modeSettings, "hits_per_page_values", "hitsPerPageValues")

            function recurse(folder) {
                changeLangCode(folder, "title")
                changeLangCode(folder, "description")

                rename(folder, "corpora", "contents")

                for (const subFolderName in folder["subfolders"]) {
                    const subFolder = folder["subfolders"][subFolderName]
                    recurse(subFolder)
                    folder[subFolderName] = subFolder
                }
                delete folder["subfolders"]
            }
            for (const folder in modeSettings["corporafolders"]) {
                recurse(modeSettings.corporafolders[folder])
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
