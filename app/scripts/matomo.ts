/**
 * @format
 * @see: https://developer.matomo.org/guides/tracking-javascript-guide
 */
import settings from "@/settings"
import angular from "angular"

// Allow environment-specific (development/staging/production) settings or fallback to general settings
const matomoSettings = {
    ...settings.matomo,
    ...settings.matomo?.[process.env.ENVIRONMENT],
}

if (matomoSettings.url && matomoSettings.site) {
    /** Matomo message queue */
    var _paq = (window._paq = window._paq || [])
    _paq.push(["trackPageView"])
    _paq.push(["enableLinkTracking"])

    // Load the Matomo client once page has been loaded.
    ;(function () {
        var u = matomoSettings["url"]
        _paq.push(["setTrackerUrl", u + "matomo.php"])
        _paq.push(["setSiteId", matomoSettings["site"]])
        var d = document,
            g = d.createElement("script"),
            s = d.getElementsByTagName("script")[0]
        g.type = "text/javascript"
        g.async = true
        g.src = u + "matomo.js"
        s.parentNode!.insertBefore(g, s)
    })()
}

type MatomoService = {
    /** Queue a Matomo command */
    send: (cmd: string, ...args: string[]) => void
}

angular.module("korpApp").factory("matomo", [
    (): MatomoService => ({
        send(cmd, ...args) {
            window._paq?.push([cmd, ...args])
        },
    }),
])
