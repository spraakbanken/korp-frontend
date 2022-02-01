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

                <span ng-if-start="$ctrl.selectCount > 1">{{ $ctrl.selectCount }}</span>
                <span>{{ 'corpselector_of' | loc:$root.lang }}</span>
                <span>{{ $ctrl.totalCount }}</span>
                <span ng-if-end>{{'corpselector_selectedmultiple' | loc:$root.lang }}</span>
                
                <span ng-if-start="$ctrl.selectCount == 1">{{ $ctrl.corpora[0].title }}</span>
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
            <cc-tree root="$ctrl.root" on-select="$ctrl.onSelect()"/>

            <p style="font-size: 85%;">
                {{ $ctrl.numberOfSentencesStr() }} {{'corpselector_sentences_long' | loc:$root.lang}}
            </p>
          </div>
    </div>
    `,
    bindings: {},
    controller: [
        "$rootScope",
        function ($rootScope) {
            let $ctrl = this

            statemachine.listen("login", function (data) {
                // Do something here
            })

            statemachine.listen("logout", function (data) {
                // Do something here
            })

            $ctrl.initialized = false
            $ctrl.showChooser = false

            // should be ON INFO-call done from statemachine
            $rootScope.$on("corpuschooserchange", (e, corpora) => {
                // change of corpora from outside the chooser
                // happens on initialzation when corpora is either decided by
                // settings.preselectedCorpora / URL query param
                if ($ctrl.initialized) {
                    return
                }

                $ctrl.initialized = true
                $ctrl.selectCount = settings.corpusListing.selected.length
                $ctrl.corpora = settings.corpusListing.selected
                $ctrl.totalCount = settings.corpusListing.corpora.length

                $ctrl.selectedNumberOfTokens = 0
                for (const corpus of settings.corpusListing.selected) {
                    $ctrl.selectedNumberOfTokens += parseInt(corpus["info"]["Size"])
                }

                $ctrl.totalNumberOfTokens = 0
                for (const corpus of settings.corpusListing.corpora) {
                    $ctrl.totalNumberOfTokens += parseInt(corpus["info"]["Size"])
                }

                $ctrl.root = treeUtil.initCorpusStructure(corpora)
            })

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

            $ctrl.numberOfSentencesStr = () => {
                return "161 233 118"
            }

            $ctrl.onSelect = function () {
                const currentCorpora = treeUtil.findAllSelected($ctrl.root)
                select(currentCorpora)
            }

            $ctrl.selectAll = function () {
                treeUtil.selectAll($ctrl.root)
                select(_.map(Object.values(settings.corpora), (corpus) => corpus.id))
            }

            $ctrl.selectNone = function () {
                treeUtil.selectNone($ctrl.root)
                select([])
            }

            function select(corpora) {
                settings.corpusListing.select(corpora)
                $rootScope.$broadcast("corpuschooserchange", corpora)
            }
        },
    ],
}
