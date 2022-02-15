/** @format */
import statemachine from "@/statemachine"
import * as treeUtil from "./util"

export const corpusChooserComponent = {
    template: `
    <div class="absolute inset-0 bg-transparent"
        ng-click="$ctrl.showChooser = false"
        ng-if="$ctrl.showChooser"></div>
    <div id="corpusbox" class="scroll_checkboxes flex-shrink-0 ml-8">
        <div ng-click="$ctrl.showChooser = !$ctrl.showChooser" class="hp_topframe group flex justify-between items-center border border-gray-400 transition-all duration-500 hover_bg-blue-50 rounded h-12">
            <div ng-if="$ctrl.initialized">

                <span ng-if-start="$ctrl.selectCount != 1">{{ $ctrl.selectCount }}</span>
                <span>{{ 'corpselector_of' | loc:$root.lang }}</span>
                <span>{{ $ctrl.totalCount }}</span>
                <span ng-if-end>{{'corpselector_selectedmultiple' | loc:$root.lang }}</span>
                
                <span ng-if-start="$ctrl.selectCount == 1">{{ $ctrl.firstCorpus.title }}</span>
                <span ng-if-end>{{ 'corpselector_selectedone' | loc:$root.lang }}</span>
                
                <span style="color: #888888;">
                    — {{ $ctrl.suffixedNumbers($ctrl.selectedNumberOfTokens, $root.lang) }} {{ 'corpselector_of' | loc:$root.lang }} {{ $ctrl.suffixedNumbers($ctrl.totalNumberOfTokens, $root.lang) }} {{ 'corpselector_tokens' | loc:$root.lang }}
                </span>
            </div>
            <div ng-if="!$ctrl.initialized">
                <!-- TODO make this look nicer -->
                ...
            </div>
            <div class="transition-colors duration-500 group-hover_text-indigo-500">
                <i class="fa fa-caret-up relative top-2"></i>
                <br>
                <i class="fa fa-caret-down relative bottom-2"></i>
            </div>
        </div>
        <div ng-if="$ctrl.showChooser" class="popupchecks flex-shrink-0">
            <div class="header">
                <cc-time-graph />
                <div class="buttons">
                    <button ng-click="$ctrl.selectAll()" class="btn btn-default btn-sm selectall">
                        <span class="fa fa-check"></span>
                        <span>{{'corpselector_buttonselectall' | loc:$root.lang }}</span>
                    </button>
                    <button ng-click="$ctrl.selectNone()" class="btn btn-default btn-sm selectnone">
                        <span class="fa fa-times"></span>
                        <span>{{ 'corpselector_buttonselectnone' | loc:$root.lang }}</span>
                    </button>
                </div>
            </div>
            <!-- this is the beginning of the recursive component -->
            <cc-tree root="$ctrl.root" on-select="$ctrl.onSelect()" on-select-only="$ctrl.selectOnly(corporaIds)" />

            <p style="font-size: 85%;">
                {{ $ctrl.selectedNumberOfSentences | prettyNumber }} {{'corpselector_sentences_long' | loc:$root.lang}}
            </p>
          </div>
    </div>
    <script type="text/ng-template" id="chooserpopover.html">
        <div class="px-4">
            <h3 class="mb-6">
                <i class="fa fa-file-text-o text-blue-700" ng-if="$ctrl.isCorpus"></i>
                <i class="fa fa-folder-open-o text-blue-700" ng-if="$ctrl.isFolder"></i>
                {{ $ctrl.title }}
            </h3>
            <div class="text-base my-3" ng-bind-html="$ctrl.description | trust"></div>
            <ul class="border-l-4 border-blue-500 pl-3 leading-none space-y-1">
                <li ng-if="$ctrl.isFolder">
                    <strong>{{$ctrl.numberOfChildren}}</strong>
                    {{$ctrl.numberOfChildren == 1 ? 'corpselector_corporawith_sing' : 'corpselector_corporawith_plur' | loc:lang}}
                </li>
                <li ng-repeat-start="stats in $ctrl.langStats">
                    <strong>{{ stats.tokens | prettyNumber }}</strong>
                    {{ 'corpselector_tokens' | loc:lang }}
                    <span ng-if="$ctrl.langStats.length > 1">({{ stats.lang | loc:lang }})</span>
                </li>
                <li ng-repeat-end ng-if="stats.sentences > 0">
                    <strong>{{ stats.sentences | prettyNumber }}</strong>
                    {{ 'corpselector_sentences' | loc:lang }}
                    <span ng-if="$ctrl.langStats.length > 1">({{ stats.lang | loc:lang }})</span>
                </li>
            </ul>
            <div ng-if="$ctrl.context">{{'corpselector_supports' | loc:lang}}</div>
            <div ng-if="$ctrl.limitedAccess">{{'corpselector_limited' | loc:lang}}</div>
            <div class="text-sm mt-3" ng-if="$ctrl.isCorpus">
                <span class="mr-1">{{'corpselector_lastupdate' | loc:lang}}:</span>
                <span class="font-bold">{{ $ctrl.lastUpdated }}</span>
            </div>
        </div>
    </script>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        "$location",
        function ($rootScope, $location) {
            let $ctrl = this

            $ctrl.credentials = authenticationProxy.loginObj.credentials || []

            statemachine.listen("login", function () {
                $ctrl.credentials = authenticationProxy.loginObj.credentials
                // recalculate folder status and repaint it all
                $ctrl.updateLimitedAccess()
            })

            statemachine.listen("logout", function () {
                $ctrl.credentials = []
                let newCorpora = []
                for (let corpus of settings.corpusListing.getSelectedCorpora()) {
                    if (!settings.corpora[corpus].limitedAccess) {
                        newCorpora.push(corpus)
                    } else {
                        settings.corpora[corpus].selected = false
                    }
                }

                if (_.isEmpty(newCorpora)) {
                    newCorpora = settings.preselectedCorpora
                }
                settings.corpusListing.select(newCorpora)
                $ctrl.updateSelectedCount(newCorpora)
                $ctrl.updateLimitedAccess()
            })

            $ctrl.initialized = false
            $ctrl.showChooser = false

            // should be ON INFO-call done from statemachine
            $rootScope.$on("corpuschooserchange", (e, corpusIds) => {
                // change of corpora from outside the chooser
                // happens on initialzation when corpora is either decided by
                // settings.preselectedCorpora / URL query param
                if ($ctrl.initialized) {
                    return
                }

                $ctrl.initialized = true

                // remove the corpora with hide=true (linked corpora)
                const ccCorpora = Object.keys(settings.corpora).reduce((prev, current) => {
                    if (!settings.corpora[current].hide) {
                        prev[current] = settings.corpora[current]
                    }
                    return prev
                }, {})

                $ctrl.root = treeUtil.initCorpusStructure(ccCorpora, corpusIds)

                $ctrl.totalCount = Object.values(ccCorpora).length
                $ctrl.totalNumberOfTokens = $ctrl.root.tokens
                $ctrl.updateLimitedAccess()
                select(corpusIds)
            })

            $ctrl.updateSelectedCount = (selection) => {
                $ctrl.corpora = selection
                $ctrl.selectCount = selection.length
                $ctrl.selectedNumberOfTokens = 0
                $ctrl.selectedNumberOfSentences = 0
                for (const corpusId of selection) {
                    const corpus = settings.corpora[corpusId]
                    $ctrl.selectedNumberOfTokens += corpus.tokens
                    $ctrl.selectedNumberOfSentences += corpus.sentences
                }
            }

            $ctrl.suffixedNumbers = (num, lang) => {
                let out = ""
                if (num < 1000) {
                    // 232
                    out = num.toString()
                } else if (num >= 1000 && num < 1e6) {
                    // 232,21K
                    out = (num / 1000).toFixed(2).toString() + "K"
                } else if (num >= 1e6 && num < 1e9) {
                    // 232,21M
                    out = (num / 1e6).toFixed(2).toString() + "M"
                } else if (num >= 1e9 && num < 1e12) {
                    // 232,21G
                    out = (num / 1e9).toFixed(2).toString() + "G"
                } else if (num >= 1e12) {
                    // 232,21T
                    out = (num / 1e12).toFixed(2).toString() + "T"
                }
                return out.replace(".", util.getLocaleString("util_decimalseparator", lang))
            }

            $ctrl.onSelect = function () {
                const currentCorpora = treeUtil.getAllSelected($ctrl.root)
                select(currentCorpora)
            }

            $ctrl.selectAll = function () {
                select(_.map(Object.values(settings.corpora), (corpus) => corpus.id))
            }

            $ctrl.selectNone = function () {
                select([])
            }

            $ctrl.selectOnly = function (corporaIds) {
                select(corporaIds)
            }

            $ctrl.updateLimitedAccess = function () {
                treeUtil.updateLimitedAccess($ctrl.root, $ctrl.credentials)
            }

            function select(corporaIds) {
                const selection = treeUtil.filterCorporaOnCredentials(settings.corpora, corporaIds, $ctrl.credentials)
                treeUtil.recalcFolderStatus($ctrl.root)
                settings.corpusListing.select(selection)
                $ctrl.updateSelectedCount(selection)
                $rootScope.$broadcast("corpuschooserchange", selection)
                $location.search("corpus", selection.join(","))

                // used when there is only one corpus selected to show name
                $ctrl.firstCorpus = settings.corpora[selection[0]]
            }
        },
    ],
}
