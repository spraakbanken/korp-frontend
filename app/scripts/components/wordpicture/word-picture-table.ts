import angular, { IController } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { WordPictureDef, WordPictureDefItem } from "@/settings/app-settings.types"
import { TableData } from "@/backend/proxy/relations-proxy"
import { WordPictureColumn, WordPictureTable } from "@/word-picture"
import { ApiRelation, RelationsSort } from "@/backend/types/relations"
import "./word-picture-column"
import { Lemgram } from "@/lemgram"

type WordPictureController = IController & {
    // Bindings
    heading: string
    limit: string
    parentIndex: number
    table: WordPictureTable
    showWordClass: boolean
    sort: RelationsSort

    // Locals
    columns: WordPictureColumn[]
    word: string
    renderResultHeader: (table: TableData[], index: number) => ApiRelation[] | { word: string }
    getHeaderLabel: (header: WordPictureDefItem, table: TableData[], idx: number) => string
    getHeaderClasses: (header: WordPictureDefItem | "_", token: string) => string
    getResultHeader: (index: number, wordClass: string) => WordPictureDef
    renderTable: (obj: ApiRelation[] | { word: string }) => boolean
    getTableClass: (wordClass: string, parentIdx: number, idx: number) => string | undefined
}

angular.module("korpApp").component("wordPictureTable", {
    template: html`
        <div class="lemgram_table">
            <div class="lemgram_help">
                <span ng-repeat="column in $ctrl.table.columnsBefore" ng-class="column.config.css_class">
                    {{(column.config.alt_label || 'rel_' + column.rel) | loc:$root.lang}}
                </span>
                <span><b>{{$ctrl.heading}}</b></span>
                <span ng-repeat="column in $ctrl.table.columnsAfter" ng-class="column.config.css_class">
                    {{(column.config.alt_label || 'rel_' + column.rel) | loc:$root.lang}}
                </span>
            </div>
            <word-picture-column
                ng-repeat="column in $ctrl.columns"
                column="column"
                limit="$ctrl.limit"
                show-word-class="$ctrl.showWordClass"
                sort="$ctrl.sort"
            ></word-picture-column>
        </div>
    `,
    bindings: {
        heading: "<",
        limit: "<",
        parentIndex: "<",
        table: "<",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        function () {
            const $ctrl = this as WordPictureController

            $ctrl.$onInit = () => {
                $ctrl.table.columnsBefore = $ctrl.table.columnsBefore.filter((column) => column.rows.length)
                $ctrl.table.columnsAfter = $ctrl.table.columnsAfter.filter((column) => column.rows.length)
                $ctrl.columns = [...$ctrl.table.columnsBefore, ...$ctrl.table.columnsAfter]
            }

            $ctrl.renderResultHeader = function (table, index) {
                return table[index]?.table
            }

            $ctrl.getHeaderLabel = function (header, table, idx) {
                if (header.alt_label) {
                    return header.alt_label
                } else {
                    return `rel_${table[idx].rel}`
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

            $ctrl.getResultHeader = (index, wordClass) => settings.word_picture_conf![wordClass][index]

            $ctrl.renderTable = (obj) => obj instanceof Array

            $ctrl.getTableClass = (wordClass, parentIdx, idx) => {
                const def = $ctrl.getResultHeader(parentIdx, wordClass)[idx]
                return def != "_" ? def.css_class : undefined
            }
        },
    ],
})
