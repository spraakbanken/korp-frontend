(function() {
  var korpApp,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  korpApp = angular.module("korpApp");

  korpApp.directive('kwicWord', function() {
    return {
      replace: true,
      template: "<span class=\"word\" ng-class=\"getClassObj(wd)\">\n{{::wd.word}} </span>",
      link: function(scope, element) {
        return scope.getClassObj = function(wd) {
          var j, k, l, len1, len2, len3, output, ref, ref1, ref2, struct, x, y;
          output = {
            reading_match: wd._match,
            punct: wd._punct,
            match_sentence: wd._matchSentence,
            link_selected: wd._link_selected
          };
          ref = wd._struct || [];
          for (j = 0, len1 = ref.length; j < len1; j++) {
            struct = ref[j];
            output["struct_" + struct] = true;
          }
          ref1 = wd._open || [];
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            struct = ref1[k];
            output["open_" + struct] = true;
          }
          ref2 = wd._close || [];
          for (l = 0, len3 = ref2.length; l < len3; l++) {
            struct = ref2[l];
            output["close_" + struct] = true;
          }
          return ((function() {
            var len4, m, ref3, ref4, results;
            ref3 = _.pairs(output);
            results = [];
            for (m = 0, len4 = ref3.length; m < len4; m++) {
              ref4 = ref3[m], x = ref4[0], y = ref4[1];
              if (y) {
                results.push(x);
              }
            }
            return results;
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
          var i, j, len1, out, p, ref;
          out = null;
          ref = contentScope.tabs;
          for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
            p = ref[i];
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
          var j, len1, ref, ref1, t;
          ref = contentScope.tabs;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            t = ref[j];
            t.active = false;
            if (typeof t.onDeselect === "function") {
              t.onDeselect();
            }
          }
          if (contentScope.tabs[index]) {
            return contentScope.tabs[index].active = true;
          } else {
            return (ref1 = _.last(contentScope.tabs)) != null ? ref1.active = true : void 0;
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
          var ref;
          if (ref = $scope.orObj.op, indexOf.call(doNotEscape, ref) < 0) {
            return regescape(val);
          } else {
            return val;
          }
        };
        unescape = function(val) {
          var ref;
          if (ref = $scope.orObj.op, indexOf.call(doNotEscape, ref) < 0) {
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
    getDefaultTmpl = _.template("<input ng-model='input' class='arg_value' escaper ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: \"default blur\"}'\n<%= maybe_placeholder %>>\n<span class='val_mod' popper\n    ng-class='{sensitive : case == \"sensitive\", insensitive : case == \"insensitive\"}'>\n        Aa\n</span> \n<ul class='mod_menu popper_menu dropdown-menu'>\n    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc}}</a></li>\n    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc}}</a></li>\n</ul>");
    defaultController = [
      "$scope", function($scope) {
        $scope["case"] = "sensitive";
        $scope.makeSensitive = function() {
          var ref;
          $scope["case"] = "sensitive";
          return (ref = $scope.orObj.flags) != null ? delete ref["c"] : void 0;
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
              maybe_placeholder: "placeholder='<{{\"any\" | loc}}>'"
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

  korpApp.directive("korpAutocomplete", function() {
    return {
      scope: {
        model: "=",
        stringify: "=",
        sorter: "=",
        type: "@"
      },
      link: function(scope, elem, attr) {
        var arg_value, setVal;
        setVal = function(lemgram) {
          return $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, "")).val("").blur();
        };
        if (scope.model) {
          setVal(scope.model);
        }
        return arg_value = elem.korp_autocomplete({
          labelFunction: scope.stringify,
          sortFunction: scope.sorter,
          type: scope.type,
          select: function(lemgram) {
            setVal(lemgram);
            return scope.$apply(function() {
              if (scope.type === "baseform") {
                return scope.model = lemgram.split(".")[0];
              } else {
                return scope.model = lemgram;
              }
            });
          },
          "sw-forms": true
        }).blur(function() {
          var input;
          input = this;
          return setTimeout((function() {
            if (($(input).val().length && !util.isLemgramId($(input).val())) || $(input).data("value") === null) {
              return $(input).addClass("invalid_input").attr("placeholder", null).data("value", null);
            } else {
              return $(input).removeClass("invalid_input");
            }
          }), 100);
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
      template: '<div class="search_submit">\n    <div class="btn-group">\n        <button class="btn btn-small" id="sendBtn" ng-click="onSendClick()">{{\'search\' | loc}}</button>\n        <button class="btn btn-small opener" ng-click="togglePopover($event)">\n            <span class="caret"></span>\n        </button>\n    </div>\n    <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">\n        <div class="arrow"></div>\n        <h3 class="popover-title">{{\'compare_save_header\' | loc}}</h3>\n        <form class="popover-content" ng-submit="onSubmit()">\n            <div>\n                <label for="cmp_input">{{\'compare_name\' | loc}} :</label> <input id="cmp_input" ng-model="name">\n            </div>\n            <div class="btn_container">\n                <button class="btn btn-primary btn-small">{{\'compare_save\' | loc}}</button>\n            </div>\n        </form>\n    </div>\n</div>',
      restrict: "E",
      replace: true,
      link: function(scope, elem, attr) {
        var at, horizontal, my, onEscape, popover, ref, s, trans;
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
        horizontal = (ref = s.pos) === "top" || ref === "bottom";
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
        scope.tooltipHTML = (util.getLocaleString('statstable_absfreq')) + ": " + scope.meter[2] + "\n<br>\nloglike: " + scope.loglike;
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
          var error, j, k, len1, len2, output, ref, ref1, results, token, tokenObj;
          c.log("inner cqp change", val);
          try {
            s.data = CQP.parse(val);
            c.log("s.data", s.data);
          } catch (_error) {
            error = _error;
            output = [];
            ref = val.split("[");
            for (j = 0, len1 = ref.length; j < len1; j++) {
              token = ref[j];
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
          ref1 = s.data;
          results = [];
          for (k = 0, len2 = ref1.length; k < len2; k++) {
            token = ref1[k];
            if (!("and_block" in token) || !token.and_block.length) {
              results.push(token.and_block = CQP.parse('[word = ""]')[0].and_block);
            } else {
              results.push(void 0);
            }
          }
          return results;
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
      template: "<div class=\"pager-wrapper\" ng-show=\"gotFirstKwic\" >\n  <pagination\n     total-items=\"hits\"\n     ng-if=\"gotFirstKwic\"\n     ng-model=\"pageObj.pager\"\n     ng-click=\"pageChange($event, pageObj.pager)\"\n     max-size=\"15\"\n     items-per-page=\"::$root._searchOpts.hits_per_page\"\n     previous-text=\"‹\" next-text=\"›\" first-text=\"«\" last-text=\"»\" \n     boundary-links=\"true\" \n     rotate=\"false\" \n     num-pages=\"$parent.numPages\"> </pagination>\n  <div class=\"page_input\"><span>{{'goto_page' | loc}} </span>\n    <input ng-model=\"$parent.$parent.gotoPage\" ng-keyup=\"onPageInput($event, gotoPage, numPages)\" \n        ng-click=\"$event.stopPropagation()\" />\n    {{'of' | loc}} {{numPages}}\n  </div>\n\n</div>"
    };
  });

}).call(this);

//# sourceMappingURL=directives.js.map
