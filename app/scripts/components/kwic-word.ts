/** @format */
import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { ApiKwic, Token } from "@/backend/types"

type KwicWordController = IController & {
    word: Token
    sentence: ApiKwic
    sentenceIndex: number
}

export type KwicWordScope = IScope & {
    word: Token
    sentence: ApiKwic
    sentenceIndex: number
    class: Record<string, boolean>
}

angular.module("korpApp").component("kwicWord", {
    template: html`<span class="word" ng-class="class">{{::$ctrl.word.word}}</span> `,
    bindings: {
        word: "<",
        sentence: "<",
        sentenceIndex: "<",
    },
    controller: [
        "$scope",
        function ($scope: KwicWordScope) {
            const $ctrl = this as KwicWordController

            $scope.class = {}

            $ctrl.$onInit = () => {
                // Add incoming values to local scope, to be used by click handlers in the Kwic component.
                $scope.word = $ctrl.word
                $scope.sentence = $ctrl.sentence
                $scope.sentenceIndex = $ctrl.sentenceIndex
            }

            $scope.$watch(
                "word",
                (word: Token) => {
                    // Produce applicable class names depending on token data.
                    $scope.class = {
                        reading_match: word._match,
                        punct: word._punct,
                        match_sentence: word._matchSentence,
                        link_selected: word._link_selected,
                        open_sentence: "_open_sentence" in word,
                    }
                },
                true
            )
        },
    ],
})
