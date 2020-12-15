/** @format */
import statemachine from "./statemachine"
const korpApp = angular.module("korpApp")

korpApp.directive("textReaderCtrl", ($timeout) => ({
    controller($scope, backend) {
        const s = $scope

        s.loading = true
        s.newDynamicTab()

        s.closeTab = function (idx, e) {
            e.preventDefault()
            s.textTabs.splice(idx, 1)
            s.closeDynamicTab()
        }

        const corpus = s.inData.corpus
        s.corpusObj = settings.corpora[corpus]
        const sentenceId = s.inData.sentenceId
        backend.getDataForReadingMode(corpus, sentenceId).then(function (data) {
            new Promise((resolve, reject) => {
                resolve(prepareData(data.kwic[0], s.corpusObj))
            }).then((document) => {
                s.data = { corpus, sentenceId, document }
                $timeout(() => (s.loading = false), 0)
            })
        })

        s.onentry = function () {
            s.$broadcast("on-entry")
        }
        s.onexit = function () {
            s.$broadcast("on-exit")
        }
    },
}))

korpApp.directive("textReader", function ($compile) {
    return {
        scope: false,
        link: function (scope, element) {
            var generatedTemplate =
                "<div " +
                scope.corpusObj.readingMode.directive +
                ' data="data" word-click="wordClick"></div>'
            element.append($compile(generatedTemplate)(scope))

            scope.selectedToken = {}

            scope.wordClick = (token) => {
                statemachine.send("select_word", {
                    sentenceData: scope.data.document.structs,
                    wordData: token.attrs,
                    corpus: scope.data.corpus,
                    tokens: token.currentSentence,
                    inReadingMode: true,
                })
                scope.selectedToken = token
                // scope.$root.sidebar_visible = true
                // }
            }

            scope.$on("on-entry", function () {
                if (scope.data) {
                    scope.wordClick(scope.selectedToken)
                }
            })

            scope.$on("on-exit", function () {
                // scope.$root.sidebar_visible = false
            })

            scope.wordClick({})
        },
    }
})

korpApp.directive("standardReadingMode", () => ({
    scope: {
        data: "<",
        wordClick: "&",
    },
    link(scope, elem, attr) {
        function standardInnerElem(document) {
            const doc = []
            for (let idx = 0; idx < document.tokens.length; idx++) {
                let token = document.tokens[idx]
                if (!token.tokens) {
                    doc.push(
                        `<span class="word" data-idx="${idx}">${token.attrs.head}${token.attrs.word}${token.attrs.tail}</span>`
                    )
                } else {
                    doc.push(`<div>${standardInnerElem(token.tokens)}</div>`)
                }
            }
            return `${doc.join("")}`
        }

        function standardOuterElem(data) {
            return `<div class="text-container m-md-5">${standardInnerElem(data.document)}</div>`
        }

        elem[0].innerHTML = standardOuterElem(scope.data)

        elem[0].addEventListener("click", (e) => {
            if (e.target.dataset.idx) {
                const idx = e.target.dataset.idx
                const token = scope.data.document.tokens[idx]
                scope.wordClick(["wordClick"])(token)
            }
        })
    },
}))

function prepareData(kwic, settings) {
    const newTokens = _prepareData(kwic.tokens, 0, settings.readingMode.groupElement, false)
    delete kwic.tokens
    kwic.tokens = newTokens
    return kwic
}

/**
if groupElement is set to anything, result will be a list of tokens for each
sentence or whatever groupElement is set to
*/
function _prepareData(tokens, start, groupElement, inGroup) {
    const open = {}
    const newTokens = []

    // TODO: sentence is hard-coded, not good?
    let currentSentence = []
    for (let i = start; i < tokens.length; i++) {
        let token = tokens[i]
        // first check if we should do recursive call
        let done = false
        if ("structs" in token) {
            if ("open" in token.structs) {
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
        }

        token.head = (token._head || "")
            .replace(/\\s/g, " ")
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
        token.tail = (token._tail || "")
            .replace(/\\s/g, " ")
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
        currentSentence.push(token)
        // if no call was made, do the other thing
        if (!done) {
            if ("structs" in token && "open" in token.structs) {
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

            if ("structs" in token && "close" in token.structs) {
                token["close"] = []
                for (let field of token.structs.close) {
                    if (field === groupElement) {
                        delete token.structs
                        newTokens.push({ attrs: token, currentSentence: actualCurrentSentence })
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

            delete token.structs
            token = { attrs: token, currentSentence: actualCurrentSentence }
        }
        newTokens.push(token)
    }

    return newTokens
}
