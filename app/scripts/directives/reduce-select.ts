/** @format */
import _ from "lodash"
import angular, { IScope, ITimeoutService } from "angular"
import { html } from "@/util"
import { AttributeOption } from "@/corpus_listing"

type ReduceSelectScope = IScope & {
    items: Item[]
    keyItems: Record<string, Item>
    hasWordAttrs: boolean
    hasStructAttrs: boolean
    selected: string[]
    insensitive: string[]
    toggleSelected: (value: string, event?: MouseEvent) => void
    toggleWordInsensitive: (event: MouseEvent) => void
    onChange: () => void
    toggled: (open: boolean) => void
}

type Item = AttributeOption & {
    selected?: boolean
    insensitive?: boolean
}

angular.module("korpApp").directive("reduceSelect", [
    "$timeout",
    ($timeout: ITimeoutService) => ({
        restrict: "AE",
        scope: {
            items: "=reduceItems",
            selected: "=reduceSelected",
            insensitive: "=reduceInsensitive",
            lang: "=reduceLang",
            onChange: "<",
        },
        replace: true,
        template: html`<div uib-dropdown auto-close="outsideClick" class="reduce-attr-select" on-toggle="toggled(open)">
            <div
                uib-dropdown-toggle
                class="reduce-dropdown-button inline-block align-middle bg-white border border-gray-500"
            >
                <div class="reduce-dropdown-button-text">
                    <span>{{ "reduce_text" | loc:$root.lang }}:</span>
                    <span> {{keyItems[selected[0]].label | locObj:$root.lang}} </span>
                    <span ng-if="selected.length > 1"> (+{{ selected.length - 1 }}) </span>
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
                        <input type="checkbox" class="reduce-check" ng-checked="keyItems['word'].selected" />
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
                        ng-repeat="item in items | filter:{ group: 'word_attr' }"
                        ng-click="toggleSelected(item.value, $event)"
                        ng-class="item.selected ? 'selected':''"
                        class="attribute"
                    >
                        <input type="checkbox" class="reduce-check" ng-checked="item.selected" />
                        <span class="reduce-label">{{item.label | locObj:$root.lang }}</span>
                    </li>
                    <b ng-if="hasStructAttrs">{{'sentence_attr' | loc:$root.lang}}</b>
                    <li
                        ng-repeat="item in items | filter:{ group: 'sentence_attr' }"
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

        link(scope: ReduceSelectScope) {
            scope.$watchCollection("items", function () {
                if (!scope.items) return
                scope.keyItems = _.keyBy(scope.items, "value")
                scope.hasWordAttrs = scope.items.some((item) => item.group == "word_attr")
                scope.hasStructAttrs = scope.items.some((item) => item.group == "sentence_attr")

                for (const name of scope.selected || []) {
                    scope.keyItems[name].selected = true
                }
                for (const name of scope.insensitive || []) {
                    scope.keyItems[name].insensitive = true
                }

                // If no selection given, default to selecting the word option
                const hasSelection = scope.items.some((item) => item.selected)
                if (!hasSelection) {
                    scope.keyItems["word"].selected = true
                }
                updateSelected()
            })

            function updateSelected() {
                // If unselecting the word option, reset the insensitive flag.
                if (!scope.keyItems["word"].selected) {
                    scope.keyItems["word"].insensitive = false
                }

                scope.selected = scope.items.filter((item) => item.selected).map((item) => item.value)
                scope.insensitive = scope.items.filter((item) => item.insensitive).map((item) => item.value)

                $timeout(() => scope.onChange())
            }

            scope.toggleSelected = function (value, event) {
                event.stopPropagation()
                const item = scope.keyItems[value]
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                if (isLinux ? event.ctrlKey : event.altKey) {
                    // Unselect all options and select only the given option
                    scope.items.forEach((item) => (item.selected = false))
                    item.selected = true
                } else {
                    item.selected = !item.selected
                }
                updateSelected()
            }

            scope.toggleWordInsensitive = function (event) {
                event.stopPropagation()
                scope.keyItems["word"].insensitive = !scope.keyItems["word"].insensitive
                if (!scope.keyItems["word"].selected) {
                    scope.keyItems["word"].selected = true
                }
                updateSelected()
            }

            scope.toggled = function (open) {
                // if no element is selected when closing popop, select word
                if (!open && !scope.selected.length) {
                    scope.keyItems["word"].selected = true
                    updateSelected()
                }
            }
        },
    }),
])
