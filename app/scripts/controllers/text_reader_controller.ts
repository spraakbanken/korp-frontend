/** @format */
import _ from "lodash"
import angular, { ICompileService } from "angular"
import statemachine from "@/statemachine"
import settings from "@/settings"
import "@/backend/backend"
import "@/components/readingmode"
import { RootScope, TextTab } from "@/root-scope.types"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { kebabize } from "@/util"
import { ApiKwic, Token } from "@/backend/kwic-proxy"
import { TabHashScope } from "@/directives/tab-hash"
import { getDataForReadingMode } from "@/backend/backend"

type TextReaderControllerScope = TabHashScope & {
    loading: boolean
    inData: TextTab
    data: TextReaderDataContainer
    corpusObj: CorpusTransformed
    closeTab: (idx: number, e: Event) => void
    onentry: () => void
    onexit: () => void
}

export type TextReaderDataContainer = {
    corpus: string
    document: TextReaderData
    sentenceData: TextTab["sentenceData"]
}

export type TextReaderWordHandler = (token: TextReaderToken) => void

export type TextReaderTokenContainer = {
    tokens: TextReaderToken[]
}

type TextReaderData = Omit<ApiKwic, "tokens"> & TextReaderTokenContainer

type TextReaderScope = TextReaderControllerScope & {
    selectedToken?: TextReaderToken
    wordClick: TextReaderWordHandler
}

export type TextReaderToken = TokenTreeParent | TokenTreeLeaf

// TODO The token types need examination, I'm not quite sure yet what the _prepareData function really does

type TokenTreeParent = {
    tokens: TextReaderToken[]
    attrs: Record<string, string>
    head?: string
    tail?: string
}

type TokenTreeLeaf = {
    attrs: { head: string; tail: string; close: string[]; [attr: string]: any }
    currentSentence: unknown
}

angular.module("korpApp").directive("textReaderCtrl", [
    () => ({
        controller: [
            "$scope",
            "$rootScope",
            ($scope: TextReaderControllerScope, $rootScope: RootScope) => {
                $scope.loading = true
                $scope.newDynamicTab()

                $scope.closeTab = function (idx, e) {
                    e.preventDefault()
                    $rootScope.textTabs.splice(idx, 1)
                    $scope.closeDynamicTab()
                }

                const corpus = $scope.inData.corpus
                $scope.corpusObj = settings.corpora[corpus]
                const textId = $scope.inData.sentenceData["text__id"]
                getDataForReadingMode(corpus, textId).then(function (data) {
                    if (!data || "ERROR" in data) {
                        $scope.$apply(($scope: TextReaderControllerScope) => ($scope.loading = false))
                        return
                    }
                    const document = prepareData(data.kwic[0], $scope.corpusObj)
                    $scope.$apply(($scope: TextReaderControllerScope) => {
                        $scope.data = { corpus, document, sentenceData: $scope.inData.sentenceData }
                        $scope.loading = false
                    })
                })

                $scope.onentry = function () {
                    $scope.$broadcast("on-entry")
                }
                $scope.onexit = function () {
                    $scope.$broadcast("on-exit")
                }
            },
        ],
    }),
])

angular.module("korpApp").directive("textReader", [
    "$compile",
    function ($compile: ICompileService) {
        return {
            scope: false,
            link: function (scope: TextReaderScope, element) {
                const config = scope.corpusObj.reading_mode
                const componentName = typeof config == "object" ? config.component : "standardReadingMode"
                const componentTag = kebabize(componentName)

                const template = `<${componentTag} data="data" word-click="wordClick"></${componentTag}>`
                element.append($compile(template)(scope))

                scope.selectedToken = undefined

                scope.wordClick = (token) => {
                    statemachine.send("SELECT_WORD", {
                        sentenceData: scope.data.document.structs,
                        wordData: token.attrs,
                        corpus: scope.data.corpus,
                        tokens: "currentSentence" in token ? token.currentSentence : undefined,
                        inReadingMode: true,
                    })
                    scope.selectedToken = token
                }

                scope.$on("on-entry", () => {
                    if (scope.data && scope.selectedToken) {
                        scope.wordClick(scope.selectedToken)
                    }
                })
            },
        }
    },
])

function prepareData(
    kwic: ApiKwic,
    settings: CorpusTransformed
): Omit<ApiKwic, "tokens"> & { tokens: TextReaderToken[] } {
    const tokens: TextReaderToken[] = _prepareData(kwic.tokens, 0, settings["reading_mode"]!["group_element"], false)
    return { ...kwic, tokens }
}

/**
if groupElement is set to anything, result will be a list of tokens for each
sentence or whatever groupElement is set to
*/
function _prepareData(tokens: Token[], start: number, groupElement: string, inGroup: boolean): TextReaderToken[] {
    const open: Record<string, Record<string, string>> = {}
    const newTokens: TextReaderToken[] = []

    // TODO: sentence is hard-coded, not good?
    let currentSentence: (Token | TextReaderToken)[] = []
    for (let i = start; i < tokens.length; i++) {
        let token: Token | TextReaderToken = tokens[i]
        // first check if we should do recursive call
        let done = false
        if ("structs" in token && token.structs?.open) {
            token["open"] = []
            for (let fieldObj of token.structs.open) {
                const keyName = _.keys(fieldObj)[0]

                if (!inGroup && keyName === groupElement) {
                    done = true
                    const innerTokens = _prepareData(tokens, i, groupElement, true)
                    i = i + innerTokens.length - 1
                    token = {
                        tokens: innerTokens,
                        attrs: {},
                    }
                    for (let subField in fieldObj[keyName]) {
                        token.attrs[subField] = fieldObj[keyName][subField]
                    }
                }
            }
        }

        token.head = "_head" in token ? escapeWhitespace(token._head) : ""
        token.tail = "_tail" in token ? escapeWhitespace(token._tail) : ""
        currentSentence.push(token)

        // if no call was made, do the other thing
        if (!done) {
            if ("structs" in token && token.structs && "open" in token.structs && token.structs.open) {
                for (let fieldObj of token.structs.open) {
                    const keyName = _.keys(fieldObj)[0]
                    open[keyName] = {}
                    for (let subField in fieldObj[keyName]) {
                        open[keyName][keyName + "_" + subField] = fieldObj[keyName][subField]
                    }
                }
            }

            for (let field in open) {
                for (let subField in open[field]) {
                    if (open[field][subField]) {
                        token[subField] = open[field][subField]
                    }
                }
            }

            const actualCurrentSentence = currentSentence

            if ("structs" in token && token.structs && "close" in token.structs && token.structs?.close) {
                token["close"] = []
                for (let field of token.structs.close) {
                    if (field === groupElement) {
                        delete token.structs
                        newTokens.push({
                            attrs: token as Token & { head: string; tail: string; close: string[] },
                            currentSentence: actualCurrentSentence,
                        })
                        return newTokens
                    } else {
                        if (field === "sentence") {
                            currentSentence = []
                        }
                        token["close"].push(field)
                        delete open[field]
                    }
                }
            }

            token = {
                attrs: _.omit(
                    token as (Token | TokenTreeParent) & { head: string; tail: string; close: string[] },
                    "structs"
                ),
                currentSentence: actualCurrentSentence,
            }
        }
        newTokens.push(token as TextReaderToken)
    }

    return newTokens
}

const escapeWhitespace = (str?: any): string =>
    String(str || "")
        .replace(/\\s/g, " ")
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
