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
import { TabHashScope } from "@/directives/tab-hash"
import { getDataForReadingMode } from "@/backend/backend"
import { ApiKwic, Token } from "@/backend/types"
import { KorpBackendError } from "@/backend/common"

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

export type TextReaderWordHandler = (token: ReaderToken) => void

export type ReaderTokenContainer = { tokens: Group<ReaderToken>[] | ReaderToken[] }

type Group<T> = { attrs: Record<string, string>; tokens: T[] }

type ReaderToken = {
    /** Original token content, plus struct attrs renamed to `(struct)_(attr)` */
    attrs: Attrs
    currentSentence: Attrs[]
}

type Attrs = Record<string, string>

type TextReaderData = Omit<ApiKwic, "tokens"> & ReaderTokenContainer

type TextReaderScope = TextReaderControllerScope & {
    selectedToken?: ReaderToken
    wordClick: TextReaderWordHandler
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
                getDataForReadingMode(corpus, textId)
                    .then(function (data) {
                        const document = prepareData(data.kwic[0], $scope.corpusObj)
                        $scope.$apply(($scope: TextReaderControllerScope) => {
                            $scope.data = { corpus, document, sentenceData: $scope.inData.sentenceData }
                            $scope.loading = false
                        })
                    })
                    .catch((err) => {
                        $scope.$apply(($scope: TextReaderControllerScope) => ($scope.loading = false))
                        throw err
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

function prepareData(kwic: ApiKwic, settings: CorpusTransformed): TextReaderData {
    const groupElement = typeof settings.reading_mode == "object" ? settings.reading_mode.group_element : undefined

    if (groupElement) {
        const groups = groupTokens(kwic.tokens, groupElement)
        const tokens = groups.map((group) => ({ ...group, tokens: convertTokens(group.tokens) }))
        return { ...kwic, tokens }
    }

    const tokens = convertTokens(kwic.tokens)
    return { ...kwic, tokens }
}

/**
 * Partition a token sequence into groups corresponding to structs of the `groupElement` type.
 * The `groupElement` structs are assumed to cover the whole document, i.e. no tokens in between.
 */
function groupTokens(tokens: Token[], groupElement: string): Group<Token>[] {
    const groups: Group<Token>[] = []
    for (const token of tokens) {
        // Start a new group if this tokens opens a new struct of the groupElement type
        if (token.structs?.open) {
            const struct = token.structs.open.find((open) => open[groupElement])
            if (!struct) continue
            // Copy attrs to group
            const attrs = { ...struct[groupElement] }
            groups.push({ attrs, tokens: [] })
        }
        // Add token to current group
        groups[groups.length - 1].tokens.push(token)
    }
    return groups
}

function convertTokens(tokens: Token[]): ReaderToken[] {
    const out: ReaderToken[] = []
    let currentSentence: Record<string, string>[] = []
    /** Attributes per currently open struct */
    const open: Record<string, Record<string, string>> = {}

    for (const token of tokens) {
        // Store new struct attrs and track current sentence
        for (const openStruct of token.structs?.open || []) {
            const name = Object.keys(openStruct)[0]
            open[name] = openStruct[name]
            if (name === "sentence") currentSentence = []
        }

        // Convert and push token
        const attrs = convertToken(token, open)
        currentSentence.push(attrs)
        out.push({ attrs, currentSentence })

        // Clear closed struct attrs
        for (const name of token.structs?.close || []) {
            delete open[name]
        }
    }

    return out
}

function convertToken(token: Token, open: Record<string, Record<string, string>>): Record<string, string> {
    // Add attrs of all open structs
    const structAttrs: Record<string, string> = {}
    for (const name in open) {
        for (const attr in open[name]) {
            if (open[name][attr]) structAttrs[name + "_" + attr] = open[name][attr]
        }
    }

    return {
        ..._.omit(token, "structs"),
        ...structAttrs,
        head: parseWhitespace(token._head),
        tail: parseWhitespace(token._tail),
    }
}

const parseWhitespace = (str?: string): string =>
    str?.replace(/\\s/g, " ").replace(/\\n/g, "\n").replace(/\\t/g, "\t") || ""
