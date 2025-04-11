/** @format */
import angular, { IController, IScope } from "angular"
import { downloadFile, html } from "@/util"
import { API } from "@/backend/types"
import { korpRequest } from "@/backend/common"

type JsonButtonController = IController & {
    endpoint: keyof API
    params: API[keyof API]["params"]
}

type JsonButtonScope = IScope & {
    loading: boolean
    openJson: () => Promise<void>
}

angular.module("korpApp").component("jsonButton", {
    template: html`<div class="float-right mx-2">
        <tab-preloader ng-if="loading" class="inline-block mr-1"></tab-preloader>
        <input
            type="image"
            src="img/json.png"
            alt="{{'download_response' | loc:$root.lang}}"
            ng-click="openJson()"
            class="border-0"
        />
    </div>`,
    bindings: {
        endpoint: "<",
        params: "<",
    },
    controller: [
        "$scope",
        function ($scope: JsonButtonScope) {
            const $ctrl = this as JsonButtonController
            $scope.loading = false

            $scope.openJson = async function () {
                // $apply needed becase async
                $scope.$applyAsync(($scope: JsonButtonScope) => ($scope.loading = true))
                const data = await korpRequest($ctrl.endpoint, $ctrl.params)
                const json = JSON.stringify(data, null, 2)
                downloadFile(json, `korp-${$ctrl.endpoint}.json`, "application/json")
                $scope.$applyAsync(($scope: JsonButtonScope) => ($scope.loading = false))
            }
        },
    ],
})
