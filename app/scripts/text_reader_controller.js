const korpApp = angular.module("korpApp")

korpApp.directive("textReaderCtrl", ($timeout, searches) => ({
    controller($scope, $rootScope, backend) {
        const s = $scope

        s.loading = true
        s.newDynamicTab()

        s.closeTab = function(idx, e) {
            e.preventDefault()
            s.textTabs.splice(idx, 1)
            s.closeDynamicTab()
        }

        const corpus = s.inData.corpus
        s.corpusObj = settings.corpora[corpus]
        const sentenceId = s.inData.sentenceId
        backend.getDataForReadingMode(corpus, sentenceId).then(function(data) {
            new Promise((resolve, reject) => {
                resolve(prepareData(data, s.corpusObj))
            }).then((document) => {
                s.data = {corpus, sentenceId, document}
                $timeout(() => s.loading = false, 0)
            })
        })

        s.onentry = function () {
            s.$broadcast('on-entry')
        }
        s.onexit = function () {
            s.$broadcast('on-exit')
        }
    }
}))

// text attributes for all tokens
// struct attributes for sentence should be merged with word attrs
korpApp.directive('textReader', function($compile) {
    return {
        scope: false,
        link: function(scope, element) {
            var generatedTemplate = '<div ' + scope.corpusObj.readingMode.directive + ' data="data" word-click="wordClick"></div>'
            element.append($compile(generatedTemplate)(scope))

            scope.selectedToken = {}

            scope.wordClick = (token) => {
                scope.selectedToken = token
                if ($("#sidebar").data()["korpSidebar"]) {
                    $("#sidebar").sidebar(
                        "updateContent",
                        {}, // structural attributes
                        token,
                        scope.data.corpus,
                        [], // this should be the current tokens in sentence, for dependency graph to work 
                        true
                    )
                    scope.$root.sidebar_visible = true
                }
            }
            
            scope.$on('on-entry', function(event, arg) {
                if(scope.data) {
                    scope.wordClick(scope.selectedToken)
                }
            })
            
            scope.$on('on-exit', function(event, arg) {
                scope.$root.sidebar_visible = false
            })
            
            scope.wordClick({})
        }
    }
})

korpApp.directive("standard", () => ({
    scope: {
        data: '<',
        wordClick: '&'
    },
    link(scope, elem, attr) {
        function standardRecursion(document) {
            const doc = []
            for (let idx = 0; idx < document.tokens.length; idx++) {
                let token = document.tokens[idx]
                if (!token.tokens) {
                    doc.push(`<span class="word" data-idx="${idx}">${token.attrs.head}${token.attrs.word}${token.attrs.tail}</span>`)
                } else {
                    doc.push(`<div>${standardRecursion(token.tokens)}</div>`)
                }
            }
            return `${doc.join('')}`
        }

        function standard(data) {
            return `<div class="text-container">${standardRecursion(data.document)}</div>`
        }

        elem[0].innerHTML = standard(scope.data)

        elem[0].addEventListener('click', (e) => {
            if(e.target.dataset.idx) {
                const idx = e.target.dataset.idx
                const token = scope.data.document.tokens[idx].attrs
                scope.wordClick(['wordClick'])(token)
            }
        })
    }
}))

/*
this is supposed to be used by all corpora
*/
function prepareData(data, settings) {
    const newTokens = prepareDataRecurse(data.kwic[0].tokens, 0, settings.readingMode.nodes || [], [])
    delete data.kwic[0].tokens
    data.kwic[0].tokens = newTokens
    return data.kwic[0]
}


/**
if settings.nodes are defined, create a nested structure of tokens using those nodes
*/
function prepareDataRecurse(tokens, start, nodes, openNode) {
    const open = {}
    const newTokens = []

    for (let i = start; i < tokens.length; i++) {
        let token = tokens[i]
        token.head = (token._head || '').replace(/\\s/g, " ").replace(/\\n/g, "\n").replace(/\\t/g, "\t")
        token.tail = (token._tail || '').replace(/\\s/g, " ").replace(/\\n/g, "\n").replace(/\\t/g, "\t")
        // first check if we should do recursive call
        let done = false
        if ("structs" in token) {
            if ("open" in token.structs) {
                token["open"] = []
                for (let fieldObj of token.structs.open) {
                    const keyName = _.keys(fieldObj)[0]
                    
                    if (nodes.includes(keyName)) {
                        done = true
                        const innerTokens = prepareDataRecurse(tokens, i, _.without(nodes, keyName), [keyName]) 
                        i = i + innerTokens.length - 1
                        token = {
                            tokens: innerTokens,
                            attrs: {}
                        }
                        for (let subField in fieldObj[keyName]) {
                            token.attrs[subField] = fieldObj[keyName][subField]
                        }
                    }
                }
            }
        }

        // if no call was made, do the other thing
        if (!done) {
            if ("structs" in token && "open" in token.structs) {
                for (let fieldObj of token.structs.open) {
                    const keyName = _.keys(fieldObj)[0]
                    open[keyName] = {}
                    for (let subField in fieldObj[keyName]) {
                        open[keyName][keyName + '_' + subField] = fieldObj[keyName][subField]
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

            if ("structs" in token && "close" in token.structs) {
                token["close"] = []
                for (let field of token.structs.close) {
                    if (openNode.includes(field)) {
                        delete token.structs
                        newTokens.push({attrs: token})
                        // TODO: what if one tokens close two elements at 
                        // the same time?? s.a. paragraph & sentence
                        return newTokens
                    } else {
                        token["close"].push(field)
                        delete open[field]
                    }
                }
            }

            delete token.structs
            token = {attrs: token}
        }
        newTokens.push(token)
    }

    return newTokens
}
