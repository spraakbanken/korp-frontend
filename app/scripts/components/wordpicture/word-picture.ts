import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { TableDrawData } from "@/backend/proxy/relations-proxy"
import { RelationsSort } from "@/backend/types/relations"
import "./word-picture-section"
import { Lemgram } from "@/lemgram"

type WordPictureController = IController & {
    data: TableDrawData[]
    limit: number
    showWordClass: boolean
    sort: RelationsSort
}

type WordPictureScope = IScope & {
    isLemgram: (word: string) => boolean
    lemgramToHtml: (word: string) => string
}

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div class="content_target flex flex-wrap gap-4 items-start">
            <section class="radialBkg p-2 border border-gray-400" ng-repeat="word in $ctrl.data">
                <h2 class="text-xl mb-4">
                    <span ng-if="isLemgram(word.token)" ng-bind-html="lemgramToHtml(word.token) | trust"></span>
                    <span ng-if="!isLemgram(word.token)">
                        {{word.token}} ({{word.wordClassShort | loc:$root.lang}})
                    </span>
                </h2>

                <word-picture-section
                    ng-repeat="section in word.data"
                    limit="$ctrl.limit"
                    parent-index="$index"
                    section="section"
                    show-word-class="$ctrl.showWordClass"
                    sort="$ctrl.sort"
                    token="word.token"
                    word-class="word.wordClass"
                >
                </word-picture-section>
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

            $scope.isLemgram = (id) => !!Lemgram.parse(id)
            $scope.lemgramToHtml = (id) => Lemgram.parse(id)!.toHtml()
        },
    ],
})
