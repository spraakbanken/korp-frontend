/** @format */
import { kwicPagerName, kwicPager } from "./components/pager"
import { sidebarName, sidebarComponent } from "./components/sidebar"
import * as autoc from "./components/autoc"
import * as readingmode from "./components/readingmode"
import * as extendedAddBox from "./components/extended/extended_add_box"
import { corpusChooserComponent } from "./components/corpus_chooser/corpus_chooser"
import { ccTimeGraphComponent } from "./components/corpus_chooser/time_graph"
import { ccTreeComponent } from "./components/corpus_chooser/tree"
import { ccInfoBox } from "./components/corpus_chooser/info_box"
import { loginBoxComponent } from "./components/auth/login_box"
import { loginStatusComponent } from "./components/auth/login_status"
import { depTreeComponent } from "./components/deptree/deptree"
import { simpleSearchComponent } from "./components/simple_search"
import { extendedStandardComponent } from "./components/extended/standard_extended"
import { extendedParallelComponent } from "./components/extended/parallel_extended"
import { extendedTokensComponent } from "./components/extended/extended_tokens"
import { extendedAndTokenComponent } from "./components/extended/and_token"
import { extendedCQPTermComponent } from "./components/extended/cqp_term"
import { extendedTokenComponent } from "./components/extended/token"
import { extendedStructTokenComponent } from "./components/extended/struct_token"
import { extendedCQPValueComponent } from "./components/extended/cqp_value"
import { kwicComponent } from "./components/kwic"
import { trendDiagramComponent } from "./components/trend_diagram"
import * as treeUtil from "./components/corpus_chooser/util"
import statemachine from "@/statemachine"

window.korpApp = angular.module("korpApp", [
    "ui.bootstrap.typeahead",
    "uib/template/typeahead/typeahead-popup.html",
    "uib/template/typeahead/typeahead-match.html",
    "ui.bootstrap.tooltip",
    "uib/template/tooltip/tooltip-popup.html",
    "uib/template/tooltip/tooltip-html-popup.html",
    "ui.bootstrap.modal",
    "uib/template/modal/window.html",
    "ui.bootstrap.tabs",
    "uib/template/tabs/tabset.html",
    "uib/template/tabs/tab.html",
    "ui.bootstrap.dropdown",
    "ui.bootstrap.pagination",
    "uib/template/pagination/pagination.html",
    "ui.bootstrap.datepicker",
    "uib/template/datepicker/datepicker.html",
    "uib/template/datepicker/day.html",
    "uib/template/datepicker/month.html",
    "uib/template/datepicker/year.html",
    "ui.bootstrap.timepicker",
    "uib/template/timepicker/timepicker.html",
    "ui.bootstrap.buttons",
    "ui.bootstrap.popover",
    "uib/template/popover/popover.html",
    "uib/template/popover/popover-template.html",
    "angularSpinner",
    "ui.sortable",
    "newsdesk",
    "sbMap",
    "tmh.dynamicLocale",
    "angular.filter",
])

korpApp.component(kwicPagerName, kwicPager)
korpApp.component(sidebarName, sidebarComponent)
korpApp.component(readingmode.componentName, readingmode.component)
korpApp.component(autoc.componentName, autoc.component)
korpApp.component(extendedAddBox.componentName, extendedAddBox.component)
korpApp.component("corpusChooser", corpusChooserComponent)
korpApp.component("ccTimeGraph", ccTimeGraphComponent)
korpApp.component("ccTree", ccTreeComponent)
korpApp.component("ccInfoBox", ccInfoBox)
korpApp.component("loginStatus", loginStatusComponent)
korpApp.component("loginBox", loginBoxComponent)
korpApp.component("depTree", depTreeComponent)
korpApp.component("simpleSearch", simpleSearchComponent)
korpApp.component("extendedStandard", extendedStandardComponent)
korpApp.component("extendedParallel", extendedParallelComponent)
korpApp.component("extendedTokens", extendedTokensComponent)
korpApp.component("extendedAndToken", extendedAndTokenComponent)
korpApp.component("extendedCqpTerm", extendedCQPTermComponent)
korpApp.component("extendedToken", extendedTokenComponent)
korpApp.component("extendedStructToken", extendedStructTokenComponent)
korpApp.component("extendedCqpValue", extendedCQPValueComponent)
korpApp.component("kwic", kwicComponent)
korpApp.component("trendDiagram", trendDiagramComponent)

// load all custom components
let customComponents = {}

try {
    customComponents = require("custom/components.js").default
} catch (error) {
    console.log("No module for components available")
}
for (const componentName in customComponents) {
    korpApp.component(componentName, customComponents[componentName])
}

/**
 * angular-dynamic-locale updates translations in the builtin $locale service, which is used
 * by at least the datepicker in angular-ui-bootstrap.
 */
korpApp.config((tmhDynamicLocaleProvider) =>
    tmhDynamicLocaleProvider.localeLocationPattern("translations/angular-locale_{{locale}}.js")
)

korpApp.config(($uibTooltipProvider) =>
    $uibTooltipProvider.options({
        appendToBody: true,
    })
)

/**
 * Makes the hashPrefix "" instead of "!" which means our URL:s are ?mode=test#?lang=eng
 * instead of ?mode=test#!?lang=eng
 */
korpApp.config(["$locationProvider", ($locationProvider) => $locationProvider.hashPrefix("")])

/**
 * "blob" must be added to the trusted URL:s, otherwise downloading KWIC and statistics etc. will not work
 */
korpApp.config([
    "$compileProvider",
    ($compileProvider) => $compileProvider.aHrefSanitizationTrustedUrlList(/^\s*(https?|ftp|mailto|tel|file|blob):/),
])

korpApp.run(function ($rootScope, $location, searches, tmhDynamicLocale, $q) {
    const s = $rootScope
    s._settings = settings
    window.lang = s.lang = $location.search().lang || settings["default_language"]

    s.isLab = window.isLab

    s.extendedCQP = null

    s.globalFilterDef = $q.defer()

    s.locationSearch = function () {
        const search = $location.search(...arguments)
        $location.replace()
        return search
    }

    s.searchtabs = () => $(".search_tabs > ul").scope().tabset.tabs

    s._loc = $location

    s.$watch("_loc.search()", function () {
        _.defer(() => (window.onHashChange || _.noop)())
        tmhDynamicLocale.set($location.search().lang || settings["default_language"])
    })

    $rootScope.kwicTabs = []
    $rootScope.compareTabs = []
    $rootScope.graphTabs = []
    $rootScope.mapTabs = []
    $rootScope.textTabs = []

    $q.all([searches.infoDef, searches.timeDeferred]).then(function () {
        // if no preselectedCorpora is defined, use all of them
        if (!(settings["preselected_corpora"] && settings["preselected_corpora"].length)) {
            settings["preselected_corpora"] = _.map(
                _.filter(settings.corpusListing.corpora, (corpus) => !corpus.hide),
                "id"
            )
        } else {
            let expandedCorpora = []
            for (let preItem of settings["preselected_corpora"]) {
                preItem = preItem.replace(/^__/g, "")
                expandedCorpora = [].concat(
                    expandedCorpora,
                    treeUtil.getAllCorporaInFolders(settings["folders"], preItem)
                )
            }
            // folders expanded, save
            settings["preselected_corpora"] = expandedCorpora
        }

        let currentCorpora
        let { corpus } = $location.search()
        if (corpus) {
            currentCorpora = _.flatten(
                _.map(corpus.split(","), (val) => treeUtil.getAllCorporaInFolders(settings["folders"], val))
            )
        } else {
            currentCorpora = settings["preselected_corpora"]
        }

        const loginNeededFor = []
        for (let corpusId of currentCorpora) {
            const corpusObj = settings.corpora[corpusId]
            if (corpusObj["limited_access"]) {
                if (
                    _.isEmpty(authenticationProxy.loginObj) ||
                    !authenticationProxy.loginObj.credentials.includes(corpusObj.id.toUpperCase())
                ) {
                    loginNeededFor.push(corpusObj)
                }
            }
        }

        // only ask user to login if corpora came from URL
        if (corpus && loginNeededFor.length != 0) {
            s.savedState = $location.search()
            $location.url($location.path() + "?")

            // some state need special treatment
            if (s.savedState.reading_mode) {
                $location.search("reading_mode")
            }
            if (s.savedState.search_tab) {
                $location.search("search_tab", s.savedState.search_tab)
            }
            if (s.savedState.cqp) {
                $location.search("cqp", s.savedState.cqp)
            }

            statemachine.send("LOGIN_NEEDED", { loginNeededFor })
        } else {
            $rootScope.$broadcast("corpuschooserchange", currentCorpora)
        }
    })

    statemachine.listen("login", function () {
        if (s.savedState) {
            for (let key in s.savedState) {
                const val = s.savedState[key]
                if (key !== "search_tab") {
                    $location.search(key, val)
                }
            }
            // some state need special treatment
            s.$broadcast("updateAdvancedCQP")
            const corpora = s.savedState.corpus.split(",")
            s.savedState = null
            $rootScope.$broadcast("corpuschooserchange", corpora)
        }
    })
})

korpApp.controller("headerCtrl", function ($scope, $uibModal, utils) {
    const s = $scope

    s.logoClick = function () {
        const [baseUrl, modeParam, langParam] = $scope.getUrlParts(currentMode)
        window.location = baseUrl + modeParam + langParam
        if (langParam.length > 0) {
            window.location.reload()
        }
    }

    s.languages = settings["languages"]

    s.citeClick = () => {
        s.show_modal = "about"
    }

    s.show_modal = false

    let modal = null
    utils.setupHash(s, [
        {
            key: "display",
            scope_name: "show_modal",
            post_change(val) {
                if (val) {
                    showAbout()
                } else {
                    if (modal != null) {
                        modal.close()
                    }
                    modal = null
                }
            },
        },
    ])

    const closeModals = function () {
        s.show_modal = false
    }

    var showAbout = function () {
        const params = {
            template: require("../markup/about.html"),
            scope: s,
            windowClass: "about",
        }
        modal = $uibModal.open(params)

        modal.result.then(
            () => closeModals(),
            () => closeModals()
        )
    }

    s.clickX = () => closeModals()

    const N_VISIBLE = settings["visible_modes"]

    s.modes = _.filter(settings["modes"])
    if (!isLab) {
        s.modes = _.filter(settings["modes"], (item) => item.labOnly !== true)
    }

    s.visible = s.modes.slice(0, N_VISIBLE)

    s.$watch("$root.lang", () => {
        s.menu = util.collatorSort(s.modes.slice(N_VISIBLE), "label", s.$root.lang)
    })

    const i = _.map(s.menu, "mode").indexOf(currentMode)
    if (i !== -1) {
        s.visible.push(s.menu[i])
        s.menu.splice(i, 1)
    }

    for (let mode of s.modes) {
        mode.selected = false
        if (mode.mode === currentMode) {
            window.settings.mode = mode
            mode.selected = true
        }
    }

    s.getUrl = function (modeId) {
        return s.getUrlParts(modeId).join("")
    }

    s.getUrlParts = function (modeId) {
        const langParam = settings["default_language"] === s.$root.lang ? "" : `#?lang=${s.$root.lang}`
        const modeParam = modeId === "default" ? "" : `?mode=${modeId}`
        return [location.pathname, modeParam, langParam]
    }
})

korpApp.filter("trust", ($sce) => (input) => $sce.trustAsHtml(input))
korpApp.filter("prettyNumber", () => (input) => new Intl.NumberFormat(lang).format(input))
angular.module("korpApp").filter("maxLength", function () {
    return function (val) {
        return val.length > 39 ? val.slice(0, 36) + "…" : val
    }
})
