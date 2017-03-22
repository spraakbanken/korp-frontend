window.korpApp = angular.module 'korpApp', [
                                            'ui.bootstrap',
                                            "uib/template/tabs/tabset.html"
                                            "uib/template/tabs/tab.html"
                                            "uib/template/modal/backdrop.html"
                                            "uib/template/modal/window.html"
                                            "uib/template/typeahead/typeahead-match.html",
                                            "uib/template/typeahead/typeahead-popup.html"
                                            "uib/template/pagination/pagination.html"
                                            "angularSpinner"
                                            "ui.sortable"
                                            "newsdesk"
                                            "sbMap"
                                            "tmh.dynamicLocale"
                                            "angular.filter"
                                        ]


# This is due to angular-leaflet-directive logging, move to geokorp-component?
korpApp.config ($logProvider) ->
    $logProvider.debugEnabled false

korpApp.config (tmhDynamicLocaleProvider) ->
    tmhDynamicLocaleProvider.localeLocationPattern("translations/angular-locale_{{locale}}.js")

korpApp.config ($uibTooltipProvider) ->
    $uibTooltipProvider.options
        appendToBody: true

korpApp.run ($rootScope, $location, utils, searches, tmhDynamicLocale, $timeout, $q) ->
    s = $rootScope
    s._settings = settings
    window.lang = s.lang = $location.search().lang or settings.defaultLanguage
    s.word_selected = null
    s.isLab = window.isLab;

    s.sidebar_visible = false

    s.extendedCQP = null

    s.globalFilterDef = $q.defer()

    s.locationSearch = () ->
        $location.search arguments...

    s.searchtabs = () ->
        $(".search_tabs > ul").scope().tabs

    tmhDynamicLocale.set("en")

    s._loc = $location

    s.$watch "_loc.search()", () ->
        c.log "loc.search() change", $location.search()
        _.defer () -> window.onHashChange?()

        tmhDynamicLocale.set($location.search().lang or "sv")



    $rootScope.kwicTabs = []
    $rootScope.compareTabs = []
    $rootScope.graphTabs = []
    $rootScope.mapTabs = []
    isInit = true

    if $location.search().corpus
        loginNeededFor = []
        for corpus in $location.search().corpus.split(",")
            corpusObj = settings.corpusListing.struct[corpus]
            if corpusObj.limited_access
                if (_.isEmpty authenticationProxy.loginObj) or (corpus.toUpperCase() not in authenticationProxy.loginObj.credentials)
                    loginNeededFor.push corpusObj
        s.loginNeededFor = loginNeededFor

        if not _.isEmpty s.loginNeededFor
            s.savedState = $location.search()
            $location.url $location.path()
            if s.savedState.reading_mode
                $location.search "reading_mode"
            $location.search "display", "login"
    
    s.restorePreLoginState = () ->
        if s.savedState
            for key, val of s.savedState
                $location.search key, val

            corpora = s.savedState.corpus.split(",")
            settings.corpusListing.select corpora
            corpusChooserInstance.corpusChooser "selectItems", corpora

            s.savedState = null
            s.loginNeededFor = null


    s.searchDisabled = false
    s.$on "corpuschooserchange", (event, corpora) ->
        c.log "corpuschooserchange", corpora
        settings.corpusListing.select corpora
        nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id")
        if corpora.length and _.intersection(corpora, nonprotected).length isnt nonprotected.length
            $location.search "corpus", corpora.join(",")
        else
            $location.search "corpus", null

        isInit = false

        s.searchDisabled = settings.corpusListing.selected.length == 0

    searches.infoDef.then () ->
        corpus = $location.search().corpus
        currentCorpora = []
        if corpus
            _.map corpus.split(","), (val) ->
                currentCorpora = [].concat(currentCorpora, getAllCorporaInFolders(settings.corporafolders, val))
        else
            if not settings.preselected_corpora?.length
                currentCorpora = _.pluck settings.corpusListing.corpora, "id"
            else
                for pre_item in settings.preselected_corpora
                    pre_item = pre_item.replace /^__/g, ''
                    currentCorpora = [].concat(currentCorpora, getAllCorporaInFolders(settings.corporafolders, pre_item))

            settings.preselected_corpora = currentCorpora

        settings.corpusListing.select currentCorpora
        corpusChooserInstance.corpusChooser "selectItems", currentCorpora


korpApp.controller "headerCtrl", ($scope, $location, $uibModal, utils) ->
    s = $scope

    s.logoClick = () ->
        window.location = $scope.getUrl currentMode
        window.location.reload()


    s.citeClick = () ->
        s.show_modal = 'about'

    s.showLogin = () ->
        s.show_modal = 'login'
    
    s.logout = () ->
        authenticationProxy.loginObj = {}
        $.jStorage.deleteKey "creds"
        newCorpora = []
        for corpus in settings.corpusListing.getSelectedCorpora()
            if not settings.corpora[corpus].limited_access
                newCorpora.push corpus
        if _.isEmpty newCorpora
            newCorpora = settings.preselected_corpora
        settings.corpusListing.select newCorpora
        s.loggedIn = false
        $("#corpusbox").corpusChooser "selectItems", newCorpora
        return

    N_VISIBLE = settings.visibleModes

    s.modes = _.filter settings.modeConfig
    if !isLab
        s.modes = _.filter settings.modeConfig, (item) ->
            item.labOnly != true


    s.visible = s.modes[...N_VISIBLE]
    s.menu = s.modes[N_VISIBLE..]

    i = $.inArray currentMode, (_.pluck s.menu, "mode")
    if i != -1
        s.visible.push s.menu[i]
        s.menu.splice(i, 1)

    for mode in s.modes
        mode.selected = false
        if mode.mode == currentMode
            mode.selected = true

    s.getUrl = (modeId) ->
        langParam = "#?lang=#{s.$root.lang}"
        if modeId is "default"
            return location.pathname + langParam
        return location.pathname + "?mode=#{modeId}" + langParam

    s.onModeMenuClick = (modeId) ->
        window.location = s.getUrl modeId

    s.show_modal = false

    modal = null
    utils.setupHash s, [
        key: "display"
        scope_name: "show_modal"
        post_change : (val) ->
            c.log "post change", val
            if val
                showModal(val)
            else
                c.log "post change modal", modal
                modal?.close()
                modal = null
    ]

    closeModals = () ->
        s.login_err = false
        s.show_modal = false

    showModal = (key) ->
        tmpl = {about: 'markup/about.html', login: 'login_modal'}[key]
        params = 
            templateUrl : tmpl
            scope : s
            windowClass : key
        if key == 'login'
            params.size = 'sm'
        modal = $uibModal.open params

        modal.result.then (() ->
            closeModals()
        ), () ->
            closeModals()

    s.clickX = () ->
        closeModals()

    s.loggedIn = false
    creds = $.jStorage.get("creds")
    if creds
        util.setLogin()
        s.loggedIn = true
        s.username = authenticationProxy.loginObj.name
    s.loginSubmit = (usr, pass, saveLogin) ->
        s.login_err = false
        authenticationProxy.makeRequest(usr, pass, saveLogin).done((data) ->
            util.setLogin()
            safeApply s, () ->
                s.show_modal = null
                s.restorePreLoginState()
                s.loggedIn = true
                s.username = usr
        ).fail ->
            c.log "login fail"
            safeApply s, () ->
                s.login_err = true


korpApp.filter "trust", ($sce) ->
    return (input) ->
        $sce.trustAsHtml input
