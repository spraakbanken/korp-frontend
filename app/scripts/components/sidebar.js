/** @format */
import "../../styles/sidebar.scss"
export const sidebarName = "sidebar"
import statemachine from "../statemachine"
import { stringify } from "@/stringify.js"

let sidebarComponents = {}

try {
    sidebarComponents = require("custom/sidebar.js").default
} catch (error) {
    console.log("No module for sidebar components available")
}

let html = String.raw
export const sidebarComponent = {
    template: html`
        <div class="sticky top-10 border border-gray-300 p-2 rounded-sm" ng-show="$ctrl.corpusObj">
            <div>
                <h4 class="font-normal uppercase text-gray-800 mt-4 mb-1 text-sm tracking-tight">
                    {{'corpus' | loc:$root.lang}}
                </h4>
                <div class="text-lg">{{$ctrl.corpusObj.title| locObj:$root.lang}}</div>
            </div>
            <div class="openReadingMode" ng-show="!$ctrl.inReadingMode && $ctrl.corpusObj['reading_mode']">
                <span ng-click="$ctrl.openReadingMode()" class="link"> {{'read_in_korp' | loc:$root.lang}} </span>
            </div>
            <div id="selected_sentence"></div>
            <div id="selected_word"></div>

            <div ng-show="$ctrl.corpusObj.attributes.deprel" ng-click="$ctrl.openDepTree()" class="link show_deptree">
                {{'show_deptree' | loc:$root.lang}}
            </div>
            <dep-tree
                ng-if="$ctrl.showDepTree"
                tokens="$ctrl.tokens"
                corpus="$ctrl.corpusObj"
                on-close="$ctrl.closeDepTree()"
            ></dep-tree>
        </div>
    `,
    bindings: {
        onShow: "&",
        onHide: "&",
        lang: "<",
    },
    controller: [
        "$element",
        "utils",
        "$rootScope",
        "$compile",
        "$controller",
        "$filter",
        function ($element, utils, $rootScope, $compile, $controller, $filter) {
            let $ctrl = this

            const locObj = $filter("locObj")

            statemachine.listen("select_word", function (data) {
                safeApply($rootScope, () => {
                    $ctrl.data = data
                    if (data == null) {
                        $ctrl.onHide()
                    } else {
                        $ctrl.onShow()
                        $ctrl.updateContent(data)
                    }
                })
            })

            $ctrl.$onChanges = (changesObj) => {
                if (changesObj["lang"]) {
                    if ($ctrl.data) {
                        $ctrl.updateContent($ctrl.data)
                    }
                }
            }

            $ctrl.openDepTree = () => {
                $ctrl.showDepTree = true
            }

            $ctrl.closeDepTree = () => {
                $ctrl.showDepTree = false
            }

            Object.assign($ctrl, {
                openReadingMode() {
                    $rootScope.textTabs.push({
                        corpus: $ctrl.corpusObj.id,
                        sentenceData: $ctrl.sentenceData,
                    })
                },
                updateContent({ sentenceData, wordData, corpus, tokens, inReadingMode }) {
                    $("#selected_sentence").add("#selected_word").empty()
                    // TODO: this is pretty broken
                    const corpusObj = settings.corpora[corpus] || settings.corpusListing.get(corpus)
                    $ctrl.corpusObj = corpusObj
                    $ctrl.sentenceData = sentenceData
                    $ctrl.inReadingMode = inReadingMode
                    $ctrl.tokens = tokens
                    const customData = { pos: [], struct: [] }
                    if (!$.isEmptyObject(corpusObj["custom_attributes"])) {
                        const [word, sentence] = this.renderCustomContent(
                            wordData,
                            sentenceData,
                            corpusObj["custom_attributes"],
                            tokens
                        )
                        customData.pos = word
                        customData.struct = sentence
                    }

                    let posData = []
                    if (!$.isEmptyObject(corpusObj.attributes)) {
                        posData = this.renderCorpusContent(
                            "pos",
                            wordData,
                            sentenceData,
                            corpusObj.attributes,
                            tokens,
                            corpusObj["custom_attributes"] || {},
                            customData.pos
                        )
                    }
                    let structData = []
                    if (!$.isEmptyObject(corpusObj["struct_attributes"])) {
                        structData = this.renderCorpusContent(
                            "struct",
                            wordData,
                            sentenceData,
                            corpusObj["struct_attributes"],
                            tokens,
                            corpusObj["custom_attributes"] || {},
                            customData.struct
                        )
                    }

                    $("#selected_word").append(
                        $(
                            '<h4 class="font-normal uppercase text-gray-800 mt-8 mb-1 text-sm" tracking-tight>'
                        ).localeKey("word_attr")
                    )
                    $("#selected_sentence").append(
                        $(
                            '<h4 class="font-normal uppercase text-gray-800 mt-8 mb-1 text-sm" tracking-tight>'
                        ).localeKey("sentence_attr")
                    )
                    $("#selected_word").append(posData)
                    $("#selected_sentence").append(structData)

                    $element.localize()
                    this.applyEllipse()
                },

                renderCorpusContent(type, wordData, sentenceData, corpus_attrs, tokens, customAttrs, customData) {
                    let pairs
                    let sortingArr
                    if (type === "struct") {
                        pairs = _.toPairs(sentenceData)
                        sortingArr = $ctrl.corpusObj["_struct_attributes_order"]
                    } else if (type === "pos") {
                        pairs = _.toPairs(wordData)
                        sortingArr = $ctrl.corpusObj["_attributes_order"]
                    }

                    pairs = _.filter(pairs, function (...args) {
                        let [key, val] = args[0]
                        return corpus_attrs[key]
                    })
                    pairs = _.filter(pairs, function (...args) {
                        let [key, val] = args[0]
                        return !(corpus_attrs[key]["display_type"] === "hidden" || corpus_attrs[key]["hide_sidebar"])
                    })
                    pairs.sort((a, b) => sortingArr.indexOf(a[0]) - sortingArr.indexOf(b[0]))

                    for (let custom of customData) {
                        pairs.push(custom)
                    }

                    let items = []
                    for (let [key, value] of pairs) {
                        if (key in customAttrs) {
                            items.push(value)
                        } else {
                            items = items.concat(
                                (
                                    this.renderItem(
                                        type,
                                        key,
                                        value,
                                        corpus_attrs[key],
                                        wordData,
                                        sentenceData,
                                        tokens
                                    ) || $()
                                ).get(0) || []
                            )
                        }
                    }

                    items = _.compact(items)
                    return $(items)
                },

                renderCustomContent(wordData, sentenceData, corpus_attrs, tokens) {
                    const structItems = []
                    const posItems = []
                    for (let key in corpus_attrs) {
                        const attrs = corpus_attrs[key]
                        try {
                            const output = (
                                this.renderItem(null, key, "not_used", attrs, wordData, sentenceData, tokens) || $()
                            ).get(0)
                            if (attrs["custom_type"] === "struct") {
                                structItems.push([key, output])
                            } else if (attrs["custom_type"] === "pos") {
                                posItems.push([key, output])
                            }
                        } catch (e) {
                            c.log("failed to render custom attribute", e)
                        }
                    }
                    return [posItems, structItems]
                },

                renderItem(type, key, value, attrs, wordData, sentenceData, tokens) {
                    let output, pattern, ul
                    let val, inner, li, address
                    if (attrs.label) {
                        output = $(`<p><span>${locObj(attrs.label, $ctrl.lang)}</span>: </p>`)
                    } else {
                        output = $("<p></p>")
                    }
                    if (attrs["sidebar_component"]) {
                        const def = sidebarComponents[attrs["sidebar_component"].name || attrs["sidebar_component"]]
                        let { template, controller } = _.isFunction(def) ? def(attrs["sidebar_component"].options) : def
                        let scope = $rootScope.$new()
                        let locals = { $scope: scope }
                        Object.assign(scope, {
                            type,
                            key,
                            value,
                            attrs,
                            wordData,
                            sentenceData,
                            tokens,
                        })
                        $controller(controller, locals)
                        return output.append($compile(template)(scope))
                    }

                    // If attrs["sidebar_info_url"], add an info symbol
                    // linking to the value of the property (URL)
                    let info_link = ""
                    if (attrs["sidebar_info_url"]) {
                        info_link = `<a href='${attrs["sidebar_info_url"]}' target='_blank'>
                                 <span class='sidebar_info ui-icon ui-icon-info'></span>
                             </a>`
                    }

                    output.data("attrs", attrs)
                    if (value === "|" || value === "" || value === null) {
                        output.append(
                            `<i rel='localize[empty]' style='color : grey'>${util.getLocaleString("empty")}</i>`
                        )
                        return output
                    }

                    if (attrs.type === "set") {
                        // For sets, info link after attribute label
                        output.append(info_link)
                        pattern = attrs.pattern || '<span data-key="<%= key %>"><%= val %></span>'
                        ul = $("<ul>")
                        const getStringVal = (str) =>
                            _.reduce(_.invokeMap(_.invokeMap(str, "charCodeAt", 0), "toString"), (a, b) => a + b)
                        let valueArray = _.filter((value && value.split("|")) || [], Boolean)
                        if (key === "variants") {
                            // TODO: this doesn't sort quite as expected
                            valueArray.sort(function (a, b) {
                                const splita = util.splitLemgram(a)
                                const splitb = util.splitLemgram(b)
                                const strvala = getStringVal(splita.form) + splita.index + getStringVal(splita.pos)
                                const strvalb = getStringVal(splitb.form) + splitb.index + getStringVal(splitb.pos)

                                return parseInt(strvala) - parseInt(strvalb)
                            })
                        }

                        const itr = _.isArray(valueArray) ? valueArray : _.values(valueArray)
                        const lis = []
                        for (let x of itr) {
                            if (x.length) {
                                const stringifyKey = attrs.stringify
                                val = stringify(stringifyKey, x)

                                if (attrs.translation != null) {
                                    val = util.translateAttribute($ctrl.lang, attrs.translation, val)
                                }

                                inner = $(_.template(pattern)({ key: x, val }))

                                if (attrs["internal_search"]) {
                                    inner.addClass("link").click(function () {
                                        const cqpVal = $(this).data("key")
                                        const cqp = `[${key} contains "${regescape(cqpVal)}"]`
                                        statemachine.send("SEARCH_CQP", { cqp })
                                    })
                                }

                                li = $("<li></li>").data("key", x).append(inner)
                                if (attrs["external_search"]) {
                                    address = _.template(attrs["external_search"])({ val: x })
                                    li.append($(`<a href='${address}' class='external_link' target='_blank'></a>`))
                                }

                                lis.push(li)
                            }
                        }
                        ul.append(lis)
                        output.append(ul)

                        return output
                    }

                    let str_value = value
                    if (attrs.stringify) {
                        str_value = stringify(attrs.stringify, value)
                    } else if (attrs.translation) {
                        str_value = util.translateAttribute($ctrl.lang, attrs.translation, value)
                    }

                    if (attrs.type === "url") {
                        output.append(
                            `<a href='${str_value}' class='exturl sidebar_url' target='_blank'>${decodeURI(
                                str_value
                            )}</a>`
                        )
                    } else if (attrs.pattern) {
                        output.append(
                            _.template(attrs.pattern)({
                                key,
                                val: str_value,
                                pos_attrs: wordData,
                                struct_attrs: sentenceData,
                            })
                        )
                    } else {
                        output.append(`<span>${str_value || ""}</span>`)
                    }

                    // For non-sets, info link after the value
                    return output.append(info_link)
                },

                applyEllipse() {
                    const totalWidth = $element.width()

                    // ellipse for too long links of type=url
                    $element
                        .find(".sidebar_url")
                        .css("white-space", "nowrap")
                        .each(function () {
                            while ($(this).width() > totalWidth) {
                                const oldtext = $(this).text()
                                const a = _.trim(oldtext, "/").replace("...", "").split("/")
                                const domain = a.slice(2, 3)
                                let midsection = a.slice(3).join("/")
                                midsection = `...${midsection.slice(2)}`
                                $(this).text(["http:/"].concat(domain, midsection).join("/"))
                                if (midsection === "...") {
                                    break
                                }
                            }
                        })
                },
            })
        },
    ],
}
