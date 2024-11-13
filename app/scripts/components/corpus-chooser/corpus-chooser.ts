/** @format */
import angular, { IController } from "angular"
import _ from "lodash"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { getCredentials } from "@/components/auth/auth"
import { html, suffixedNumbers } from "@/util"
import {
    ChooserFolderRoot,
    ChooserFolderSub,
    filterCorporaOnCredentials,
    getAllSelected,
    initCorpusStructure,
    recalcFolderStatus,
    updateLimitedAccess,
} from "./util"
import "@/components/corpus-chooser/corpus-time-graph"
import "@/components/corpus-chooser/info-box"
import "@/components/corpus-chooser/tree"
import { RootScope } from "@/root-scope.types"
import { LocationService } from "@/urlparams"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { LangString } from "@/i18n/types"

type CorpusChooserController = IController & {
    credentials: string[]
    firstCorpus: LangString
    /** Traverse corpora and determine if each is available to the user */
    updateLimitedAccess: () => void
    /** Updates selectCount, selectedNumberOfTokens and selectedNumberOfSentences */
    updateSelectedCount: (ids: string[]) => void
    initialized: boolean
    showChooser: boolean
    showTimeGraph: boolean
    showInfoBox: boolean
    selectedNumberOfTokens: number
    selectedNumberOfSentences: number
    infoNode?: ChooserFolderSub | CorpusTransformed
    /** UI handler for opening selector */
    onShowChooser: () => void
    /** UI handler for collapsing selector */
    closeChooser: () => void
    root: ChooserFolderRoot
    totalCount: number
    totalNumberOfTokens: number
    /** Handle the on-select event of the cc-tree component */
    onSelect: () => void
    /** Handle clicking "Select all" */
    selectAll: () => void
    /** Handle clicking "Select none" */
    selectNone: () => void
    /** Handle the on-select-only event of the cc-tree component */
    selectOnly: (ids: string[]) => void
}

angular.module("korpApp").component("corpusChooser", {
    template: html`
        <div
            class="absolute inset-0 bg-transparent z-50"
            ng-click="$ctrl.closeChooser()"
            ng-if="$ctrl.showChooser"
        ></div>
        <div class="scroll_checkboxes shrink-0" ng-class="{'cursor-pointer': $ctrl.initialized}">
            <div
                ng-click="$ctrl.onShowChooser()"
                class="hp_topframe no-underline flex justify-between items-center border border-gray-400 transition-all duration-500 hover:bg-blue-50 rounded h-12"
            >
                <div ng-if="$ctrl.initialized">
                    <span ng-if-start="$ctrl.selectCount != 1">{{ $ctrl.selectCount }}</span>
                    <span>{{ 'corpselector_of' | loc }}</span>
                    <span>{{ $ctrl.totalCount }}</span>
                    <span ng-if-end>{{'corpselector_selectedmultiple' | loc:$root.lang }}</span>

                    <span ng-if-start="$ctrl.selectCount == 1"
                        >{{ $ctrl.firstCorpus | locObj:$root.lang | maxLength}}</span
                    >
                    <span ng-if-end>{{ 'corpselector_selectedone' | loc:$root.lang }}</span>

                    <span class="text-gray-600">
                        — {{ $ctrl.suffixedNumbers($ctrl.selectedNumberOfTokens, $root.lang) }} {{ 'corpselector_of' |
                        loc:$root.lang }} {{ $ctrl.suffixedNumbers($ctrl.totalNumberOfTokens, $root.lang) }} {{
                        'corpselector_tokens' | loc:$root.lang }}
                    </span>
                </div>
                <div ng-if="!$ctrl.initialized">
                    <i class="fa-solid fa-spinner fa-pulse"></i>
                </div>
                <div class="transition-colors duration-500">
                    <i class="fa-solid fa-caret-up relative top-2"></i>
                    <br />
                    <i class="fa-solid fa-caret-down relative bottom-2"></i>
                </div>
            </div>
            <div ng-if="$ctrl.showChooser" class="corpus-chooser flex bg-white">
                <div class="popupchecks shrink-0 p-4 h-full">
                    <div class="flex">
                        <corpus-time-graph ng-if="$ctrl.showTimeGraph"></corpus-time-graph>
                        <div class="p-2">
                            <button ng-click="$ctrl.selectAll()" class="btn btn-default btn-sm w-full mb-2">
                                <span class="fa-solid fa-check"></span>
                                <span>{{'corpselector_buttonselectall' | loc:$root.lang }}</span>
                            </button>
                            <button ng-click="$ctrl.selectNone()" class="btn btn-default btn-sm w-full">
                                <span class="fa-solid fa-times"></span>
                                <span>{{ 'corpselector_buttonselectnone' | loc:$root.lang }}</span>
                            </button>
                        </div>
                    </div>
                    <!-- this is the beginning of the recursive component -->
                    <cc-tree
                        node="$ctrl.root"
                        on-select="$ctrl.onSelect()"
                        on-select-only="$ctrl.selectOnly(corporaIds)"
                        on-show-info="$ctrl.onShowInfo(node)"
                    ></cc-tree>

                    <p class="text-sm pb-4">
                        {{ $ctrl.selectedNumberOfSentences | prettyNumber }} {{'corpselector_sentences_long' |
                        loc:$root.lang}}
                    </p>
                </div>
                <cc-info-box
                    ng-if="$ctrl.showInfoBox"
                    class="sticky top-0 bg-gray-100 overflow-auto"
                    style="width: 480px;"
                    object="$ctrl.infoNode"
                ></cc-info-box>
            </div>
        </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$location",
        function ($rootScope: RootScope, $location: LocationService) {
            const $ctrl = this as CorpusChooserController

            statemachine.listen("login", function () {
                $ctrl.credentials = getCredentials()
                $ctrl.updateLimitedAccess()
            })

            statemachine.listen("logout", function () {
                $ctrl.credentials = []
                // Unselect restricted corpora
                for (const corpus of Object.values(settings.corpora))
                    corpus.selected = corpus.selected && !corpus.limited_access
                // Select those, or if none remain, fall back to default selection
                const remaining = Object.keys(_.pickBy(settings.corpora, (corpus) => corpus.selected))
                const toSelect = remaining.length ? remaining : settings.preselected_corpora || []
                // Apply selection
                settings.corpusListing.select(toSelect)
                $ctrl.updateSelectedCount(toSelect)
                $ctrl.updateLimitedAccess()
            })

            $ctrl.initialized = false
            $ctrl.showChooser = false
            $ctrl.showTimeGraph = settings.has_timespan || false

            $ctrl.onShowChooser = () => {
                // don't open the chooser unless the info-call is done
                if ($ctrl.initialized) {
                    $ctrl.showChooser = !$ctrl.showChooser
                }
            }

            $ctrl.closeChooser = () => {
                $ctrl.showChooser = false
                $ctrl.showInfoBox = false
                $ctrl.infoNode = undefined
            }

            // should be ON INFO-call done from statemachine)
            $rootScope.$on("initialcorpuschooserchange", (e, corpusIds) => {
                $ctrl.credentials = getCredentials()
                $ctrl.initialized = true

                // remove the corpora with hide=true (linked corpora)
                const ccCorpora = _.omitBy(settings.corpora, "hide")

                $ctrl.root = initCorpusStructure(ccCorpora, corpusIds)

                $ctrl.totalCount = $ctrl.root.numberOfChildren
                $ctrl.totalNumberOfTokens = $ctrl.root.tokens
                $ctrl.updateLimitedAccess()
                select(corpusIds, true)

                // Sync when corpus selection is modified elsewhere.
                $rootScope.$watch(
                    () => $location.search().corpus,
                    (corpusIdsComma) => {
                        const corpusIds = corpusIdsComma ? corpusIdsComma.split(",") : []
                        select(corpusIds)
                    }
                )
                $rootScope.$on("corpuschooserchange", (e, selected) => select(selected))
            })

            $ctrl.updateSelectedCount = (selection) => {
                $ctrl.selectCount = selection.length
                $ctrl.selectedNumberOfTokens = 0
                $ctrl.selectedNumberOfSentences = 0
                for (const corpusId of selection) {
                    const corpus = settings.corpora[corpusId]
                    $ctrl.selectedNumberOfTokens += corpus.tokens!
                    $ctrl.selectedNumberOfSentences += corpus.sentences!
                }
            }

            $ctrl.suffixedNumbers = suffixedNumbers

            $ctrl.onSelect = function () {
                const currentCorpora = getAllSelected($ctrl.root)
                select(currentCorpora)
            }

            $ctrl.selectAll = function () {
                select(Object.values(settings.corpora).map((corpus) => corpus.id))
            }

            $ctrl.selectNone = function () {
                select([])
            }

            $ctrl.selectOnly = function (corporaIds) {
                select(corporaIds)
            }

            $ctrl.updateLimitedAccess = function () {
                if ($ctrl.root) {
                    updateLimitedAccess($ctrl.root, $ctrl.credentials)
                }
            }

            function select(corporaIds: string[], force?: boolean) {
                // Exit if no actual change
                const selectedIds = settings.corpusListing.mapSelectedCorpora((corpus) => corpus.id)
                if (!force && _.isEqual(corporaIds, selectedIds)) return

                const selection = filterCorporaOnCredentials(
                    Object.values(settings.corpora),
                    corporaIds,
                    $ctrl.credentials
                )

                recalcFolderStatus($ctrl.root)
                $ctrl.updateSelectedCount(selection)
                // used when there is only one corpus selected to show name
                if (selection.length == 1) {
                    $ctrl.firstCorpus = settings.corpora[selection[0]].title
                }

                settings.corpusListing.select(selection)
                $rootScope.$broadcast("corpuschooserchange", selection)
                $location.search("corpus", selection.join(","))
            }

            $ctrl.onShowInfo = (node: ChooserFolderSub | CorpusTransformed) => {
                $ctrl.showInfoBox = node.id != $ctrl.infoNode?.id
                $ctrl.infoNode = $ctrl.showInfoBox ? node : undefined
            }
        },
    ],
})
