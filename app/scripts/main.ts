/** @format */
import _ from "lodash"
import angular from "angular"
import settings from "@/settings"
import { fetchInitialData } from "@/data_init"
import currentMode from "@/mode"
import * as authenticationProxy from "@/components/auth/auth"
import { getUrlHash, html, simpleModal } from "@/util"
import korpLogo from "../img/korp.svg"
import korpFail from "../img/korp_fail.svg"
import { convertJstorage } from "@/local-storage"

const createSplashScreen = () => {
    const splash = document.getElementById("preload")
    if (!splash) {
        console.error("preload element missing")
        return
    }
    splash.innerHTML = html`<img class="splash" height="300" width="300" src="${korpLogo}" />`
}

function initApp() {
    // rewriting old language codes to new ones
    const lang = getUrlHash("lang")
    if (lang) {
        if (settings["iso_languages"][lang]) {
            location.hash = location.hash.replace(`lang=${lang}`, `lang=${settings["iso_languages"][lang]}`)
        }
    }

    angular.bootstrap(document, ["korpApp"])

    if (process.env.ENVIRONMENT == "staging") {
        $("body").addClass("lab")
    }

    $("body").addClass(`mode-${currentMode}`)

    // this is to hide all ugly markup before Angular is fully loaded
    $("#main").css("display", "block")
    $("#main").animate({ opacity: 1 }, function () {
        $(this).css("opacity", "")
    })
}

// Handle uncaught exceptions and rejections outside Angular
// Inside Angular, see the `$exceptionHandler` service.
window.onerror = (message, source, lineno, colno, error) => errorModal(message)
window.onunhandledrejection = (event) => errorModal(event.reason)

function errorModal(message: any) {
    const escaped = new Option(String(message)).innerHTML
    const content = html`<img class="block mx-auto mb-4" height="300" width="300" src="${korpFail}" />
        <p>${escaped}</p>`
    simpleModal(content)
}

createSplashScreen()
;(async () => {
    // TODO This was added in July 2024, remove after a few months?
    convertJstorage()
    // Check if user is logged in
    const initAuth = authenticationProxy.init()
    // Fetch everything that only needs to be check once
    await fetchInitialData(initAuth)
    // Now wait for login to resolve
    await initAuth
    // startup Angular.js app
    initApp()
    document.getElementById("preload")?.remove()
})()
