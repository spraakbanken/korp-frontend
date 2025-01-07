/** @format */
import angular, { IController } from "angular"
import settings from "@/settings"
import { html, isLemgram, lemgramToHtml, splitLemgram } from "@/util"
import { loc } from "@/i18n"
import { RootScope } from "@/root-scope.types"
import { WordPictureDef, WordPictureDefItem } from "@/settings/app-settings.types"
import { ShowableApiRelation, TableData, TableDrawData } from "@/controllers/word_picture_controller"
import { ApiRelation } from "@/backend/types/relations"

type WordPictureController = IController & {
    // Bindings
    wordPic: boolean
    activate: () => void
    loading: boolean
    hasData: boolean
    aborted: boolean
    hitSettings: string[]
    settings: {
        showNumberOfHits: `${number}`
    }
    data: TableDrawData[]
    noHits: boolean

    // Locals
    showWordClass: boolean
    localeString: (lang: string, hitSetting: string) => string
    renderResultHeader: (section: TableData[], index: number) => ApiRelation[] | { word: string }
    getHeaderLabel: (header: WordPictureDefItem, section: TableData[], idx: number) => string
    getHeaderClasses: (header: WordPictureDefItem | "_", token: string) => string
    isLemgram: (word: string) => boolean
    lemgramToHtml: (word: string) => string
    fromLemgram: (word: string) => string
    getResultHeader: (index: number, wordClass: string) => WordPictureDef
    renderTable: (obj: ApiRelation[] | { word: string }) => boolean
    getTableClass: (wordClass: string, parentIdx: number, idx: number) => string | undefined
    minimize: (table: ShowableApiRelation[]) => ShowableApiRelation[]
    parseLemgram: (row: ShowableApiRelation) => ParsedLemgram
    onClickExample: (row: ShowableApiRelation) => void
}

type ParsedLemgram = {
    label: string
    pos: string
    idx: string
    showIdx: boolean
}

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div class="wordpic_disabled" ng-if="!$ctrl.wordPic">
            {{'word_pic_warn' | loc:$root.lang}}
            <div>
                <button class="btn btn-sm btn-default activate_word_pic" ng-click="$ctrl.activate()">
                    {{'word_pic_warn_btn' | loc:$root.lang}}
                </button>
            </div>
        </div>

        <div ng-if="$ctrl.wordPic && !$ctrl.hasData && !$ctrl.loading && !$ctrl.aborted" class="korp-warning">
            {{'word_pic_bad_search' | loc:$root.lang}}
        </div>

        <div ng-if="$ctrl.wordPic && $ctrl.aborted && !$ctrl.loading" class="korp-warning">
            {{'search_aborted' | loc:$root.lang}}
        </div>

        <div ng-if="$ctrl.wordPic && $ctrl.noHits" class="korp-warning">{{"no_stats_results" | loc:$root.lang}}</div>

        <div ng-if="$ctrl.wordPic && $ctrl.hasData && !$ctrl.noHits">
            <div id="wordPicSettings">
                <div>
                    <input id="wordclassChk" ng-model="$ctrl.showWordClass" type="checkbox" /><label for="wordclassChk"
                        >{{'show_wordclass' | loc:$root.lang}}</label
                    >
                </div>
                <div>
                    <select id="numberHitsSelect" ng-model="$ctrl.settings.showNumberOfHits">
                        <option ng-repeat="hitSetting in $ctrl.hitSettings" value="{{hitSetting}}">
                            {{ $ctrl.localeString($root.lang, hitSetting) }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="content_target">
                <div class="tableContainer radialBkg" ng-repeat="word in $ctrl.data">
                    <div
                        class="header"
                        ng-if="$ctrl.isLemgram(word.token)"
                        ng-bind-html="$ctrl.lemgramToHtml(word.token) | trust"
                    ></div>
                    <div class="header" ng-if="!$ctrl.isLemgram(word.token)">
                        {{word.token}} ({{word.wordClassShort | loc:$root.lang}})
                    </div>

                    <div class="lemgram_section" ng-repeat="section in word.data" ng-init="parentIndex = $index">
                        <div class="lemgram_help">
                            <span
                                ng-repeat="header in $ctrl.getResultHeader(parentIndex, word.wordClass)"
                                ng-class="$ctrl.getHeaderClasses(header, word.token)"
                                ng-if="$ctrl.renderResultHeader(section, $index)"
                                ><span ng-if="header != '_'"
                                    >{{$ctrl.getHeaderLabel(header, section, $index) | loc:$root.lang}}</span
                                ><span ng-if="header == '_'"><b>{{$ctrl.fromLemgram(word.token)}}</b></span></span
                            >
                        </div>
                        <div
                            class="lemgram_result float-left py-1 px-2"
                            ng-repeat="table in section"
                            ng-if="$ctrl.renderTable(table.table)"
                            ng-class="$ctrl.getTableClass(word.wordClass, parentIndex, $index)"
                        >
                            <table class="m-0 p-0">
                                <tbody>
                                    <tr
                                        ng-repeat="row in $ctrl.minimize(table.table)"
                                        ng-init="data = $ctrl.parseLemgram(row, table.all_lemgrams)"
                                    >
                                        <td class="text-right"><span class="enumerate"></span></td>
                                        <td>
                                            {{ data.label }}<sup ng-if="data.showIdx">{{data.idx}}</sup>
                                            <span ng-if="$ctrl.showWordClass">({{data.pos | loc:$root.lang}})</span>
                                        </td>
                                        <td title="mi: {{row.mi | number:2}}" class="text-right">{{row.freq}}</td>
                                        <td ng-click="$ctrl.onClickExample(row)" class="cursor">
                                            <i class="fa-solid fa-magnifying-glass fa-xs ml-2"></i>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    bindings: {
        wordPic: "<",
        activate: "<",
        loading: "<",
        hasData: "<",
        aborted: "<",
        hitSettings: "<",
        settings: "<",
        data: "<",
        noHits: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureController

            $ctrl.showWordClass = false

            $ctrl.localeString = function (lang, hitSetting) {
                if (hitSetting === "1000") {
                    return loc("word_pic_show_all", lang)
                } else {
                    return loc("word_pic_show_some", lang) + " " + hitSetting + " " + loc("word_pic_hits", lang)
                }
            }

            $ctrl.renderResultHeader = function (section, index) {
                return section[index]?.table
            }

            $ctrl.getHeaderLabel = function (header, section, idx) {
                if (header.alt_label) {
                    return header.alt_label
                } else {
                    return `rel_${section[idx].rel}`
                }
            }

            $ctrl.getHeaderClasses = function (header, token) {
                if (header !== "_") {
                    return `lemgram_header_item ${header.css_class}`
                } else {
                    let classes = "hit"
                    if (isLemgram(token)) {
                        classes += " lemgram"
                    }
                    return classes
                }
            }

            $ctrl.isLemgram = isLemgram
            $ctrl.lemgramToHtml = lemgramToHtml

            $ctrl.fromLemgram = (word) => (isLemgram(word) ? splitLemgram(word).form : word)

            $ctrl.getResultHeader = (index, wordClass) => settings.word_picture_conf![wordClass][index]

            $ctrl.renderTable = (obj) => obj instanceof Array

            $ctrl.getTableClass = (wordClass, parentIdx, idx) => {
                const def = $ctrl.getResultHeader(parentIdx, wordClass)[idx]
                return def != "_" ? def.css_class : undefined
            }

            $ctrl.minimize = (table) => table.slice(0, Number($ctrl.settings.showNumberOfHits))

            $ctrl.parseLemgram = function (row) {
                const set = row[row.show_rel].split("|")
                const lemgram = set[0]

                let infixIndex = ""
                let concept = lemgram
                infixIndex = ""
                let type = "-"

                const prefix = row.depextra

                if (isLemgram(lemgram)) {
                    const match = splitLemgram(lemgram)
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

            $ctrl.onClickExample = function (row) {
                $rootScope.kwicTabs.push({
                    queryParams: {
                        ajaxParams: {
                            command: "relations_sentences",
                            source: row.source.join(","),
                            start: 0,
                            end: 24,
                        },
                    },
                })
            }
        },
    ],
})
