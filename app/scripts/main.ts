/** @format */
import _ from "lodash"
import angular from "angular"
import jStorage from "../lib/jstorage"
import settings from "@/settings"
import { updateSearchHistory } from "@/history"
import { fetchInitialData } from "@/data_init"
import currentMode from "@/mode"
import * as authenticationProxy from "@/components/auth/auth"
import { getUrlHash, html } from "@/util"
import korpLogo from "../img/korp.svg"
import korpFail from "../img/korp_fail.svg"

const createSplashScreen = () => {
    const splash = document.getElementById("preload")
    splash.innerHTML = html`<img class="splash" height="300" width="300" src="${korpLogo}" />`
}

const createErrorScreen = () => {
    const elem = document.getElementById("preload")
    elem.innerHTML = html`
        <div class="absolute top-1/3 text-center">
            <img class="block" height="300" width="300" src="${korpFail}" />
            Sorry, Korp doesn't seem to work right now
        </div>
    `
}

function initApp() {
    // rewriting old language codes to new ones
    const lang = getUrlHash("lang")
    if (lang) {
        if (settings["iso_languages"][lang]) {
            location.hash = location.hash.replace(`lang=${lang}`, `lang=${settings["iso_languages"][lang]}`)
        }
    }

    try {
        angular.bootstrap(document, ["korpApp"])
    } catch (error) {
        console.error(error)
    }

    try {
        updateSearchHistory()
    } catch (error) {
        console.error("ERROR setting corpora from location", error)
    }

    if (process.env.ENVIRONMENT == "staging") {
        $("body").addClass("lab")
    }

    $("body").addClass(`mode-${currentMode}`)

    $("#search_history").change(function (event) {
        const optionElement = $(this).find(":selected")
        const value = optionElement.val() as string
        if (_.includes(["http://", "https:/"], value.slice(0, 7))) {
            location.href = value
        } else if (optionElement.is(".clear")) {
            jStorage.set("searches", [])
            updateSearchHistory()
        }
    })

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
