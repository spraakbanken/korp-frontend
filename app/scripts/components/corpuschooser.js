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
                    type="checkbox"
                    id="{{$ctrl.folder.id}}"
                    ng-checked="$ctrl.folder.selected"
                    ng-click="$ctrl.toggleSelected($event, $ctrl.folder)"
                />
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

            $ctrl.$onChanges = () => {
                if ($ctrl.folder.id != "root") {
                    $scope.$watch("$ctrl.folder.isIndeterminate", (val) => {
                        $("input", $element).first().prop("indeterminate", val)
                    })
                }
            }

            let correctState = (folder) => {
                let childSelected = Array.from(getChildren(folder, false)).map(
                    (child) => child.selected
                )

                folder.isIndeterminate =
                    childSelected.some(Boolean) && !childSelected.every(Boolean)

                folder.selected = childSelected.every(Boolean)
            }

            $ctrl.toggleSelected = ($event, folder) => {
                let selected = []

                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                let newSelected = !folder.selected

                if ((!isLinux && $event.altKey) || (isLinux && $event.ctrlKey)) {
                    let root = _.last(Array.from(getParents(folder)))
                    for (let child of getChildren(root)) {
                        child.selected = false
                        child.isIndeterminate = false
                    }
                    newSelected = true
                    folder.selected = true
                }
                $timeout(() => (folder.selected = newSelected), 0)
                folder.selected = newSelected
                for (let child of getChildren(folder)) {
                    child.selected = newSelected
                    if (child.isLeaf && child.selected) {
                        selected.push(child.id)
                    }
                }

                for (let parent of getParents(folder)) {
                    correctState(parent)
                }
                // because the darned checkbox is going to flip my current
                // value, i should leave it as the opposite of what I want.

                folder.selected = !folder.selected

                statemachine.send({
                    type: "CORPUS_CHANGE",
                    corpora: selected,
                })
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
                <div ng-if="$ctrl.folder.isLeaf" class="">
                    {{'corpselector_sentences' | loc:lang}}:
                    {{$ctrl.folder.corpus.info.Sentences | prettyNumber}}
                </div>
            </div>
        </script>
        <div class="flex-shrink-0 ml-8 hidden" id="corpusbox">
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
                    <button class="btn btn-default btn-sm selectall">
                        <span class="fa fa-check"></span>
                        <span rel="localize[corpselector_buttonselectall]"></span>
                        <span data-loc="corpselector_buttonselectall"></span>
                    </button>
                    <button class="btn btn-default btn-sm selectnone">
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
                            selected: true,
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
                        selected: true,
                        parent: root,
                        isLeaf: true,
                        label: corpus.title,
                        corpus: settings.corpora[id],
                    })
                }
            }

            function decorateCounts(tree) {
                for (let child of getChildren(tree)) {
                    child.numChildren = Array.from(getChildren(child)).filter(
                        (item) => item.isLeaf
                    ).length
                }
            }

            decorateCounts(root)
            $ctrl.tree = root
        },
    ],
}
