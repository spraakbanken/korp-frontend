angular.module('sbMapTemplate', ['template/sb_map.html']);

angular.module("template/sb_map.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sb_map.html",
    "<div class=\"map\" >\n" +
    "    <div class=\"map-outer-container\" ng-show=\"showMap\">\n" +
    "        <div class=\"map-container\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"hover-info-container\" style=\"opacity:0;display:none;\"></div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);
