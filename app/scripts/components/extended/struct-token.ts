/** @format */
import angular, { IController } from "angular"
import settings from "@/settings"
import { html } from "@/util"
import { CqpToken } from "@/cqp_parser/cqp.types"
import { StoreService } from "@/services/store"

type ExtendedStructTokenController = IController & {
    token: CqpToken
    remove: () => void
    change: () => void
    tagTypes: Record<string, string>
}

angular.module("korpApp").component("extendedStructToken", {
    template: html`
        <div class="query_token mt-8">
            <div class="token_header">
                <i class="close_btn fa-solid fa-circle-xmark text-gray-600" ng-click="$ctrl.remove()"></i>
                <div style="clear:both;"></div>
            </div>

            <div class="args">
                <div class="query_arg tag-box">
                    <div class="or or_arg">
                        <div>{{ 'boundary_unit' | loc:$root.lang }}</div>
                        <select
                            class="tag_arg"
                            ng-options="tag as ('tag_' + label | loc:$root.lang) for (tag, label) in $ctrl.tagTypes"
                            ng-model="$ctrl.token.struct"
                            ng-change="$ctrl.change()"
                        ></select>
                    </div>
                    <div>
                        <label class="px-2">
                            <input
                                class="mr-1"
                                type="radio"
                                ng-model="$ctrl.token.start"
                                ng-value="true"
                                ng-change="$ctrl.change()"
                            />
                            {{'starts' | loc:$root.lang }}
                        </label>
                        <label class="px-2">
                            <input
                                class="mr-1"
                                type="radio"
                                ng-model="$ctrl.token.start"
                                ng-value="false"
                                ng-change="$ctrl.change()"
                            />
                            {{'ends' | loc:$root.lang }}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `,
    bindings: {
        token: "<",
        remove: "&",
        change: "&",
    },
    controller: [
        "store",
        function (store: StoreService) {
            const ctrl = this as ExtendedStructTokenController

            store.watch("corpus", () => {
                // Update options
                ctrl.tagTypes = settings.corpusListing.getCommonWithins()
                const structs = Object.keys(ctrl.tagTypes)
                // Set default value
                if (!ctrl.token.struct || !structs.includes(ctrl.token.struct)) {
                    ctrl.token.struct = structs.includes("sentence") ? "sentence" : structs[0]
                    ctrl.change()
                }
            })
        },
    ],
})
