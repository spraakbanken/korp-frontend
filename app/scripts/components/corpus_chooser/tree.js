/** @format */
import * as treeUtil from "./util"

var collapsedImg = require("../../../img/collapsed.png")

export const ccTreeComponent = {
    template: `
    <div ng-class="{ 'cc-level-indent' : $ctrl.indent }">
        <div
            ng-if="!$ctrl.node.isRoot && $ctrl.node.contents"
            class="tree"
            ng-class="{ collapsed: !$ctrl.node.extended, extended: $ctrl.node.extended, disabled: $ctrl.node.limitedAccess }"
            >
            <img ng-click="$ctrl.toggleFolderVisibility($ctrl.node)" src="${collapsedImg}" alt="extend" class="ext cursor-pointer">
            <label 
                class="boxlabel cursor-pointer"
                ng-click="$ctrl.toggleFolderSelection($event, $ctrl.node)">
                <span class="checkbox" ng-class="{ checked: $ctrl.node.selected == 'all', unchecked: $ctrl.node.selected == 'none', intermediate: $ctrl.node.selected == 'some' }"></span>
                <span>{{ $ctrl.node.title }}</span>
                <span class="numberOfChildren">({{$ctrl.node.numberOfChildren}})</span>
            </label>
            <i 
                ng-click="$ctrl.showInfo($event, $ctrl.node)" 
                class="fa fa-lg fa-info-circle text-gray-700 float-right mr-2 mt-1 rounded-full bg-white"></i>
        </div>
        <div
            ng-if="!$ctrl.node.contents"
            class="boxdiv"
            ng-class="{ 'disabled cursor-default': !$ctrl.node.userHasAccess }"
            style="margin-left:16px; background-color: rgb(221, 233, 255)"
            ng-click="$ctrl.toggleCorpusSelection($event, $ctrl.node)"
            >
            <label class="px-2" 'cursor-pointer': $ctrl.node.userHasAccess }>
                <span class="checkbox" ng-class="{ checked: $ctrl.node.selected, unchecked: !$ctrl.node.selected }"></span>
                <span>{{$ctrl.node.title}}</span>
            </label>
            <i 
                ng-click="$ctrl.showInfo($event, $ctrl.node)" 
                class="fa fa-lg fa-info-circle text-gray-700 float-right mr-2 mt-1 rounded-full bg-white"></i>
        </div>

        <div ng-if="$ctrl.node.extended || $ctrl.node.isRoot" ng-repeat="node in $ctrl.children">
            <cc-tree node="node" indent="!$ctrl.node.isRoot" on-select="$ctrl.onChildSelect()" on-select-only="$ctrl.selectOnly(corporaIds)" on-show-info="$ctrl.onShowInfoLocal(node)" />
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
        function () {
            let $ctrl = this

            $ctrl.$onInit = function () {
                $ctrl.children = $ctrl.node ? _.concat($ctrl.node.subFolders || [], $ctrl.node.contents || []) : []
            }

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
