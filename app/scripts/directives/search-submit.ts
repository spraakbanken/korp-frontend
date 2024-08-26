/** @format */
import _ from "lodash"
import angular, { IScope } from "angular"
import { html } from "@/util"

type SearchSubmitScope = IScope & {
    disabled: boolean
    name: string
    onSearch: () => void
    onSearchSave: (params: { name: string }) => void
    isPopoverVisible: boolean
    pos: string
    togglePopover: (event: Event) => void
    popHide: () => void
    popShow: () => void
    onSubmit: () => void
    onSendClick: (event: Event) => void
    onPopoverClick: (event: Event) => void
}

angular.module("korpApp").directive("searchSubmit", [
    "$rootElement",
    ($rootElement) => ({
        template: html`<div class="search_submit">
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
                <form class="popover-content" ng-submit="onSubmit()">
                    <div>
                        <label>
                            {{'compare_name' | loc:$root.lang}}:
                            <input class="cmp_input" ng-model="name" />
                        </label>
                    </div>
                    <div class="btn_container">
                        <button class="btn btn-primary btn-sm">{{'compare_save' | loc:$root.lang}}</button>
                    </div>
                </form>
            </div>
        </div>`,
        restrict: "E",
        replace: true,
        scope: {
            onSearch: "&",
            onSearchSave: "&",
            disabled: "<",
        },
        link(scope: SearchSubmitScope, elem, attr) {
            const s = scope

            s.disabled = angular.isDefined(s.disabled) ? s.disabled : false

            s.pos = attr.pos || "bottom"
            s.togglePopover = function (event) {
                if (s.isPopoverVisible) {
                    s.popHide()
                } else {
                    s.popShow()
                }
                event.preventDefault()
                event.stopPropagation()
            }

            const popover = elem.find(".popover")
            s.onPopoverClick = function (event) {
                if (event.target !== popover.find(".btn")[0]) {
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
            s.isPopoverVisible = false
            const trans = {
                bottom: "top",
                top: "bottom",
                right: "left",
                left: "right",
            }
            const horizontal = ["top", "bottom"].includes(s.pos)
            const my = horizontal ? `center ${trans[s.pos]}` : `${trans[s.pos]} center`
            const at = horizontal ? `center ${s.pos}+10` : `${s.pos}+10 center`

            const onEscape = function (event) {
                if (event.which === 27) {
                    // escape
                    s.popHide()
                    return false
                }
            }

            s.popShow = function () {
                s.isPopoverVisible = true
                popover
                    .fadeIn("fast")
                    .focus()
                    .position({ my, at, of: elem.find(".opener") })

                $rootElement.on("keydown", onEscape)
                $rootElement.on("click", s.popHide)
            }

            s.popHide = function () {
                s.isPopoverVisible = false
                popover.fadeOut("fast")
                $rootElement.off("keydown", onEscape)
                $rootElement.off("click", s.popHide)
            }

            s.onSubmit = function () {
                s.popHide()
                s.onSearchSave({ name: s.name })
            }

            s.onSendClick = () => s.onSearch()
        },
    }),
])
