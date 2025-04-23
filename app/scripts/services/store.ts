/** @format */
import angular from "angular"
import { RootScope } from "@/root-scope.types"
import { UtilsService } from "@/services/utils"

export type StoreService = {
    initialize: () => void
}

angular.module("korpApp").factory("store", [
    "$rootScope",
    "utils",
    ($rootScope: RootScope, utils: UtilsService): StoreService => {
        const initialize = () => {
            $rootScope.show_modal = false
        }

        // Sync to url
        utils.setupHash($rootScope, {
            key: "display",
            scope_name: "show_modal",
        })

        return {
            initialize,
        }
    },
])
