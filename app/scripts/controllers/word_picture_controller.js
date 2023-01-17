/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("wordpicCtrl", () => ({
    controller($scope, $rootScope, $location, $timeout, searches) {
        const s = $scope
        s.tabindex = 3
        s.proxy = new model.LemgramProxy()

        s.error = false
        s.loading = false
        s.progress = 0
        s.word_pic = $location.search().word_pic != null
        s.$watch(
            () => $location.search().word_pic,
            (val) => (s.word_pic = Boolean(val))
        )

        $rootScope.$on("word_picture_make_request", (msg, word, type) => {
            s.makeRequest(word, type)
        })

        s.$on("abort_requests", () => {
            s.proxy.abort()
        })

        s.activate = function () {
            $location.search("word_pic", true)
            const search = searches.activeSearch
            const searchVal = search.type === "lemgram" ? unregescape(search.val) : search.val
            s.makeRequest(searchVal, search.type)
        }

        s.resetView = () => {
            s.hasData = false
            s.aborted = false
            s.no_hits = false
            s.error = false
        }

        s.onProgress = (progressObj) => (s.progress = Math.round(progressObj["stats"]))

        s.makeRequest = (word, type) => {
            // if a global filter is set, do not generate a word picture
            if ($rootScope.globalFilter) {
                s.hasData = false
                return
            }

            if (s.proxy.hasPending()) {
                s.ignoreAbort = true
            } else {
                s.ignoreAbort = false
                s.resetView()
            }

            s.loading = true
            const def = s.proxy.makeRequest(word, type, (progressObj) => $timeout(() => s.onProgress(progressObj)))

            def.done((data) => {
                $timeout(() => s.renderResult(data, word))
            })
            def.fail((jqXHR, status, errorThrown) => {
                $timeout(() => {
                    c.log("def fail", status)
                    if (s.ignoreAbort) {
                        return
                    }
                    s.loading = false
                    if (status === "abort") {
                        s.aborted = true
                    } else {
                        s.error = true
                    }
                })
            })
        }

        s.onentry = () => {
            if (s.hasData) {
                s.$root.jsonUrl = s.proxy.prevUrl
            }
        }

        s.onexit = () => {
            s.$root.jsonUrl = null
        }

        s.isActive = () => {
            return s.tabindex == s.$parent.$parent.tabset.active
        }

        s.renderResult = (data, query) => {
            s.loading = false
            s.progress = 100
            if (data.ERROR != undefined) {
                s.hasData = false
                s.error = true
                return
            }

            if (s.isActive()) {
                s.$root.jsonUrl = s.proxy.prevUrl
            }

            s.hasData = true
            if (!data.relations) {
                s.no_hits = true
            } else if (util.isLemgramId(query)) {
                s.renderTables(query, data.relations)
            } else {
                s.renderWordTables(query, data.relations)
            }
        }

        s.renderWordTables = (word, data) => {
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
                s.loading = false
                return
            }

            s.drawTables(unique_words, data)
            s.loading = false
        }

        s.renderTables = (lemgram, data) => {
            let wordClass
            if (data[0].head === lemgram) {
                wordClass = data[0].headpos
            } else {
                wordClass = data[0].deppos
            }
            s.drawTables([[lemgram, wordClass]], data)
            s.loading = false
        }

        s.drawTables = (tables, data) => {
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

            $rootScope.$broadcast("word_picture_data_available", res)
        }

        s.countCorpora = () => {
            return s.proxy.prevParams && s.proxy.prevParams.corpus.split(",").length
        }

        s.settings = { showNumberOfHits: "15" }

        s.hitSettings = ["15"]

        s.minimize = (table) => table.slice(0, s.settings.showNumberOfHits)

        s.onClickExample = function (event, row) {
            const data = row

            const opts = {}
            opts.ajaxParams = {
                start: 0,
                end: 24,
                command: "relations_sentences",
                source: data.source.join(","),
                corpus: data.corpus,
            }

            return $rootScope.kwicTabs.push({ queryParams: opts })
        }

        s.showWordClass = false

        $rootScope.$on("word_picture_data_available", function (event, data) {
            s.data = data

            let max = 0
            _.map(data, (form) =>
                _.map(form, function (categories) {
                    if (categories instanceof Array) {
                        return _.map(categories, (cols) =>
                            _.map(cols, function (col) {
                                if (col.table && col.table.length > max) {
                                    max = col.table.length
                                }
                            })
                        )
                    }
                })
            )

            s.hitSettings = []
            if (max < 15) {
                s.settings = { showNumberOfHits: "1000" }
            } else {
                s.hitSettings.push("15")
                s.settings = { showNumberOfHits: "15" }
            }

            if (max > 50) {
                s.hitSettings.push("50")
            }
            if (max > 100) {
                s.hitSettings.push("100")
            }
            if (max > 500) {
                s.hitSettings.push("500")
            }

            return s.hitSettings.push("1000")
        })

        s.localeString = function (lang, hitSetting) {
            if (hitSetting === "1000") {
                return util.getLocaleString("word_pic_show_all", lang)
            } else {
                return (
                    util.getLocaleString("word_pic_show_some", lang) +
                    " " +
                    hitSetting +
                    " " +
                    util.getLocaleString("word_pic_hits", lang)
                )
            }
        }

        s.isLemgram = (word) => {
            util.isLemgramId(word)
        }

        s.renderTable = (obj) => obj instanceof Array

        s.parseLemgram = function (row) {
            const set = row[row.show_rel].split("|")
            const lemgram = set[0]

            let infixIndex = ""
            let concept = lemgram
            infixIndex = ""
            let type = "-"

            const prefix = row.depextra

            if (util.isLemgramId(lemgram)) {
                const match = util.splitLemgram(lemgram)
                infixIndex = match.index
                if (row.dep) {
                    concept = match.form.replace(/_/g, " ")
                } else {
                    concept = "-"
                }
                type = match.pos.slice(0, 2)
            }
            return {
                label: prefix + " " + concept,
                pos: type,
                idx: infixIndex,
                showIdx: !(infixIndex === "" || infixIndex === "1"),
            }
        }

        s.getTableClass = (wordClass, parentIdx, idx) =>
            settings["word_picture_conf"][wordClass][parentIdx][idx].css_class

        s.getHeaderLabel = function (header, section, idx) {
            if (header.alt_label) {
                return header.alt_label
            } else {
                return `rel_${section[idx].rel}`
            }
        }

        s.getHeaderClasses = function (header, token) {
            if (header !== "_") {
                return `lemgram_header_item ${header.css_class}`
            } else {
                let classes = "hit"
                if (s.isLemgram(token)) {
                    classes += " lemgram"
                }
                return classes
            }
        }

        s.renderResultHeader = function (parentIndex, section, wordClass, index) {
            return section[index] && section[index].table
        }

        s.getResultHeader = (index, wordClass) => settings["word_picture_conf"][wordClass][index]

        s.fromLemgram = function (maybeLemgram) {
            if (util.isLemgramId(maybeLemgram)) {
                return util.splitLemgram(maybeLemgram).form
            } else {
                return maybeLemgram
            }
        }
    },
}))
