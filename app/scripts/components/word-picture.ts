/** @format */
import angular, { IController } from "angular"
import settings from "@/settings"
import { html, isLemgram, lemgramToHtml, splitLemgram } from "@/util"
import { loc } from "@/i18n"
import { RootScope } from "@/root-scope.types"
import { WordPictureDef, WordPictureDefItem } from "@/settings/app-settings.types"
import { ShowableApiRelation, TableData, TableDrawData } from "@/controllers/word_picture_controller"
import { ApiRelation } from "@/backend/types/relations"
import "@/components/help-box"

type WordPictureController = IController & {
    // Bindings
    wordPic: boolean
    activate: () => void
    loading: boolean
    limitOptions: number[]
    data: TableDrawData[]
    warning?: string

    // Locals
    limit: string // Number as string to work with <select ng-model>
    showWordClass: boolean
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
    sortProp: RootScope["wordpicSortProp"]
    onClickExample: (row: ShowableApiRelation) => void
}

type ParsedLemgram = {
    label: string
    pos?: string
    idx?: string
}

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]

angular.module("korpApp").component("wordPicture", {
    template: html`
        <help-box
            text="'word_pic_description' | loc:$root.lang"
            extended-text="'word_pic_result_description' | loc:$root.lang"
        ></help-box>

        <div ng-if="!$ctrl.wordPic">
            {{'word_pic_warn' | loc:$root.lang}}
            <div>
                <button class="btn btn-sm btn-default activate_word_pic" ng-click="$ctrl.activate()">
                    {{'word_pic_warn_btn' | loc:$root.lang}}
                </button>
            </div>
        </div>

        <div ng-if="$ctrl.wordPic && $ctrl.warning" class="korp-warning">{{$ctrl.warning}}</div>

        <div ng-if="$ctrl.wordPic && $ctrl.data.length">
            <div class="my-4 flex flex-wrap items-baseline gap-4">
                <div>
                    <input id="wordclassChk" ng-model="$ctrl.showWordClass" type="checkbox" />
                    <label for="wordclassChk"> {{'show_wordclass' | loc:$root.lang}}</label>
                </div>
                <div>
                    <select id="numberHitsSelect" ng-model="$ctrl.limit">
                        <option ng-repeat="option in $ctrl.limitOptions" value="{{option}}">
                            {{'word_pic_show_some' | loc:$root.lang}} {{option}} {{'word_pic_hits' | loc:$root.lang}}
                        </option>
                    </select>
                </div>
                <div class="flex flex-wrap gap-2">
                    <label for="wordpic-sort">{{'sort_by' | loc:$root.lang}}:</label>
                    <div>
                        <input type="radio" id="wordpic-sort-mi" value="mi" ng-model="$root.wordpicSortProp" />
                        <label for="wordpic-sort-mi">
                            {{'stat_lmi' | loc:$root.lang}}
                            <i
                                class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                                uib-tooltip="{{'stat_lmi_help' | loc:$root.lang}}"
                            ></i>
                        </label>
                    </div>
                    <div>
                        <input type="radio" id="wordpic-sort-freq" value="freq" ng-model="$root.wordpicSortProp" />
                        <label for="wordpic-sort-freq"> {{'stat_frequency' | loc:$root.lang}}</label>
                    </div>
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
                            class="lemgram_result float-left p-1"
                            ng-repeat="table in section"
                            ng-if="$ctrl.renderTable(table.table)"
                            ng-class="$ctrl.getTableClass(word.wordClass, parentIndex, $index)"
                        >
                            <table class="m-0 p-0">
                                <tbody>
                                    <tr
                                        ng-repeat="row in $ctrl.minimize(table.table)"
                                        ng-init="data = $ctrl.parseLemgram(row)"
                                    >
                                        <td class="px-1 text-right"><span class="enumerate"></span></td>
                                        <td
                                            ng-click="$ctrl.onClickExample(row)"
                                            class="px-1 pr-2 cursor-pointer hover:underline"
                                        >
                                            <span ng-if="data.label">
                                                {{ data.label }}<sup ng-if="data.idx > 1">{{data.idx}}</sup>
                                                <span ng-if="$ctrl.showWordClass && data.pos">
                                                    ({{data.pos | loc:$root.lang}})
                                                </span>
                                            </span>
                                            <span ng-if="!data.label" class="opacity-50">&empty;</span>
                                        </td>
                                        <td
                                            ng-if="$ctrl.sortProp == 'freq'"
                                            title="{{'stat_lmi' | loc:$root.lang}}: {{row.mi | number:2}}"
                                            class="px-1 text-right"
                                        >
                                            {{row.freq}}
                                        </td>
                                        <td
                                            ng-if="$ctrl.sortProp == 'mi'"
                                            title="{{'stat_frequency' | loc:$root.lang}}: {{row.freq}}"
                                            class="px-1 text-right"
                                        >
                                            {{row.mi | number:2}}
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
        data: "<",
        warning: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureController

            $ctrl.limitOptions = [...LIMITS]
            $ctrl.limit = String(LIMITS[0])
            $ctrl.showWordClass = false
            $ctrl.sortProp = $rootScope.wordpicSortProp

            $ctrl.$onChanges = (changes) => {
                // Update local sortProp value after new data is received
                if ("data" in changes && changes.data.currentValue) {
                    $ctrl.sortProp = $rootScope.wordpicSortProp

                    // Find options for the limit setting
                    // Find length of longest column
                    const max = Math.max(
                        ...$ctrl.data.flatMap((word) =>
                            word.data.flatMap((table) =>
                                table.flatMap((col) => (Array.isArray(col.table) ? col.table.length : 0))
                            )
                        )
                    )
                    // Include options up to the first that is higher than the longest column
                    const endIndex = LIMITS.findIndex((limit) => limit >= max)
                    $ctrl.limitOptions = LIMITS.slice(0, endIndex + 1)
                    // Clamp previously selected value
                    if (Number($ctrl.limit) > LIMITS[endIndex]) $ctrl.limit = String(LIMITS[endIndex])
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

            $ctrl.minimize = (table) => table.slice(0, Number($ctrl.limit) || LIMITS[0])

            $ctrl.parseLemgram = function (row) {
                const set = row[row.show_rel].split("|")
                const lemgram = set[0]
                const prefix = row.depextra ? `${row.depextra} ` : ""

                if (isLemgram(lemgram)) {
                    const match = splitLemgram(lemgram)
                    const concept = row.dep ? match.form.replace(/_/g, " ") : "-"
                    return {
                        label: prefix + concept,
                        pos: match.pos.slice(0, 2),
                        idx: match.index,
                    }
                }

                return {
                    label: prefix + lemgram,
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
