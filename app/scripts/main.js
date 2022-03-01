/** @format */
import statemachine from "@/statemachine"

const korpFailImg = require("../img/korp_fail.svg")
const deparam = require("jquery-deparam")

import jStorage from "../lib/jstorage"

window.authenticationProxy = new model.AuthenticationProxy()
window.timeProxy = new model.TimeProxy()

const creds = jStorage.get("creds")
if (creds) {
    authenticationProxy.loginObj = creds
    statemachine.send("USER_FOUND", creds)
} else {
    statemachine.send("USER_NOT_FOUND")
}

// rewriting old url format to the angular one
if (location.hash.length && location.hash[1] !== "?") {
    location.hash = `#?${_.trimStart(location.hash, "#")}`
}

$.ajaxSetup({
    dataType: "json",
    traditional: true,
})

$.ajaxPrefilter("json", function (options) {
    if (options.crossDomain && !$.support.cors) {
        return "jsonp"
    }
})

const deferred_domReady = $.Deferred(function (dfd) {
    $(function () {
        return $.getScript(`modes/${currentMode}_mode.js`)
            .done(() => dfd.resolve())
            .fail((jqxhr, settings, exception) => c.error("Mode file parsing error: ", exception))
    })
    return dfd
}).promise()

const loc_dfd = window.initLocales()
$(document).keyup(function (event) {
    if (event.keyCode === 27) {
        if (kwicResults) {
            kwicResults.abort()
        }
        if ("lemgramResults" in window) {
            lemgramResults.abort()
        }
        if (statsResults) {
            statsResults.abort()
        }
    }
})

$.when(loc_dfd, deferred_domReady).then(
    function () {
        try {
            angular.bootstrap(document, ["korpApp"])
        } catch (error) {
            console.log("????")
            c.error(error)
        }

        try {
            view.updateSearchHistory()
        } catch (error1) {
            c.error("ERROR setting corpora from location", error1)
        }

        if (isLab) {
            $("body").addClass("lab")
        }

        $("body").addClass(`mode-${window.currentMode}`)
        util.browserWarn()

        $("#search_history").change(function (event) {
            const target = $(this).find(":selected")
            if (_.includes(["http://", "https:/"], target.val().slice(0, 7))) {
                location.href = target.val()
            } else if (target.is(".clear")) {
                jStorage.set("searches", [])
                view.updateSearchHistory()
            }
        })

        let prevFragment = {}
        // Note that this is _not_ window.onhashchange (lowercase only) and is not called by the browser
        window.onHashChange = function (event, isInit) {
            const hasChanged = (key) => prevFragment[key] !== locationSearch()[key]
            if (hasChanged("lang")) {
                const newLang = locationSearch().lang || settings.defaultLanguage
                $("body").scope().lang = newLang
                window.lang = newLang
                util.localize()

                $("#languages").radioList("select", newLang)
            }

            if (isInit) {
                util.localize()
            }

            prevFragment = _.extend({}, locationSearch())
        }

        $("#languages").radioList({
            change() {
                const currentLang = $(this).radioList("getSelected").data("mode")
                locationSearch({
                    lang: currentLang !== settings.defaultLanguage ? currentLang : null,
                })
            },
            // TODO: this does nothing?
            selected: settings.defaultLanguage,
        })

        setTimeout(() => window.onHashChange(null, true), 0)
        $("body").animate({ opacity: 1 }, function () {
            $(this).css("opacity", "")
        })
    },
    function () {
        c.log("failed to load some resource at startup.", arguments)
        return $("body")
            .css({
                opacity: 1,
                padding: 20,
            })
            .html('<object class="korp_fail" type="image/svg+xml" data="img/korp_fail.svg">')
            .append("<p>The server failed to respond, please try again later.</p>")
    }
)
