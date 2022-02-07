/** @format */
import * as treeUtil from "./util"

var collapsedImg = require("../../../img/collapsed.png")

export const ccTreeComponent = {
    template: `
    <div ng-class="{ 'cc-level-indent' : $ctrl.indent }">
        <div ng-repeat="folder in $ctrl.root.subFolders">
            <cc-info-box object="folder">
                <div 
                    class="tree"
                    ng-class="{ collapsed: !folder.extended, extended: folder.extended }"
                    >
                    <img ng-click="$ctrl.toggleFolderVisibility(folder)" src="${collapsedImg}" alt="extend" class="ext cursor-pointer">
                    <label 
                        class="boxlabel cursor-pointer"
                        ng-click="$ctrl.toggleFolderSelection($event, folder)">
                        <span class="checkbox" ng-class="{ checked: folder.selected == 'all', unchecked: folder.selected == 'none', intermediate: folder.selected == 'some' }"></span>
                        <span>{{ folder.title }}</span>
                        <span class="numberOfChildren">({{folder.numberOfChildren}})</span>
                    </label>
                </div>
            </cc-info-box>
            <cc-tree ng-if="folder.extended" root="folder" indent="true" on-select="$ctrl.onChildSelect()" on-select-only="$ctrl.selectOnly(corporaIds)" />
        </div>
        
        <cc-info-box object="corpus" ng-repeat="corpus in $ctrl.root.contents">
            <div
                class="boxdiv"
                style="margin-left:16px; background-color: rgb(221, 233, 255)"
                >
                <label class="hplabel" ng-click="$ctrl.toggleCorpusSelection($event, corpus)" class="cursor-pointer">
                    <span class="checkbox" ng-class="{ checked: corpus.selected, unchecked: !corpus.selected }"></span>
                    <span>{{corpus.title}}</span>
                </label>
            </div>
        </cc-info-box>
    </div>
    `,
    bindings: {
        // do not change these directly, even though it is possible
        root: "<",
        indent: "<",
        onSelect: "&",
        onSelectOnly: "&",
    },
    controller: [
        function () {
            let $ctrl = this

            $ctrl.$onInit = function () {}

            $ctrl.toggleFolderVisibility = (folder) => {
                folder.extended = !folder.extended
            }

            $ctrl.toggleFolderSelection = (e, folder) => {
                if (selectOnly(e)) {
                    const corporaIds = treeUtil.getAllCorpora(folder)
                    $ctrl.selectOnly(corporaIds)
                } else {
                    function recurse(folder, selectStatus) {
                        folder.selected = selectStatus
                        _.map(folder.contents, (corpus) => {
                            corpus.selected = selectStatus == "all"
                        })
                        _.map(folder.subFolders, (folder) => {
                            recurse(folder, selectStatus)
                        })
                    }

                    recurse(folder, folder.selected == "all" ? "none" : "all")
                    $ctrl.onLocalSelect()
                }
            }

            $ctrl.toggleCorpusSelection = (e, corpus) => {
                if (selectOnly(e)) {
                    $ctrl.selectOnly([corpus.id])
                } else {
                    corpus.selected = !corpus.selected
                    $ctrl.onLocalSelect()
                }
            }

            function selectOnly(e) {
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                return (!isLinux && e.altKey) || (isLinux && e.ctrlKey)
            }

            // TODO why this weird duplication??
            $ctrl.onLocalSelect = function () {
                $ctrl.root.selected = treeUtil.getFolderSelectStatus($ctrl.root)
                $ctrl.onSelect()
            }

            // TODO why this weird duplication??
            $ctrl.onChildSelect = function () {
                $ctrl.root.selected = treeUtil.getFolderSelectStatus($ctrl.root)
                $ctrl.onSelect()
            }

            $ctrl.selectOnly = function (corporaIds) {
                $ctrl.onSelectOnly({ corporaIds })
            }
        },
    ],
}
