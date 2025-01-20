/** @format */
import _ from "lodash"
import angular, { ITimeoutService } from "angular"
import settings from "@/settings"
import lemgramProxyFactory, { LemgramProxy } from "@/backend/lemgram-proxy"
import { isLemgram, lemgramToString, unregescape } from "@/util"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { ProgressReport } from "@/backend/types"
import { WordPictureDefItem } from "@/settings/app-settings.types"
import { TabHashScope } from "@/directives/tab-hash"
import { ApiRelation, RelationsResponse } from "@/backend/types/relations"

type WordpicCtrlScope = TabHashScope & {
    $root: RootScope
    aborted: boolean
    activate: () => void
    countCorpora: () => number | null
    data?: TableDrawData[]
    drawTables: (tables: [string, string][], data: ApiRelation[]) => void
    error?: string
    hasData: boolean
    hitSettings: `${number}`[]
    loading: boolean
    makeRequest: () => void
    noHits: boolean
    onProgress: (progressObj: ProgressReport<"relations">) => void
    progress: number
    proxy: LemgramProxy
    renderResult: (data: RelationsResponse, word: string) => void
    renderTables: (query: string, data: ApiRelation[]) => void
    renderWordTables: (query: string, data: ApiRelation[]) => void
    resetView: () => void
    settings: {
        showNumberOfHits: `${number}`
    }
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
    all_lemgrams?: string[]
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
        "$location",
        "$timeout",
        ($scope: WordpicCtrlScope, $rootScope: RootScope, $location: LocationService, $timeout: ITimeoutService) => {
            const s = $scope
            s.proxy = lemgramProxyFactory.create()

            s.loading = false
            s.progress = 0
            s.wordPic = $location.search().word_pic != null
            s.$watch(
                () => $location.search().word_pic,
                (val) => (s.wordPic = Boolean(val))
            )

            $rootScope.$on("make_request", () => {
                s.makeRequest()
            })

            s.$on("abort_requests", () => {
                s.proxy.abort()
                if (s.loading) {
                    s.aborted = true
                    s.loading = false
                }
            })

            s.activate = function () {
                $location.search("word_pic", true)
                s.wordPic = true
                s.makeRequest()
            }

            s.resetView = () => {
                s.hasData = false
                s.data = undefined
                s.aborted = false
                s.noHits = false
                s.error = undefined
            }

            s.onProgress = (progressObj) => (s.progress = Math.round(progressObj["percent"]))

            s.makeRequest = () => {
                const search = $rootScope.activeSearch
                if (!s.wordPic || !search || (search.type !== "lemgram" && search.val.includes(" "))) {
                    s.resetView()
                    return
                }
                const word = search.type === "lemgram" ? unregescape(search.val) : search.val
                const type = search.type

                // if a global filter is set, do not generate a word picture
                if ($rootScope.globalFilter) {
                    s.hasData = false
                    return
                }

                // Abort any running request
                if (s.loading) s.proxy.abort()

                s.progress = 0
                s.loading = true
                s.proxy
                    .makeRequest(word, type, (progressObj) => $timeout(() => s.onProgress(progressObj)))
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
                s.hasData = true
                if (!data.relations) {
                    s.noHits = true
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
                const tagsetTrans = _.invert(settings["word_picture_tagset"]!)
                unique_words = _.filter(unique_words, function (...args) {
                    const [currentWd, pos] = args[0]
                    return settings["word_picture_conf"]![tagsetTrans[pos]] != null
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

                const tagsetTrans = _.invert(settings["word_picture_tagset"]!)

                const res: TableDrawData[] = []

                for (const row of tables) {
                    const token = row[0]
                    const wordClassShort = row[1].toLowerCase()
                    const wordClass = _.invert(settings["word_picture_tagset"]!)[wordClassShort]

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
                                rel: tagsetTrans[item.rel.toLowerCase()],
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
                        // Sort each table by MI
                        section.forEach((table) => {
                            if (table) table.sort((first, second) => second.mi - first.mi)
                        })
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
                                const all_lemgrams = _.uniq(
                                    _.map(table, show_rel).map((item: string) =>
                                        isLemgram(item) ? item.slice(0, -1) : item
                                    )
                                )
                                return { table, rel, show_rel, all_lemgrams }
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

                prepareScope(res)
            }

            s.countCorpora = () => {
                return s.proxy.prevParams ? s.proxy.prevParams.corpus.split(",").length : null
            }

            s.hitSettings = ["15"]
            s.settings = { showNumberOfHits: "15" }

            const prepareScope = (data: TableDrawData[]) => {
                s.data = data

                // Find length of longest table.
                const lengths = data.map((section) =>
                    section.data.map((col) => col.map((table) => (Array.isArray(table.table) ? table.table.length : 0)))
                )
                const max = Math.max(...lengths.flat(2))

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

                s.hitSettings.push("1000")
            }
        },
    ],
}))
