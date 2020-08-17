/** @format */

var collapsedImg = require("../img/collapsed.png")
var hp_this
var hp_corpusChooser = {
    options: {
        template: "",
    },

    _create: function () {
        this.totalTokenCount = 0
        this._transform()
        var self = this

        this.updateAllStates()

        // Make the popup disappear when the user clicks outside it
        $(window).unbind("click.corpusselector")
        $(window).bind("click.corpusselector", function (e) {
            if ($(".popupchecks").is(":visible") && e.target != self) {
                $(".popupchecks").fadeOut("fast")
                $(".corpusInfoSpace").fadeOut("fast")
                $(".hp_topframe").removeClass("ui-corner-top")
            }
        })

        $(".buttonlink, ul#icons li").hover(
            function () {
                $(this).addClass("ui-state-hover")
            },
            function () {
                $(this).removeClass("ui-state-hover")
            }
        )
    },
    isSelected: function (id) {
        // Test if a given id is selected
        var cb = $("#" + id)
        return cb.hasClass("checked")
    },
    selectedItems: function () {
        // Return all ids that are selected
        var IDArray = []
        var allboxes = $(".boxdiv label .checked")
        allboxes.each(function () {
            var idstring = $(this).attr("id")
            if (idstring != "") {
                IDArray.push(idstring.slice(9))
            }
        })
        return IDArray
    },
    selectItems: function (item_ids) {
        item_ids = $.map(item_ids, function (item) {
            return "hpcorpus_" + item
        })
        // Check items from outside
        var allboxes = $(".checkbox")
        allboxes.each(function () {
            /* First clear all items */
            hp_this.setStatus($(this), "unchecked")
        })
        var realboxes = $(".boxdiv")
        realboxes.each(function () {
            var chk = $(".checkbox", this)
            if ($.inArray(chk.attr("id"), item_ids) != -1 && !$(this).is(".disabled")) {
                /* Change status of item */
                hp_this.setStatus(chk, "checked")
                hp_this.updateState(chk) // <-?
                var ancestors = chk.parents(".tree")
                ancestors.each(function () {
                    hp_this.updateState($(this))
                })
            }
        })
        this.countSelected()
        // Fire callback "change":
        hp_this.triggerChange()
    },
    updateAllStates: function () {
        var self = this
        $(".tree").each(function () {
            self.updateState($(this))
        })
    },
    updateState: function (element) {
        // element is a div!
        var descendants = element.find(".checkbox")
        var numbOfChecked = 0
        var numbOfUnchecked = 0
        descendants.each(function () {
            if (!$(this).parent().parent().hasClass("tree")) {
                if ($(this).hasClass("checked")) {
                    numbOfChecked++
                } else if ($(this).hasClass("unchecked")) {
                    numbOfUnchecked++
                }
            }
        })
        var theBox = element.children("label").children(".checkbox")
        if (numbOfUnchecked > 0 && numbOfChecked > 0) {
            this.setStatus(theBox, "intermediate") // Intermediate
        } else if (numbOfUnchecked > 0 && numbOfChecked == 0) {
            this.setStatus(theBox, "unchecked") // Unchecked
        } else if (numbOfChecked > 0 && numbOfUnchecked == 0) {
            this.setStatus(theBox, "checked") // Checked
        }

        var numDisabled = element.find(".disabled").length
        if (element.find(".boxdiv").length === numDisabled && numDisabled > 0) {
            element.addClass("disabled")
        } else {
            element.removeClass("disabled")
        }
    },
    setStatus: function (obj, stat) {
        /* Change status of item */
        obj.removeClass("intermediate unchecked checked")
        if (stat == "checked") {
            obj.addClass("checked")
        } else if (stat == "intermediate") {
            obj.addClass("intermediate")
        } else {
            obj.addClass("unchecked")
        }
    },
    countSelected: function () {
        /* Update header */
        var header_text = ""
        var header_text_2 = ""
        var header_total = ""
        var header_of = false
        var checked_checkboxes = $(".hplabel .checked")
        var num_checked_checkboxes = checked_checkboxes.length
        var num_unchecked_checkboxes = $(".hplabel .unchecked").length
        var num_checkboxes = $(".hplabel .checkbox").length
        // if (num_unchecked_checkboxes == num_checkboxes) {
        //  header_text_2 = 'corpselector_noneselected';
        // } else
        if (num_checked_checkboxes == num_checkboxes && num_checkboxes > 1) {
            header_text = num_checked_checkboxes
            header_text_2 = "corpselector_allselected"
        } else if (num_checked_checkboxes == 1) {
            var currentCorpusName = checked_checkboxes.parent().parent().attr("data")
            if (currentCorpusName.length > 37) {
                // Ellipsis
                currentCorpusName = _.trim(currentCorpusName.substr(0, 37)) + "..."
            }
            header_text = currentCorpusName
            header_text_2 = "corpselector_selectedone"
        } else {
            header_text = num_checked_checkboxes
            header_text_2 = "corpselector_selectedmultiple"
            header_total = $(".popupchecks").find(".hplabel").length
            header_of = true
        }

        // Number of tokens
        var selectedNumberOfTokens = 0
        var selectedNumberOfSentences = 0
        checked_checkboxes.each(function (key, corpItem) {
            var corpusID = $(this).attr("id").slice(9)
            selectedNumberOfTokens += parseInt(settings.corpora[corpusID]["info"]["Size"])
            var numSen = parseInt(settings.corpora[corpusID]["info"]["Sentences"])
            if (!isNaN(numSen)) selectedNumberOfSentences += numSen
        })
        var totalNumberOfTokens = this.totalTokenCount

        $("#hp_corpora_title1").text(header_text)
        $("#hp_corpora_titleOf").toggle(header_of)
        $("#hp_corpora_titleTotal").text(header_total)
        $("#hp_corpora_title2").attr({ rel: "localize[" + header_text_2 + "]" })
        $("#hp_corpora_title2").text(util.getLocaleString(header_text_2))
        $("#hp_corpora_titleTokens")
            .html(
                " — " +
                    util.suffixedNumbers(selectedNumberOfTokens.toString()) +
                    '<span rel="localize[corpselector_of]">' +
                    util.getLocaleString("corpselector_of") +
                    "</span>" +
                    util.suffixedNumbers(totalNumberOfTokens.toString()) +
                    " "
            )
            .append($("<span>").localeKey("corpselector_tokens"))
        $("#sentenceCounter")
            .html(util.prettyNumbers(selectedNumberOfSentences.toString()) + " ")
            .append($("<span>").localeKey("corpselector_sentences_long"))
    },
    triggerChange: function () {
        this._trigger("change", null, [this.selectedItems()])
    },

    redraw: function () {
        this._transform()
    },

    _transform: function () {
        var el = this.element
        hp_this = this
        var body
        if (this.options.template != "") {
            body = this.options.template
        } else {
            body = el.html()
        }

        var newHTML = recursive_transform(body, 0)
        $(".popupchecks .checks").html(newHTML)

        // el.addClass("scroll_checkboxes inline_block");
        var pos = $(".scroll_checkboxes").offset().left + 434
        $(".corpusInfoSpace")
            .css({ left: pos.toString() + "px" })
            .click(function (event) {
                var target = event.target
                if (!$(target).is("a")) return false
            })

        hp_this.countSelected()
        // Update the number of children for all folders:
        $(".tree").each(function () {
            var noItems = $(this).find(".hplabel .checkbox").length
            $(this)
                .children("label")
                .children(".numberOfChildren")
                .text("(" + noItems + ")")
        })

        var popoffset = $(".scroll_checkboxes").position().top + $(".scroll_checkboxes").height()

        $(".scroll_checkboxes").unbind("mousedown")
        $(".scroll_checkboxes").mousedown(function (e) {
            if ($(this).siblings(".popupchecks").css("display") == "block") {
                $(".popupchecks").fadeOut("fast")
                $(".corpusInfoSpace").fadeOut("fast")
                $(".hp_topframe").removeClass("ui-corner-top")
            } else {
                $(".popupchecks")
                    .show()
                    .css({
                        position: "absolute",
                        top: $("#corpusbox").offset().top + $("#corpusbox").height() - 2,
                        left: $("#corpusbox").offset().left,
                    })
                hp_this._trigger("open")
                $(".hp_topframe").addClass("ui-corner-top")
            }
            e.stopPropagation()
        })

        $(".scroll_checkboxes")
            .unbind("click")
            .click(function (e) {
                e.stopPropagation()
            })

        // Prevent clicking through the box
        $(".popupchecks")
            .unbind("click")
            .click(function (e) {
                e.stopPropagation()
            })

        /* SELECT ALL BUTTON */
        $(".selectall")
            .unbind("click")
            .click(function () {
                hp_this.setStatus(
                    $(".boxlabel .checkbox, div.checks .boxdiv:not(.disabled) .checkbox"),
                    "checked"
                )
                hp_this.countSelected()
                // Fire callback "change":
                hp_this.triggerChange()
                return false
            })

        /* SELECT NONE BUTTON */
        $(".selectnone")
            .unbind("click")
            .click(function () {
                hp_this.setStatus(
                    $(".boxlabel .checkbox, div.checks .boxdiv:not(.disabled) .checkbox"),
                    "unchecked"
                )
                hp_this.countSelected()
                // Fire callback "change":
                hp_this.triggerChange()
                return false
            })

        $(".ext")
            .unbind("click")
            .click(function () {
                $(".corpusInfoSpace").fadeOut("fast")
                if ($(this).parent().hasClass("collapsed")) {
                    $(this).parent().removeClass("collapsed").addClass("extended")
                    $(this).siblings("div").fadeToggle("fast")
                } else {
                    $(this).parent().removeClass("extended").addClass("collapsed")
                    $(this).siblings("div").fadeToggle("fast")
                }
            })

        $(".boxlabel")
            .unbind("click") // "folders"
            .click(function (event) {
                let isLinux = window.navigator.userAgent.indexOf("Linux") != -1

                if (!$(this).parent().hasClass("disabled")) {
                    if (!isLinux && event.altKey == 1) {
                        $(".checkbox").each(function () {
                            hp_this.setStatus($(this), "unchecked")
                        })
                    } else if (isLinux && event.ctrlKey == 1) {
                        $(".checkbox").each(function () {
                            hp_this.setStatus($(this), "unchecked")
                        })
                    }
                    if ($(this).is(".disabled")) return
                    hp_this.updateState($(this).parent())
                    var childMan = $(this).children(".checkbox")
                    var checkedAllUnlocked =
                        childMan.hasClass("intermediate") &&
                        childMan.parent().siblings("div:not(.disabled)").length ===
                            childMan.parent().siblings().find(".checked").length
                    if (childMan.hasClass("checked") || checkedAllUnlocked) {
                        // Checked, uncheck it if not the root of a tree
                        if (!$(this).parent().hasClass("tree")) {
                            hp_this.setStatus(childMan, "unchecked")
                        } else {
                            var descendants = childMan.parent().siblings("div").find(".checkbox")
                            hp_this.setStatus(descendants, "unchecked")
                        }
                    } else {
                        // Unchecked, check it unless it's intermediate and all unchecked ones are locked
                        hp_this.setStatus(childMan, "checked")
                        if ($(this).parent().hasClass("tree")) {
                            // If tree, check all descendants
                            descendants = childMan
                                .parent()
                                .siblings("div:not(.disabled)")
                                .find(".checkbox")
                            hp_this.setStatus(descendants, "checked")
                        }
                    }
                    var ancestors = childMan.parents(".tree")
                    ancestors.each(function () {
                        hp_this.updateState($(this))
                    })
                    hp_this.countSelected()
                    // Fire callback "change":
                    hp_this.triggerChange()
                }
            })

        var hoverConfig = {
            over: function () {
                // Fire callback "infoPopup":
                var callback = hp_this.options.infoPopup
                var returnValue = ""
                var inValue = ""
                var idstring = $(this).find("span").attr("id")
                if (idstring != "") {
                    inValue = idstring.slice(9)
                }
                if ($.isFunction(callback)) returnValue = callback(inValue)
                $(".corpusInfoSpace").css({ top: $(this).offset().top })
                $(".corpusInfoSpace").find("p").html(returnValue)
                $(".corpusInfoSpace").fadeIn("fast")
                // $(".corpusInfoSpace").css({"display": "block"});
            },
            interval: 200, // number = milliseconds delay before onMouseOut
            out: function () {
                /* $(".corpusInfoSpace").fadeOut('fast');
                    //$(".corpusInfoSpace").css({"display": "none"}); */
            },
        }

        var hoverFolderConfig = {
            over: function () {
                var callback = hp_this.options.infoPopupFolder
                var returnValue = ""
                var indata = []
                var boxes = $(this).parent().find(".boxdiv")
                var corpusID = []
                boxes.each(function (index) {
                    corpusID.push($(this).find("span").attr("id").slice(9))
                })
                indata["corporaID"] = corpusID
                var desc = $(this).parent().attr("data").split("___")[1]
                if (!desc) {
                    desc = ""
                }
                indata["description"] = unescape(desc)
                indata["title"] = $(this).parent().attr("data").split("___")[0]
                if ($.isFunction(callback)) returnValue = callback(indata)
                $(".corpusInfoSpace").css({
                    top: $(this).parent().offset().top,
                })
                $(".corpusInfoSpace").find("p").html(returnValue)
                $(".corpusInfoSpace").fadeIn("fast")
            },
            interval: 200,
            out: function () {},
        }

        $(".boxdiv").hoverIntent(hoverConfig)
        $(".boxlabel").hoverIntent(hoverFolderConfig)

        $(".boxdiv").unbind("click") // "Non-folder items"
        $(".boxdiv").click(function (event) {
            if ($(this).is(".disabled")) return
            let isLinux = window.navigator.userAgent.indexOf("Linux") != -1
            if (!isLinux && event.altKey == 1) {
                $(".checkbox").each(function () {
                    hp_this.setStatus($(this), "unchecked")
                })
            } else if (isLinux && event.ctrlKey == 1) {
                $(".checkbox").each(function () {
                    hp_this.setStatus($(this), "unchecked")
                })
            }

            hp_this.updateState($(this))
            var childMan = $(this).children("label").children(".checkbox")
            if (childMan.hasClass("checked")) {
                hp_this.setStatus(childMan, "unchecked")
            } else {
                hp_this.setStatus(childMan, "checked")
            }
            var ancestors = childMan.parents(".tree")
            ancestors.each(function () {
                hp_this.updateState($(this))
            })
            hp_this.countSelected()
            // Fire callback "change":
            hp_this.triggerChange()
        })
        function wrapWithSpan(htmlStr) {
            return "<span>" + htmlStr + "</span>"
        }
        function recursive_transform(einHTML, levelindent) {
            var outStr = ""
            var ul = $(einHTML).children()
            var hasDirectCorporaChildren = false
            ul = ul.each(function (index) {
                var theHTML = $(this).html()
                if (theHTML != null) {
                    var leftattrib = 0
                    var item_id = $(this).attr("id")
                    if (item_id == null) item_id = ""

                    if (item_id != "") {
                        hp_this.totalTokenCount += parseInt(
                            settings.corpora[item_id]["info"]["Size"]
                        )
                        item_id = "hpcorpus_" + item_id
                    }

                    if (theHTML.indexOf("<li") != -1 || theHTML.indexOf("<LI") != -1) {
                        var cssattrib = ""
                        if (levelindent > 0) {
                            leftattrib = 30
                            cssattrib += "margin-left:" + leftattrib + "px; display:none"
                        }
                        var foldertitle = $(this).children("ul").attr("title")
                        var folderdescription = $(this).children("ul").attr("description")
                        if (folderdescription == "undefined") folderdescription = ""
                        outStr +=
                            '<div data="' +
                            foldertitle +
                            "___" +
                            folderdescription +
                            '" style="' +
                            cssattrib +
                            '" class="tree collapsed ' +
                            levelindent +
                            '"><img src="' +
                            collapsedImg +
                            '" alt="extend" class="ext"/> <label class="boxlabel"><span id="' +
                            item_id +
                            '" class="checkbox checked"/> <span>' +
                            foldertitle +
                            ' </span><span class="numberOfChildren">(?)</span></label>'

                        outStr += recursive_transform(theHTML, levelindent + 1)
                        outStr += "</div>"
                    } else {
                        var disable =
                            settings.corpora[$(this).attr("id")].limitedAccess === true &&
                            !authenticationProxy.hasCred($(this).attr("id"))

                        if (levelindent > 0) {
                            // Indragna och gömda per default
                            hasDirectCorporaChildren = true
                            outStr +=
                                '<div data="' +
                                theHTML +
                                '" class="boxdiv' +
                                (disable ? " disabled" : "") +
                                '" style="margin-left:46px; display:none; background-color:' +
                                settings.primaryColor +
                                '"><label class="hplabel"><span id="' +
                                item_id +
                                '" class="checkbox ' +
                                (disable ? " unchecked" : "checked") +
                                '"></span> ' +
                                wrapWithSpan(theHTML) +
                                " </label></div>"
                        } else {
                            if (index != ul.length) {
                                hasDirectCorporaChildren = true
                                outStr +=
                                    '<div data="' +
                                    theHTML +
                                    '" class="boxdiv' +
                                    (disable ? " disabled" : "") +
                                    '" style="margin-left:16px; background-color:' +
                                    settings.primaryColor +
                                    '"><label class="hplabel"><span id="' +
                                    item_id +
                                    '" class="checkbox ' +
                                    (disable ? " unchecked" : "checked") +
                                    '"></span> ' +
                                    wrapWithSpan(theHTML) +
                                    " </label></div>"
                            }
                        }
                    }
                }
            })
            if (!hasDirectCorporaChildren) {
                outStr +=
                    '<div class="extra_fill" style="height:2px; display:none; visible:false"></div>'
            }

            return outStr
        }
    },
}

let widget = require("components-jqueryui/ui/widget")
widget("hp.corpusChooser", hp_corpusChooser) // create the widget
