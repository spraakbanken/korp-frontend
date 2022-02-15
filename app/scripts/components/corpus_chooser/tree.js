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
                    ng-class="{ collapsed: !folder.extended, extended: folder.extended, disabled: folder.limitedAccess }"
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
                ng-class="{ 'disabled cursor-default': !corpus.userHasAccess }"
                style="margin-left:16px; background-color: rgb(221, 233, 255)"
                ng-click="$ctrl.toggleCorpusSelection($event, corpus)"
                >
                <label class="px-2" 'cursor-pointer': corpus.userHasAccess }>
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
                if (folder.limitedAccess) {
                    folder.extended = !folder.extended
                    return
                }

                const corporaIds = treeUtil.getAllCorpora(folder)
                if (selectOnly(e)) {
                    $ctrl.selectOnly(corporaIds)
                } else {
                    const selectStatus = !["all", "some"].includes(folder.selected)
                    for (const corpusId of corporaIds) {
                        settings.corpora[corpusId].selected = selectStatus
                    }
                    $ctrl.onChildSelect()
                }
            }

            $ctrl.toggleCorpusSelection = (e, corpus) => {
                if (!corpus.userHasAccess) {
                    return
                }

                if (selectOnly(e)) {
                    $ctrl.selectOnly([corpus.id])
                } else {
                    corpus.selected = !corpus.selected
                    $ctrl.onChildSelect()
                }
            }

            function selectOnly(e) {
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                return (!isLinux && e.altKey) || (isLinux && e.ctrlKey)
            }

            $ctrl.onChildSelect = function () {
                $ctrl.onSelect()
            }

            $ctrl.selectOnly = function (corporaIds) {
                $ctrl.onSelectOnly({ corporaIds })
            }
        },
    ],
}
