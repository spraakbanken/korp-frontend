/** @format */
import statemachine from "../statemachine"

export const corpusChooserComponent = {
    template: `
    <div id="corpusbox" class="scroll_checkboxes flex-shrink-0 ml-8">
        <div ng-click="$ctrl.openChooser()" class="hp_topframe buttonlink group flex justify-between items-center border border-gray-400 transition-all duration-500 hover_bg-blue-50 shadow-inset rounded h-12 ui-corner-top">
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
        <div class="popupchecks ui-corner-bottom flex-shrink-0" ng-if="$ctrl.showChooser" style="position: absolute; top: 128.781px; left: 369.5px;">
            <div class="header">
                <small-time-graph />
                <div class="buttons">
                    <button class="btn btn-default btn-sm selectall">
                        <span class="fa fa-check"></span>
                        <span>{{'corpselector_buttonselectall' | loc:$root.lang }}</span>
                    </button>
                    <button class="btn btn-default btn-sm selectnone">
                        <span class="fa fa-times"></span>
                        <span>{{ 'corpselector_buttonselectnone' | loc:$root.lang }}</span>
                    </button>
                </div>
            </div>
            <!-- this is the beginning of the recursive component -->
            <cc-tree folders="$ctrl.topFolders" corpora-ids="$ctrl.topCorpora" />

            <p style="font-size: 85%;">
                {{ $ctrl.numberOfSentencesStr() }} {{'corpselector_sentences_long' | loc:$root.lang}}
            </p>
          </div>
    </div>
    `,
    bindings: {},
    controller: [
        "$element",
        "utils",
        "$rootScope",
        "$compile",
        "$controller",
        function ($element, utils, $rootScope, $compile, $controller) {
            let $ctrl = this

            statemachine.listen("login", function (data) {
                // Do something here
            })

            statemachine.listen("logout", function (data) {
                // Do something here
            })

            $ctrl.initialized = false
            $ctrl.showChooser = false

            $rootScope.$on("corpuschooserchange", () => {
                // change of corpora from outside the chooser
                // happens on initialzation when corpora is either decided by
                // settings.preselectedCorpora / URL query param

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

                // this does not change so should only be done once

                $ctrl.topFolders = _.map(settings.corporafolders, (value) => value)
                $ctrl.topCorpora = getTopLevelCorpora()
            })

            $ctrl.openChooser = () => {
                $ctrl.showChooser = true
            }

            $ctrl.closeChooser = () => {
                $ctrl.showChooser = false
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

            $ctrl.numberOfSentencesStr = () => {
                return "161 233 118"
            }
        },
    ],
}

function getTopLevelCorpora() {
    function getCorporaInFolders(folder) {
        let result = folder.contents
        _.map(folder, (value, key) => {
            if (!["title", "description", "contents"].includes(key)) {
                // is a folder
                const corpora = getCorporaInFolders(value)
                result = result.concat(corpora)
            }
        })

        // TODO this is an unexpected side effect, refactor
        folder.numberOfChildren = result.length

        return result
    }

    const folderCorpora = _.flatten(_.map(settings.corporafolders, (value) => getCorporaInFolders(value)))
    return _.map(
        _.filter(settings.corpora, (corpus) => !folderCorpora.includes(corpus.id)),
        (corpus) => corpus.id
    )
}
