/** @format */
import angular from "angular"
import { html } from "@/util"
import korpFailImg from "../../../img/korp_fail.svg"

angular.module("korpApp").component("korpError", {
    template: html`
        <div class="mx-auto flex flex-wrap items-center justify-center gap-8" role="alert">
            <img src="${korpFailImg}" alt="{{'fail_alt' | loc:$root.lang}}" />
            <div class="w-full max-w-screen-sm text-lg flex flex-col gap-2">
                <div>{{'fail_text' | loc:$root.lang}}</div>
                <pre ng-if="$ctrl.message" class="bg-zinc-100 p-2 px-4 text-base whitespace-pre-wrap break-words">
{{$ctrl.message}}</pre
                >
                <div>{{'fail_contact' | loc:$root.lang}}</div>
            </div>
        </div>
    `,
    bindings: {
        message: "@",
    },
})
