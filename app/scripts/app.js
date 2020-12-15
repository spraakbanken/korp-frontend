/** @format */

import jStorage from "../lib/jstorage"
import { kwicPagerName, kwicPager } from "./components/pager"
import { sidebarName, sidebarComponent } from "./components/sidebar"
import { setDefaultConfigValues } from "./settings.js"

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

korpApp.component(kwicPagerName, kwicPager).component(sidebarName, sidebarComponent)

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
    ($compileProvider) =>
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/),
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

    if ($location.search().corpus) {
        const initialCorpora = []

        function findInFolder(folder) {
            // checks if folder is an actual folder of corpora and recursively
            // collects all corpora in this folder and subfolders
            const corpusIds = []
            if (folder && folder.contents) {
                for (let corpusId of folder.contents) {
                    corpusIds.push(corpusId)
                }
                for (let subFolderId of Object.keys(folder)) {
                    for (let corpusId of findInFolder(folder[subFolderId])) {
                        corpusIds.push(corpusId)
                    }
                }
            }
            return corpusIds
        }

        for (let corpus of $location.search().corpus.split(",")) {
            const corpusObj = settings.corpusListing.struct[corpus]
            if (corpusObj) {
                initialCorpora.push(corpusObj)
            } else {
                // corpus does not correspond to a corpus ID, check if it is a folder
                for (let folderCorpus of findInFolder(settings.corporafolders[corpus])) {
                    if (settings.corpusListing.struct[folderCorpus]) {
                        initialCorpora.push(settings.corpusListing.struct[folderCorpus])
                    }
                }
            }
        }

        const loginNeededFor = []
        for (let corpusObj of initialCorpora) {
            if (corpusObj.limitedAccess) {
                if (
                    _.isEmpty(authenticationProxy.loginObj) ||
                    !authenticationProxy.loginObj.credentials.includes(corpusObj.id.toUpperCase())
                ) {
                    loginNeededFor.push(corpusObj)
                }
            }
        }
        s.loginNeededFor = loginNeededFor

        if (!_.isEmpty(s.loginNeededFor)) {
            s.savedState = $location.search()
            $location.url($location.path())

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

            $location.search("display", "login")
        }
    }

    s.restorePreLoginState = function () {
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
            settings.corpusListing.select(corpora)
            corpusChooserInstance.corpusChooser("selectItems", corpora)

            s.savedState = null
            s.loginNeededFor = null
        }
    }

    s.searchDisabled = false
    s.$on("corpuschooserchange", function (event, corpora) {
        settings.corpusListing.select(corpora)
        const nonprotected = _.map(settings.corpusListing.getNonProtected(), "id")
        if (
            corpora.length &&
            _.intersection(corpora, nonprotected).length !== nonprotected.length
        ) {
            $location.search("corpus", corpora.join(","))
        } else {
            $location.search("corpus", null)
        }
        s.searchDisabled = settings.corpusListing.selected.length === 0
    })

    searches.infoDef.then(function () {
        let { corpus } = $location.search()
        let currentCorpora = []
        if (corpus) {
            currentCorpora = _.flatten(
                _.map(corpus.split(","), (val) =>
                    getAllCorporaInFolders(settings.corporafolders, val)
                )
            )
        } else {
            if (!(settings.preselectedCorpora && settings.preselectedCorpora.length)) {
                currentCorpora = _.map(settings.corpusListing.corpora, "id")
            } else {
                for (let pre_item of settings.preselectedCorpora) {
                    pre_item = pre_item.replace(/^__/g, "")
                    currentCorpora = [].concat(
                        currentCorpora,
                        getAllCorporaInFolders(settings.corporafolders, pre_item)
                    )
                }
            }

            settings.preselectedCorpora = currentCorpora
        }

        settings.corpusListing.select(currentCorpora)
        corpusChooserInstance.corpusChooser("selectItems", currentCorpora)
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

    s.showLogin = () => {
        s.show_modal = "login"
    }

    s.logout = function () {
        authenticationProxy.loginObj = {}
        jStorage.deleteKey("creds")

        // TODO figure out another way to do this
        for (let corpusObj of settings.corpusListing.corpora) {
            const corpus = corpusObj.id
            if (corpusObj.limitedAccess) {
                $(`#hpcorpus_${corpus}`).closest(".boxdiv").addClass("disabled")
            }
        }
        $("#corpusbox").corpusChooser("updateAllStates")

        let newCorpora = []
        for (let corpus of settings.corpusListing.getSelectedCorpora()) {
            if (!settings.corpora[corpus].limitedAccess) {
                newCorpora.push(corpus)
            }
        }

        if (_.isEmpty(newCorpora)) {
            newCorpora = settings.preselectedCorpora
        }
        settings.corpusListing.select(newCorpora)
        s.loggedIn = false
        $("#corpusbox").corpusChooser("selectItems", newCorpora)
    }

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

    s.show_modal = false

    let modal = null
    utils.setupHash(s, [
        {
            key: "display",
            scope_name: "show_modal",
            post_change(val) {
                if (val) {
                    showModal(val)
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
        s.login_err = false
        s.show_modal = false
    }

    var showModal = function (key) {
        const tmpl = { about: require("../markup/about.html"), login: "login_modal" }[key]
        const params = {
            templateUrl: tmpl,
            scope: s,
            windowClass: key,
        }
        if (key === "login") {
            params.size = "sm"
        }
        modal = $uibModal.open(params)

        modal.result.then(
            () => closeModals(),
            () => closeModals()
        )
    }

    s.clickX = () => closeModals()

    s.loggedIn = false
    const creds = jStorage.get("creds")
    if (creds) {
        util.setLogin()
        s.loggedIn = true
        s.username = authenticationProxy.loginObj.name
    }
    s.loginSubmit = function (usr, pass, saveLogin) {
        s.login_err = false
        authenticationProxy
            .makeRequest(usr, pass, saveLogin)
            .done(function () {
                util.setLogin()
                safeApply(s, function () {
                    s.show_modal = null
                    s.restorePreLoginState()
                    s.loggedIn = true
                    s.username = usr
                })
            })
            .fail(function () {
                c.log("login fail")
                safeApply(s, () => {
                    s.login_err = true
                })
            })
    }
})

korpApp.filter("trust", ($sce) => (input) => $sce.trustAsHtml(input))
