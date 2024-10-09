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
        <i ng-if="spinner" class="fa-solid fa-spinner motion-safe_animate-spin-slow"></i>
    </div>`,

    link() {},
}))
