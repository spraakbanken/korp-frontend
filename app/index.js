
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
window.isLab = window.location.pathname.split("/")[1] == "korplabb"
window.currentMode = deparam(window.location.search.slice(1)).mode || "default"

// tmhDynamicLocale = require("angular-dynamic-locale/src/tmhDynamicLocale")
require("angular-dynamic-locale/dist/tmhDynamicLocale.js")
window.Raphael = require("raphael")

require("jquery-flot/jquery.flot.js")
require("jquery-flot/jquery.flot.stack.js")

require("slickgrid/lib/jquery.event.drag-2.3.0")
require("slickgrid/slick.core")
require("slickgrid/slick.grid")
require("slickgrid/plugins/slick.checkboxselectcolumn")
require("slickgrid/plugins/slick.rowselectionmodel")

require("./scripts/jq_extensions.js")

window.moment = require("moment")
window.CSV = require("comma-separated-values/csv")

require("./lib/leaflet-settings.js")
// require("leaflet")
// require("leaflet.markercluster")
// require("leaflet-providers")
require("geokorp/dist/scripts/geokorp")
require("geokorp/dist/scripts/geokorp-templates")
require("angular-filter/index.js")


require("./lib/jquery.tooltip.pack.js")

window.settings = {}
settings.markup = {
  msd: require("./markup/msd.html")
}
require("configjs")
let commonSettings = require("commonjs")
// we need to put the exports on window so that the non-webpacked modes modes files
// can use the exports
_.map(commonSettings, function(v, k) {
  if (k in window) {
    console.error("warning, overwriting setting" + k)
  }
  window[k] = v
})

require("./scripts/components/sidebar.js")

require("./scripts/statistics.js")
require("./scripts/cqp_parser/CQPParser.js")
require("./scripts/cqp_parser/cqp.js")
require("./scripts/util.js")
require("./scripts/pie-widget.js")
require("./scripts/search.js")
require("./scripts/results.js")
require("./scripts/model.js")
require("./scripts/widgets.js")
require("./scripts/main.js")
require("./scripts/selector_widget.js")
require("./scripts/app.js")
require("./scripts/search_controllers.js")
require("./scripts/kwic_download.js")
require("./scripts/result_controllers.js")
require("./scripts/map_controllers.js")
require("./scripts/text_reader_controller.js")
require("./scripts/video_controllers.js")
require("./scripts/services.js")
require("./scripts/extended.js")
require("./scripts/struct_services.js")
require("./scripts/directives.js")
require("./scripts/filter_directives.js")
require("./scripts/newsdesk.js")

function requireAll(r) { r.keys().forEach(r) } 
requireAll(require.context('customcss', true, /\.css$/))
requireAll(require.context('customscripts', true, /\.js$/))

require("./index.pug")
