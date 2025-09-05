import angular, { IController } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { RootScope } from "@/root-scope.types"
import { WordPictureDef, WordPictureDefItem } from "@/settings/app-settings.types"
import { ShowableApiRelation, TableData, TableDrawData } from "@/backend/proxy/relations-proxy"
import { ApiRelation, RelationsSort } from "@/backend/types/relations"
import "@/components/util/help-box"
import { Lemgram } from "@/lemgram"
import { WordpicExampleTask } from "@/task/wordpic-example-task"

type WordPictureController = IController & {
    // Bindings
    data: TableDrawData[]
    onSortChange: (args: { sort: RelationsSort }) => void
    sort: RelationsSort
    warning?: string

    // Locals
    limit: string // Number as string to work with <select ng-model>
    limitOptions: number[]
    showWordClass: boolean
    sortLocal: RelationsSort
    statProp: RelationsSort
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
    pos?: string
    idx?: number
}

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div ng-if="$ctrl.warning" class="korp-warning" role="status">{{$ctrl.warning}}</div>

        <div ng-if="$ctrl.data.length">
            <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
                <label>
                    <input ng-model="$ctrl.showWordClass" type="checkbox" />
                    {{'show_wordclass' | loc:$root.lang}}
                </label>
                <select ng-model="$ctrl.limit">
                    <option ng-repeat="option in $ctrl.limitOptions" value="{{option}}">
                        {{'word_pic_show_some' | loc:$root.lang}} {{option}} {{'word_pic_hits' | loc:$root.lang}}
                    </option>
                </select>
                <div class="flex flex-wrap gap-2">
                    {{'sort_by' | loc:$root.lang}}:
                    <label>
                        <input type="radio" value="mi" ng-model="$ctrl.sortLocal" ng-change="$ctrl.changeSort()" />
                        {{'stat_lmi' | loc:$root.lang}}
                        <i
                            class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                            uib-tooltip="{{'stat_lmi_help' | loc:$root.lang}}"
                        ></i>
                    </label>
                    <label>
                        <input type="radio" value="freq" ng-model="$ctrl.sortLocal" ng-change="$ctrl.changeSort()" />
                        {{'stat_frequency' | loc:$root.lang}}
                    </label>
                </div>
            </div>
            <div class="content_target flex flex-wrap gap-4 items-start">
                <section class="radialBkg p-2 border border-gray-400" ng-repeat="word in $ctrl.data">
                    <h2 class="text-xl mb-4">
                        <span
                            ng-if="$ctrl.isLemgram(word.token)"
                            ng-bind-html="$ctrl.lemgramToHtml(word.token) | trust"
                        ></span>
                        <span ng-if="!$ctrl.isLemgram(word.token)">
                            {{word.token}} ({{word.wordClassShort | loc:$root.lang}})
                        </span>
                    </h2>

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
                                            ng-if="$ctrl.statProp == 'freq'"
                                            title="{{'stat_lmi' | loc:$root.lang}}: {{row.mi | number:2}}"
                                            class="px-1 text-right"
                                        >
                                            {{row.freq}}
                                        </td>
                                        <td
                                            ng-if="$ctrl.statProp == 'mi'"
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
                </section>
            </div>
        </div>

        <help-box>
            <p>{{'word_pic_description' | loc:$root.lang}}</p>
            <p>{{'word_pic_result_description' | loc:$root.lang}}</p>
        </help-box>
    `,
    bindings: {
        data: "<",
        onSortChange: "&",
        sort: "<",
        warning: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureController

            $ctrl.limitOptions = [...LIMITS]
            $ctrl.limit = String(LIMITS[0])
            $ctrl.showWordClass = false

            $ctrl.$onChanges = (changes) => {
                if ("data" in changes && changes.data.currentValue) {
                    $ctrl.statProp = $ctrl.sort
                    // Find length of longest column
                    const max = Math.max(
                        ...$ctrl.data.flatMap((word) =>
                            word.data.flatMap((table) =>
                                table.flatMap((col) => (Array.isArray(col.table) ? col.table.length : 0)),
                            ),
                        ),
                    )
                    // Include options up to the first that is higher than the longest column
                    const endIndex = LIMITS.findIndex((limit) => limit >= max)
                    $ctrl.limitOptions = LIMITS.slice(0, endIndex + 1)
                    // Clamp previously selected value
                    if (Number($ctrl.limit) > LIMITS[endIndex]) $ctrl.limit = String(LIMITS[endIndex])
                }

                if ("sort" in changes) {
                    $ctrl.sortLocal = changes.sort.currentValue
                }
            }

            $ctrl.changeSort = () => {
                $ctrl.onSortChange({ sort: $ctrl.sortLocal })
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
                    if (Lemgram.parse(token)) {
                        classes += " lemgram"
                    }
                    return classes
                }
            }

            $ctrl.isLemgram = (id) => !!Lemgram.parse(id)
            $ctrl.lemgramToHtml = (id) => Lemgram.parse(id)!.toHtml()

            $ctrl.fromLemgram = (word) => Lemgram.parse(word)?.form || word

            $ctrl.getResultHeader = (index, wordClass) => settings.word_picture_conf![wordClass][index]

            $ctrl.renderTable = (obj) => obj instanceof Array

            $ctrl.getTableClass = (wordClass, parentIdx, idx) => {
                const def = $ctrl.getResultHeader(parentIdx, wordClass)[idx]
                return def != "_" ? def.css_class : undefined
            }

            $ctrl.minimize = (table) => table.slice(0, Number($ctrl.limit) || LIMITS[0])

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
