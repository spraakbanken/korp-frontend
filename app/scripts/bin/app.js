(function() {
  window.korpApp = angular.module('korpApp', ['ui.bootstrap', "uib/template/tabs/tabset.html", "uib/template/tabs/tab.html", "uib/template/modal/backdrop.html", "uib/template/modal/window.html", "uib/template/typeahead/typeahead-match.html", "uib/template/typeahead/typeahead-popup.html", "uib/template/pagination/pagination.html", "angularSpinner", "ui.sortable", "newsdesk", "sbMap", "tmh.dynamicLocale", "angular.filter"]);

  korpApp.config(function(tmhDynamicLocaleProvider) {
    return tmhDynamicLocaleProvider.localeLocationPattern("translations/angular-locale_{{locale}}.js");
  });

  korpApp.config(function($uibTooltipProvider) {
    return $uibTooltipProvider.options({
      appendToBody: true
    });
  });

  korpApp.run(function($rootScope, $location, utils, searches, tmhDynamicLocale, $timeout) {
    var isInit, s;
    s = $rootScope;
    s._settings = settings;
    window.lang = s.lang = $location.search().lang || settings.defaultLanguage;
    s.word_selected = null;
    s.isLab = window.isLab;
    s.sidebar_visible = false;
    s.extendedCQP = null;
    s.search = function() {
      return $location.search.apply($location, arguments);
    };
    s.searchtabs = function() {
      return $(".search_tabs > ul").scope().tabs;
    };
    tmhDynamicLocale.set("en");
    s._loc = $location;
    s._searchOpts = {};
    s.$watch("_loc.search()", function() {
      c.log("loc.search() change", $location.search());
      _.defer(function() {
        return typeof window.onHashChange === "function" ? window.onHashChange() : void 0;
      });
      return tmhDynamicLocale.set($location.search().lang || "sv");
    });
    $rootScope.kwicTabs = [];
    $rootScope.compareTabs = [];
    $rootScope.graphTabs = [];
    isInit = true;
    s.searchDisabled = false;
    s.$on("corpuschooserchange", function(event, corpora) {
      var enableSearch, nonprotected;
      c.log("corpuschooserchange", corpora);
      settings.corpusListing.select(corpora);
      nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id");
      if (corpora.length && _.intersection(corpora, nonprotected).length !== nonprotected.length) {
        $location.search("corpus", corpora.join(","));
      } else {
        $location.search("corpus", null);
      }
      enableSearch = !!corpora.length;
      view.enableSearch(enableSearch);
      isInit = false;
      return s.searchDisabled = settings.corpusListing.selected.length === 0;
    });
    return searches.infoDef.then(function() {
      var all_default_corpora, corp_array, corpus, j, len, pre_item, processed_corp_array, ref, ref1;
      corpus = $location.search().corpus;
      if (corpus) {
        corp_array = corpus.split(",");
        processed_corp_array = [];
        $.each(corp_array, function(key, val) {
          return processed_corp_array = [].concat(processed_corp_array, getAllCorporaInFolders(settings.corporafolders, val));
        });
        settings.corpusListing.select(processed_corp_array);
        corpusChooserInstance.corpusChooser("selectItems", processed_corp_array);
        return $("#select_corpus").val(corpus);
      } else {
        if (!((ref = settings.preselected_corpora) != null ? ref.length : void 0)) {
          all_default_corpora = _.pluck(settings.corpusListing.corpora, "id");
        } else {
          all_default_corpora = [];
          ref1 = settings.preselected_corpora;
          for (j = 0, len = ref1.length; j < len; j++) {
            pre_item = ref1[j];
            pre_item = pre_item.replace(/^__/g, '');
            all_default_corpora.push.apply(all_default_corpora, getAllCorporaInFolders(settings.corporafolders, pre_item));
          }
        }
        settings.preselected_corpora = all_default_corpora;
        settings.corpusListing.select(all_default_corpora);
        return corpusChooserInstance.corpusChooser("selectItems", all_default_corpora);
      }
    });
  });

  korpApp.controller("headerCtrl", function($scope, $location, $uibModal, utils) {
    var N_VISIBLE, closeModals, i, modal, s, showModal;
    s = $scope;
    s.citeClick = function() {
      return s.show_modal = 'about';
    };
    N_VISIBLE = settings.visibleModes;
    s.modes = _.filter(settings.modeConfig);
    if (!isLab) {
      s.modes = _.filter(settings.modeConfig, function(item) {
        return item.labOnly !== true;
      });
    }
    s.visible = s.modes.slice(0, N_VISIBLE);
    s.menu = s.modes.slice(N_VISIBLE);
    i = $.inArray(currentMode, _.pluck(s.menu, "mode"));
    if (i !== -1) {
      s.visible.push(s.menu[i]);
      s.menu.splice(i, 1);
    }
    s.select = function(modeId) {
      var j, len, mode, ref, results;
      ref = s.modes;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        mode = ref[j];
        mode.selected = false;
        if (mode.mode === modeId) {
          results.push(mode.selected = true);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    s.select(currentMode);
    s.getUrl = function(modeId) {
      var langParam;
      langParam = "#lang=" + s.$root.lang;
      if (modeId === "default") {
        return location.pathname + langParam;
      }
      return location.pathname + ("?mode=" + modeId) + langParam;
    };
    s.onModeMenuClick = function(modeId) {
      return window.location = s.getUrl(modeId);
    };
    s.show_modal = false;
    modal = null;
    utils.setupHash(s, [
      {
        key: "display",
        scope_name: "show_modal",
        post_change: function(val) {
          c.log("post change", val);
          if (val) {
            return showModal(val);
          } else {
            c.log("post change modal", modal);
            if (modal != null) {
              modal.close();
            }
            return modal = null;
          }
        }
      }
    ]);
    closeModals = function() {
      s.login_err = false;
      return s.show_modal = false;
    };
    $("body").on("click", ".modal-backdrop", function() {
      var scp;
      scp = $(this).next().scope();
      return scp.$apply(function() {
        return scp.$close();
      });
    });
    showModal = function(key) {
      var tmpl;
      tmpl = {
        about: 'markup/about.html',
        login: 'login_modal'
      }[key];
      modal = $uibModal.open({
        templateUrl: tmpl,
        scope: s,
        windowClass: key
      });
      return modal.result.then((function() {
        return closeModals();
      }), function() {
        return closeModals();
      });
    };
    s.clickX = function() {
      return closeModals();
    };
    return s.loginSubmit = function(usr, pass) {
      s.login_err = false;
      return authenticationProxy.makeRequest(usr, pass).done(function(data) {
        util.setLogin();
        return safeApply(s, function() {
          return s.show_modal = null;
        });
      }).fail(function() {
        c.log("login fail");
        return safeApply(s, function() {
          return s.login_err = true;
        });
      });
    };
  });

  korpApp.filter("trust", function($sce) {
    return function(input) {
      return $sce.trustAsHtml(input);
    };
  });

}).call(this);
