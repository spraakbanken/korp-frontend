angular.module('sbMapTemplate', ['template/sb_map.html']);

angular.module("template/sb_map.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/sb_map.html",
    "<div id=\"sb-map-container\" class=\"map\" >\n" +
    "    <div id=\"leaflet-map\" ng-if=\"showMap\">\n" +
    "        <leaflet center=\"center\" markers=\"markers\" height=\"520px\" layers=\"layers\" defaults=\"defaults\"></leaflet>\n" +
    "    </div>\n" +
    "    <div id=\"hover-info\">\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "");
}]);
