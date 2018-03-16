
require("slickgrid/slick.grid.css")
require("./lib/jquery.reject.css")
require("./styles/ui_mods.css")
require("./styles/jquery.tooltip.css")
require("rickshaw/rickshaw.css")

require("leaflet/dist/leaflet.css")
require("leaflet.markercluster/dist/MarkerCluster.css")
require("geokorp/dist/styles/geokorp.css")
require("components-jqueryui/themes/smoothness/jquery-ui.min.css")
require("./styles/styles.scss")

window._ = require("lodash")
window.$ = require("jquery")
require("jquery-ui/ui/widget")
require("jquery-ui/ui/widgets/sortable.js")
require("jquery-ui/ui/widgets/dialog.js")

window.angular = require("angular")
require("angular-ui-bootstrap/src/typeahead")
require("angular-ui-bootstrap/src/tooltip")
require("angular-ui-bootstrap/src/modal")
require("angular-ui-bootstrap/src/tabs")
require("angular-ui-bootstrap/src/dropdown")
require("angular-ui-bootstrap/src/pagination")
require("angular-ui-bootstrap/src/datepicker")
require("angular-ui-bootstrap/src/timepicker")
require("angular-ui-bootstrap/src/buttons")

require("angular-spinner")
require("angular-ui-sortable/src/sortable")

require("jreject")
require("jquerybqq")
require("jquerylocalize")
require("./lib/jquery.format.js")

window.c = console
window.isLab = window.location.pathname.split("/")[1] == "korplabb"
window.currentMode = $.deparam.querystring().mode || "default"

// tmhDynamicLocale = require("angular-dynamic-locale/src/tmhDynamicLocale")
require("angular-dynamic-locale/dist/tmhDynamicLocale.js")
window.Raphael = require("raphael")

require("jstorage")
require("jquery-hoverintent")
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
require("leaflet")
require("leaflet.markercluster")
require("leaflet-providers")
require("geokorp/dist/scripts/geokorp")
require("geokorp/dist/scripts/geokorp-templates")
require("angular-filter/index.js")


require("./lib/jquery.tooltip.pack.js")
window.Rickshaw = require("rickshaw")

window.settings = {}
settings.markup = {
  msd: require("./markup/msd.html")
}
require("configjs")
commonSettings = require("commonjs")
// we need to put the exports on window so that the non-webpacked modes modes files
// can use the exports
_.map(commonSettings, function(v, k) {
  if (k in window) {
    console.error("warning, overwriting setting" + k)
  }
  window[k] = v
})


require("./config/statistics_config.js")
require("./scripts/statistics.coffee")
require("./scripts/cqp_parser/CQPParser.js")
require("./scripts/cqp_parser/cqp.coffee")
require("./scripts/util.coffee")
require("./scripts/pie-widget.coffee")
require("./scripts/search.coffee")
require("./scripts/results.coffee")
require("./scripts/model.coffee")
require("./scripts/widgets.coffee")
require("./scripts/main.coffee")
require("./scripts/selector_widget.js")
require("./scripts/app.coffee")
require("./scripts/search_controllers.coffee")
require("./scripts/kwic_download.coffee")
require("./scripts/result_controllers.coffee")
require("./scripts/map_controllers.coffee")
require("./scripts/video_controllers.coffee")
require("./scripts/services.coffee")
require("./scripts/extended.coffee")
require("./scripts/struct_services.coffee")
require("./scripts/directives.coffee")
require("./scripts/filter_directives.coffee")
require("./scripts/newsdesk.coffee")

require("./index.pug")
