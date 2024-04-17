/** @format */
import angular from "angular"
import { html } from "@/util"

angular.module("korpApp").component("newsdesk", {
    template: html`<div>NEWSDESK</div>`,
    controller: ["$rootScope", function ($rootScope) {}],
})
