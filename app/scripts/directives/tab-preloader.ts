/** @format */
import _ from "lodash"
import angular from "angular"
import { html } from "@/util"

angular.module("korpApp").directive("tabPreloader", () => ({
    restrict: "E",
    scope: {
        value: "=",
        spinner: "=",
    },
    replace: true,
    template: html`<div class="tab_preloaders">
        <div ng-if="!spinner" class="tab_progress" style="width:{{value || 0}}%"></div>
        <span
            ng-if="spinner"
            class="preloader_spinner"
            us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 7, top : -12}"
        ></span>
    </div>`,

    link() {},
}))
