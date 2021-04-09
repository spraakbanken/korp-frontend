/** @format */

import statemachine from "../statemachine"

let html = String.raw

function* getChildren(folder, deep = true) {
    let children = [...(folder.children || []), ...(folder.leafs || [])]
    while (children.length > 0) {
        // breadth-first traversal
        let child = children.shift()
        yield child
        if (deep) {
            children = [...children, ...(child.children || []), ...(child.leafs || [])]
        }
    }
}
function* getParents(folder) {
    if (folder.parent) {
        yield folder.parent
        yield* getParents(folder.parent)
    }
}
let correctState = (folder) => {
    let childSelected = Array.from(getChildren(folder, false)).map((child) => child.selected)
    let childIndeterminate = Array.from(getChildren(folder, false)).map(
        (child) => child.isIndeterminate
    )

    folder.isIndeterminate =
        (childSelected.some(Boolean) && !childSelected.every(Boolean)) ||
        childIndeterminate.some(Boolean)

    folder.selected = childSelected.every(Boolean)
}

export const chooserNodeName = "chooserNode"
export const corpusChooserNodeComponent = {
    template: html`
        <div class="">
            <span
                ng-if="$ctrl.folder.id != 'root'"
                class="cursor-pointer hover_bg-indigo-200 pr-2 flex items-center w-full"
                uib-popover-template="'chooserpopover.html'"
                popover-popup-delay="500"
                popover-placement="right"
                popover-trigger="'mouseenter'"
            >
                <span
                    class="py-1 pl-2 pr-4 -my-2 w-5 flex"
                    ng-click="$ctrl.folder.isOpen = !$ctrl.folder.isOpen"
                >
                    <span
                        class="inline-block transition-transform duration-200 transform text-blue-500"
                        ng-class="{'rotate-90': $ctrl.folder.isOpen}"
                        ng-if="!$ctrl.folder.isLeaf"
                    >
                        <i class="fa fa-caret-right fa-lg"></i>
                    </span>
                </span>
                <input
                    class="static mr-2"
                    ng-if="!$ctrl.folder.isLeaf || ($ctrl.folder.isLeaf && !$ctrl.folder.corpus.limitedAccess)"
                    type="checkbox"
                    id="{{$ctrl.folder.id}}"
                    ng-checked="$ctrl.folder.selected"
                    ng-click="$ctrl.toggleSelected($event, $ctrl.folder)"
                    indeterminate="$ctrl.folder.isIndeterminate"
                />
                <i
                    ng-if="$ctrl.folder.isLeaf && $ctrl.folder.corpus.limitedAccess"
                    class="fa fa-lock mr-2"
                >
                </i>
                <label class="mr-1 flex-grow" for="{{$ctrl.folder.id}}">
                    {{$ctrl.folder.label}}
                    <span ng-if="$ctrl.folder.numChildren" class="text-gray-500">
                        ({{$ctrl.folder.numChildren}})
                    </span>
                </label>
            </span>
            <ul
                class="m-0"
                ng-class="{ 'ml-4': $ctrl.folder.id != 'root'}"
                ng-if="$ctrl.folder.isOpen && ($ctrl.folder.children.length || $ctrl.folder.leafs.length)"
            >
                <li ng-repeat="subfolder in $ctrl.folder.children">
                    <chooser-node folder="subfolder"></chooser-node>
                </li>
                <li class="w-full flex items-center" ng-repeat="leaf in $ctrl.folder.leafs">
                    <chooser-node class="w-full" folder="leaf"></chooser-node>
                </li>
            </ul>
        </div>
    `,
    bindings: {
        folder: "<",
    },
    controller: [
        "$scope",
        "$element",
        "$timeout",
        function controller($scope, $element, $timeout) {
            let $ctrl = this

            $ctrl.toggleSelected = ($event, folder) => {
                let root = _.last(Array.from(getParents(folder)))
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                let newSelected = !folder.selected

                if ((!isLinux && $event.altKey) || (isLinux && $event.ctrlKey)) {
                    for (let child of getChildren(root)) {
                        child.selected = false
                        child.isIndeterminate = false
                    }
                    newSelected = true
                    folder.selected = true
                }
                // don't ask me
                $timeout(() => (folder.selected = newSelected), 0)
                folder.selected = newSelected
                folder.isIndeterminate = false

                for (let child of getChildren(folder)) {
                    child.selected = newSelected
                    child.isIndeterminate = false
                }

                for (let parent of getParents(folder)) {
                    correctState(parent)
                }

                let selected = []
                for (let child of getChildren(root)) {
                    if (child.isLeaf && child.selected) {
                        selected.push(child.id)
                    }
                }
                // because the darned checkbox is going to flip my current
                // value, i should leave it as the opposite of what I want.
                folder.selected = !folder.selected

                statemachine.send({
                    type: "CORPUSCHOOSER_CHANGE",
                    corpora: selected,
                })
            }
            function getLeafs() {
                return [$ctrl.folder, ...Array.from(getChildren($ctrl.folder))].filter(
                    (node) => node.isLeaf
                )
            }
            $ctrl.getSentences = () => {
                return _.sumBy(getLeafs(), (node) => Number(node.corpus.info.Sentences))
            }
            $ctrl.getTokens = () => {
                return _.sumBy(getLeafs(), (node) => Number(node.corpus.info.Size))
            }
        },
    ],
}
export const chooserName = "corpuschooser"
export const corpusChooserComponent = {
    template: html` <div>
            <script type="text/ng-template" id="chooserpopover.html">
                <div class="px-4">
                    <h3 class="mb-6">
                        <i class="fa fa-file-text-o text-blue-700" ng-if="$ctrl.folder.isLeaf"></i>
                        <i class="fa fa-folder-open-o text-blue-700" ng-if="!$ctrl.folder.isLeaf"></i>
                        {{$ctrl.folder.label}}
                    </h3>
                    <div class="text-base my-3" ng-if="$ctrl.folder.description" ng-bind-html="$ctrl.folder.description | trust"></div>
                    <ul class="border-l-4 border-blue-500 pl-3 leading-none space-y-1">
                        <li ng-if="!$ctrl.folder.isLeaf">
                            <strong>{{$ctrl.folder.numChildren}}</strong>
                            {{$ctrl.folder.numChildren.length == 1 ? 'corpselector_corporawith_sing' : 'corpselector_corporawith_plur' | loc:lang}}
                        </li>
                        <li>
                            <strong>{{$ctrl.getTokens() | prettyNumber}}</strong>
                            {{'corpselector_tokens' | loc:lang}}
                        </li>
                        <li>
                            <strong>{{$ctrl.getSentences() | prettyNumber}}</strong>
                            {{'corpselector_sentences' | loc:lang}}
                        </li>
                    </ul>
                </div>
            </script>
            <div
                class="cover absolute inset-0 bg-transparent"
                ng-click="$ctrl.isOpen = false"
                ng-if="$ctrl.isOpen"
            ></div>
            <div class="relative chooserwidth ml-8 z-20">
                <div
                    class="flex-shrink-0 "
                    ng-click="$ctrl.isOpen = !$ctrl.isOpen; $ctrl.onFirstOpen()"
                >
                    <div
                        class="group flex justify-between items-center border border-gray-300 transition-all duration-500 hover_bg-blue-50 shadow-inset rounded h-12 p-4 pl-6 cursor-pointer"
                        ng-class="{'rounded-b-none': $ctrl.isOpen}"
                    >
                        <div>
                            <span>{{$ctrl.getSelected().length}} </span>
                            <span rel="localize[corpselector_of]">
                                of
                            </span>
                            <span>{{$ctrl.numLeafNodes}}</span>
                            <span>{{'corpselector_selectedmultiple' | loc:lang}}</span>
                            <span
                                rel="localize[corpselector_allselected]"
                                ng-show="$ctrl.isAllSelected()"
                            ></span>

                            <span class="text-gray-500">
                                <span
                                    ng-bind-html="$ctrl.suffixedNumbers($ctrl.countTokens(true)) | trust"
                                ></span>

                                <span rel="localize[corpselector_of]">
                                    of
                                </span>
                                <span
                                    ng-bind-html="$ctrl.suffixedNumbers($ctrl.countTokens(false)) | trust"
                                ></span>

                                {{'corpselector_tokens' | loc:lang}}
                            </span>
                        </div>
                        <div class="transition-colors duration-500 group-hover_text-indigo-500">
                            <i class="fa fa-caret-up relative top-2"></i><br /><i
                                class="fa fa-caret-down relative bottom-2"
                            ></i>
                        </div>
                    </div>
                </div>

                <div
                    class="absolute ng-fade transition duration-200 bg-white rounded-b shadow-lg border border-gray-300 border-t-0 z-10 p-4 overflow-y-auto chooserheight w-full"
                    ng-show="$ctrl.isOpen"
                >
                    <div class="flex">
                        <mini-plot ng-if="$ctrl.loadMiniPlot"></mini-plot>
                        <div class="space-y-2">
                            <button
                                class="btn btn-default btn-sm w-full selectall"
                                ng-click="$ctrl.selectAll()"
                            >
                                <span class="fa fa-check"></span>
                                <span rel="localize[corpselector_buttonselectall]"></span>
                                <span data-loc="corpselector_buttonselectall"></span>
                            </button>
                            <button
                                class="btn btn-default btn-sm w-full selectnone"
                                ng-click="$ctrl.deselectAll()"
                            >
                                <span class="fa fa-times"></span>
                                <span rel="localize[corpselector_buttonselectnone]"></span>
                            </button>
                        </div>
                    </div>
                    <chooser-node folder="$ctrl.tree"></chooser-node>
                </div>
            </div>
        </div>

        <style>
            .chooserwidth {
                width: 480px;
            }
            .chooserheight {
                height: 70vh;
            }
        </style>`,
    bindings: {},
    controller: [
        "$scope",
        "searches",
        function controller($scope, searches) {
            let $ctrl = this

            statemachine.listen("invalidate_corpuschooser", function ({ corpora }) {
                // this is called when the context and selected nodes in tree differ
                if (corpora) {
                    for (let child of getChildren($ctrl.tree)) {
                        child.selected = child.isLeaf && corpora.includes(child.id)
                        if (child.selected) {
                            for (let parent of getParents(child)) {
                                correctState(parent)
                            }
                        }
                    }
                }
            })

            let preselected = (settings.preselectedCorpora || []).map((id) => id.replace(/^__/, ""))
            let preselectedMap = Object.fromEntries(_.zipWith(preselected, (id) => [id, true]))
            let getPreselected = (id) => (settings.preselectedCorpora ? preselectedMap[id] : true)

            let makeTree = (folderID, branch, parent, forceSelected) => {
                let branches = Object.entries(_.omit(branch, "contents", "description", "title"))
                let isBranchSelected = forceSelected || getPreselected(folderID)
                let self = {}
                return Object.assign(self, {
                    id: folderID,
                    label: branch.title,
                    parent: parent,
                    description: branch.description,
                    isOpen: folderID == "root",
                    isLeaf: false,
                    children: branches.map(([key, val]) =>
                        makeTree(key, val, self, isBranchSelected)
                    ),
                    leafs:
                        branch.contents?.map((id) => ({
                            id,
                            selected: isBranchSelected || getPreselected(id),
                            isLeaf: true,
                            parent: self,
                            label: settings.corpora[id].title,
                            corpus: settings.corpora[id],
                        })) || [],
                    selected: isBranchSelected,
                })
            }

            let root = makeTree("root", settings.corporafolders, null)

            let ids = Array.from(getChildren(root)).flatMap((item) =>
                item.isLeaf ? [item.id] : []
            )
            let idsFromFolders = Object.fromEntries(_.zipWith(ids, (id) => [id, true]))

            for (let [id, corpus] of Object.entries(settings.corpora)) {
                if (!idsFromFolders[id]) {
                    root.leafs.push({
                        id,
                        selected: getPreselected(id),
                        parent: root,
                        isLeaf: true,
                        label: corpus.title,
                        corpus: settings.corpora[id],
                    })
                }
            }

            function decorateCounts(tree) {
                for (let child of getChildren(tree)) {
                    let subchildren = Array.from(getChildren(child))
                    child.numChildren = subchildren.filter((item) => item.isLeaf).length
                }
            }

            let nodes = Array.from(getChildren(root))

            $ctrl.getSelected = () =>
                nodes.filter((node) => node.selected && node.isLeaf).map((node) => node.id)

            $ctrl.numLeafNodes = nodes.filter((node) => node.isLeaf).length

            $ctrl.isAllSelected = () => {
                nodes.filter((node) => node.isLeaf).length == $ctrl.getSelected().length
            }

            $ctrl.countTokens = (selectedOnly) =>
                _.sumBy(
                    nodes.filter(
                        (node) =>
                            (selectedOnly ? node.selected : true) && node.isLeaf && node.corpus.info
                    ),
                    (node) => Number(node.corpus.info.Size)
                )

            $ctrl.selectAll = () => {
                for (let node of nodes) {
                    node.selected = true
                }
                statemachine.send({
                    type: "CORPUSCHOOSER_CHANGE",
                    corpora: $ctrl.getSelected(),
                })
            }
            $ctrl.deselectAll = () => {
                for (let node of nodes) {
                    node.selected = false
                }
                statemachine.send({
                    type: "CORPUSCHOOSER_CHANGE",
                    corpora: [],
                })
            }

            $ctrl.suffixedNumbers = function (num) {
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
                return out.replace(
                    ".",
                    `<span rel="localize[util_decimalseparator]">${util.getLocaleString(
                        "util_decimalseparator"
                    )}</span>`
                )
            }
            decorateCounts(root)

            // make sure indeterminate states are applied. because getChildren is
            // breadth first, reversing it should get us the deepest nodes first.
            for (let folder of Array.from(getChildren(root))
                .filter((node) => !node.isLeaf)
                .reverse()) {
                correctState(folder)
            }
            $ctrl.tree = root

            $ctrl.onFirstOpen = _.once(function () {
                $ctrl.loadMiniPlot = true
            })
        },
    ],
}
