/** @format */
import { html } from "@/util"
import angular, { IController } from "angular"

type SidebarSectionController = IController & {
    title: string
}

angular.module("korpApp").component("sidebarSection", {
    template: html`
        <details open class="border border-gray-300 rounded-sm">
            <summary tabindex="0" class="bg-gray-300 uppercase m-0 p-1 px-2">{{$ctrl.title}}</summary>
            <div ng-transclude class="p-2"></div>
        </details>
    `,
    bindings: {
        title: "@",
    },
    transclude: true,
    controller: function () {
        const $ctrl = this as SidebarSectionController
    },
})
