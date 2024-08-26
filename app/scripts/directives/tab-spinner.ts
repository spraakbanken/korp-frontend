/** @format */
import _ from "lodash"
import angular from "angular"
import { html } from "@/util"

angular.module("korpApp").directive("tabSpinner", () => ({
    template: html`<i class="fa-solid fa-times-circle close_icon"></i>
        <span
            class="tab_spinner"
            us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}"
        ></span>`,
}))
