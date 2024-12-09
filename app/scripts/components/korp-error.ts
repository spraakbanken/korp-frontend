/** @format */
import angular from "angular"
import { html } from "@/util"
import korpFailImg from "../../img/korp_fail.svg"

angular.module("korpApp").component("korpError", {
    template: html`
        <div>
            <img class="korp_fail" src="${korpFailImg}" alt="{{'fail_alt' | loc:$root.lang}}" />
            <div class="fail_text inline-block">{{'fail_text' | loc:$root.lang}}</div>
        </div>
    `,
})
