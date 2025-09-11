import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { WordPicture } from "@/word-picture"
import { RelationsSort } from "@/backend/types/relations"
import "./word-picture-table"
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

                <word-picture-table
                    ng-repeat="table in section.tables"
                    ng-if="table.max"
                    heading="fromLemgram(section.heading.word)"
                    limit="$ctrl.limit"
                    parent-index="$index"
                    table="table"
                    show-word-class="$ctrl.showWordClass"
                    sort="$ctrl.sort"
                >
                </word-picture-table>
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
