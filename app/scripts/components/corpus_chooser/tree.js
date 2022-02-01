/** @format */
import { getFolderSelectStatus } from "./util"

var collapsedImg = require("../../../img/collapsed.png")

export const ccTreeComponent = {
    template: `
    <div ng-class="{ 'cc-level-indent' : $ctrl.indent }">
        <div ng-repeat="folder in $ctrl.root.subFolders" class="tree" ng-class="{ collapsed: !folder.extended, extended: folder.extended }">
            <img ng-click="$ctrl.toggleFolderVisibility(folder)" src="${collapsedImg}" alt="extend" class="ext cursor-pointer">
            <label class="boxlabel cursor-pointer" ng-click="$ctrl.toggleFolderSelection(folder)">
                <span class="checkbox" ng-class="{ checked: folder.selected == 'all', unchecked: folder.selected == 'none', intermediate: folder.selected == 'some' }"></span>
                <span>{{ folder.title }}</span>
                <span class="numberOfChildren">({{folder.numberOfChildren}})</span>
            </label>

            <cc-tree ng-if="folder.extended" root="folder" indent="true" on-select="$ctrl.onChildSelect()"/>
        </div>
        <div ng-repeat="corpus in $ctrl.root.contents" class="boxdiv" style="margin-left:16px; background-color: rgb(221, 233, 255)">
            <label class="hplabel" ng-click="$ctrl.toggleCorpusSelection(corpus)" class="cursor-pointer">
                <span class="checkbox" ng-class="{ checked: corpus.selected, unchecked: !corpus.selected }"></span>
                <span>{{corpus.title}}</span>
            </label>
        </div>
    </div>
    `,
    bindings: {
        // do not change these directly, even though it is possible
        root: "<",
        indent: "<",
        onSelect: "&",
        // this is probably not needed, can be handled internally
        // but collapsing and uncollapsing could be practial to do from outside
        onCollapse: "&",
    },
    controller: [
        function () {
            let $ctrl = this

            $ctrl.$onInit = function () {}

            $ctrl.toggleFolderVisibility = (folder) => {
                folder.extended = !folder.extended
            }

            $ctrl.toggleFolderSelection = (folder) => {
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

            $ctrl.toggleCorpusSelection = (corpus) => {
                corpus.selected = !corpus.selected
                $ctrl.onLocalSelect()

                // here a corpus chooser event must go out
                // but it could wait until the corpus chooser component is closed
            }

            // TODO why this weird duplication??
            $ctrl.onLocalSelect = function () {
                $ctrl.root.selected = getFolderSelectStatus($ctrl.root)
                $ctrl.onSelect()
            }

            // TODO why this weird duplication??
            $ctrl.onChildSelect = function () {
                $ctrl.root.selected = getFolderSelectStatus($ctrl.root)
                $ctrl.onSelect()
            }
        },
    ],
}
