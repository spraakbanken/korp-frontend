/** @format */
import { html } from "@/util"
import angular from "angular"

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
    controller: function () {},
})
