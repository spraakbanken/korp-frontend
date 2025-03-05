/** @format */
import _ from "lodash"
import angular, { ITimeoutService } from "angular"
import settings from "@/settings"
import lemgramProxyFactory, { LemgramProxy } from "@/backend/lemgram-proxy"
import { isLemgram, lemgramToString, unregescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { WordPictureDefItem } from "@/settings/app-settings.types"
import { TabHashScope } from "@/directives/tab-hash"
import { ApiRelation, RelationsResponse } from "@/backend/types/relations"
import { loc } from "@/i18n"

type WordpicCtrlScope = TabHashScope & {
    $root: RootScope
    activate: () => void
    data?: TableDrawData[]
    drawTables: (tables: [string, string][], data: ApiRelation[]) => void
    error?: string
    loading: boolean
    makeRequest: () => void
    onentry: () => void
    progress: number
    proxy: LemgramProxy
    renderResult: (data: RelationsResponse, word: string) => void
    renderTables: (query: string, data: ApiRelation[]) => void
    renderWordTables: (query: string, data: ApiRelation[]) => void
    resetView: () => void
    warning?: string
    wordPic: boolean
}

/** A relation item modified for showing. */
export type ShowableApiRelation = ApiRelation & {
    /** Direction of relation */
    show_rel: "head" | "dep"
}

export type TableData = {
    table: ApiRelation[] | { word: string }
    rel?: string
    show_rel?: string
}

export type TableDrawData = {
    token: string
    wordClass: string
    wordClassShort: string
    data: TableData[][]
}

angular.module("korpApp").directive("wordpicCtrl", () => ({
    controller: [
        "$scope",
        "$rootScope",
        "$timeout",
        ($scope: WordpicCtrlScope, $rootScope: RootScope, $timeout: ITimeoutService) => {
            /** Mapping from pos tag to identifiers used in word_picture_conf */
            const tagset = _.invert(settings["word_picture_tagset"] || {})

            const s = $scope
            s.proxy = lemgramProxyFactory.create()
            s.loading = false
            s.progress = 0
            s.wordPic = false

            $rootScope.$watch("globalFilter", () => {
                if ($rootScope.globalFilter) s.warning = loc("word_pic_global_filter", $rootScope.lang)
            })

            $rootScope.$on("make_request", () => s.makeRequest())

            $rootScope.$watch("wordpicSortProp", () => s.makeRequest())

            s.$on("abort_requests", () => {
                s.proxy.abort()
                if (s.loading) {
                    s.warning = loc("search_aborted", $rootScope.lang)
                    s.loading = false
                }
            })

            s.onentry = () => {
                // Enable word picture when opening tab
                if (!s.wordPic) s.activate()
            }

            s.activate = function () {
                s.wordPic = true
                s.makeRequest()
            }

            s.resetView = () => {
                s.data = undefined
                s.error = undefined
            }

            s.makeRequest = () => {
                if (!s.wordPic) {
                    s.resetView()
                    return
                }

                const search = $rootScope.activeSearch
                if (!search || (search.type !== "lemgram" && search.val.includes(" "))) {
                    s.resetView()
                    s.warning = loc("word_pic_bad_search", $rootScope.lang)
                    return
                }
                const word = search.type === "lemgram" ? unregescape(search.val) : search.val
                const type = search.type

                if ($rootScope.globalFilter) {
                    s.resetView()
                    s.warning = loc("word_pic_global_filter", $rootScope.lang)
                    return
                }

                // Abort any running request
                if (s.loading) s.proxy.abort()

                s.progress = 0
                s.loading = true
                s.warning = undefined
                s.proxy
                    .makeRequest(word, type, $rootScope.wordpicSortProp, (progressObj) =>
                        $timeout(() => (s.progress = progressObj.percent))
                    )
                    .then((data) =>
                        $timeout(() => {
                            s.loading = false
                            s.renderResult(data, word)
                        })
                    )
                    .catch((error) => {
                        // AbortError is expected if a new search is made before the previous one is finished
                        if (error.name == "AbortError") return
                        console.error(error)
                        // TODO Show error
                        $timeout(() => {
                            s.error = error
                            s.loading = false
                        })
                    })
            }

            s.renderResult = (data, query) => {
                s.loading = false
                s.progress = 100
                if (!data.relations) {
                    s.warning = loc("no_stats_results", $rootScope.lang)
                    s.resetView()
                } else if (isLemgram(query)) {
                    s.renderTables(query, data.relations)
                } else {
                    s.renderWordTables(query, data.relations)
                }
            }

            s.renderWordTables = (word, data) => {
                const wordlist = $.map(data, function (item) {
                    const output: [string, string][] = []
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
                unique_words = _.filter(unique_words, function (...args) {
                    const [, pos] = args[0]
                    return settings["word_picture_conf"]![tagset[pos]] != null
                })
                if (!unique_words.length) {
                    s.loading = false
                    return
                }

                s.drawTables(unique_words, data)
                s.loading = false
            }

            s.renderTables = (lemgram, data) => {
                const wordClass = data[0].head === lemgram ? data[0].headpos : data[0].deppos
                s.drawTables([[lemgram, wordClass]], data)
                s.loading = false
            }

            s.drawTables = (tables, data) => {
                /** Find a given relation in the wordpic config structure. */
                const inArray = function (
                    rel: WordPictureDefItem,
                    orderList: (WordPictureDefItem | "_")[]
                ): { i: number; type: "head" | "dep" } {
                    const i = _.findIndex(
                        orderList,
                        (item) =>
                            item != "_" &&
                            (item.field_reverse || false) === (rel.field_reverse || false) &&
                            item.rel === rel.rel
                    )
                    const type = rel.field_reverse ? "head" : "dep"
                    return { i, type }
                }

                const res: TableDrawData[] = []

                for (const row of tables) {
                    const token = row[0]
                    const wordClassShort = row[1].toLowerCase()
                    const wordClass = tagset[wordClassShort]

                    if (settings["word_picture_conf"]![wordClass] == null) {
                        continue
                    }

                    // Sort the list of relations according to configuration.
                    // Up to three sections. Each section is one or a few tables, each table has a number of rows.
                    const sections: ShowableApiRelation[][][] = [[], [], []]
                    data.forEach((item) => {
                        settings["word_picture_conf"]![wordClass].forEach((rel_type_list, i) => {
                            const section = sections[i]
                            const rel = {
                                rel: tagset[item.rel.toLowerCase()],
                                field_reverse: item.dep === token,
                            }

                            const ret = inArray(rel, rel_type_list)
                            if (ret.i === -1) {
                                return
                            }
                            if (!section[ret.i]) {
                                section[ret.i] = []
                            }
                            const itemModified = {
                                ...item,
                                show_rel: ret.type,
                            }
                            section[ret.i].push(itemModified)
                        })
                    })

                    // In this iteration, one element in each section is the search word, not a table of relations.
                    const sectionsWithSearchWord: (ShowableApiRelation[] | { word: string })[][] = []
                    sections.forEach((section, i) => {
                        sectionsWithSearchWord[i] = section

                        if (settings["word_picture_conf"]![wordClass][i] && section.length) {
                            const toIndex = settings["word_picture_conf"]![wordClass][i].indexOf("_")
                            sectionsWithSearchWord[i][toIndex] = {
                                word: isLemgram(token) ? lemgramToString(token) : token,
                            }
                        }

                        sectionsWithSearchWord[i] = section.filter(Boolean)
                    })

                    // Convert each table to an object and add info about the relation type
                    const dataOut: TableData[][] = sectionsWithSearchWord.map((section) =>
                        section.map((table) => {
                            if (Array.isArray(table) && table[0]) {
                                const { rel, show_rel } = table[0]
                                return { table, rel, show_rel }
                            } else {
                                return { table }
                            }
                        })
                    )

                    res.push({
                        token,
                        wordClass,
                        wordClassShort,
                        data: dataOut,
                    })
                }

                s.data = res
            }
        },
    ],
}))
