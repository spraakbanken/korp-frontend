
import settings from 'korp_config'

window.settings = settings
settings.markup = {
  msd: require("./markup/msd.html")
}

let $ = require("jquery");
window.jQuery = $;
window.$ = $;

require("slickgrid/slick.grid.css")
require("./lib/jquery.reject.css")
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

window._ = require("lodash")

require("components-jqueryui/ui/widget.js")
require("components-jqueryui/ui/widgets/sortable.js")
require("components-jqueryui/ui/widgets/dialog.js")

require("angular")
require("angular-ui-bootstrap/src/typeahead")
require("angular-ui-bootstrap/src/tooltip")
require("angular-ui-bootstrap/src/modal")
require("angular-ui-bootstrap/src/tabs")
require("angular-ui-bootstrap/src/dropdown")
require("angular-ui-bootstrap/src/pagination")
require("angular-ui-bootstrap/src/datepicker")
require("angular-ui-bootstrap/src/timepicker")
require("angular-ui-bootstrap/src/buttons")
require("angular-ui-bootstrap/src/popover")

require("angular-spinner")
require("angular-ui-sortable/src/sortable")

require("jreject")
require("jquerylocalize")
require("jqueryhoverintent")
require("./lib/jquery.format.js")

let deparam = require("jquery-deparam")

window.c = console
// __IS_LAB__ is defined in webpack and set to true if NODE_ENV is "staging"
window.isLab = __IS_LAB__
window.currentMode = deparam(window.location.search.slice(1)).mode || "default"

try {
  // modes-files are optional and have customizing code
  require(`modes/${currentMode}_mode.js`)
} catch (error) {
  console.log("No mode file available for mode:", currentMode)
}

require("angular-dynamic-locale/dist/tmhDynamicLocale.js")
window.Raphael = require("raphael")

require("jquery-flot/jquery.flot.js")
require("jquery-flot/jquery.flot.stack.js")

require("slickgrid/lib/jquery.event.drag-2.3.0")
require("slickgrid/slick.core")
require("slickgrid/slick.grid")
require("slickgrid/plugins/slick.checkboxselectcolumn")
require("slickgrid/plugins/slick.rowselectionmodel")
require("slickgrid/slick.interactions.js")

require("./scripts/jq_extensions.js")

window.moment = require("moment")
window.CSV = require("comma-separated-values/csv")

require("./lib/leaflet-settings.js")
require("leaflet")
require("leaflet.markercluster")
require("leaflet-providers")
require("geokorp/dist/scripts/geokorp")
require("geokorp/dist/scripts/geokorp-templates")
require("angular-filter/index.js")


require("./lib/jquery.tooltip.pack.js")



require("./scripts/components/sidebar.js")

require("./scripts/statistics.js")
require("./scripts/cqp_parser/CQPParser.js")
require("./scripts/cqp_parser/cqp.js")
require("./scripts/util.js")
require("./scripts/pie-widget.js")
require("./scripts/model.js")
require("./scripts/widgets.js")
require("./scripts/main.js")
require("./scripts/app.js")
require("./scripts/search_controllers.js")

require("./scripts/kwic_download.js")

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
require("./scripts/newsdesk.js")
