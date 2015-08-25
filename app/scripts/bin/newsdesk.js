(function() {
  angular.module('newsdesk', []).directive("newsDesk", function($window, $document, $rootElement, $http, $location) {
    return {
      template: '<div>\n    <div ng-if="shouldUseThis()" class="newsdesk-opener" ng-click="togglePopover($event)" ng-class="{\'newsdesk-new-news\': numNewNews != 0, \'newsdesk-no-new-news\' : numNewNews == 0}">\n        <i class="fa fa-bell newsdesk-bell"></i>\n        <div class="newsdesk-arrow-box">\n            <span>{{numNewNews}}</span>\n        </div>&nbsp;\n    </div>\n    <div class="popover newsdesk-popover" ng-click="onPopoverClick($event)" to-body>\n        <div class="arrow"></div>\n        <h2 class="popover-title">{{header | loc}}<span style="float:right;cursor:pointer" ng-click="popHide()">×</span></h2>\n        <div class="newsdesk-around-items">\n            <div class="newsdesk-news-item" ng-repeat="item in newsitems" ng-class="{\'newsdesk-new-news-item\': (item.d > lastChecked)}">\n                <h4>{{item.t[currentLang]}}</h4>\n                <span class="newsdesk-item-date">{{item.d}}</span>\n                <div ng-bind-html="item.h[currentLang] | trust"></div>\n            </div>\n        </div>\n    </div>\n</div>',
      restrict: "EA",
      replace: true,
      scope: {
        "header": "=",
        "storage": "="
      },
      link: function(scope, elem, attr) {
        var handleEscape, popover, s;
        s = scope;
        s.shouldUseThis = function() {
          return settings.news_desk_url != null;
        };
        if (s.shouldUseThis()) {
          s.onPopoverClick = function(event) {
            return event.stopPropagation();
          };
          s.newsitems = [];
          s.initData = function() {
            s.lastChecked = localStorage.getItem(s.storage) || "0000-00-00";
            return $.ajax({
              type: "GET",
              url: settings.news_desk_url,
              async: false,
              jsonpCallback: "newsdata",
              contentType: "application/json",
              dataType: "jsonp",
              success: function(json) {
                var currentDate, n, n_item, newsitem, _i, _len, _ref;
                currentDate = new Date().toISOString().slice(0, 10);
                s.newsitems = (function() {
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = json.length; _i < _len; _i++) {
                    newsitem = json[_i];
                    if ((newsitem.e == null) || (newsitem.e >= currentDate)) {
                      _results.push(newsitem);
                    }
                  }
                  return _results;
                })();
                n = 0;
                _ref = s.newsitems;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  n_item = _ref[_i];
                  if (n_item.d > s.lastChecked) {
                    n += 1;
                  }
                }
                return s.$apply(function() {
                  return s.numNewNews = n;
                });
              },
              error: function(e) {
                return console.log("error, couldn't fetch news", e.message);
              }
            });
          };
          s.currentLang = $location.search().lang || "sv";
          s.numNewNews = 0;
          s.initData();
          s.togglePopover = function(event) {
            if (s.isPopoverVisible) {
              s.popHide();
            } else {
              s.currentLang = $location.search().lang || "sv";
              s.popShow();
              s.numNewNews = 0;
            }
            event.preventDefault();
            return event.stopPropagation();
          };
          popover = $(".newsdesk-popover");
          s.isPopoverVisible = false;
          handleEscape = function(event) {
            if (event.which === 27) {
              s.popHide();
              return false;
            }
          };
          s.popShow = function() {
            s.isPopoverVisible = true;
            popover.show().focus().position({
              my: "right top",
              at: "right-10 top+10",
              of: window
            });
            $rootElement.on("keydown", handleEscape);
            $rootElement.on("click", s.popHide);
            return localStorage.setItem(s.storage, s.newsitems[0].d);
          };
          return s.popHide = function() {
            s.isPopoverVisible = false;
            popover.hide();
            $rootElement.off("keydown", handleEscape);
            $rootElement.off("click", s.popHide);
          };
        }
      }
    };
  });

}).call(this);

//# sourceMappingURL=newsdesk.js.map
