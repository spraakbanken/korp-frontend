import angular, { IController } from "angular"
import { html } from "@/util"
import { WordPictureColumn, WordPictureTable } from "@/word-picture"
import { RelationsSort } from "@/backend/types/relations"
import "./word-picture-column"

type WordPictureController = IController & {
    // Bindings
    heading: string
    limit: string
    table: WordPictureTable
    showWordClass: boolean
    sort: RelationsSort
    // Locals
    columns: WordPictureColumn[]
}

angular.module("korpApp").component("wordPictureTable", {
    template: html`
        <div class="lemgram_table">
            <div class="lemgram_help">
                <span ng-repeat="column in $ctrl.table.columnsBefore" ng-class="column.config.css_class">
                    {{'rel_' + column.rel | loc:$root.lang}}
                </span>
                <span><b>{{$ctrl.heading}}</b></span>
                <span ng-repeat="column in $ctrl.table.columnsAfter" ng-class="column.config.css_class">
                    {{'rel_' + column.rel | loc:$root.lang}}
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
        },
    ],
})
