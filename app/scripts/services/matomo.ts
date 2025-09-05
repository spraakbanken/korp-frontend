/**
 * @see: https://developer.matomo.org/guides/tracking-javascript-guide
 */
import settings from "@/settings"

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

/**
 * Send a command to Matomo.
 *
 * Does nothing if Matomo is not configured.
 */
export function matomoSend<P extends keyof Matomo>(command: P, ...args: Parameters<Matomo[P]>) {
    window._paq = window._paq || []
    window._paq.push([command, ...args])
}

/**
 * This type describes available Matomo commands.
 *
 * Extend as needed.
 * Fully described on https://developer.matomo.org/api-reference/tracking-javascript
 */
export type Matomo = {
    trackEvent: (category: string, action: string, name?: string, value?: number) => void
    trackLink: (url: string, linkType: string) => void
    trackPageView: (customTitle?: string) => void
    trackSiteSearch: (keyword: string, category?: string, resultsCount?: number) => void
}
