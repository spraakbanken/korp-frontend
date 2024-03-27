/** @format */
import angular from "angular"
import { html } from "@/util"
import "@/components/korp-error"

angular.module("korpApp").directive("textTabs", () => ({
    replace: true,
    template: html`<uib-tab
        ng-repeat="inData in $ctrl.tabs"
        text-reader-ctrl="text-reader-ctrl"
        select="onentry()"
        deselect="onexit()"
    >
        <uib-tab-heading ng-class="{loading : loading}"
            >{{ 'text_tab_header' | loc:$root.lang}}<span
                tab-spinner="tab-spinner"
                ng-click="closeTab($index, $event)"
            ></span
        ></uib-tab-heading>
        <div>
            <korp-error ng-if="error"></korp-error>
            <div ng-if="!loading" text-reader="text-reader"></div>
        </div>
    </uib-tab>`,
    bindToController: {
        tabs: "<",
    },
    scope: {},
    controllerAs: "$ctrl",
    controller: [() => {}],
}))
