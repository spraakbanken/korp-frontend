/** @format */
import statemachine from "@/statemachine"

let html = String.raw
export const simpleSearchComponent = {
    template: html`
        <div id="korp-simple">
            <global-filters lang="lang"></global-filters>
            <div class="sm_flex justify-between">
                <form class="simple_form">
                    <autoc
                        id="simple_text"
                        input="$ctrl.input"
                        is-raw-input="$ctrl.isRawInput"
                        type="lemgram"
                        disable-lemgram-autocomplete="$ctrl.disableLemgramAutocomplete"
                        on-change="$ctrl.onChange(output, isRawOutput)"
                    ></autoc>
                    <search-submit
                        on-search="$ctrl.updateSearch()"
                        on-search-save="$ctrl.onSearchSave(name)"
                    ></search-submit>
                    <div class="opts">
                        <input id="inOrderChk" type="checkbox" ng-model="$ctrl.inOrder" />
                        <label for="inOrderChk"> {{'in_order_chk' | loc:$root.lang}}</label>
                        <span> {{'and' | loc:$root.lang}} </span>
                        <span> {{'and_include' | loc:$root.lang}} </span>
                        <input id="prefixChk" type="checkbox" ng-model="$ctrl.prefix" />
                        <label for="prefixChk"> {{'prefix_chk' | loc:$root.lang}}</label>
                        <input id="midChk" type="checkbox" ng-model="$ctrl.mid_comp" />
                        <label for="midChk"> {{'compound_middle' | loc:$root.lang}} </label>
                        <input id="suffixChk" type="checkbox" ng-model="$ctrl.suffix" />
                        <label for="suffixChk"> {{'suffix_chk' | loc:$root.lang}} </label>
                        <span> {{'and' | loc:$root.lang}} </span>
                        <input id="caseChk" type="checkbox" ng-model="$ctrl.isCaseInsensitive" />
                        <label for="caseChk"> {{'case_insensitive' | loc:$root.lang}} </label>
                    </div>
                </form>
                <div id="similar_wrapper" ng-show="$ctrl.relatedObj">
                    <button
                        class="btn btn-sm btn-default"
                        ng-click="$ctrl.showAllRelated()"
                        ng-if="$ctrl.relatedObj.length != 0"
                    >
                        <span class="btn_header">{{ 'similar_header' | loc:$root.lang }} (SWE-FN)</span><br /><span
                            ng-repeat="wd in $ctrl.relatedObj[0].words | limitTo:$ctrl.relatedDefault"
                        >
                            {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                        ><br /><span
                            ng-repeat="wd in $ctrl.relatedObj[0].words.slice($ctrl.relatedDefault) | limitTo:$ctrl.relatedDefault"
                        >
                            {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                        ><span
                            ng-if="$ctrl.relatedObj[0].words.length > $ctrl.relatedDefault || $ctrl.relatedObj.length > 1"
                        >
                            ...</span
                        >
                    </button>
                    <div class="btn btn-sm btn-default" ng-if="$ctrl.relatedObj.length == 0">
                        <span class="btn_header">{{ 'similar_header' | loc:$root.lang }} (SWE-FN)</span><br /><span
                            >{{'no_related_words' | loc:$root.lang}}</span
                        >
                    </div>
                </div>
            </div>
        </div>
    `,
    controller: [
        "$location",
        "backend",
        "$rootScope",
        "searches",
        "compareSearches",
        "$uibModal",
        "$timeout",
        function ($location, backend, $rootScope, searches, compareSearches, $uibModal, $timeout) {
            const ctrl = this

            ctrl.disableLemgramAutocomplete = !settings.autocomplete

            statemachine.listen("lemgram_search", (event) => {
                ctrl.input = event.value
                ctrl.isRawInput = false
                ctrl.onChange(event.value, false)
            })

            ctrl.inOrder = $location.search().in_order == null
            ctrl.prefix = $location.search().prefix != null
            ctrl.mid_comp = $location.search().mid_comp != null
            ctrl.suffix = $location.search().suffix != null
            if (settings.inputCaseInsensitiveDefault) {
                ctrl.isCaseInsensitive = true
                $location.search("isCaseInsensitive", "")
            } else {
                ctrl.isCaseInsensitive = $location.search().isCaseInsensitive != null
            }

            // triggers watch on searches.activeSearch
            ctrl.updateSearch = function () {
                $location.search("in_order", !ctrl.inOrder ? false : null)
                $location.search("prefix", ctrl.prefix ? true : null)
                $location.search("mid_comp", ctrl.mid_comp ? true : null)
                $location.search("suffix", ctrl.suffix ? true : null)
                $location.search("isCaseInsensitive", ctrl.isCaseInsensitive ? true : null)

                $location.search("within", null)
                locationSearch("search", null)
                $timeout(function () {
                    if (ctrl.currentText) {
                        util.searchHash("word", ctrl.currentText)
                    } else if (ctrl.lemgram) {
                        util.searchHash("lemgram", ctrl.lemgram)
                    }
                }, 0)
            }

            ctrl.getCQP = function () {
                let suffix, val
                const currentText = (ctrl.currentText || "").trim()

                if (currentText) {
                    suffix = ctrl.isCaseInsensitive ? " %c" : ""
                    const wordArray = currentText.split(" ")
                    const tokenArray = _.map(wordArray, (token) => {
                        const orParts = []
                        if (ctrl.prefix) {
                            orParts.push(token + ".*")
                        }
                        if (ctrl.mid_comp) {
                            orParts.push(`.*${token}.*`)
                        }
                        if (ctrl.suffix) {
                            orParts.push(`.*${token}`)
                        }
                        if (!(ctrl.prefix || ctrl.suffix)) {
                            orParts.push(regescape(token))
                        }
                        const res = _.map(orParts, (orPart) => `word = "${orPart}"${suffix}`)
                        return `[${res.join(" | ")}]`
                    })
                    val = tokenArray.join(" ")
                } else if (ctrl.lemgram) {
                    const lemgram = ctrl.lemgram
                    val = `[lex contains \"${lemgram}\"`
                    if (ctrl.prefix) {
                        val += ` | complemgram contains \"${lemgram}\\+.*\"`
                    }
                    if (ctrl.mid_comp) {
                        val += ` | complemgram contains \".*\\+${lemgram}\\+.*\"`
                    }
                    if (ctrl.suffix) {
                        val += ` | complemgram contains \".*\\+${lemgram}:.*\"`
                    }
                    val += "]"
                }

                if ($rootScope.globalFilter) {
                    val = CQP.stringify(CQP.mergeCqpExprs(CQP.parse(val || "[]"), $rootScope.globalFilter))
                }

                return val
            }

            ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, ctrl.getCQP())
            }

            ctrl.stringifyRelated = (wd) => util.saldoToString(wd)

            ctrl.relatedDefault = 3

            ctrl.showAllRelated = () => {
                const scope = $rootScope.$new()
                scope.stringifyRelatedHeader = (wd) => wd.replace(/_/g, " ")
                scope.clickX = () => modalInstance.dismiss()
                scope.stringifyRelated = ctrl.stringifyRelated
                scope.relatedObj = ctrl.relatedObj
                scope.clickRelated = function (wd, attribute) {
                    let cqp
                    if (modalInstance != null) {
                        modalInstance.close()
                    }
                    $rootScope.searchtabs()[1].tab.select()
                    if (attribute === "saldo") {
                        cqp = `[saldo contains \"${regescape(wd)}\"]`
                    } else {
                        cqp = `[sense rank_contains \"${regescape(wd)}\"]`
                    }
                    statemachine.send("SEARCH_CQP", { cqp })
                }
                const modalInstance = $uibModal.open({
                    template: `\
                        <div class="modal-header">
                            <h3 class="modal-title">{{'similar_header' | loc:$root.lang}} (SWE-FN)</h3>
                            <span ng-click="clickX()" class="close-x">×</span>
                        </div>
                        <div class="modal-body">
                            <div ng-repeat="obj in relatedObj" class="col"><a target="_blank" ng-href="https://spraakbanken.gu.se/karp/#?mode=swefn&lexicon=swefn&amp;search=extended||and|sense|equals|swefn--{{obj.label}}" class="header">{{stringifyRelatedHeader(obj.label)}}</a>
                              <div class="list_wrapper">
                                  <ul>
                                    <li ng-repeat="wd in obj.words"> <a ng-click="clickRelated(wd, relatedObj.attribute)" class="link">{{stringifyRelated(wd) + " "}}</a></li>
                                  </ul>
                              </div>
                            </div>
                        </div>\
                        `,
                    scope,
                    size: "lg",
                    windowClass: "related",
                })
            }

            $rootScope.searches = searches
            $rootScope.$watch("searches.activeSearch", function (search) {
                if (!search) {
                    return
                }
                if (search.type === "word" || search.type === "lemgram") {
                    if (search.type === "word") {
                        ctrl.input = search.val
                        ctrl.isRawInput = true
                        ctrl.currentText = search.val
                    } else {
                        ctrl.input = unregescape(search.val)
                        ctrl.isRawInput = false
                        ctrl.lemgram = search.val
                    }
                    $rootScope.simpleCQP = CQP.expandOperators(ctrl.getCQP())
                    ctrl.doSearch()
                }
            })

            ctrl.onChange = (output, isRawOutput) => {
                if (isRawOutput) {
                    ctrl.currentText = output
                    ctrl.lemgram = null
                } else {
                    ctrl.lemgram = regescape(output)
                    ctrl.currentText = null
                }
            }

            ctrl.doSearch = function () {
                const search = searches.activeSearch
                ctrl.relatedObj = null
                const cqp = ctrl.getCQP()
                searches.kwicSearch(cqp)

                if (search.type === "lemgram") {
                    let sense = false
                    let saldo = false
                    for (let corpus of settings.corpusListing.selected) {
                        if ("sense" in corpus.attributes) {
                            sense = true
                        }
                        if ("saldo" in corpus.attributes) {
                            saldo = true
                        }
                    }

                    if (sense || saldo) {
                        backend.relatedWordSearch(unregescape(search.val)).then(function (data) {
                            ctrl.relatedObj = data
                            if (data.length > 2 && data[0].label == "Excreting") {
                                let [first, second, ...rest] = data
                                ctrl.relatedObj.data = [second, first, ...rest]
                            }
                            ctrl.relatedObj.attribute = sense ? "sense" : "saldo"
                        })
                    }
                }
            }
        },
    ],
}
