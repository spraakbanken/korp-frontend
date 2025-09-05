import angular from "angular"
import { html } from "@/util"

angular.module("korpApp").component("tabPreloader", {
    template: html`<div role="progressbar" aria-valuenow="{{$ctrl.progress || 0}}">
        <div
            ng-if="$ctrl.progress !== null"
            class="h-0.5 bg-current absolute bottom-0 left-0 transition-all"
            style="width: {{$ctrl.progress || 0}}%"
        ></div>
        <i class="fa-solid fa-spinner motion-safe:animate-spin-slow"></i>
    </div>`,
    bindings: {
        progress: "<",
    },
})
