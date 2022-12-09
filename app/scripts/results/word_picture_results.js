/** @format */
import { BaseResults } from "./base_results.js"

export class WordPictureResults extends BaseResults {
    constructor(tabSelector, resultSelector, scope) {
        super(tabSelector, resultSelector, scope)
        this.s = scope
        this.tabindex = 3
        this.proxy = new model.LemgramProxy()
    }

    resetView() {
        super.resetView()
        safeApply(this.s, () => {
            this.s.$parent.aborted = false
            this.s.$parent.no_hits = false
        })
    }

    makeRequest(word, type) {
        // if a global filter is set, do not generate a word picture
        if (this.s.$root.globalFilter) {
            this.hasData = false
            return
        }

        if (this.proxy.hasPending()) {
            this.ignoreAbort = true
        } else {
            this.ignoreAbort = false
            this.resetView()
        }

        this.showPreloader()
        const def = this.proxy.makeRequest(word, type, (...args) => {
            this.onProgress(...(args || []))
        })

        def.done((data) => {
            safeApply(this.s, () => {
                return this.renderResult(data, word)
            })
        })
        def.fail((jqXHR, status, errorThrown) => {
            c.log("def fail", status)
            if (this.ignoreAbort) {
                return
            }
            if (status === "abort") {
                return safeApply(this.s, () => {
                    this.hidePreloader()
                    this.s.$parent.aborted = true
                })
            }
        })
    }

    renderResult(data, query) {
        const resultError = super.renderResult(data)
        this.hidePreloader()
        this.s.$parent.progress = 100
        if (resultError === false) {
            return
        }
        if (!data.relations) {
            this.s.$parent.no_hits = true
        } else if (util.isLemgramId(query)) {
            this.renderTables(query, data.relations)
        } else {
            this.renderWordTables(query, data.relations)
        }
    }

    renderWordTables(word, data) {
        const wordlist = $.map(data, function (item) {
            const output = []
            if (item.head.split("_")[0] === word) {
                output.push([item.head, item.headpos.toLowerCase()])
            }
            if (item.dep.split("_")[0] === word) {
                output.push([item.dep, item.deppos.toLowerCase()])
            }
            return output
        })
        let unique_words = _.uniqBy(wordlist, function (...args) {
            let [word, pos] = args[0]
            return word + pos
        })
        const tagsetTrans = _.invert(settings["word_picture_tagset"])
        unique_words = _.filter(unique_words, function (...args) {
            const [currentWd, pos] = args[0]
            return settings["word_picture_conf"][tagsetTrans[pos]] != null
        })
        if (!unique_words.length) {
            this.showNoResults()
            return
        }

        this.drawTables(unique_words, data)
        return this.hidePreloader()
    }

    renderTables(lemgram, data) {
        let wordClass
        if (data[0].head === lemgram) {
            wordClass = data[0].headpos
        } else {
            wordClass = data[0].deppos
        }
        this.drawTables([[lemgram, wordClass]], data)
        return this.hidePreloader()
    }

    drawTables(tables, data) {
        const inArray = function (rel, orderList) {
            const i = _.findIndex(
                orderList,
                (item) => (item.field_reverse || false) === (rel.field_reverse || false) && item.rel === rel.rel
            )
            const type = rel.field_reverse ? "head" : "dep"
            return {
                i,
                type,
            }
        }

        const tagsetTrans = _.invert(settings["word_picture_tagset"])

        const res = _.map(tables, function ([token, wordClass]) {
            const getRelType = (item) => ({
                rel: tagsetTrans[item.rel.toLowerCase()],
                field_reverse: item.dep === token,
            })

            const wordClassShort = wordClass.toLowerCase()
            wordClass = _.invert(settings["word_picture_tagset"])[wordClassShort]

            if (settings["word_picture_conf"][wordClass] == null) {
                return
            }
            let orderArrays = [[], [], []]
            $.each(data, (index, item) => {
                $.each(settings["word_picture_conf"][wordClass] || [], (i, rel_type_list) => {
                    const list = orderArrays[i]
                    const rel = getRelType(item)

                    if (!rel) {
                        return
                    }
                    const ret = inArray(rel, rel_type_list)
                    if (ret.i === -1) {
                        return
                    }
                    if (!list[ret.i]) {
                        list[ret.i] = []
                    }
                    item.show_rel = ret.type
                    list[ret.i].push(item)
                })
            })

            $.each(orderArrays, function (i, unsortedList) {
                $.each(unsortedList, function (_, list) {
                    if (list) {
                        list.sort((first, second) => second.mi - first.mi)
                    }
                })

                if (settings["word_picture_conf"][wordClass][i] && unsortedList.length) {
                    const toIndex = $.inArray("_", settings["word_picture_conf"][wordClass][i])
                    if (util.isLemgramId(token)) {
                        unsortedList[toIndex] = { word: token.split("..")[0].replace(/_/g, " ") }
                    } else {
                        unsortedList[toIndex] = { word: util.lemgramToString(token) }
                    }
                }

                unsortedList = _.filter(unsortedList, (item, index) => Boolean(item))
            })

            orderArrays = _.map(orderArrays, (section, i) =>
                _.map(section, function (table, j) {
                    if (table && table[0]) {
                        const { rel } = table[0]
                        const { show_rel } = table[0]
                        const all_lemgrams = _.uniq(
                            _.map(_.map(table, show_rel), function (item) {
                                if (util.isLemgramId(item)) {
                                    return item.slice(0, -1)
                                } else {
                                    return item
                                }
                            })
                        )
                        return { table, rel, show_rel, all_lemgrams }
                    } else {
                        return { table }
                    }
                })
            )

            return {
                token: token,
                wordClass: wordClass,
                wordClassShort: wordClassShort,
                data: orderArrays,
            }
        })

        return this.s.$root.$broadcast("word_picture_data_available", res)
    }

    onentry() {
        super.onentry()
    }

    onexit() {
        super.onexit()
        clearTimeout(self.timeout)
    }

    showNoResults() {
        this.hidePreloader()
    }
}