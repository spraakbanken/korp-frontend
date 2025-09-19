import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { WordPicture } from "@/word-picture"
import { RelationsSort } from "@/backend/types/relations"
import "./word-picture-column"
import { Lemgram } from "@/lemgram"

type WordPictureController = IController & {
    data: WordPicture
    limit: number
    showWordClass: boolean
    sort: RelationsSort
}

type WordPictureScope = IScope & {
    fromLemgram: (word: string) => string
    isLemgram: (word: string) => boolean
    lemgramToHtml: (word: string) => string
}

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div class="content_target flex flex-wrap gap-4 items-start">
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
        },
    ],
})
