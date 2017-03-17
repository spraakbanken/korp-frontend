window.view = {}

#**************
# Search view objects
#**************

view.updateSearchHistory = (value, href) ->
    filterParam = (url) ->
        $.grep($.param.fragment(url).split("&"), (item) ->
            item.split("=")[0] is "search" or item.split("=")[0] is "corpus"
        ).join "&"
    $("#search_history").empty()
    searches = $.jStorage.get("searches") or []
    searchLocations = $.map(searches, (item) ->
        filterParam item.location
    )
    if value? and filterParam(href) not in searchLocations
        searches.splice 0, 0,
            label: value
            location: href

        $.jStorage.set "searches", searches
    return unless searches.length
    opts = $.map(searches, (item) ->
        output = $("<option />", value: item.location)
        .text(item.label).get(0)
        output
    )
    placeholder = $("<option>").localeKey("search_history").get(0)
    clear = $("<option class='clear'>").localeKey("search_history_clear")

    $("#search_history").html(opts)
        .prepend(clear)
        .prepend(placeholder)

##TODO data-history and data-prefix (not used?) should be replaced with angular
view.initSearchOptions = ->
    selects = $("#search_options > div:first select").customSelect()

    $("#search_options select").each ->
        state = locationSearch()[$(this).data("history")]

        if state
            $(this).val(state).change()
        else
            $(this).prop("selectedIndex", 0).change()

    $("#search_options").css("background-color", settings.primaryLight).change (event, isInit) ->
        target = $(event.target)
        unless target.data("history") then return
        state = {}
        state[target.data("history")] = target.val()
        unless target.prop("selectedIndex") is 0
            locationSearch state
        else
            if locationSearch()[target.data("history")]
                locationSearch target.data("history"), null

        if isInit is true
            locationSearch("search", null)

