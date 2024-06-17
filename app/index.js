/** @format */
import $ from "jquery"
import currentMode from "@/mode"
import { locationSearchGet } from "@/util"

window.jQuery = $
window.$ = $

require("slickgrid/slick.grid.css")
require("./styles/ui_mods.css")
require("./styles/jquery.tooltip.css")
require("rickshaw/rickshaw.css")

require("leaflet/dist/leaflet.css")
require("leaflet.markercluster/dist/MarkerCluster.css")
require("geokorp/dist/styles/geokorp.css")
require("components-jqueryui/themes/smoothness/jquery-ui.min.css")
require("./styles/_bootstrap-custom.scss")

require("./styles/tailwind.scss")

require("./styles/styles.scss")
require("./styles/textreader.css")

require("components-jqueryui/ui/widget.js")

require("angular")

require("jquerylocalize")

try {
    // modes-files are optional and have customizing code
    require(`modes/${currentMode}_mode.js`)
} catch (error) {
    if (error.code != "MODULE_NOT_FOUND") console.error("Error importing mode file:", error)
}

require("slickgrid/lib/jquery.event.drag-2.3.0")
require("slickgrid/slick.core")
require("slickgrid/slick.grid")
require("slickgrid/plugins/slick.checkboxselectcolumn")
require("slickgrid/plugins/slick.rowselectionmodel")
require("slickgrid/slick.interactions.js")

require("./scripts/jq_extensions.js")

require("leaflet")
require("leaflet.markercluster")
require("leaflet-providers")
require("angular-filter/index.js")

require("./lib/jquery.tooltip.pack.js")

require("./scripts/main.js")
require("./scripts/app.js")

require("./scripts/controllers/comparison_controller.js")
require("./scripts/controllers/kwic_controller.js")
require("./scripts/controllers/example_controller.js")
require("./scripts/controllers/statistics_controller.js")
require("./scripts/controllers/trend_diagram_controller.js")
require("./scripts/controllers/word_picture_controller.js")

require("./scripts/map_controllers.js")
require("./scripts/text_reader_controller.js")
require("./scripts/video_controllers.js")
require("./scripts/services.js")
require("./scripts/extended.js")
require("./scripts/struct_services.js")
require("./scripts/directives.js")
require("./scripts/directives/scroll.js")
require("./scripts/filter_directives.js")
require("./scripts/matomo.js")

// TODO Remove, currently used in tests
/** @deprecated */
window.locationSearch = locationSearchGet
