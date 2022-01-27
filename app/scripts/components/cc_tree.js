/** @format */
var collapsedImg = require("../../img/collapsed.png")

/*

TODO 

- make one optimized pass over the structure each time a corpora/folder is selected/unselected and update select-flags

*/

export const ccTreeComponent = {
    template: `
    <div ng-class="{ 'cc-level-indent' : $ctrl.indent }">
        <div ng-click="folder.extended = true" ng-repeat="folder in $ctrl.folders" class="tree" ng-class="{ collapsed: !folder.extended, extended: folder.extended }">
            <img src="${collapsedImg}" alt="extend" class="ext">
            <label class="boxlabel">
                <span class="checkbox" ng-class="{ checked: folder.selected, unchecked: !folder.selected }"></span>
                <span>{{ folder.title }}</span>
                <span class="numberOfChildren">({{folder.numberOfChildren}})</span>
            </label>

            <cc-tree ng-if="folder.extended" folders="folder.subFolders" corpora-ids="folder.contents" indent="true" />
        </div>
        <div ng-repeat="corpus in $ctrl.corpora" class="boxdiv" style="margin-left:16px; background-color: rgb(221, 233, 255)">
            <label class="hplabel">
                <span class="checkbox" ng-class="{ checked: corpus.selected, unchecked: !corpus.selected }"></span>
                <span>{{corpus.title}}</span>
            </label>
        </div>
    </div>
    `,
    bindings: {
        // do not change these directly, even though it is possible
        folders: "<",
        corporaIds: "<",
        indent: "<",
        onSelect: "&",
        // this is probably not needed, can be handled internally
        // but collapsing and uncollapsing could be practial to do from outside
        onCollapse: "&",
    },
    controller: [
        "$element",
        "utils",
        "$rootScope",
        "$compile",
        "$controller",
        function ($element, utils, $rootScope, $compile, $controller) {
            let $ctrl = this

            $ctrl.$onInit = function () {
                $ctrl.corpora = _.map($ctrl.corporaIds, (corpusId) => settings.corpora[corpusId])

                for (const folder of $ctrl.folders) {
                    folder.subFolders = []
                    _.map(folder, (value, key) => {
                        if (!["title", "description", "contents", "numberOfChildren", "subFolders"].includes(key)) {
                            folder.subFolders.push(value)
                        }
                    })
                }
            }
        },
    ],
}
