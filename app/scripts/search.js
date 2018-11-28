/* eslint-disable
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
window.view = {}

//* *************
// Search view objects
//* *************

view.updateSearchHistory = function(value, href) {
    let needle
    const filterParam = url =>
        $.grep($.param.fragment(url).split("&"), item => (item.split("=")[0] === "search") || (item.split("=")[0] === "corpus")).join("&")
    
    $("#search_history").empty()
    const searches = $.jStorage.get("searches") || []
    const searchLocations = $.map(searches, item => filterParam(item.location))
    if ((value != null) && (needle = filterParam(href), !Array.from(searchLocations).includes(needle))) {
        searches.splice(0, 0, {
            label: value,
            location: href
        }
        )

        $.jStorage.set("searches", searches)
    }
    if (!searches.length) { return }
    const opts = $.map(searches, function(item) {
        const output = $("<option />", { value: item.location })
        .text(item.label).get(0)
        return output
    })
    const placeholder = $("<option>").localeKey("search_history").get(0)
    const clear = $("<option class='clear'>").localeKey("search_history_clear")

    return $("#search_history").html(opts)
        .prepend(clear)
        .prepend(placeholder)
}
