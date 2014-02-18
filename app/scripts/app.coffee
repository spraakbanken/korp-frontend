korpApp = angular.module('korpApp', [       "watchFighters"
                                            'ui.bootstrap',
                                            "template/tabs/tabset.html"
                                            "template/tabs/tab.html"
                                            "template/modal/backdrop.html"
                                            "template/modal/window.html"
                                            "template/typeahead/typeahead-match.html",
                                            "template/typeahead/typeahead-popup.html"
                                            "angularSpinner"
                                            "uiSlider"
                                            "ui.sortable"
                                            "pasvaz.bindonce"
                                        ])

# korpApp.controller "kwicCtrl", ($scope) ->

korpApp.run ($rootScope, $location, utils, searches) ->
    s = $rootScope
    s._settings = settings
    s.lang = "sv"
    s.word_selected = null
    s.isLab = window.isLab;


    s.sidebar_visible = false

    s.activeCQP = "[]"
    s.search = () -> $location.search arguments...



    s._loc = $location
    s.$watch "_loc.search()", () ->
        c.log "loc.search() change", $location.search()
        _.defer () -> window.onHashChange?()



    $rootScope.kwicTabs = []
    $rootScope.compareTabs = []
    $rootScope.graphTabs = []
    isInit = true
    s.$on "corpuschooserchange", (event, corpora) ->
        c.log "corpuschooserchange", corpora
        settings.corpusListing.select corpora
        nonprotected = _.pluck(settings.corpusListing.getNonProtected(), "id")
        c.log "corpus change", corpora.length, _.intersection(corpora, nonprotected).length, nonprotected.length
        if corpora.length and _.intersection(corpora, nonprotected).length isnt nonprotected.length
            # $.bbq.pushState({"corpus" : corpora.join(",")})
            # search corpus: corpora.join(",")
            $location.search "corpus", corpora.join(",")
        else
            $location.search "corpus", null
        if corpora.length
          
            # if(currentMode == "parallel")
            #     extendedSearch.reset();
            # else 
            #     extendedSearch.refreshTokens();
            view.updateReduceSelect()
            view.updateContextSelect "within"

        #           view.updateContextSelect("context");
        enableSearch = !!corpora.length
        view.enableSearch enableSearch


        # unless isInit
        #     $location.search("search", null).replace()
        isInit = false


    # corpus = search()["corpus"]
    searches.infoDef.then () ->
        corpus = $location.search().corpus
        if corpus
            corp_array = corpus.split(",")
            processed_corp_array = []
            settings.corpusListing.select(corp_array)
            $.each corp_array, (key, val) ->
                processed_corp_array = [].concat(processed_corp_array, getAllCorporaInFolders(settings.corporafolders, val))
            corpusChooserInstance.corpusChooser "selectItems", processed_corp_array
            $("#select_corpus").val corpus
        #     simpleSearch.enableSubmit()
        
korpApp.controller "headerCtrl", ($scope, $location) ->
    s = $scope

    s.citeClick = () ->
        $location.search("display", "about")
        onHashChange()

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


    s.select = (modeId) ->
        for mode in s.modes
            mode.selected = false
            if mode.mode == modeId
                mode.selected = true

    s.select(currentMode)
    s.onSelect = (modeId) ->
        s.select(modeId)
        $location.search("corpus", null)
        if modeId is "default"
            location.href = location.pathname
        else
            location.href = location.pathname + "?mode=" + modeId
