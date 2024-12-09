/** @format */
import _ from "lodash"
import angular, { IController, IRootElementService, IScope } from "angular"
import { html } from "@/util"

type SearchSubmitController = IController & {
    onSearch: () => void
    onSearchSave: (params: { name: string }) => void
    disabled: boolean
    pos: Position
}

type SearchSubmitScope = IScope & {
    disabled: boolean
    pos: Position
    name: string
    isPopoverVisible: boolean
    togglePopover: (event: Event) => void
    popHide: () => void
    popShow: () => void
    onWrapperKeydown: (event: KeyboardEvent) => void
    onPopoverKeydown: (event: KeyboardEvent) => void
    onSubmit: () => void
    onSendClick: (event: Event) => void
    onPopoverClick: (event: Event) => void
}

type Position = "top" | "bottom" | "right" | "left"

angular.module("korpApp").component("searchSubmit", {
    template: html`<div class="search_submit" ng-keydown="onWrapperKeydown($event)">
        <div class="btn-group">
            <button class="btn btn-primary" id="sendBtn" ng-click="onSendClick()" ng-disabled="disabled">
                {{'search' | loc:$root.lang}}
            </button>
            <button class="btn btn-default opener" ng-click="togglePopover($event)" ng-disabled="disabled">
                <span class="caret"></span>
            </button>
        </div>
        <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">
            <div class="arrow"></div>
            <h3 class="popover-title">{{'compare_save_header' | loc:$root.lang}}</h3>
            <div class="popover-content" ng-keydown="onPopoverKeydown($event)">
                <div>
                    <label>
                        {{'compare_name' | loc:$root.lang}}:
                        <input class="cmp_input" ng-model="name" />
                    </label>
                </div>
                <div class="btn_container">
                    <button class="btn btn-primary btn-sm" ng-click="onSubmit()">
                        {{'compare_save' | loc:$root.lang}}
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    bindings: {
        onSearch: "&",
        onSearchSave: "&",
        disabled: "<",
        pos: "@",
    },
    controller: [
        "$element",
        "$rootElement",
        "$scope",
        function ($element: IRootElementService, $rootElement: IRootElementService, $scope: SearchSubmitScope) {
            const $ctrl = this as SearchSubmitController

            $ctrl.$onInit = () => {
                $scope.disabled = angular.isDefined($ctrl.disabled) ? $ctrl.disabled : false
                $scope.pos = $ctrl.pos || "bottom"
            }

            const popover = $element.find(".popover")
            const opposites: Record<Position, Position> = {
                bottom: "top",
                top: "bottom",
                right: "left",
                left: "right",
            }

            $scope.togglePopover = function (event) {
                if ($scope.isPopoverVisible) {
                    $scope.popHide()
                } else {
                    $scope.popShow()
                }
                event.preventDefault()
                event.stopPropagation()
            }

            $scope.onPopoverClick = function (event) {
                if (event.target !== popover.find(".btn")[0]) {
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
            $scope.isPopoverVisible = false

            $scope.popShow = function () {
                $scope.isPopoverVisible = true
                const horizontal = ["top", "bottom"].includes($scope.pos)
                const my = horizontal ? `center ${opposites[$scope.pos]}` : `${opposites[$scope.pos]} center`
                const at = horizontal ? `center ${$scope.pos}+10` : `${$scope.pos}+10 center`
                popover
                    .fadeIn("fast")
                    .focus()
                    .position({ my, at, of: $element.find(".opener") })

                $rootElement.on("click", $scope.popHide)
            }

            $scope.popHide = function () {
                $scope.isPopoverVisible = false
                popover.fadeOut("fast")
                $rootElement.off("click", $scope.popHide)
            }

            $scope.onWrapperKeydown = (event: KeyboardEvent) => {
                if (event.key == "Escape") {
                    $scope.popHide()
                    event.preventDefault()
                    event.stopPropagation()
                }
            }

            $scope.onPopoverKeydown = (event: KeyboardEvent) => {
                if (event.key == "Enter") {
                    $scope.onSubmit()
                    event.preventDefault()
                    event.stopPropagation()
                }
            }

            $scope.onSubmit = function () {
                $scope.popHide()
                $ctrl.onSearchSave({ name: $scope.name })
            }

            $scope.onSendClick = () => $ctrl.onSearch()
        },
    ],
})
