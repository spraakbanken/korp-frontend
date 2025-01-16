/** @format */
import angular, { IController, IScope, ITimeoutService, ui } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { expandOperators, mergeCqpExprs, parse, stringify, supportsInOrder } from "@/cqp_parser/cqp"
import { html, regescape, saldoToHtml, unregescape } from "@/util"
import { matomoSend } from "@/matomo"
import "@/services/compare-searches"
import "@/backend/lexicons"
import "@/services/searches"
import "@/components/autoc"
import "@/components/search-submit"
import "@/global-filter/global-filters"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { CompareSearches } from "@/services/compare-searches"
import { LexiconsRelatedWords, relatedWordSearch } from "@/backend/lexicons"
import { SearchesService } from "@/services/searches"
import { CqpSearchEvent } from "@/statemachine/types"

type SimpleSearchController = IController & {
    input: string
    isRawInput: boolean
    disableLemgramAutocomplete: boolean
    freeOrder: boolean
    freeOrderEnabled: boolean
    prefix: boolean
    mid_comp: boolean
    suffix: boolean
    isCaseInsensitive: boolean
    currentText?: string
    lemgram?: string
    relatedObj?: { data: LexiconsRelatedWords[]; attribute: string }
    relatedDefault: number
    updateSearch: () => void
    getCQP: () => string
    onSearchSave: (name: string) => void
    stringifyRelated: (wd: string) => string
    showAllRelated: () => void
    updateFreeOrderEnabled: () => void
    doSearch: () => void
    onChange: (output: string, isRawOutput: boolean) => void
}

angular.module("korpApp").component("simpleSearch", {
    template: html`
        <div id="korp-simple">
            <global-filters lang="lang"></global-filters>
            <div class="sm:flex justify-between">
                <form>
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
                      
                      <div class="">
                        <span> {{'and' | loc:$root.lang}} </span>
                        <span> {{'and_include' | loc:$root.lang}} </span>
                      </div>
                      <div>                        
                        <input id="prefixChk" type="checkbox" ng-model="$ctrl.prefix" />
                        <label for="prefixChk"> {{'prefix_chk' | loc:$root.lang}}</label>
                      </div>
                      <div>
                        <input id="midChk" type="checkbox" ng-model="$ctrl.mid_comp" />
                        <label for="midChk"> {{'compound_middle' | loc:$root.lang}}</label>
                      </div>
                      <div>
                        <input id="suffixChk" type="checkbox" ng-model="$ctrl.suffix" />
                        <label for="suffixChk"> {{'suffix_chk' | loc:$root.lang}} </label>
                        <span> {{'and' | loc:$root.lang}} </span>
                      </div>
                        
                        <input id="caseChk" type="checkbox" ng-model="$ctrl.isCaseInsensitive" />
                        <label for="caseChk"> {{'case_insensitive' | loc:$root.lang}} </label>
                    </div>
                </form>
                <div id="similar_wrapper" ng-show="$ctrl.relatedObj">
                    <button
                        class="btn btn-sm btn-default"
                        ng-click="$ctrl.showAllRelated()"
                        ng-if="$ctrl.relatedObj.data.length != 0"
                    >
                        <span class="btn_header">{{ 'similar_header' | loc:$root.lang }} (SWE-FN)</span><br /><span
                            ng-repeat="wd in $ctrl.relatedObj.data[0].words | limitTo:$ctrl.relatedDefault"
                        >
                            {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                        ><br /><span
                            ng-repeat="wd in $ctrl.relatedObj.data[0].words.slice($ctrl.relatedDefault) | limitTo:$ctrl.relatedDefault"
                        >
                            {{$ctrl.stringifyRelated(wd)}}<span ng-if="!$last">, </span></span
                        ><span
                            ng-if="$ctrl.relatedObj.data[0].words.length > $ctrl.relatedDefault || $ctrl.relatedObj.data.length > 1"
                        >
                            ...</span
                        >
                    </button>
                    <div class="btn btn-sm btn-default" ng-if="$ctrl.relatedObj.data.length == 0">
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
        "$rootScope",
        "$scope",
        "$timeout",
        "$uibModal",
        "compareSearches",
        "searches",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $scope: IScope,
            $timeout: ITimeoutService,
            $uibModal: ui.bootstrap.IModalService,
            compareSearches: CompareSearches,
            searches: SearchesService
        ) {
            const ctrl = this as SimpleSearchController

            ctrl.disableLemgramAutocomplete = !settings.autocomplete

            statemachine.listen("lemgram_search", (event) => {
                ctrl.input = event.value
                ctrl.isRawInput = false
                ctrl.onChange(event.value, false)
            })

            /** Whether tokens should be matched in arbitrary order. */
            ctrl.freeOrder = false
            /** Whether the "free order" option is applicable. */
            ctrl.freeOrderEnabled = false
            ctrl.prefix = false
            ctrl.mid_comp = false
            ctrl.suffix = false
            ctrl.isCaseInsensitive = false

            if (settings.input_case_insensitive_default) {
                $location.search("isCaseInsensitive", "")
            }

            // triggers watch on activeSearch, via the Searches service
            ctrl.updateSearch = function () {
                $location.search("in_order", ctrl.freeOrder && ctrl.freeOrderEnabled ? false : null)
                $location.search("prefix", ctrl.prefix ? true : null)
                $location.search("mid_comp", ctrl.mid_comp ? true : null)
                $location.search("suffix", ctrl.suffix ? true : null)
                $location.search("isCaseInsensitive", ctrl.isCaseInsensitive ? true : null)
                $location.search("within", null)

                // Unset and set query in next time step in order to trigger changes correctly in the Searches service.
                $location.search("search", null)
                $location.replace()
                $timeout(function () {
                    if (ctrl.currentText) {
                        $location.search("search", `word|${ctrl.currentText}`)
                    } else if (ctrl.lemgram) {
                        $location.search("search", `lemgram|${ctrl.lemgram}`)
                    }
                    $location.search("page", null)
                }, 0)
                matomoSend("trackEvent", "Search", "Submit search", "Simple")
            }

            ctrl.getCQP = function () {
                let val = ""
                const currentText = (ctrl.currentText || "").trim()

                if (currentText) {
                    const suffix = ctrl.isCaseInsensitive ? " %c" : ""
                    const wordArray = currentText.split(" ")
                    const tokenArray = _.map(wordArray, (token) => {
                        const orParts: string[] = []

                        if (ctrl.mid_comp) {
                            orParts.push(`.*${token}.*`)
                        } else {
                            if (ctrl.prefix) {
                                orParts.push(token + ".*")
                            }
                            if (ctrl.suffix) {
                                orParts.push(".*" + token)
                            }
                            if (!ctrl.prefix && !ctrl.suffix) {
                                orParts.push(regescape(token))
                            }
                        }

                        const res = _.map(orParts, (orPart) => `word = "${orPart}"${suffix}`)
                        return `[${res.join(" | ")}]`
                    })
                    val = tokenArray.join(" ")
                } else if (ctrl.lemgram) {
                    const lemgram = ctrl.lemgram
                    val = `[lex contains "${lemgram}"`

                    // The complemgram attribute is a set of strings like: <part1>+<part2>+<...>:<probability>
                    if (ctrl.prefix) {
                        // Must match first part
                        val += ` | complemgram contains "${lemgram}\\+.*"`
                    }
                    if (ctrl.mid_comp) {
                        // Can be anywhere in the string, as long as it's surrounded by start, end or the "+" separator.
                        val += ` | complemgram contains "(.*\\+)?${lemgram}(\\+|:).*"`
                    }
                    if (ctrl.suffix) {
                        // Must match last part
                        val += ` | complemgram contains ".*\\+${lemgram}:.*"`
                    }
                    val += "]"
                }

                if ($rootScope.globalFilter) {
                    val = stringify(mergeCqpExprs(parse(val || "[]"), $rootScope.globalFilter))
                }

                return val
            }

            ctrl.onSearchSave = (name) => {
                compareSearches.saveSearch(name, ctrl.getCQP())
            }

            ctrl.stringifyRelated = (wd) => saldoToHtml(wd)

            ctrl.relatedDefault = 3

            ctrl.showAllRelated = () => {
                type ShowAllRelatedScope = IScope & {
                    stringifyRelatedHeader: (wd: string) => string
                    clickX: () => void
                    stringifyRelated: (wd: string) => string
                    relatedObj: any
                    clickRelated: (wd: string, attribute: string) => void
                }
                const scope = $rootScope.$new() as ShowAllRelatedScope
                scope.stringifyRelatedHeader = (wd) => wd.replace(/_/g, " ")
                scope.clickX = () => modalInstance.dismiss()
                scope.stringifyRelated = ctrl.stringifyRelated
                scope.relatedObj = ctrl.relatedObj
                scope.clickRelated = function (wd, attribute) {
                    if (modalInstance != null) {
                        modalInstance.close()
                    }
                    $rootScope.searchtabs()[1].tab.select()
                    const cqp =
                        attribute === "saldo"
                            ? `[saldo contains \"${regescape(wd)}\"]`
                            : `[sense rank_contains \"${regescape(wd)}\"]`

                    statemachine.send("SEARCH_CQP", { cqp } as CqpSearchEvent)
                }
                const modalInstance = $uibModal.open({
                    template: `\
                        <div class="modal-header">
                            <h3 class="modal-title">{{'similar_header' | loc:$root.lang}} (SWE-FN)</h3>
                            <span ng-click="clickX()" class="close-x">×</span>
                        </div>
                        <div class="modal-body">
                            <div ng-repeat="obj in relatedObj.data" class="col"><a target="_blank" ng-href="https://spraakbanken.gu.se/karp/#?mode=swefn&lexicon=swefn&amp;search=extended||and|sense|equals|swefn--{{obj.label}}" class="header">{{stringifyRelatedHeader(obj.label)}}</a>
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

            $rootScope.$watch("activeSearch", () => {
                const search = $rootScope.activeSearch
                if (!search) return

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
                    $rootScope.simpleCQP = expandOperators(ctrl.getCQP())
                    ctrl.updateFreeOrderEnabled()
                    ctrl.doSearch()
                }
            })

            // Reach to changes in URL params
            $scope.$watch(
                () => $location.search(),
                (search) => {
                    ctrl.freeOrder = search.in_order != null
                    ctrl.prefix = search.prefix != null
                    ctrl.mid_comp = search.mid_comp != null
                    ctrl.suffix = search.suffix != null
                    ctrl.isCaseInsensitive = search.isCaseInsensitive != null
                }
            )

            ctrl.onChange = (output, isRawOutput) => {
                if (isRawOutput) {
                    ctrl.currentText = output
                    ctrl.lemgram = undefined
                } else {
                    ctrl.lemgram = regescape(output)
                    ctrl.currentText = undefined
                }

                ctrl.updateFreeOrderEnabled()
            }

            ctrl.updateFreeOrderEnabled = () => {
                const cqpObjs = parse(ctrl.getCQP() || "[]")
                ctrl.freeOrderEnabled = supportsInOrder(cqpObjs)
            }

            ctrl.doSearch = function () {
                const search = $rootScope.activeSearch
                ctrl.relatedObj = undefined
                const cqp = ctrl.getCQP()
                searches.kwicSearch(cqp)

                if (search?.type === "lemgram") {
                    const attrExists = (name: string) =>
                        settings.corpusListing.selected.some((corpus) => name in corpus.attributes)
                    const sense = attrExists("sense")
                    const saldo = attrExists("saldo")

                    if (sense || saldo) {
                        relatedWordSearch(unregescape(search.val)).then((data) => {
                            // Lower some nasty words
                            if (data.length >= 2 && data[0].label == "Excreting") {
                                // Swap the first two elements
                                const [first, second, ...rest] = data
                                data = [second, first, ...rest]
                            }
                            $timeout(() => (ctrl.relatedObj = { data, attribute: sense ? "sense" : "saldo" }))
                        })
                    }
                }
            }
        },
    ],
})
