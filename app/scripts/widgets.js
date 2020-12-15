/** @format */
let widget = require("components-jqueryui/ui/widget")
// const Sidebar = {
//     _init() {},

//     updateContent(sentenceData, wordData, corpus, tokens, inReadingMode) {
//         this.element.html('<div id="selected_sentence" /><div id="selected_word" />')
//         // TODO: this is pretty broken
//         const corpusObj = settings.corpora[corpus] || settings.corpusListing.get(corpus)

//         const corpusInfo = $("<div />").html(
//             `<h4 rel='localize[corpus]'></h4> <p>${corpusObj.title}</p>`
//         )
//         corpusInfo.prependTo("#selected_sentence")

//         if (!inReadingMode && corpusObj.readingMode) {
//             $("<div class='openReadingMode'/>")
//                 .html(`<span class="link" rel="localize[read_in_korp]"></span>`)
//                 .click(function () {
//                     const aScope = angular
//                         .element(document.getElementById("results-wrapper"))
//                         .scope()
//                     safeApply(aScope.$root, () =>
//                         aScope.$root.textTabs.push({
//                             corpus: corpus,
//                             sentenceId: sentenceData.sentence_id,
//                         })
//                     )
//                 })
//                 .prependTo(corpusInfo)
//         }

//         const customData = { pos: [], struct: [] }
//         if (!$.isEmptyObject(corpusObj.customAttributes)) {
//             const [word, sentence] = this.renderCustomContent(
//                 wordData,
//                 sentenceData,
//                 corpusObj.customAttributes,
//                 tokens
//             )
//             customData.pos = word
//             customData.struct = sentence
//         }

//         let posData = []
//         if (!$.isEmptyObject(corpusObj.attributes)) {
//             posData = this.renderCorpusContent(
//                 "pos",
//                 wordData,
//                 sentenceData,
//                 corpusObj.attributes,
//                 tokens,
//                 corpusObj.customAttributes || {},
//                 customData.pos
//             )
//         }
//         let structData = []
//         if (!$.isEmptyObject(corpusObj.structAttributes)) {
//             structData = this.renderCorpusContent(
//                 "struct",
//                 wordData,
//                 sentenceData,
//                 corpusObj.structAttributes,
//                 tokens,
//                 corpusObj.customAttributes || {},
//                 customData.struct
//             )
//         }

//         $("#selected_word").append($("<h4>").localeKey("word_attr"))
//         $("#selected_sentence").append($("<h4>").localeKey("sentence_attr"))
//         $("#selected_word").append(posData)
//         $("#selected_sentence").append(structData)

//         this.element.localize()
//         this.applyEllipse()
//         if (corpusObj.attributes.deprel) {
//             this.renderGraph(tokens)
//         }
//     },

//     renderGraph(tokens) {
//         if (!tokens || tokens.length == 0) {
//             return
//         }
//         $("<span class='link show_deptree'></button>")
//             .localeKey("show_deptree")
//             .click(function () {
//                 const outerW = $(window).width() - 80
//                 const info = $("<span class='info' />")
//                 const iframe = $('<iframe src="lib/deptrees/deptrees.html"></iframe>')
//                     .css("width", outerW - 40)
//                     .on("load", function () {
//                         const wnd = this.contentWindow
//                         wnd.draw_deptree.call(wnd, tokens, function (msg) {
//                             const [type, val] = _.head(_.toPairs(msg))
//                             info.empty().append(
//                                 $("<span>").localeKey(type),
//                                 $("<span>: </span>"),
//                                 $("<span>").localeKey(`${type}_${val}`)
//                             )
//                         })
//                     })

//                 $("#deptree_popup")
//                     .empty()
//                     .append(info, iframe)
//                     .dialog({
//                         height: 300,
//                         width: outerW,
//                     })
//                     .parent()
//                     .find(".ui-dialog-title")
//                     .localeKey("dep_tree")
//             })
//             .appendTo(this.element)
//     },

//     renderCorpusContent(
//         type,
//         wordData,
//         sentenceData,
//         corpus_attrs,
//         tokens,
//         customAttrs,
//         customData
//     ) {
//         let pairs
//         if (type === "struct") {
//             pairs = _.toPairs(sentenceData)
//         } else if (type === "pos") {
//             pairs = _.toPairs(wordData)
//         }

//         pairs = _.filter(pairs, function (...args) {
//             let [key, val] = args[0]
//             return corpus_attrs[key]
//         })
//         pairs = _.filter(pairs, function (...args) {
//             let [key, val] = args[0]
//             return !(corpus_attrs[key].displayType === "hidden" || corpus_attrs[key].hideSidebar)
//         })

//         for (let custom of customData) {
//             pairs.push(custom)
//         }

//         pairs.sort(function (...args) {
//             let ord1, ord2
//             const [a] = args[0]
//             const [b] = args[1]
//             if (a in corpus_attrs) {
//                 ord1 = corpus_attrs[a].order
//             } else {
//                 ord1 = customAttrs[a].order
//             }

//             if (b in corpus_attrs) {
//                 ord2 = corpus_attrs[b].order
//             } else {
//                 ord2 = customAttrs[b].order
//             }

//             if (_.isUndefined(ord1)) {
//                 ord1 = 10000
//             }
//             if (_.isUndefined(ord2)) {
//                 ord2 = 10000
//             }
//             return ord1 - ord2
//         })

//         let items = []
//         for (let [key, value] of pairs) {
//             if (key in customAttrs) {
//                 items.push(value)
//             } else {
//                 items = items.concat(
//                     (
//                         this.renderItem(
//                             key,
//                             value,
//                             corpus_attrs[key],
//                             wordData,
//                             sentenceData,
//                             tokens
//                         ) || $()
//                     ).get(0) || []
//                 )
//             }
//         }

//         items = _.compact(items)
//         return $(items)
//     },

//     renderCustomContent(wordData, sentenceData, corpus_attrs, tokens) {
//         const structItems = []
//         const posItems = []
//         for (let key in corpus_attrs) {
//             const attrs = corpus_attrs[key]
//             try {
//                 const output = (
//                     this.renderItem(key, "not_used", attrs, wordData, sentenceData, tokens) || $()
//                 ).get(0)
//                 if (attrs.customType === "struct") {
//                     structItems.push([key, output])
//                 } else if (attrs.customType === "pos") {
//                     posItems.push([key, output])
//                 }
//             } catch (e) {
//                 c.log("failed to render custom attribute", e)
//             }
//         }
//         return [posItems, structItems]
//     },

//     renderItem(key, value, attrs, wordData, sentenceData, tokens) {
//         let lis, output, pattern, ul, valueArray
//         let val, inner, cqpVal, li, address
//         if (attrs.label) {
//             output = $(`<p><span rel='localize[${attrs.label}]'></span>: </p>`)
//         } else {
//             output = $("<p></p>")
//         }
//         if (attrs.renderItem) {
//             return output.append(
//                 attrs.renderItem(key, value, attrs, wordData, sentenceData, tokens)
//             )
//         }

//         output.data("attrs", attrs)
//         if (value === "|" || value === "" || value === null) {
//             output.append(
//                 `<i rel='localize[empty]' style='color : grey'>${util.getLocaleString("empty")}</i>`
//             )
//             return output
//         }

//         if (attrs.type === "set" && attrs.display && attrs.display.expandList) {
//             valueArray = _.filter((value && value.split("|")) || [], Boolean)
//             const attrSettings = attrs.display.expandList
//             if (attrs.ranked) {
//                 valueArray = _.map(valueArray, function (value) {
//                     val = value.split(":")
//                     return [val[0], val[val.length - 1]]
//                 })

//                 lis = []

//                 for (let outerIdx = 0; outerIdx < valueArray.length; outerIdx++) {
//                     var externalLink
//                     let [value, prob] = valueArray[outerIdx]
//                     li = $("<li></li>")
//                     const subValues = attrSettings.splitValue
//                         ? attrSettings.splitValue(value)
//                         : [value]
//                     for (let idx = 0; idx < subValues.length; idx++) {
//                         const subValue = subValues[idx]
//                         val = (attrs.stringify || attrSettings.stringify || _.identity)(subValue)
//                         inner = $(`<span>${val}</span>`)
//                         inner.attr("title", prob)

//                         if (
//                             attrs.internalSearch &&
//                             (attrSettings.linkAllValues || outerIdx === 0)
//                         ) {
//                             inner.data("key", subValue)
//                             inner.addClass("link").click(function () {
//                                 const searchKey = attrSettings.searchKey || key
//                                 cqpVal = $(this).data("key")
//                                 const cqpExpr = attrSettings.internalSearch
//                                     ? attrSettings.internalSearch(searchKey, cqpVal)
//                                     : `[${searchKey} contains '${regescape(cqpVal)}']`
//                                 return locationSearch({ search: "cqp", cqp: cqpExpr, page: null })
//                             })
//                         }
//                         if (attrs.externalSearch) {
//                             address = _.template(attrs.externalSearch)({ val: subValue })
//                             externalLink = $(
//                                 `<a href='${address}' class='external_link' target='_blank' style='margin-top: -6px'></a>`
//                             )
//                         }

//                         li.append(inner)
//                         if (attrSettings.joinValues && idx !== subValues.length - 1) {
//                             li.append(attrSettings.joinValues)
//                         }
//                     }
//                     if (externalLink) {
//                         li.append(externalLink)
//                     }
//                     lis.push(li)
//                 }
//             } else {
//                 lis = []
//                 for (value of valueArray) {
//                     li = $("<li></li>")
//                     li.append(value)
//                     lis.push(li)
//                 }
//             }

//             if (lis.length === 0) {
//                 ul = $('<i rel="localize[empty]" style="color : grey"></i>')
//             } else {
//                 ul = $("<ul style='list-style:initial'>")
//                 ul.append(lis)

//                 if (lis.length !== 1 && !attrSettings.showAll) {
//                     _.map(lis, function (li, idx) {
//                         if (idx !== 0) {
//                             return li.css("display", "none")
//                         }
//                     })

//                     const showAll = $(
//                         `<span class='link' rel='localize[complemgram_show_all]'></span><span> (${
//                             lis.length - 1
//                         })</span>`
//                     )
//                     ul.append(showAll)

//                     const showOne = $(
//                         "<span class='link' rel='localize[complemgram_show_one]'></span>"
//                     )
//                     showOne.css("display", "none")
//                     ul.append(showOne)

//                     showAll.click(function () {
//                         showAll.css("display", "none")
//                         showOne.css("display", "inline")
//                         return _.map(lis, (li) => li.css("display", "list-item"))
//                     })

//                     showOne.click(function () {
//                         showAll.css("display", "inline")
//                         showOne.css("display", "none")
//                         _.map(lis, function (li, i) {
//                             if (i !== 0) {
//                                 return li.css("display", "none")
//                             }
//                         })
//                     })
//                 }
//             }

//             output.append(ul)
//             return output
//         } else if (attrs.type === "set") {
//             pattern = attrs.pattern || '<span data-key="<%= key %>"><%= val %></span>'
//             ul = $("<ul>")
//             const getStringVal = (str) =>
//                 _.reduce(
//                     _.invokeMap(_.invokeMap(str, "charCodeAt", 0), "toString"),
//                     (a, b) => a + b
//                 )
//             valueArray = _.filter((value && value.split("|")) || [], Boolean)
//             if (key === "variants") {
//                 // TODO: this doesn't sort quite as expected
//                 valueArray.sort(function (a, b) {
//                     const splita = util.splitLemgram(a)
//                     const splitb = util.splitLemgram(b)
//                     const strvala =
//                         getStringVal(splita.form) + splita.index + getStringVal(splita.pos)
//                     const strvalb =
//                         getStringVal(splitb.form) + splitb.index + getStringVal(splitb.pos)

//                     return parseInt(strvala) - parseInt(strvalb)
//                 })
//             }

//             const itr = _.isArray(valueArray) ? valueArray : _.values(valueArray)
//             const lis = []
//             for (let x of itr) {
//                 if (x.length) {
//                     val = (attrs.stringify || _.identity)(x)

//                     inner = $(_.template(pattern)({ key: x, val }))
//                     if (attrs.translationKey != null) {
//                         const prefix = attrs.translationKey || ""
//                         inner.localeKey(prefix + val)
//                     }

//                     if (attrs.internalSearch) {
//                         inner.addClass("link").click(function () {
//                             cqpVal = $(this).data("key")
//                             return locationSearch({
//                                 page: null,
//                                 search: "cqp",
//                                 cqp: `[${key} contains \"${regescape(cqpVal)}\"]`,
//                             })
//                         })
//                     }

//                     li = $("<li></li>").data("key", x).append(inner)
//                     if (attrs.externalSearch) {
//                         address = _.template(attrs.externalSearch)({ val: x })
//                         li.append(
//                             $(`<a href='${address}' class='external_link' target='_blank'></a>`)
//                         )
//                     }

//                     lis.push(li)
//                 }
//             }
//             ul.append(lis)
//             output.append(ul)

//             return output
//         }

//         const str_value = (attrs.stringify || _.identity)(value)

//         if (attrs.type === "url") {
//             return output.append(
//                 `<a href='${str_value}' class='exturl sidebar_url' target='_blank'>${decodeURI(
//                     str_value
//                 )}</a>`
//             )
//         } else if (key === "msd") {
//             // msdTags = require '../markup/msdtags.html'
//             const msdTags = "markup/msdtags.html"
//             return output.append(`<span class='msd_sidebar'>${str_value}</span>
//                     <a href='${msdTags}' target='_blank'>
//                         <span class='sidebar_info ui-icon ui-icon-info'></span>
//                     </a>
//                 </span>\
//             `)
//         } else if (attrs.pattern) {
//             return output.append(
//                 _.template(attrs.pattern)({
//                     key,
//                     val: str_value,
//                     pos_attrs: wordData,
//                     struct_attrs: sentenceData,
//                 })
//             )
//         } else {
//             if (attrs.translationKey) {
//                 if (window.loc_data["en"][attrs.translationKey + value]) {
//                     return output.append(
//                         `<span rel='localize[${attrs.translationKey}${value}]'></span>`
//                     )
//                 } else {
//                     return output.append(`<span>${value}</span>`)
//                 }
//             } else {
//                 return output.append(`<span>${str_value || ""}</span>`)
//             }
//         }
//     },

//     applyEllipse() {
//         // oldDisplay = @element.css("display")
//         // @element.css "display", "block"
//         const totalWidth = this.element.width()

//         // ellipse for too long links of type=url
//         this.element
//             .find(".sidebar_url")
//             .css("white-space", "nowrap")
//             .each(function () {
//                 while ($(this).width() > totalWidth) {
//                     const oldtext = $(this).text()
//                     const a = _.trim(oldtext, "/").replace("...", "").split("/")
//                     const domain = a.slice(2, 3)
//                     let midsection = a.slice(3).join("/")
//                     midsection = `...${midsection.slice(2)}`
//                     $(this).text(["http:/"].concat(domain, midsection).join("/"))
//                     if (midsection === "...") {
//                         break
//                     }
//                 }
//             })
//     },

//     updatePlacement() {
//         const max = Math.round($("#columns").position().top)
//         if ($(window).scrollTop() < max) {
//             return this.element.removeClass("fixed")
//         } else if ($("#left-column").height() > $("#sidebar").height()) {
//             return this.element.addClass("fixed")
//         }
//     },
// }

// widget("korp.sidebar", Sidebar)

widget("korp.radioList", {
    options: {
        change: $.noop,
        separator: "|",
        selected: "default",
    },

    _create() {
        this._super()
        const self = this
        $.each(this.element, function () {
            // $.proxy(self.options.change, self.element)();
            return $(this)
                .children()
                .wrap("<li />")
                .click(function () {
                    if (!$(this).is(".radioList_selected")) {
                        self.select($(this).data("mode"))
                        return self._trigger("change", $(this).data("mode"))
                    }
                })
                .parent()
                .prepend($("<span>").text(self.options.separator))
                .wrapAll("<ul class='inline_list' />")
        })

        this.element.find(".inline_list span:first").remove()
        return this.select(this.options.selected)
    },

    select(mode) {
        this.options.selected = mode
        const target = this.element.find("a").filter(function () {
            return $(this).data("mode") === mode
        })
        this.element.find(".radioList_selected").removeClass("radioList_selected")
        this.element.find(target).addClass("radioList_selected")
        return this.element
    },

    getSelected() {
        return this.element.find(".radioList_selected")
    },
})
