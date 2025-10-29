import angular from "angular"
import settings from "@/settings"
import { fetchInitialData } from "@/data_init"
import currentMode from "@/mode"
import { html, simpleModal } from "@/util"
import { getUrlHash } from "./urlparams"
import korpLogo from "../img/korp.svg"
import korpFail from "../img/korp_fail.svg"
import { findAuthModule } from "@/auth/init"
import { initAuth, setAuthModule } from "@/auth/auth"
import { createMaintenanceNewsElement } from "./services/maintenance-news"

const createSplashScreen = () => {
    const splash = document.getElementById("preload")
    if (!splash) {
        console.error("preload element missing")
        return
    }
    splash.innerHTML = html`<img class="animate-pulse" height="300" width="300" src="${korpLogo}" />`

    // Add maintenance news if loading is slow.
    const newsTimeout = 5000
    setTimeout(async () => {
        const splash = document.getElementById("preload")
        // Abort if app has continued loading
        if (!splash) return
        const html = await createMaintenanceNewsElement()
        const element = $(html).get(0)
        if (element) splash.append(element)
    }, newsTimeout)
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
    // Identify authentication module
    const authModule = findAuthModule()
    setAuthModule(authModule)
    // Check if user is logged in
    const authPromise = initAuth()
    // Fetch everything that only needs to be check once
    await fetchInitialData(authPromise)
    // Now wait for login to resolve
    await authPromise
    // startup Angular.js app
    initApp()
    document.getElementById("preload")?.remove()
})()
