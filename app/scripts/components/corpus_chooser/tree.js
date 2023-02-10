/** @format */
import * as treeUtil from "./util"

var collapsedImg = require("../../../img/collapsed.png")

export const ccTreeComponent = {
    template: `
    <div ng-class="{ 'cc-level-indent' : $ctrl.indent }">
        <div ng-repeat="folder in $ctrl.sortedFolders"
            class="tree relative"
            ng-class="{ collapsed: !folder.extended, extended: folder.extended, disabled: folder['limited_access'] }"
            >
            <img ng-click="$ctrl.toggleFolderVisibility(folder)" src="${collapsedImg}" alt="extend" class="ext cursor-pointer">
            <label 
                class="boxlabel cursor-pointer"
                ng-click="$ctrl.toggleFolderSelection($event, folder)">
                <span class="checkbox" ng-class="{ checked: folder.selected == 'all', unchecked: folder.selected == 'none', intermediate: folder.selected == 'some' }"></span>
                <span>{{ folder.title | locObj:$root.lang }}</span>
                <span class="numberOfChildren">({{folder.numberOfChildren}})</span>
            </label>
            <i 
                ng-click="$ctrl.showInfo($event, folder)" 
                class="fa-solid text-xl fa-info-circle text-gray-700 mt-1 rounded-full bg-white text-blue-500 absolute right-2"></i>
            <cc-tree ng-if="folder.extended" node="folder" indent="true" on-select="$ctrl.onChildSelect()" on-select-only="$ctrl.selectOnly(corporaIds)" on-show-info="$ctrl.onShowInfoLocal(node)"></cc-tree>
        </div>
        <div ng-repeat="corpus in $ctrl.sortedCorpora"
            class="boxdiv relative"
            ng-class="{ 'disabled cursor-default': !corpus.userHasAccess }"
            style="margin-left:16px; background-color: rgb(221, 233, 255)"
            ng-click="$ctrl.toggleCorpusSelection($event, corpus)"
            >
            <label class="px-2" 'cursor-pointer': corpus.userHasAccess }>
                <span class="checkbox" ng-class="{ checked: corpus.selected, unchecked: !corpus.selected }"></span>
                <span>{{ corpus.title | locObj:$root.lang }}</span>
            </label>
            <i ng-if="corpus['limited_access'] && corpus.userHasAccess" class="fa-solid fa-unlock"></i>
            <i 
                ng-click="$ctrl.showInfo($event, corpus)" 
                class="fa-solid text-xl fa-info-circle text-gray-700 mt-1 rounded-full bg-white text-blue-500 absolute right-2"></i>
        </div>
    </div>
    `,
    bindings: {
        node: "<",
        indent: "<",
        onSelect: "&",
        onSelectOnly: "&",
        onShowInfo: "&",
    },
    controller: [
        "$rootScope",
        "$scope",
        function ($rootScope, $scope) {
            let $ctrl = this

            $ctrl.$onInit = () => {
                function sort(nodes) {
                    return util.collatorSort(nodes, "title", $rootScope.lang)
                }
                $ctrl.sortedCorpora = sort($ctrl.node.corpora)
                $ctrl.sortedFolders = sort($ctrl.node.subFolders)
            }

            $ctrl.toggleFolderVisibility = (folder) => {
                folder.extended = !folder.extended
            }

            $ctrl.toggleFolderSelection = (e, folder) => {
                if (folder["limited_access"]) {
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

            $ctrl.showInfo = (e, node) => {
                e.stopPropagation()
                $ctrl.onShowInfo({ node })
            }

            // this one is needed for passing the node back to the corpus chooser component
            $ctrl.onShowInfoLocal = (node) => {
                $ctrl.onShowInfo({ node })
            }
        },
    ],
}
