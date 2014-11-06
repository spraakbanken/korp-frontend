
window.searchProxy = new model.SearchProxy()
window.authenticationProxy = new model.AuthenticationProxy()
window.timeProxy = new model.TimeProxy()
creds = $.jStorage.get("creds")
if creds
    authenticationProxy.loginObj = creds

# rewriting old url format to the angular one
if(location.hash.length && location.hash[1] != "?")
    location.hash = "#?" + _.str.lstrip(location.hash, "#")

t = $.now()

isDev = window.location.host is "localhost"
# deferred_load = $.get("markup/searchbar.html")
$.ajaxSetup
    dataType: "json"
    traditional: true

$.ajaxPrefilter "json", (options, orig, jqXHR) ->
    "jsonp" if options.crossDomain and not $.support.cors

deferred_domReady = $.Deferred((dfd) ->
    $ ->
        mode = $.deparam.querystring().mode
        if mode? and mode isnt "default"
            $.getScript("modes/#{mode}_mode.js").done () ->
                dfd.resolve()
        else
            dfd.resolve()
                
            

    return dfd
).promise()

loc_dfd = initLocales()
$(document).keyup (event) ->
    if event.keyCode == 27
        kwicResults?.abort()
        lemgramResults?.abort()
        statsResults?.abort()

$.when(loc_dfd, deferred_domReady).then ((loc_data) ->
    c.log "preloading done, t = ", $.now() - t

    # angular.element(document).ready () ->
    angular.bootstrap(document, ['korpApp'])

    corpus = search()["corpus"]
    if corpus
        settings.corpusListing.select corpus.split(",")
    
    # window.advancedSearch = new view.AdvancedSearch('#korp-advanced')
    # window.extendedSearch = new view.ExtendedSearch('#korp-extended')
    # window.simpleSearch = new view.SimpleSearch('#korp-simple')

    $("body").addClass "lab" if isLab
    
    $("body").addClass "mode-" + currentMode
    util.browserWarn()
    view.updateSearchHistory()

    paper = new Raphael(document.getElementById("cog"), 33, 33)
    paper.path("M26.974,16.514l3.765-1.991c-0.074-0.738-0.217-1.454-0.396-2.157l-4.182-0.579c-0.362-0.872-0.84-1.681-1.402-2.423l1.594-3.921c-0.524-0.511-1.09-0.977-1.686-1.406l-3.551,2.229c-0.833-0.438-1.73-0.77-2.672-0.984l-1.283-3.976c-0.364-0.027-0.728-0.056-1.099-0.056s-0.734,0.028-1.099,0.056l-1.271,3.941c-0.967,0.207-1.884,0.543-2.738,0.986L7.458,4.037C6.863,4.466,6.297,4.932,5.773,5.443l1.55,3.812c-0.604,0.775-1.11,1.629-1.49,2.55l-4.05,0.56c-0.178,0.703-0.322,1.418-0.395,2.157l3.635,1.923c0.041,1.013,0.209,1.994,0.506,2.918l-2.742,3.032c0.319,0.661,0.674,1.303,1.085,1.905l4.037-0.867c0.662,0.72,1.416,1.351,2.248,1.873l-0.153,4.131c0.663,0.299,1.352,0.549,2.062,0.749l2.554-3.283C15.073,26.961,15.532,27,16,27c0.507,0,1.003-0.046,1.491-0.113l2.567,3.301c0.711-0.2,1.399-0.45,2.062-0.749l-0.156-4.205c0.793-0.513,1.512-1.127,2.146-1.821l4.142,0.889c0.411-0.602,0.766-1.243,1.085-1.905l-2.831-3.131C26.778,18.391,26.93,17.467,26.974,16.514zM20.717,21.297l-1.785,1.162l-1.098-1.687c-0.571,0.22-1.186,0.353-1.834,0.353c-2.831,0-5.125-2.295-5.125-5.125c0-2.831,2.294-5.125,5.125-5.125c2.83,0,5.125,2.294,5.125,5.125c0,1.414-0.573,2.693-1.499,3.621L20.717,21.297z").attr
        fill: "#666"
        stroke: "none"
        transform: "s0.6"

    paper = new Raphael(document.getElementById("labs_logo"), 39, 60)
    labs = paper.path("M22.121,24.438l-3.362-7.847c-0.329-0.769-0.599-2.081-0.599-2.917s0.513-1.521,1.14-1.521s1.141-0.513,1.141-1.14s-0.685-1.14-1.521-1.14h-6.84c-0.836,0-1.52,0.513-1.52,1.14s0.513,1.14,1.14,1.14s1.14,0.685,1.14,1.521s-0.269,2.148-0.599,2.917l-3.362,7.847C8.55,25.206,8.28,26.177,8.28,26.595s0.342,1.103,0.76,1.521s1.444,0.76,2.28,0.76h8.359c0.836,0,1.862-0.342,2.28-0.76s0.76-1.103,0.76-1.521S22.45,25.206,22.121,24.438zM16.582,7.625c0,0.599,0.484,1.083,1.083,1.083s1.083-0.484,1.083-1.083s-0.484-1.084-1.083-1.084S16.582,7.026,16.582,7.625zM13.667,7.792c0.276,0,0.5-0.224,0.5-0.5s-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5S13.391,7.792,13.667,7.792zM15.584,5.292c0.874,0,1.583-0.709,1.583-1.583c0-0.875-0.709-1.584-1.583-1.584C14.709,2.125,14,2.834,14,3.709C14,4.583,14.709,5.292,15.584,5.292z").attr(
        fill: "#333"
        stroke: "none"
        transform: "t0,18s1.7"
    )
    $("#logo").click ->
        window.location = window.location.protocol + "//" + window.location.host + window.location.pathname + location.search
        false


    #TODO: why do i have to do this?
    $("#cog_menu").menu({}).hide().find(".follow_link").click ->
        window.href = window.open($(this).attr("href"), $(this).attr("target") or "_self")

    $("#cog").click ->
        return if $("#cog_menu:visible").length
        $("#cog_menu").fadeIn("fast").position
            my: "right top"
            at: "right bottom"
            of: "#top_bar"
            offset: "-8 3"

        $("body").one "click", ->
            $("#cog_menu").fadeOut "fast"

        false

    # $("#searchbar").html searchbar_html[0]
    $("#search_history").change (event) ->
        c.log "select", $(this).find(":selected")
        target = $(this).find(":selected")
        if _.str.contains target.val(), "http://"
            location.href = target.val()
        else if target.is(".clear")
            c.log "empty searches"
            $.jStorage.set("searches", [])
            view.updateSearchHistory()

    
    creds = $.jStorage.get("creds")
    if creds
        util.setLogin()
    #     authenticationProxy.loginObj = creds

    tab_a_selector = "ul .ui-tabs-anchor"


    $("#log_out").click ->
        $.each authenticationProxy.loginObj.credentials, (i, item) ->
            $(".boxdiv[data=#{item.toLowerCase()}]").addClass "disabled"

        authenticationProxy.loginObj = {}
        $.jStorage.deleteKey "creds"
        $("body").toggleClass "logged_in not_logged_in"
        $("#pass").val ""
        $("#corpusbox").corpusChooser "redraw"



    prevFragment = {}
    window.onHashChange = (event, isInit) ->
        c.log "onHashChange"
        hasChanged = (key) ->
            prevFragment[key] isnt search()[key]
        showAbout = ->
            $("#about_content").dialog(beforeClose: ->
                search "display", null
                false
            ).css("opacity", 0)
            .parent().find(".ui-dialog-title").localeKey("about")
            $("#about_content").fadeTo 400, 1
            $("#about_content").find("a").blur() # Prevents the focus of the first link in the "dialog"
        if hasChanged("lang")
            newLang = search().lang || settings.defaultLanguage
            $("body").scope().lang = newLang
            # loc_dfd = util.initLocalize()
            # loc_dfd.done ->
            util.localize()

            $("#languages").radioList "select", newLang

        display = search().display
        if display is "about"
            if $("#about_content").is(":empty")
                $("#about_content").load "markup/about.html", ->
                    util.localize this
                    showAbout()

            else
                showAbout()
        else if display is "login"
            $("#login_popup").dialog(
                height: 220
                width: 177
                modal: true
                resizable: false
                create: ->
                    $(".err_msg", this).hide()

                open: ->
                    $(".ui-widget-overlay").hide().fadeIn()

                beforeClose: ->
                    $(".ui-widget-overlay").remove()
                    $("<div />",
                        class: "ui-widget-overlay"
                    ).css(
                        height: $("body").outerHeight()
                        width: $("body").outerWidth()
                        zIndex: 1001
                    ).appendTo("body").fadeOut ->
                        $(this).remove()

                    search "display", null
                    false
            ).show().unbind("submit").submit ->
                self = this
                authenticationProxy.makeRequest($("#usrname", this).val(), $("#pass", this).val()).done((data) ->
                    util.setLogin()
                    search "display", null
                ).fail ->
                    c.log "login fail"
                    $("#pass", self).val ""
                    $(".err_msg", self).show()

                false

            $("#ui-dialog-title-login_popup").attr "rel", "localize[log_in]"
        else
            $(".ui-dialog").fadeTo 400, 0, ->
                $(".ui-dialog-content", this).dialog "destroy"

        if not isInit and hasChanged("display")
            $("#plot_popup.ui-dialog-content").dialog("destroy").css
                opacity: 0
                display: "block"
                height: 0


        if isInit
            util.localize()

        prevFragment = _.extend {}, search()


    $(window).scroll ->
        $("#sidebar").sidebar "updatePlacement"


    #setup about link
    $("#about").click ->
        unless search().display?
            search display: "about"
        else
            search "about", null

    $("#login").click ->
        unless search().display?
            search display: "login"
        else
            search "login", null

    $("#languages").radioList(
        change: ->
            c.log "lang change", $(this).radioList("getSelected").data("mode")
            search lang: $(this).radioList("getSelected").data("mode")
        # TODO: this does nothing?
        selected: settings.defaultLanguage


    )
    $("#sidebar").sidebar() #.sidebar "hide"
    # $("#simple_text")[0].focus()
    $(document).click ->
        $("#simple_text.ui-autocomplete-input").autocomplete "close"

    setTimeout(() -> 
        view.initSearchOptions()
        onHashChange null, true
    , 0)
    $("body").animate
        opacity: 1
    , ->
        $(this).css "opacity", ""

    # initTimeGraph()
), ->
    c.log "failed to load some resource at startup.", arguments
    $("body").css(
        opacity: 1
        padding: 20
    ).html('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">')
    .append "<p>The server failed to respond, please try again later.</p>"




window.getAllCorporaInFolders = (lastLevel, folderOrCorpus) ->
    outCorpora = []

    # Go down the alley to the last subfolder
    while "." in folderOrCorpus
        posOfPeriod = _.indexOf folderOrCorpus, "."
        leftPart = folderOrCorpus.substr(0, posOfPeriod)
        rightPart = folderOrCorpus.substr(posOfPeriod + 1)
        if lastLevel[leftPart]
            lastLevel = lastLevel[leftPart]
            folderOrCorpus = rightPart
        else
            break
    if lastLevel[folderOrCorpus]

        # Folder
        # Continue to go through any subfolders
        $.each lastLevel[folderOrCorpus], (key, val) ->
            outCorpora = outCorpora.concat getAllCorporaInFolders(lastLevel[folderOrCorpus], key) if key not in ["title", "contents", "description"]


        # And add the corpora in this folder level
        outCorpora = outCorpora.concat lastLevel[folderOrCorpus]["contents"]
    else

        # Corpus
        outCorpora.push folderOrCorpus
    outCorpora




window.initTimeGraph = (def) ->
    timestruct = null
    all_timestruct = null
    restdata = null
    restyear = null
    # time_comb = timeProxy.makeRequest(true)
    onTimeGraphChange = () ->

    getValByDate = (date, struct) ->
        output = null
        $.each struct, (i, item) ->
            if date is item[0]
                output = item[1]
                false

        return output

    window.timeDeferred = timeProxy.makeRequest()
        .fail (error) ->
            $("#time_graph").html("<i>Could not draw graph due to a backend error.</i>")
        .done ([dataByCorpus, all_timestruct, rest]) ->
            c.log "write time"
            # $.each data, (corpus, struct) ->
            for corpus, struct of dataByCorpus
                if corpus isnt "time"
                    cor = settings.corpora[corpus.toLowerCase()]
                    timeProxy.expandTimeStruct struct
                    cor.non_time = struct[""]
                    struct = _.omit struct, ""
                    cor.time = struct
                    if _.keys(struct).length > 1
                        cor.common_attributes ?= {}
                        cor.common_attributes.date_interval = true

                        
                    #     cor.struct_attributes.date_interval =
                    #         label: "date_interval"
                    #         displayType: "date_interval"
                    #         opts: settings.liteOptions

            # $("#corpusbox").trigger "corpuschooserchange", [settings.corpusListing.getSelectedCorpora()]
            # onTimeGraphChange()
            safeApply $("body").scope(), (scope) ->
                scope.$broadcast("corpuschooserchange", corpusChooserInstance.corpusChooser("selectedItems"));
                def.resolve()
            

            onTimeGraphChange = (evt, data) ->
                # the 46 here is the presumed value of
                # the height of the graph
                one_px = max / 46
                # c.log "one_px", one_px

                normalize = (array) ->
                    _.map array, (item) ->
                        out = [].concat(item)
                        out[1] = one_px if out[1] < one_px and out[1] > 0
                        out

                output = _(settings.corpusListing.selected)
                    .pluck("time")
                    .filter(Boolean)
                    .map(_.pairs)
                    .flatten(true)
                    .reduce((memo, [a, b]) -> 
                        if typeof memo[a] is "undefined"
                            memo[a] = b
                        else
                            memo[a] += b
                        memo
                    , {})

                max = _.reduce(all_timestruct, (accu, item) ->
                    return item[1] if item[1] > accu
                    return accu
                , 0)



                timestruct = timeProxy.compilePlotArray(output)
                # c.log "output", output
                # c.log "timestruct", timestruct
                endyear = all_timestruct.slice(-1)[0][0]
                yeardiff = endyear - all_timestruct[0][0]
                restyear = endyear + (yeardiff / 25)
                restdata = _(settings.corpusListing.selected)
                    .filter((item) ->
                        item.time
                    ).reduce((accu, corp) ->
                        accu + parseInt(corp.non_time or "0")
                    , 0)
                plots = [
                    data: normalize([].concat(all_timestruct, [[restyear, rest]]))
                    bars:
                        fillColor: "lightgrey"
                ,
                    data: normalize(timestruct)
                    bars:
                        fillColor: "navy"
                ]
                if restdata
                    plots.push
                        data: normalize([[restyear, restdata]])
                        bars:
                            fillColor: "indianred"

                plot = $.plot($("#time_graph"), plots,
                    bars:
                        show: true
                        fill: 1
                        align: "center"

                    grid:
                        hoverable: true
                        borderColor: "white"

                    yaxis:
                        show: false

                    xaxis:
                        show: true

                    hoverable: true
                    colors: ["lightgrey", "navy"]
                )
                $.each $("#time_graph .tickLabel"), ->
                    $(this).hide() if parseInt($(this).text()) > new Date().getFullYear()



        $("#time_graph,#rest_time_graph").bind "plothover", _.throttle((event, pos, item) ->
            if item
                # c.log "hover", pos, item, item.datapoint
                date = item.datapoint[0]
                header = $("<h4>")
                if date is restyear
                    header.text util.getLocaleString("corpselector_rest_time")
                    val = restdata
                    total = rest
                else
                    header.text util.getLocaleString("corpselector_time") + " " + item.datapoint[0]
                    val = getValByDate(date, timestruct)
                    total = getValByDate(date, all_timestruct)
                c.log "output", timestruct[item.datapoint[0].toString()]
                pTmpl = _.template("<p><span rel='localize[<%= loc %>]'></span>: <%= num %> <span rel='localize[corpselector_tokens]' </p>")
                firstrow = pTmpl(
                    loc: "corpselector_time_chosen"
                    num: util.prettyNumbers(val or 0)
                )
                secondrow = pTmpl(
                    loc: "corpselector_of_total"
                    num: util.prettyNumbers(total)
                )
                time = item.datapoint[0]
                $(".corpusInfoSpace").css top: $(this).parent().offset().top
                $(".corpusInfoSpace").find("p").empty()
                .append(header, "<span> </span>", firstrow, secondrow)
                .localize().end()
                .fadeIn "fast"
            else
                $(".corpusInfoSpace").fadeOut "fast"
        , 100)

    opendfd = $.Deferred()
    $("#corpusbox").one "corpuschooseropen", ->
        opendfd.resolve()

    $.when(timeDeferred, opendfd).then ->
        $("#corpusbox").bind "corpuschooserchange", onTimeGraphChange
        onTimeGraphChange()

