/** @format */
const korpFailImg = require("../img/korp_fail.svg")
const deparam = require("jquery-deparam")

import jStorage from "../lib/jstorage"

window.authenticationProxy = new model.AuthenticationProxy()
window.timeProxy = new model.TimeProxy()

const creds = jStorage.get("creds")
if (creds) {
    authenticationProxy.loginObj = creds
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
        let { mode } = deparam(window.location.search.slice(1))
        if (!mode) {
            mode = "default"
        }
        return $.getScript(`modes/${mode}_mode.js`)
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
            c.error(error)
        }

        try {
            const corpus = locationSearch()["corpus"]
            if (corpus) {
                settings.corpusListing.select(corpus.split(","))
            }
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

window.getAllCorporaInFolders = function (lastLevel, folderOrCorpus) {
    let outCorpora = []

    // Go down the alley to the last subfolder
    while (folderOrCorpus.includes(".")) {
        const posOfPeriod = _.indexOf(folderOrCorpus, ".")
        const leftPart = folderOrCorpus.substr(0, posOfPeriod)
        const rightPart = folderOrCorpus.substr(posOfPeriod + 1)
        if (lastLevel[leftPart]) {
            lastLevel = lastLevel[leftPart]
            folderOrCorpus = rightPart
        } else {
            break
        }
    }
    if (lastLevel[folderOrCorpus]) {
        // Folder
        // Continue to go through any subfolders
        $.each(lastLevel[folderOrCorpus], function (key, val) {
            if (!["title", "contents", "description"].includes(key)) {
                outCorpora = outCorpora.concat(
                    getAllCorporaInFolders(lastLevel[folderOrCorpus], key)
                )
            }
        })

        // And add the corpora in this folder level
        outCorpora = outCorpora.concat(lastLevel[folderOrCorpus]["contents"])
    } else {
        // Corpus
        outCorpora.push(folderOrCorpus)
    }
    return outCorpora
}

window.initTimeGraph = function (def) {
    let timestruct = null
    let restdata = null
    let restyear = null
    let hasRest = false

    let onTimeGraphChange

    const getValByDate = function (date, struct) {
        let output = null
        $.each(struct, function (i, item) {
            if (date === item[0]) {
                output = item[1]
                return false
            }
        })

        return output
    }

    window.timeDeferred = timeProxy
        .makeRequest()
        .fail((error) => {
            console.error(error)
            $("#time_graph").html("<i>Could not draw graph due to a backend error.</i>")
        })
        .done(function (...args) {
            let [dataByCorpus, all_timestruct, rest] = args[0]

            if (all_timestruct.length == 0) {
                return
            }

            for (let corpus in dataByCorpus) {
                let struct = dataByCorpus[corpus]
                if (corpus !== "time") {
                    const cor = settings.corpora[corpus.toLowerCase()]
                    timeProxy.expandTimeStruct(struct)
                    cor.non_time = struct[""]
                    struct = _.omit(struct, "")
                    cor.time = struct
                    if (_.keys(struct).length > 1) {
                        if (cor.common_attributes == null) {
                            cor.common_attributes = {}
                        }
                        cor.common_attributes.date_interval = true
                    }
                }
            }

            safeApply($("body").scope(), function (scope) {
                scope.$broadcast(
                    "corpuschooserchange",
                    corpusChooserInstance.corpusChooser("selectedItems")
                )
                return def.resolve()
            })

            onTimeGraphChange = function (evt, data) {
                let max = _.reduce(
                    all_timestruct,
                    function (accu, item) {
                        if (item[1] > accu) {
                            return item[1]
                        }
                        return accu
                    },
                    0
                )

                // the 46 here is the presumed value of
                // the height of the graph
                const one_px = max / 46

                const normalize = (array) =>
                    _.map(array, function (item) {
                        const out = [].concat(item)
                        if (out[1] < one_px && out[1] > 0) {
                            out[1] = one_px
                        }
                        return out
                    })

                const output = _(settings.corpusListing.selected)
                    .map("time")
                    .filter(Boolean)
                    .map(_.toPairs)
                    .flatten(true)
                    .reduce(function (memo, ...rest1) {
                        const [a, b] = rest1[0]
                        if (typeof memo[a] === "undefined") {
                            memo[a] = b
                        } else {
                            memo[a] += b
                        }
                        return memo
                    }, {})

                timestruct = timeProxy.compilePlotArray(output)
                const endyear = all_timestruct.slice(-1)[0][0]
                const yeardiff = endyear - all_timestruct[0][0]
                restyear = endyear + yeardiff / 25
                restdata = _(settings.corpusListing.selected)
                    .filter((item) => item.time)
                    .reduce((accu, corp) => accu + parseInt(corp.non_time || "0"), 0)

                hasRest = yeardiff > 0

                const plots = [
                    { data: normalize([].concat(all_timestruct, [[restyear, rest]])) },
                    { data: normalize(timestruct) },
                ]
                if (restdata) {
                    plots.push({
                        data: normalize([[restyear, restdata]]),
                    })
                }

                $.plot($("#time_graph"), plots, {
                    bars: {
                        show: true,
                        fill: 1,
                        align: "center",
                    },

                    grid: {
                        hoverable: true,
                        borderColor: "white",
                    },

                    yaxis: {
                        show: false,
                    },

                    xaxis: {
                        show: true,
                        tickDecimals: 0,
                    },

                    hoverable: true,
                    colors: ["lightgrey", "navy", "#cd5c5c"],
                })
                return $.each($("#time_graph .tickLabel"), function () {
                    if (parseInt($(this).text()) > new Date().getFullYear()) {
                        return $(this).hide()
                    }
                })
            }

            return $("#time_graph,#rest_time_graph").bind(
                "plothover",
                _.throttle(function (event, pos, item) {
                    if (item) {
                        let total, val
                        const date = item.datapoint[0]
                        const header = $("<h4>")
                        if (date === restyear && hasRest) {
                            header.text(util.getLocaleString("corpselector_rest_time"))
                            val = restdata
                            total = rest
                        } else {
                            header.text(
                                util.getLocaleString("corpselector_time") + " " + item.datapoint[0]
                            )
                            val = getValByDate(date, timestruct)
                            total = getValByDate(date, all_timestruct)
                        }

                        const pTmpl = _.template(
                            "<p><span rel='localize[<%= loc %>]'></span>: <%= num %> <span rel='localize[corpselector_tokens]' </p>"
                        )
                        const firstrow = pTmpl({
                            loc: "corpselector_time_chosen",
                            num: util.prettyNumbers(val || 0),
                        })
                        const secondrow = pTmpl({
                            loc: "corpselector_of_total",
                            num: util.prettyNumbers(total),
                        })
                        $(".corpusInfoSpace").css({
                            top: $(this).parent().offset().top,
                        })
                        return $(".corpusInfoSpace")
                            .find("p")
                            .empty()
                            .append(header, "<span> </span>", firstrow, secondrow)
                            .localize()
                            .end()
                            .fadeIn("fast")
                    } else {
                        return $(".corpusInfoSpace").fadeOut("fast")
                    }
                }, 100)
            )
        })

    const opendfd = $.Deferred()
    $("#corpusbox").one("corpuschooseropen", () => opendfd.resolve())

    return $.when(window.timeDeferred, opendfd).then(function () {
        if (onTimeGraphChange) {
            $("#corpusbox").bind("corpuschooserchange", onTimeGraphChange)
            return onTimeGraphChange()
        }
    })
}
