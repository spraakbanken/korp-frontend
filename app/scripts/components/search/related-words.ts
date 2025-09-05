import angular, { IScope, ui } from "angular"
import { html, regescape, splitFirst, unregescape } from "@/util"
import { Saldo } from "@/saldo"
import { CqpSearchEvent } from "@/statemachine/types"
import statemachine from "@/statemachine"
import { StoreService } from "@/services/store"
import { corpusListing } from "@/corpora/corpus_listing"
import { relatedWordSearch } from "@/backend/lexicons"
import { SwefnEntry } from "@/services/karp"

type RelatedWordsScope = IScope & {
    attribute: string
    frames: SwefnEntry[]
    isVisible: boolean
    limit: number
    open: () => void
    stringify: (saldo: string) => string
}

angular.module("korpApp").component("relatedWords", {
    template: html`
        <button class="btn btn-sm btn-default" ng-click="open()" ng-if="isVisible && frames.length">
            <span class="text-base">{{ 'similar_header' | loc:$root.lang }} (SweFN)</span>
            <br />
            <span ng-repeat="sense in frames[0].LUs | limitTo:limit">
                {{stringify(sense)}}<span ng-if="!$last">, </span>
            </span>
            <br />
            <span ng-repeat="sense in frames[0].LUs.slice(limit) | limitTo:limit">
                {{stringify(sense)}}<span ng-if="!$last">, </span></span
            >
            <span ng-if="frames[0].LUs.length > limit || frames.length > 1">...</span>
        </button>
        <div class="btn btn-sm btn-default" ng-if="isVisible && !frames.length">
            <span class="text-base">{{ 'similar_header' | loc:$root.lang }} (SWE-FN)</span><br /><span>
                {{'no_related_words' | loc:$root.lang}}
            </span>
        </div>
    `,
    controller: [
        "$scope",
        "$uibModal",
        "store",
        function ($scope: RelatedWordsScope, $uibModal: ui.bootstrap.IModalService, store: StoreService) {
            $scope.attribute = "sense"
            $scope.frames = []
            $scope.isVisible = false
            $scope.limit = 3
            $scope.stringify = (saldo) => Saldo.parse(saldo)?.toString() || saldo
            $scope.open = openModal

            // Update when a new simple search is made
            store.watch("activeSearch", async (search) => {
                if (!search?.type) return

                // Reset and hide until there are results.
                $scope.frames = []
                $scope.isVisible = false

                if (search.type != "lemgram") return

                // Find what name for the sense attribute is used by currently selected corpora.
                const attribute = ["sense", "saldo"].find((name) =>
                    corpusListing.selected.some((corpus) => name in corpus.attributes),
                )
                if (!attribute) return
                $scope.attribute = attribute

                const [, lemgram] = splitFirst("|", store.search!)
                const frames = await relatedWordSearch(unregescape(lemgram))
                $scope.$apply(() => {
                    $scope.frames = frames
                    $scope.isVisible = true
                })
            })

            function openModal() {
                type ShowAllScope = IScope & {
                    frames: SwefnEntry[]
                    stringifyHeader: (frameId: string) => string
                    stringify: (sense: string) => string
                    click: (sense: string) => void
                }
                const scope = $scope.$new() as ShowAllScope
                scope.frames = $scope.frames
                scope.stringifyHeader = (frameId) => frameId.replace(/_/g, " ")
                scope.stringify = $scope.stringify
                scope.click = (saldo) => {
                    modalInstance?.close()
                    const cqp =
                        $scope.attribute === "saldo"
                            ? `[saldo contains "${regescape(saldo)}"]`
                            : `[sense rank_contains "${regescape(saldo)}"]`

                    statemachine.send("SEARCH_CQP", { cqp } as CqpSearchEvent)
                }

                const modalInstance = $uibModal.open({
                    template: html`
                        <div class="modal-header">
                            <h3 class="modal-title">{{'similar_header' | loc:$root.lang}} (SWE-FN)</h3>
                            <span ng-click="$dismiss()" class="close-x">×</span>
                        </div>
                        <div class="modal-body">
                            <div ng-repeat="frame in frames" class="col">
                                <a
                                    target="_blank"
                                    ng-href="https://spraakbanken.gu.se/karp/?mode=swefn&lexicon=swefn&query=and(equals|swefnID|{{frame.swefnID}})"
                                    class="header"
                                >
                                    {{stringifyHeader(frame.swefnID)}}
                                </a>
                                <div class="list_wrapper">
                                    <ul>
                                        <li ng-repeat="sense in frame.LUs">
                                            <a ng-click="click(sense)" class="link">{{stringify(sense) + " "}}</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `,
                    scope,
                    size: "lg",
                    windowClass: "related",
                })
                // Ignore rejection from dismissing the modal
                modalInstance.result.catch(() => {})
            }
        },
    ],
})
