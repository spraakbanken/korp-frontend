import angular, { IController, IScope } from "angular"
import { downloadFile, html } from "@/util"

type JsonButtonController = IController & {
    data: any
    endpoint: string
}

type JsonButtonScope = IScope & {
    openJson: () => Promise<void>
}

angular.module("korpApp").component("jsonButton", {
    template: html`
        <button ng-click="openJson()" class="btn btn-default btn-sm float-right mx-2">
            <i class="fa-solid fa-download mr-1"></i>
            JSON
        </button>
    `,
    bindings: {
        data: "<",
        endpoint: "@",
    },
    controller: [
        "$scope",
        function ($scope: JsonButtonScope) {
            const $ctrl = this as JsonButtonController

            $scope.openJson = async function () {
                // TODO Check that we don't get $$hashKey etc
                const json = JSON.stringify($ctrl.data, null, 2)
                downloadFile(json, `korp-${$ctrl.endpoint}.json`, "application/json")
            }
        },
    ],
})
