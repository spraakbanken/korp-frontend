/** @format */
import { updateSearchHistory } from "@/history"
import { fetchInitialData } from "@/data_init"
import korpLogo from "../img/korplogo_block.svg"

const deparam = require("jquery-deparam")

import jStorage from "../lib/jstorage"

window.authenticationProxy = require("./components/auth/auth.js")

const createSplashScreen = () => {
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

function initApp() {
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
}

createSplashScreen()
;(async () => {
    try {
        // Check if user is logged in
        const initAuth = authenticationProxy.init()
        // Fetch everything that only needs to be check once
        await fetchInitialData(initAuth)
        // Now wait for login to resolve
        await initAuth
        document.getElementById("preload").remove()
        // startup Angular.js app
        initApp()
    } catch (error) {
        console.log(error)
        createErrorScreen()
    }
})()
