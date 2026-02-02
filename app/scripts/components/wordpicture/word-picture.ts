import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { MatchedRelation, WordPicture } from "@/word-picture"
import { RelationsSort } from "@/backend/types/relations"
import "./word-picture-column"
import { Lemgram } from "@/lemgram"
import { isEqual } from "lodash"

type WordPictureController = IController & {
    data: WordPicture
    limit: number
    onClickExample: (args: { relation: MatchedRelation }) => void
    prevPeriodData?: { range: string; data: WordPicture }
    showWordClass: boolean
    sort: RelationsSort
}

type WordPictureScope = IScope & {
    fromLemgram: (word: string) => string
    isLemgram: (word: string) => boolean
    lemgramToHtml: (word: string) => string
    getPrevPeriodItems: (
        heading: { word: string; pos: string },
        tableIndex: number,
        rel: string,
    ) => MatchedRelation[] | undefined
}

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div class="flex flex-wrap gap-4 items-start">
            <section class="radialBkg p-2 border border-gray-400" ng-repeat="section in $ctrl.data.getData()">
                <h2 class="text-xl mb-4">
                    <span
                        ng-if="isLemgram(section.heading.word)"
                        ng-bind-html="lemgramToHtml(section.heading.word) | trust"
                    ></span>
                    <span ng-if="!isLemgram(section.heading.word)">
                        {{section.heading.word}} ({{'pos_' + section.heading.pos | loc:$root.lang}})
                    </span>
                </h2>

                <div ng-repeat="table in section.tables" ng-if="table.max" class="lemgram_table">
                    <div class="lemgram_help">
                        <span ng-repeat="column in table.columnsBefore" ng-class="column.config.css_class">
                            {{(column.config.alt_label || 'rel_' + column.config.rel) | loc:$root.lang}}
                        </span>
                        <span><b>{{fromLemgram(section.heading.word)}}</b></span>
                        <span ng-repeat="column in table.columnsAfter" ng-class="column.config.css_class">
                            {{(column.config.alt_label || 'rel_' + column.config.rel) | loc:$root.lang}}
                        </span>
                    </div>
                    <word-picture-column
                        ng-repeat="column in table.columns"
                        css-class="column.config.css_class"
                        items="column.rows"
                        limit="$ctrl.limit"
                        on-click-example="$ctrl.onClickExample({relation})"
                        prev-period-items="getPrevPeriodItems(section.heading, table.index, column.rel)"
                        show-word-class="$ctrl.showWordClass"
                        sort="$ctrl.sort"
                    ></word-picture-column>
                </div>
            </section>
        </div>
    `,
    bindings: {
        data: "<",
        limit: "<",
        onClickExample: "&",
        prevPeriodData: "<",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        "$scope",
        function ($scope: WordPictureScope) {
            const $ctrl = this as WordPictureController

            $scope.fromLemgram = (word) => Lemgram.parse(word)?.form || word
            $scope.isLemgram = (id) => !!Lemgram.parse(id)
            $scope.lemgramToHtml = (id) => Lemgram.parse(id)!.toHtml()

            $scope.getPrevPeriodItems = (
                heading: { word: string; pos: string },
                tableIndex: number,
                rel: string,
            ): MatchedRelation[] | undefined => {
                if (!$ctrl.prevPeriodData) return undefined
                const prevData = $ctrl.prevPeriodData.data
                const section = prevData.getData().find((s) => isEqual(s.heading, heading))
                if (!section) return undefined
                const table = section.tables[tableIndex]
                if (!table) return undefined
                const column = table.columns.find((c) => c.rel === rel)
                return column?.rows
            }
        },
    ],
})
