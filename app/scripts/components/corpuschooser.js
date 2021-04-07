/** @format */

import { map } from "lodash"
import statemachine from "../statemachine"

import "./corpuschooser.scss"
let html = String.raw

function* getChildren(folder, deep = true) {
    let children = [...(folder.children || []), ...(folder.leafs || [])]
    yield* children
    if (deep) {
        for (let gen of children.map(getChildren)) {
            yield* gen
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
    // template: String.raw`<ul><li ng-repeat=""></li></ul>`,
    template: html`
        <div class="">
            <span
                ng-if="$ctrl.folder.id != 'root'"
                class="cursor-pointer hover_bg-indigo-200 pr-2 flex items-center"
                uib-popover-template="'myPopoverTemplate.html'"
                popover-popup-delay="500"
                popover-placement="right"
                popover-trigger="'mouseenter'"
            >
                <span
                    class="py-1 pl-2 pr-4 -my-2 w-5"
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
                <label class="mr-1" for="{{$ctrl.folder.id}}">
                    {{$ctrl.folder.label}}
                </label>
                <span ng-if="$ctrl.folder.numChildren" class="text-gray-500">
                    ({{$ctrl.folder.numChildren}})
                </span>
            </span>
            <ul
                class="m-0"
                ng-class="{ 'ml-4': $ctrl.folder.id != 'root'}"
                ng-if="$ctrl.folder.isOpen && ($ctrl.folder.children.length || $ctrl.folder.leafs.length)"
            >
                <li ng-repeat="subfolder in $ctrl.folder.children">
                    <chooser-node folder="subfolder"></chooser-node>
                </li>
                <li class="flex items-center" ng-repeat="leaf in $ctrl.folder.leafs">
                    <chooser-node folder="leaf"></chooser-node>
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
        <script type="text/ng-template" id="myPopoverTemplate.html">
            <div class="p-4">
                <h3 class="">{{$ctrl.folder.label}}</h3>
                <div class="text-base" ng-html="$ctrl.folder.description | trust"></div>
                <ul class="">
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
        <div class="flex-shrink-0 ml-8 " id="corpusbox">
            <div
                class="group flex justify-between items-center border border-gray-400 transition-all duration-500 hover_bg-blue-50 shadow-inset rounded h-12"
            >
                <div>
                    <span id="hp_corpora_title1"></span>
                    <span id="hp_corpora_titleOf" rel="localize[corpselector_of]"> of </span>
                    <span id="hp_corpora_titleTotal"></span>
                    <span id="hp_corpora_title2" rel="localize[corpselector_allselected]"></span>
                    <span id="hp_corpora_titleTokens" style="color: #888888;"></span>
                </div>
                <div class="transition-colors duration-500 group-hover_text-indigo-500">
                    <i class="fa fa-caret-up relative top-2"></i><br /><i
                        class="fa fa-caret-down relative bottom-2"
                    ></i>
                </div>
            </div>
        </div>

        <div class="flex-shrink-0">
            <div class="header">
                <div id="time">
                    <div id="time_graph"></div>
                    <div id="rest_time_graph"></div>
                </div>
                <div class="buttons">
                    <button class="btn btn-default btn-sm selectall" ng-click="$ctrl.selectAll()">
                        <span class="fa fa-check"></span>
                        <span rel="localize[corpselector_buttonselectall]"></span>
                        <span data-loc="corpselector_buttonselectall"></span>
                    </button>
                    <button
                        class="btn btn-default btn-sm selectnone"
                        ng-click="$ctrl.deselectAll()"
                    >
                        <span class="fa fa-times"></span>
                        <span rel="localize[corpselector_buttonselectnone]"></span>
                    </button>
                </div>
            </div>
            <chooser-node folder="$ctrl.tree"></chooser-node>
        </div>
    </div>`,
    bindings: {},
    controller: [
        function controller() {
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

            let preselected = settings.preselectedCorpora.map((id) => id.replace(/^__/, ""))
            let preselectedMap = Object.fromEntries(_.zipWith(preselected, (id) => [id, true]))

            let makeTree = (id, branch, parent) => {
                let branches = Object.entries(_.omit(branch, "contents", "description", "title"))

                let self = {}
                return Object.assign(self, {
                    id,
                    label: branch.title,
                    parent: parent,
                    description: branch.description,
                    isOpen: id == "root",
                    isLeaf: false,
                    children: branches.map(([key, val]) => makeTree(key, val, self)),
                    leafs:
                        branch.contents?.map((id) => ({
                            id,
                            selected: !!preselectedMap[id],
                            isLeaf: true,
                            parent: self,
                            label: settings.corpora[id].title,
                            corpus: settings.corpora[id],
                        })) || [],
                    selected: true,
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
                        selected: !!preselectedMap[id],
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

            let getSelected = () => nodes.filter((node) => node.selected).map((node) => node.id)

            $ctrl.selectAll = () => {
                for (let node of nodes) {
                    node.selected = true
                }
                statemachine.send({
                    type: "CORPUSCHOOSER_CHANGE",
                    corpora: getSelected(),
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

            decorateCounts(root)
            $ctrl.tree = root
        },
    ],
}
