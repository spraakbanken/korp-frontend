import $ from "jquery"
import currentMode from "@/mode"
import "@fontsource/source-sans-pro/400.css"
import "@fontsource/source-sans-pro/600.css"

declare global {
    interface Window {
        jQuery: JQueryStatic
        $: JQueryStatic
    }
}

window.jQuery = $
window.$ = $

require("./styles/ui_mods.css")
require("./styles/jquery.tooltip.css")
require("rickshaw/rickshaw.css")

require("leaflet/dist/leaflet.css")
require("leaflet.markercluster/dist/MarkerCluster.css")
require("./styles/_bootstrap-custom.scss")

require("./styles/tailwind.scss")

require("./styles/styles.scss")
require("./styles/textreader.css")

require("components-jqueryui/ui/widgets/dialog.js") // Needed for popover
require("components-jqueryui/ui/widget.js")

require("./lib/jquery.localize")

try {
    // modes-files are optional and have customizing code
    require(`modes/${currentMode}_mode.js`)
} catch (error) {
    if (error.code != "MODULE_NOT_FOUND") console.error("Error importing mode file:", error)
}

require("./scripts/jq_extensions.js")

require("leaflet")
require("leaflet.markercluster")
require("leaflet-providers")
require("angular-filter/index.js")

require("./lib/jquery.tooltip.pack.js")

require("./scripts/main")
require("./scripts/app")

require("./scripts/services/matomo")
