(function() {
  korpApp.directive('kwicWord', function() {
    return {
      replace: true,
      template: "<span class=\"word\" ng-class=\"getClassObj(wd)\"\nset-text=\"wd.word + ' '\" ></span>",
      link: function(scope, element) {
        return scope.getClassObj = function(wd) {
          var output, struct, x, y, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          output = {
            reading_match: wd._match,
            punct: wd._punct,
            match_sentence: wd._matchSentence
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
      link: function(scope, elem, attr) {
        var contentScope, init_tab, s, w, watchHash;
        s = scope;
        contentScope = elem.find(".tab-content").scope();
        c.log("contentScope", contentScope);
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
          if ((len - 1) >= init_tab) {
            s.setSelected(init_tab);
            watchHash();
            return w();
          }
        });
        s.getSelected = function() {
          var i, p, _i, _len, _ref;
          _ref = contentScope.tabs;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            p = _ref[i];
            if (p.active) {
              return i;
            }
          }
        };
        return s.setSelected = function(index) {
          var t, _i, _len, _ref;
          _ref = contentScope.tabs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            t.active = false;
          }
          if (contentScope.tabs[index]) {
            return contentScope.tabs[index].active = true;
          }
        };
      }
    };
  });

  korpApp.directive("tokenValue", function($compile, $controller) {
    var defaultController, defaultTmpl;
    defaultTmpl = "<input ng-model='model' class='arg_value'\nplaceholder='<{{\"any\" | loc}}>'>\n<span class='val_mod' popper\n    ng-class='{sensitive : case == \"sensitive\", insensitive : case == \"insensitive\"}'>\n        Aa\n</span> \n<ul class='mod_menu popper_menu dropdown-menu'>\n    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc}}</a></li>\n    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc}}</a></li>\n</ul>";
    defaultController = function($scope) {
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
    };
    return {
      scope: {
        tokenValue: "=",
        model: "=ngModel",
        orObj: "=orObj"
      },
      template: "<div class=\"arg_value\">{{tokenValue.label}}</div>",
      link: function(scope, elem, attr) {
        return scope.$watch("tokenValue", function(valueObj) {
          var locals, tmplElem;
          c.log("watch value", valueObj);
          if (!valueObj) {
            return;
          }
          locals = {
            $scope: _.extend(scope, valueObj)
          };
          $controller(valueObj.controller || defaultController, locals);
          tmplElem = $compile(valueObj.extended_template || defaultTmpl)(scope);
          return elem.html(tmplElem);
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
          return $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, "")).val("").blur().placeholder();
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
              return $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder();
            } else {
              return $(input).removeClass("invalid_input");
            }
          }), 100);
        });
      }
    };
  });

  korpApp.directive("slider", function() {
    return {
      template: "",
      link: function() {
        var all_years, end, from, slider, start, to;
        all_years = _(settings.corpusListing.selected).pluck("time").map(_.pairs).flatten(true).filter(function(tuple) {
          return tuple[0] && tuple[1];
        }).map(_.compose(Number, _.head)).value();
        start = Math.min.apply(Math, all_years);
        end = Math.max.apply(Math, all_years);
        arg_value.data("value", [start, end]);
        from = $("<input type='text' class='from'>").val(start);
        to = $("<input type='text' class='to'>").val(end);
        slider = $("<div />").slider({
          range: true,
          min: start,
          max: end,
          values: [start, end],
          slide: function(event, ui) {
            from.val(ui.values[0]);
            return to.val(ui.values[1]);
          },
          change: function(event, ui) {
            $(this).data("value", ui.values);
            arg_value.data("value", ui.values);
            return self._trigger("change");
          }
        });
        from.add(to).keyup(function() {
          return self._trigger("change");
        });
        return arg_value.append(slider, from, to);
      }
    };
  });

  korpApp.directive("constr", function($window) {
    return {
      link: function(scope, elem, attr) {
        var instance;
        c.log("constr scope", scope);
        instance = new $window.view[attr.constr](elem, elem, scope);
        if (attr.constrName) {
          $window[attr.constrName] = instance;
        }
        return scope.instance = instance;
      }
    };
  });

  korpApp.directive("searchSubmit", function($window, $document, $rootElement) {
    return {
      template: '<div class="search_submit">\n    <div class="btn-group">\n        <button class="btn btn-small" id="sendBtn" ng-click="onSendClick()">Sök</button>\n        <button class="btn btn-small opener" ng-click="togglePopover()">\n            <span class="caret"></span>\n        </button>\n    </div>\n    <div class="popover compare {{pos}}">\n        <div class="arrow"></div>\n        <h3 class="popover-title">Spara för jämförelse</h3>\n        <form class="popover-content" ng-submit="onSubmit()">\n            <div>\n                <label for="cmp_input">Namn:</label> <input id="cmp_input" ng-model="name">\n            </div>\n            <div class="btn_container"><button class="btn btn-primary btn-small">Spara</button></div>\n        </form>\n    </div>\n</div>',
      restrict: "E",
      replace: true,
      link: function(scope, elem, attr) {
        var at, horizontal, my, onEscape, popover, s, trans, _ref;
        s = scope;
        s.pos = attr.pos || "bottom";
        s.togglePopover = function() {
          if (s.isPopoverVisible) {
            return s.popHide();
          } else {
            return s.popShow();
          }
        };
        popover = elem.find(".popover");
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
          return $rootElement.on("keydown", onEscape);
        };
        s.popHide = function() {
          s.isPopoverVisible = false;
          popover.hide("fade", "fast");
          return $rootElement.off("keydown", onEscape);
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
      scope: {
        meter: "=",
        max: "=",
        stringify: "="
      },
      link: function(scope, elem, attr) {
        var part, w, wds;
        wds = scope.meter[0];
        elem.html((_.map(_.compact(wds.split("|")), scope.stringify)).join(", "));
        w = elem.parent().width();
        part = (Math.abs(scope.meter[1])) / (Math.abs(scope.max));
        return elem.width(Math.round(part * w));
      }
    };
  });

  korpApp.directive("popper", function($rootElement) {
    return {
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
          if (popup.is(":visible")) {
            closePopup();
          } else {
            popup.show();
          }
          popup.position({
            my: "right top",
            at: "bottom right",
            of: elem
          });
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
      template: "<i class=\"fa fa-times-circle close_icon\"></i> \n    <span class=\"tab_spinner\" \n        us-spinner=\"{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}\"></span>"
    };
  });

}).call(this);
