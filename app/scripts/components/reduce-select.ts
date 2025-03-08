/** @format */
import _ from "lodash"
import angular, { IController, IScope } from "angular"
import { html } from "@/util"
import { AttributeOption } from "@/corpus_listing"

type ReduceSelectScope = IScope & {
    keyItems: Record<string, Item>
    hasWordAttrs: boolean
    hasStructAttrs: boolean
    isOnlyWordSelected: boolean
    onDropdownToggle: (open: boolean) => void
    toggleSelected: (value: string, event: MouseEvent) => void
    toggleWordInsensitive: (event: MouseEvent) => void
    toggled: (open: boolean) => void
}

type Item = AttributeOption & {
    selected?: boolean
    insensitive?: boolean
}

type ReduceSelectController = IController & {
    items: Item[]
    selected: string[]
    insensitive: string[]
    onChange: (value: { selected?: string[]; insensitive?: string[] }) => void
}

angular.module("korpApp").component("reduceSelect", {
    template: html`<div
        uib-dropdown
        auto-close="outsideClick"
        class="inline-block"
        on-toggle="toggled(open)"
        style="width: 200px"
    >
        <div
            uib-dropdown-toggle
            class="reduce-dropdown-button inline-block align-middle bg-white border border-gray-400"
        >
            <div class="reduce-dropdown-button-text">
                <span> {{keyItems[$ctrl.selected[0]].label | locObj:$root.lang}} </span>
                <span ng-if="$ctrl.selected.length > 1"> (+{{ $ctrl.selected.length - 1 }}) </span>
                <span class="caret"></span>
            </div>
        </div>
        <div class="reduce-dropdown-menu" uib-dropdown-menu>
            <ul>
                <li
                    ng-click="toggleSelected('word', $event)"
                    ng-class="keyItems['word'].selected ? 'selected':''"
                    class="attribute"
                >
                    <input
                        type="checkbox"
                        class="reduce-check"
                        ng-checked="keyItems['word'].selected"
                        ng-disabled="isOnlyWordSelected"
                    />
                    <span class="reduce-label">{{keyItems['word'].label | locObj:$root.lang }}</span>
                    <span
                        ng-class="keyItems['word'].insensitive ? 'selected':''"
                        class="insensitive-toggle"
                        ng-click="toggleWordInsensitive($event)"
                        ><b>Aa</b></span
                    >
                </li>
                <b ng-if="hasWordAttrs">{{'word_attr' | loc:$root.lang}}</b>
                <li
                    ng-repeat="item in $ctrl.items | filter:{ group: 'word_attr' }"
                    ng-click="toggleSelected(item.value, $event)"
                    ng-class="item.selected ? 'selected':''"
                    class="attribute"
                >
                    <input type="checkbox" class="reduce-check" ng-checked="item.selected" />
                    <span class="reduce-label">{{item.label | locObj:$root.lang }}</span>
                </li>
                <b ng-if="hasStructAttrs">{{'sentence_attr' | loc:$root.lang}}</b>
                <li
                    ng-repeat="item in $ctrl.items | filter:{ group: 'sentence_attr' }"
                    ng-click="toggleSelected(item.value, $event)"
                    ng-class="item.selected ? 'selected':''"
                    class="attribute"
                >
                    <input type="checkbox" class="reduce-check" ng-checked="item.selected" />
                    <span class="reduce-label">{{item.label | locObj:$root.lang }}</span>
                </li>
            </ul>
        </div>
    </div>`,
    bindings: {
        items: "<",
        selected: "<",
        insensitive: "<",
        onChange: "<",
    },
    controller: [
        "$scope",
        function (scope: ReduceSelectScope) {
            const $ctrl = this as ReduceSelectController

            $ctrl.$onChanges = (changes) => {
                if ("items" in changes && $ctrl.items) {
                    scope.keyItems = _.keyBy($ctrl.items, "value")
                    scope.hasWordAttrs = $ctrl.items.some((item) => item.group == "word_attr")
                    scope.hasStructAttrs = $ctrl.items.some((item) => item.group == "sentence_attr")
                }

                for (const name of $ctrl.selected || []) {
                    if (name in scope.keyItems) scope.keyItems[name].selected = true
                }

                for (const name of $ctrl.insensitive || []) {
                    if (name in scope.keyItems) scope.keyItems[name].insensitive = true
                }

                updateIsOnlyWordSelected()
            }

            /** Report any changes upwards */
            function notify() {
                validate()

                const selected = $ctrl.items.filter((item) => item.selected).map((item) => item.value)
                const insensitive = $ctrl.items.filter((item) => item.insensitive).map((item) => item.value)

                const changes = {
                    // Only set values that have changed
                    selected: !_.isEqual(selected, $ctrl.selected) ? selected : undefined,
                    insensitive: !_.isEqual(insensitive, $ctrl.insensitive) ? insensitive : undefined,
                }

                // Only notify if something changed
                if (changes.selected || changes.insensitive) $ctrl.onChange(changes)
            }

            /** Update the local flag to whether only the word attr is selected. */
            function updateIsOnlyWordSelected() {
                scope.isOnlyWordSelected = $ctrl.items?.every((item) => item.value == "word" || !item.selected)
            }

            /** Fix state inconsistencies */
            function validate() {
                // If no selection given, default to selecting the word option
                const hasSelection = $ctrl.items.some((item) => item.selected)
                if (!hasSelection) {
                    scope.keyItems["word"].selected = true
                }

                // If unselecting the word option, reset the insensitive flag.
                if (!scope.keyItems["word"].selected) {
                    scope.keyItems["word"].insensitive = false
                }
            }

            scope.toggleSelected = function (value, event) {
                event.stopPropagation()
                const item = scope.keyItems[value]
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                if (isLinux ? event.ctrlKey : event.altKey) {
                    // Unselect all options and select only the given option
                    $ctrl.items.forEach((item) => (item.selected = false))
                    item.selected = true
                }
                // Toggle given value, unless it is "word" and it is the only one selected.
                else if (value != "word" || !scope.isOnlyWordSelected) {
                    item.selected = !item.selected
                    // Make sure the word option is locked if it's the only one remaining.
                    if (scope.keyItems["word"].selected) updateIsOnlyWordSelected()
                }
            }

            scope.toggleWordInsensitive = function (event) {
                event.stopPropagation()
                scope.keyItems["word"].insensitive = !scope.keyItems["word"].insensitive
                if (!scope.keyItems["word"].selected) {
                    scope.keyItems["word"].selected = true
                }
            }

            scope.toggled = function (open) {
                // if no element is selected when closing popop, select word
                if (!open && !$ctrl.selected.length) {
                    scope.keyItems["word"].selected = true
                }

                notify()
            }
        },
    ],
})
