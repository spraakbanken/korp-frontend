(function() {
  var korpApp,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  korpApp = angular.module("korpApp");

  korpApp.directive('kwicWord', function() {
    return {
      replace: true,
      template: "<span class=\"word\" ng-class=\"getClassObj(wd)\">\n{{::wd.word}} </span>",
      link: function(scope, element) {
        return scope.getClassObj = function(wd) {
          var output, struct, x, y, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          output = {
            reading_match: wd._match,
            punct: wd._punct,
            match_sentence: wd._matchSentence,
            link_selected: wd._link_selected
          };
          _ref = wd._struct || [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            struct = _ref[_i];
            output["struct_" + struct] = true;
          }
          _ref1 = wd._open || [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            struct = _ref1[_j];
            output["open_" + struct] = true;
          }
          _ref2 = wd._close || [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            struct = _ref2[_k];
            output["close_" + struct] = true;
          }
          return ((function() {
            var _l, _len3, _ref3, _ref4, _results;
            _ref3 = _.pairs(output);
            _results = [];
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              _ref4 = _ref3[_l], x = _ref4[0], y = _ref4[1];
              if (y) {
                _results.push(x);
              }
            }
            return _results;
          })()).join(" ");
        };
      }
    };
  });

  korpApp.directive("tabHash", function(utils, $location) {
    return {
      scope: true,
      link: function(scope, elem, attr) {
        var contentScope, init_tab, s, w, watchHash;
        s = scope;
        contentScope = elem.find(".tab-content").scope();
        watchHash = function() {
          return utils.setupHash(s, [
            {
              expr: "getSelected()",
              val_out: function(val) {
                return val;
              },
              val_in: function(val) {
                s.setSelected(parseInt(val));
                return parseInt(val);
              },
              key: attr.tabHash,
              "default": 0
            }
          ]);
        };
        init_tab = parseInt($location.search()[attr.tabHash]) || 0;
        w = contentScope.$watch("tabs.length", function(len) {
          if (len) {
            s.setSelected(init_tab);
            watchHash();
            return w();
          }
        });
        s.getSelected = function() {
          var i, out, p, _i, _len, _ref;
          out = null;
          _ref = contentScope.tabs;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            p = _ref[i];
            if (p.active) {
              out = i;
            }
          }
          if (out == null) {
            out = contentScope.tabs.length - 1;
          }
          return out;
        };
        return s.setSelected = function(index) {
          var t, _i, _len, _ref, _ref1;
          _ref = contentScope.tabs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            t.active = false;
            if (typeof t.onDeselect === "function") {
              t.onDeselect();
            }
          }
          if (contentScope.tabs[index]) {
            return contentScope.tabs[index].active = true;
          } else {
            return (_ref1 = _.last(contentScope.tabs)) != null ? _ref1.active = true : void 0;
          }
        };
      }
    };
  });

  korpApp.directive("escaper", function() {
    return {
      link: function($scope, elem, attr) {
        var doNotEscape, escape, unescape;
        doNotEscape = ["*=", "!*="];
        escape = function(val) {
          var _ref;
          if (_ref = $scope.orObj.op, __indexOf.call(doNotEscape, _ref) < 0) {
            return regescape(val);
          } else {
            return val;
          }
        };
        unescape = function(val) {
          var _ref;
          if (_ref = $scope.orObj.op, __indexOf.call(doNotEscape, _ref) < 0) {
            return val.replace(/\\/g, "");
          } else {
            return val;
          }
        };
        $scope.input = unescape($scope.model);
        return $scope.$watch("orObj.op + input", function() {
          return $scope.model = escape($scope.input);
        });
      }
    };
  });

  korpApp.directive("tokenValue", function($compile, $controller) {
    var defaultController, getDefaultTmpl;
    getDefaultTmpl = _.template("<input ng-model='input' class='arg_value' escaper ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: \"default blur\"}'\n<%= maybe_placeholder %>>\n<span class='val_mod' popper\n    ng-class='{sensitive : case == \"sensitive\", insensitive : case == \"insensitive\"}'>\n        Aa\n</span> \n<ul class='mod_menu popper_menu dropdown-menu'>\n    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc:lang}}</a></li>\n    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc:lang}}</a></li>\n</ul>");
    defaultController = [
      "$scope", function($scope) {
        $scope["case"] = "sensitive";
        $scope.makeSensitive = function() {
          var _ref;
          $scope["case"] = "sensitive";
          return (_ref = $scope.orObj.flags) != null ? delete _ref["c"] : void 0;
        };
        return $scope.makeInsensitive = function() {
          var flags;
          flags = $scope.orObj.flags || {};
          flags["c"] = true;
          $scope.orObj.flags = flags;
          return $scope["case"] = "insensitive";
        };
      }
    ];
    return {
      scope: {
        tokenValue: "=",
        model: "=ngModel",
        orObj: "=orObj"
      },
      template: "<div>{{tokenValue.label}}</div>",
      link: function(scope, elem, attr) {
        var current;
        current = null;
        return scope.$watch("tokenValue", function(valueObj) {
          var defaultTmpl, locals, tmplElem, tmplObj;
          if (!valueObj) {
            return;
          }
          if (valueObj.value === (current != null ? current.value : void 0)) {
            return;
          }
          current = valueObj;
          locals = {
            $scope: _.extend(scope, valueObj)
          };
          $controller(valueObj.controller || defaultController, locals);
          if (valueObj.value === "word") {
            tmplObj = {
              maybe_placeholder: "placeholder='<{{\"any\" | loc:lang}}>'"
            };
          } else {
            tmplObj = {
              maybe_placeholder: ""
            };
          }
          defaultTmpl = getDefaultTmpl(tmplObj);
          tmplElem = $compile(valueObj.extended_template || defaultTmpl)(scope);
          return elem.html(tmplElem).addClass("arg_value");
        });
      }
    };
  });

  korpApp.directive("constr", function($window, searches) {
    return {
      scope: true,
      link: function(scope, elem, attr) {
        var instance;
        instance = new $window.view[attr.constr](elem, elem, scope);
        if (attr.constrName) {
          $window[attr.constrName] = instance;
        }
        scope.instance = instance;
        return scope.$parent.instance = instance;
      }
    };
  });

  korpApp.directive("searchSubmit", function($window, $document, $rootElement) {
    return {
      template: '<div class="search_submit">\n    <div class="btn-group">\n        <button class="btn btn-small" id="sendBtn" ng-click="onSendClick()">{{\'search\' | loc:lang}}</button>\n        <button class="btn btn-small opener" ng-click="togglePopover($event)">\n            <span class="caret"></span>\n        </button>\n    </div>\n    <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">\n        <div class="arrow"></div>\n        <h3 class="popover-title">{{\'compare_save_header\' | loc:lang}}</h3>\n        <form class="popover-content" ng-submit="onSubmit()">\n            <div>\n                <label for="cmp_input">{{\'compare_name\' | loc:lang}} :</label> <input id="cmp_input" ng-model="name">\n            </div>\n            <div class="btn_container">\n                <button class="btn btn-primary btn-small">{{\'compare_save\' | loc:lang}}</button>\n            </div>\n        </form>\n    </div>\n</div>',
      restrict: "E",
      replace: true,
      link: function(scope, elem, attr) {
        var at, horizontal, my, onEscape, popover, s, trans, _ref;
        s = scope;
        s.pos = attr.pos || "bottom";
        s.togglePopover = function(event) {
          if (s.isPopoverVisible) {
            s.popHide();
          } else {
            s.popShow();
          }
          event.preventDefault();
          return event.stopPropagation();
        };
        popover = elem.find(".popover");
        s.onPopoverClick = function(event) {
          if (event.target !== popover.find(".btn")[0]) {
            event.preventDefault();
            return event.stopPropagation();
          }
        };
        s.isPopoverVisible = false;
        trans = {
          bottom: "top",
          top: "bottom",
          right: "left",
          left: "right"
        };
        horizontal = (_ref = s.pos) === "top" || _ref === "bottom";
        if (horizontal) {
          my = "center " + trans[s.pos];
          at = "center " + s.pos + "+10";
        } else {
          my = trans[s.pos] + " center";
          at = s.pos + "+10 center";
        }
        onEscape = function(event) {
          if (event.which === 27) {
            s.popHide();
            return false;
          }
        };
        s.popShow = function() {
          s.isPopoverVisible = true;
          popover.show("fade", "fast").focus().position({
            my: my,
            at: at,
            of: elem.find(".opener")
          });
          $rootElement.on("keydown", onEscape);
          $rootElement.on("click", s.popHide);
        };
        s.popHide = function() {
          s.isPopoverVisible = false;
          popover.hide("fade", "fast");
          $rootElement.off("keydown", onEscape);
          $rootElement.off("click", s.popHide);
        };
        s.onSubmit = function() {
          s.popHide();
          return s.$broadcast('popover_submit', s.name);
        };
        return s.onSendClick = function() {
          return s.$broadcast('btn_submit');
        };
      }
    };
  });

  korpApp.directive("meter", function() {
    return {
      template: '<div>\n    <div class="background" ng-bind-html="displayWd | trust"></div>\n    <div class="abs badge" tooltip-html-unsafe="{{tooltipHTML}}">{{meter[2]}}</div>\n</div>',
      replace: true,
      scope: {
        meter: "=",
        max: "=",
        stringify: "="
      },
      link: function(scope, elem, attr) {
        var bkg, part, w, wds;
        wds = scope.meter[0];
        bkg = elem.find(".background");
        if (wds === "|") {
          scope.displayWd = "&mdash;";
        } else {
          scope.displayWd = (_.map(_.compact(wds.split("|")), scope.stringify)).join(", ");
        }
        scope.loglike = Math.abs(scope.meter[1]);
        scope.tooltipHTML = "" + (util.getLocaleString('statstable_absfreq')) + ": " + scope.meter[2] + "\n<br>\nloglike: " + scope.loglike;
        w = elem.parent().width();
        part = scope.loglike / (Math.abs(scope.max));
        return bkg.width(Math.round(part * w));
      }
    };
  });

  korpApp.directive("popper", function($rootElement) {
    return {
      scope: {},
      link: function(scope, elem, attrs) {
        var closePopup, popup;
        popup = elem.next();
        popup.appendTo("body").hide();
        closePopup = function() {
          return popup.hide();
        };
        popup.on("click", function(event) {
          closePopup();
          return false;
        });
        elem.on("click", function(event) {
          var pos;
          if (popup.is(":visible")) {
            closePopup();
          } else {
            popup.show();
          }
          pos = {
            my: attrs.my || "right top",
            at: attrs.at || "bottom right",
            of: elem
          };
          if (scope.offset) {
            pos.offset = scope.offset;
          }
          popup.position(pos);
          return false;
        });
        return $rootElement.on("click", function() {
          return closePopup();
        });
      }
    };
  });

  korpApp.directive("tabSpinner", function($rootElement) {
    return {
      template: "<i class=\"fa fa-times-circle close_icon\"></i> \n<span class=\"tab_spinner\" \n    us-spinner=\"{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}\"></span>"
    };
  });

  korpApp.directive("extendedList", function($location, $rootScope) {
    return {
      templateUrl: "views/extendedlist.html",
      scope: {
        cqp: "="
      },
      link: function($scope, elem, attr) {
        var s, setCQP;
        s = $scope;
        setCQP = function(val) {
          var error, output, token, tokenObj, _i, _j, _len, _len1, _ref, _ref1, _results;
          c.log("inner cqp change", val);
          try {
            s.data = CQP.parse(val);
            c.log("s.data", s.data);
          } catch (_error) {
            error = _error;
            output = [];
            _ref = val.split("[");
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              token = _ref[_i];
              if (!token) {
                continue;
              }
              token = "[" + token;
              try {
                tokenObj = CQP.parse(token);
              } catch (_error) {
                error = _error;
                tokenObj = [
                  {
                    cqp: token
                  }
                ];
              }
              output = output.concat(tokenObj);
            }
            s.data = output;
            c.log("crash", s.data);
          }
          _ref1 = s.data;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            token = _ref1[_j];
            if (!("and_block" in token) || !token.and_block.length) {
              _results.push(token.and_block = CQP.parse('[word = ""]')[0].and_block);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        if (s.cqp == null) {
          s.cqp = '[]';
        }
        setCQP(s.cqp);
        s.$watch('getCQPString()', function(val) {
          c.log("getCQPString", val);
          return s.cqp = val;
        });
        s.getCQPString = function() {
          return (CQP.stringify(s.data)) || "";
        };
        s.addOr = function(and_array) {
          and_array.push({
            type: "word",
            op: "=",
            val: ""
          });
          return and_array;
        };
        s.addToken = function() {
          var token;
          token = {
            and_block: [[]]
          };
          s.data.push(token);
          return s.addOr(token.and_block[0]);
        };
        return s.removeToken = function(i) {
          if (!(s.data.length > 1)) {
            return;
          }
          return s.data.splice(i, 1);
        };
      }
    };
  });

  korpApp.directive("tabPreloader", function() {
    return {
      restrict: "E",
      scope: {
        value: "=",
        spinner: "="
      },
      replace: true,
      template: "<div class=\"tab_preloaders\">\n    <div ng-if=\"!spinner\" class=\"tab_progress\" style=\"width:{{value || 0}}%\"></div>\n        <span ng-if=\"spinner\" class=\"preloader_spinner\" \n            us-spinner=\"{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 7, top : -12}\"></span>\n</div>",
      link: function(scope, elem, attr) {}
    };
  });

  korpApp.directive("clickCover", function() {
    return {
      link: function(scope, elem, attr) {
        var cover, pos;
        cover = $("<div>").css({
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }).on("click", function() {
          return false;
        });
        pos = elem.css("position") || "static";
        return scope.$watch(function() {
          return scope.$eval(attr.clickCover);
        }, function(val) {
          if (val) {
            elem.prepend(cover);
            return elem.css("position", "relative").addClass("covered");
          } else {
            cover.remove();
            return elem.css("position", pos).removeClass("covered");
          }
        });
      }
    };
  });

  korpApp.directive('toBody', function($compile) {
    return {
      restrict: "A",
      compile: function(elm, attrs) {
        var cmp, wrapper;
        elm.remove();
        elm.attr("to-body", null);
        wrapper = $("<div>").append(elm);
        cmp = $compile(wrapper.html());
        return function(scope, iElement, iAttrs) {
          var newElem;
          newElem = cmp(scope);
          $("body").append(newElem);
          return scope.$on("$destroy", function() {
            return newElem.remove();
          });
        };
      }
    };
  });

  korpApp.directive("warning", function() {
    return {
      restrict: "E",
      transclude: true,
      template: "<div class='korp-warning bs-callout bs-callout-warning' ng-transclude></div>"
    };
  });

  korpApp.directive("kwicPager", function() {
    return {
      replace: true,
      restrict: "E",
      scope: false,
      template: "<div class=\"pager-wrapper\" ng-show=\"gotFirstKwic\" >\n  <pagination\n     total-items=\"hits\"\n     ng-if=\"gotFirstKwic\"\n     ng-model=\"pageObj.pager\"\n     ng-click=\"pageChange($event, pageObj.pager)\"\n     max-size=\"15\"\n     items-per-page=\"::$root._searchOpts.hits_per_page\"\n     previous-text=\"‹\" next-text=\"›\" first-text=\"«\" last-text=\"»\" \n     boundary-links=\"true\" \n     rotate=\"false\" \n     num-pages=\"$parent.numPages\"> </pagination>\n  <div class=\"page_input\"><span>{{'goto_page' | loc:lang}} </span>\n    <input ng-model=\"gotoPage\" ng-keyup=\"onPageInput($event, gotoPage, numPages)\" \n        ng-click=\"$event.stopPropagation()\" />\n    {{'of' | loc:lang}} {{numPages}}\n  </div>\n\n</div>"
    };
  });

  korpApp.directive("autoc", function($q, $http, lexicons) {
    return {
      replace: true,
      restrict: "E",
      scope: {
        "placeholder": "=",
        "model": "=",
        "type": "@",
        "variant": "@"
      },
      template: "<div>\n    <script type=\"text/ng-template\" id=\"lemgramautocomplete.html\">\n        <a style=\"cursor:pointer\">\n            <span ng-class=\"{'autocomplete-item-disabled' : match.model.count == 0, 'none-to-find' : match.model.count == 0 && noVariant()}\">\n                <span ng-if=\"match.model.parts.namespace\" class=\"label\">{{match.model.parts.namespace | loc}}</span>\n                <span>{{match.model.parts.main}}</span>\n                <sup ng-if=\"match.model.parts.index != 1\">{{match.model.parts.index}}</sup>\n                <span ng-if=\"match.model.parts.pos\">({{match.model.parts.pos}})</span>\n                <span ng-if=\"match.model.desc\" style=\"color:gray;margin-left:6px\">{{match.model.desc.main}}</span>\n                <sup ng-if=\"match.model.desc && match.model.desc.index != 1\" style=\"color:gray\">{{match.model.desc.index}}</sup>\n                <span class=\"num-to-find\" ng-if=\"match.model.count && match.model.count > 0\">\n                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{match.model.count}}\n                </span>\n            </span>\n        </a>\n    </script>\n    <div style=\"float:left\"><input\n        class=\"new_simple_text\"\n        type=\"text\" class=\"form-control\"\n        ng-model=\"textInField\"\n        typeahead=\"row for row in getRows($viewValue)\"\n        typeahead-wait-ms=\"500\"\n        typeahead-template-url=\"lemgramautocomplete.html\"\n        typeahead-loading=\"isLoading\"\n        typeahead-on-select=\"selectedItem($item, $model, $label)\"\n        placeholder=\"{{lemgramToString(placeholder)}}\"></div>\n    <div style=\"margin-left:-20px;margin-top:2px;float:left\" ng-if=\"isLoading\"><i class=\"fa fa-spinner fa-pulse\"></i></div>\n</div>",
      link: function(scope, elem, attr) {
        scope.noVariant = function() {
          return variant !== 'dalin';
        };
        scope.lemgramify = function(lemgram) {
          var lemgramRegExp, match;
          lemgramRegExp = /([^_\.-]*--)?([^-]*)\.\.(\w+)\.(\d\d?)/;
          match = lemgram.match(lemgramRegExp);
          if (!match) {
            return false;
          }
          return {
            "main": match[2].replace(/_/g, " "),
            "pos": util.getLocaleString(match[3].slice(0, 2)),
            "index": match[4],
            "namespace": match[1] ? match[1].slice(0, -2) : ""
          };
        };
        scope.sensify = function(sense) {
          var senseParts;
          senseParts = sense.split("..");
          return {
            "main": senseParts[0].replace(/_/g, " "),
            "index": senseParts[1]
          };
        };
        scope.lemgramToString = function(lemgram) {
          if (!lemgram) {
            return;
          }
          return util.lemgramToString(lemgram).replace(/<.*?>/g, "");
        };
        scope.formatPlaceholder = function(input) {
          var lemgramRegExp, match;
          lemgramRegExp = /([^_\.-]*--)?([^-]*)\.\.(\w+)\.(\d\d?)/;
          match = input.match(lemgramRegExp);
          if (match) {
            return scope.lemgramToString(input);
          } else {
            return input;
          }
        };
        scope.selectedItem = function(item, model, label) {
          scope.placeholder = model.lemgram;
          scope.model = model.lemgram;
          return scope.textInField = "";
        };
        scope.getMorphologies = function(corporaIDs) {
          var corporaID, morf, morfs, morphologies, _i, _j, _len, _len1, _ref;
          morphologies = [];
          if (scope.variant === "dalin") {
            morphologies.push("dalinm");
          } else {
            for (_i = 0, _len = corporaIDs.length; _i < _len; _i++) {
              corporaID = corporaIDs[_i];
              morfs = ((_ref = settings.corpora[corporaID].morf) != null ? _ref.split("|") : void 0) || [];
              for (_j = 0, _len1 = morfs.length; _j < _len1; _j++) {
                morf = morfs[_j];
                if (__indexOf.call(morphologies, morf) < 0) {
                  morphologies.push(morf);
                }
              }
            }
            if (morphologies.length === 0) {
              morphologies.push("saldom");
            }
          }
          return morphologies;
        };
        scope.getRows = function(input) {
          var corporaIDs, lemgrams, morphologies;
          corporaIDs = _.pluck(settings.corpusListing.selected, "id");
          morphologies = scope.getMorphologies(corporaIDs);
          if (scope.type === "lemgram") {
            lemgrams = scope.getLemgrams(input, morphologies, corporaIDs);
            return lemgrams;
          } else if (scope.type === "sense") {
            return scope.getSenses(input, morphologies, corporaIDs);
          }
        };
        scope.getLemgrams = function(input, morphologies, corporaIDs) {
          var deferred, http;
          deferred = $q.defer();
          http = lexicons.getLemgrams(input, morphologies.join("|"), corporaIDs, scope.variant === "affix");
          http.then(function(data) {
            data.forEach(function(item) {
              if (scope.variant === 'affix') {
                item.count = -1;
              }
              return item.parts = scope.lemgramify(item.lemgram);
            });
            data.sort(function(a, b) {
              return b.count - a.count;
            });
            return deferred.resolve(data);
          });
          return deferred.promise;
        };
        return scope.getSenses = function(input, morphologies, corporaIDs) {
          var deferred, http;
          deferred = $q.defer();
          http = lexicons.getSenses(input, morphologies.join("|"), corporaIDs);
          http.then(function(data) {
            data.forEach(function(item) {
              item.parts = scope.sensify(item.sense);
              if (item.desc) {
                return item.desc = scope.sensify(item.desc);
              }
            });
            data.sort(function(a, b) {
              return b.count - a.count;
            });
            return deferred.resolve(data);
          });
          return deferred.promise;
        };
      }
    };
  });

}).call(this);

//# sourceMappingURL=directives.js.map
