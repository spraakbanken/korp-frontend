import angular, { IController } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import { WordPictureDef, WordPictureDefItem } from "@/settings/app-settings.types"
import { ShowableApiRelation, TableData } from "@/backend/proxy/relations-proxy"
import { ApiRelation, RelationsSort } from "@/backend/types/relations"
import "@/components/util/help-box"
import { Lemgram } from "@/lemgram"
import { WordpicExampleTask } from "@/task/wordpic-example-task"

type WordPictureController = IController & {
    // Bindings
    limit: string
    parentIndex: number
    section: TableData[][]
    showWordClass: boolean
    sort: RelationsSort
    token: string
    wordClass: string

    // Locals
    renderResultHeader: (section: TableData[], index: number) => ApiRelation[] | { word: string }
    getHeaderLabel: (header: WordPictureDefItem, section: TableData[], idx: number) => string
    getHeaderClasses: (header: WordPictureDefItem | "_", token: string) => string
    fromLemgram: (word: string) => string
    getResultHeader: (index: number, wordClass: string) => WordPictureDef
    renderTable: (obj: ApiRelation[] | { word: string }) => boolean
    getTableClass: (wordClass: string, parentIdx: number, idx: number) => string | undefined
    minimize: (table: ShowableApiRelation[]) => ShowableApiRelation[]
    parseLemgram: (row: ShowableApiRelation) => { label: string; pos?: string; idx?: number }
    onClickExample: (row: ShowableApiRelation) => void
}

angular.module("korpApp").component("wordPictureSection", {
    template: html`
        <div class="lemgram_section">
            <div class="lemgram_help">
                <span
                    ng-repeat="header in $ctrl.getResultHeader($ctrl.parentIndex, $ctrl.wordClass)"
                    ng-class="$ctrl.getHeaderClasses(header, $ctrl.token)"
                    ng-if="$ctrl.renderResultHeader($ctrl.section, $index)"
                >
                    <span ng-if="header != '_'">
                        {{$ctrl.getHeaderLabel(header, $ctrl.section, $index) | loc:$root.lang}}
                    </span>
                    <span ng-if="header == '_'"><b>{{$ctrl.fromLemgram($ctrl.token)}}</b></span>
                </span>
            </div>
            <div
                class="lemgram_result float-left p-1"
                ng-repeat="table in $ctrl.section"
                ng-if="$ctrl.renderTable(table.table)"
                ng-class="$ctrl.getTableClass($ctrl.wordClass, $ctrl.parentIndex, $index)"
            >
                <table class="m-0 p-0">
                    <tbody>
                        <tr ng-repeat="row in $ctrl.minimize(table.table)" ng-init="data = $ctrl.parseLemgram(row)">
                            <td class="px-1 text-right"><span class="enumerate"></span></td>
                            <td ng-click="$ctrl.onClickExample(row)" class="px-1 pr-2 cursor-pointer hover:underline">
                                <span ng-if="data.label">
                                    {{ data.label }}<sup ng-if="data.idx > 1">{{data.idx}}</sup>
                                    <span ng-if="$ctrl.showWordClass && data.pos">
                                        ({{data.pos | loc:$root.lang}})
                                    </span>
                                </span>
                                <span ng-if="!data.label" class="opacity-50">&empty;</span>
                            </td>
                            <td
                                ng-if="$ctrl.sort == 'freq'"
                                title="{{'stat_lmi' | loc:$root.lang}}: {{row.mi | number:2}}"
                                class="px-1 text-right"
                            >
                                {{row.freq}}
                            </td>
                            <td
                                ng-if="$ctrl.sort == 'mi'"
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
    `,
    bindings: {
        limit: "<",
        parentIndex: "<",
        section: "<",
        showWordClass: "<",
        sort: "<",
        token: "<",
        wordClass: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureController

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
                    if (Lemgram.parse(token)) {
                        classes += " lemgram"
                    }
                    return classes
                }
            }

            $ctrl.fromLemgram = (word) => Lemgram.parse(word)?.form || word

            $ctrl.getResultHeader = (index, wordClass) => settings.word_picture_conf![wordClass][index]

            $ctrl.renderTable = (obj) => obj instanceof Array

            $ctrl.getTableClass = (wordClass, parentIdx, idx) => {
                const def = $ctrl.getResultHeader(parentIdx, wordClass)[idx]
                return def != "_" ? def.css_class : undefined
            }

            $ctrl.minimize = (table) => table.slice(0, Number($ctrl.limit))

            $ctrl.parseLemgram = function (row) {
                const set = row[row.show_rel].split("|")
                const id = set[0]
                const prefix = row.depextra ? `${row.depextra} ` : ""

                const lemgram = Lemgram.parse(id)
                if (lemgram) {
                    const concept = row.dep ? lemgram.form : "-"
                    return {
                        label: prefix + concept,
                        pos: lemgram.pos,
                        idx: lemgram.index,
                    }
                }

                return { label: prefix + id }
            }

            $ctrl.onClickExample = function (row) {
                $rootScope.kwicTabs.push(new WordpicExampleTask(row.source.join(",")))
            }
        },
    ],
})
