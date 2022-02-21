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
import { setDefaultConfigValues } from "./settings"
import * as treeUtil from "./components/corpus_chooser/util"
import statemachine from "@/statemachine"

setDefaultConfigValues()

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

korpApp.config((tmhDynamicLocaleProvider) =>
    tmhDynamicLocaleProvider.localeLocationPattern("translations/angular-locale_{{locale}}.js")
)

korpApp.config(($uibTooltipProvider) =>
    $uibTooltipProvider.options({
        appendToBody: true,
    })
)

korpApp.config(["$locationProvider", ($locationProvider) => $locationProvider.hashPrefix("")])

korpApp.config([
    "$compileProvider",
    ($compileProvider) => $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/),
])

korpApp.run(function ($rootScope, $location, searches, tmhDynamicLocale, $q, $timeout) {
    const s = $rootScope
    s._settings = settings
    window.lang = s.lang = $location.search().lang || settings.defaultLanguage
    s.word_selected = null
    s.isLab = window.isLab

    // s.sidebar_visible = false

    s.extendedCQP = null

    s.globalFilterDef = $q.defer()

    s.locationSearch = function () {
        const search = $location.search(...arguments)
        $location.replace()
        return search
    }

    s.searchtabs = () => $(".search_tabs > ul").scope().tabset.tabs

    tmhDynamicLocale.set("en")

    s._loc = $location

    s.$watch("_loc.search()", function () {
        _.defer(() => (window.onHashChange || _.noop)())

        return tmhDynamicLocale.set($location.search().lang || "sv")
    })

    $rootScope.kwicTabs = []
    $rootScope.compareTabs = []
    $rootScope.graphTabs = []
    $rootScope.mapTabs = []
    $rootScope.textTabs = []

    searches.infoDef.then(function () {
        let currentCorpora = []

        // if no preselectedCorpora is defined, use all of them
        if (!(settings.preselectedCorpora && settings.preselectedCorpora.length)) {
            settings.preselectedCorpora = _.map(
                _.filter(settings.corpusListing.corpora, (corpus) => !corpus.hide),
                "id"
            )
        } else {
            for (let preItem of settings.preselectedCorpora) {
                preItem = preItem.replace(/^__/g, "")
                currentCorpora = [].concat(
                    currentCorpora,
                    treeUtil.getAllCorporaInFolders(settings.corporafolders, preItem)
                )
            }
            // folders expanded, save
            settings.preselectedCorpora = currentCorpora
        }

        let { corpus } = $location.search()

        if (corpus) {
            currentCorpora = _.flatten(
                _.map(corpus.split(","), (val) => treeUtil.getAllCorporaInFolders(settings.corporafolders, val))
            )
        }

        const loginNeededFor = []
        for (let corpusId of currentCorpora) {
            const corpusObj = settings.corpora[corpusId]
            if (corpusObj.limitedAccess) {
                if (
                    _.isEmpty(authenticationProxy.loginObj) ||
                    !authenticationProxy.loginObj.credentials.includes(corpusObj.id.toUpperCase())
                ) {
                    loginNeededFor.push(corpusObj)
                }
            }
        }

        if (loginNeededFor.length != 0) {
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

    const N_VISIBLE = settings.visibleModes

    s.modes = _.filter(settings.modeConfig)
    if (!isLab) {
        s.modes = _.filter(settings.modeConfig, (item) => item.labOnly !== true)
    }

    s.visible = s.modes.slice(0, N_VISIBLE)
    s.menu = s.modes.slice(N_VISIBLE)

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
        const langParam = settings.defaultLanguage === s.$root.lang ? "" : `#?lang=${s.$root.lang}`
        const modeParam = modeId === "default" ? "" : `?mode=${modeId}`
        return [location.pathname, modeParam, langParam]
    }
})

korpApp.filter("trust", ($sce) => (input) => $sce.trustAsHtml(input))
korpApp.filter("prettyNumber", () => (input) => new Intl.NumberFormat(lang).format(input))
