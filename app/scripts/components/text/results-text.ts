/** @format */
import angular, { ICompileService, IController, IScope } from "angular"
import statemachine from "@/statemachine"
import "@/components/text/readingmode"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { html, kebabize } from "@/util"
import { ReaderToken, TextReaderData, TextReaderDataContainer, TextTask } from "@/task/text-task"

type ResultsTextController = IController & {
    active: boolean
    setProgress: (loading: boolean, progress: number) => void
    task: TextTask
}

type ResultsTextScope = IScope & {
    corpusObj: CorpusTransformed
    data: TextReaderDataContainer
    selectedToken?: ReaderToken
    wordClick: (token: ReaderToken) => void
}

angular.module("korpApp").component("resultsText", {
    bindings: {
        active: "<",
        setProgress: "<",
        task: "<",
    },
    controller: [
        "$compile",
        "$element",
        "$scope",
        function ($compile: ICompileService, $element: JQLite, $scope: ResultsTextScope) {
            const $ctrl = this as ResultsTextController

            $ctrl.$onInit = () => {
                $ctrl.setProgress(true, 0)

                $ctrl.task
                    .send()
                    .then(render)
                    .catch((err) => {
                        $scope.$apply(() => $ctrl.setProgress(false, 100))
                        throw err
                    })
            }

            $ctrl.$onChanges = (changes) => {
                if (changes.active) {
                    // Restore sidebar for previously selected token
                    if (changes.active.currentValue && $scope.data && $scope.selectedToken) {
                        $scope.wordClick($scope.selectedToken)
                    }
                    // Deselect word if exiting tab
                    if (!changes.active.currentValue) {
                        statemachine.send("DESELECT_WORD")
                    }
                }
            }

            function render(document: TextReaderData) {
                $scope.$apply(($scope: ResultsTextScope) => {
                    $scope.data = { corpus: $ctrl.task.corpusId, document, sentenceData: $ctrl.task.sentenceData }
                    $ctrl.setProgress(false, 100)
                    const config = $ctrl.task.corpus.reading_mode
                    const componentName = typeof config == "object" ? config.component : "standardReadingMode"
                    const componentTag = kebabize(componentName)

                    const template = html`<${componentTag} data="data" word-click="wordClick"></${componentTag}>`
                    $element.append($compile(template)($scope))

                    $scope.selectedToken = undefined
                })
            }

            $scope.wordClick = (token) => {
                statemachine.send("SELECT_WORD", {
                    sentenceData: $scope.data.document.structs,
                    wordData: token.attrs,
                    corpus: $scope.data.corpus,
                    tokens: "currentSentence" in token ? token.currentSentence : undefined,
                    inReadingMode: true,
                })
                $scope.selectedToken = token
            }
        },
    ],
})
