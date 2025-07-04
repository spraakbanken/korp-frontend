/** @format */
import angular, { IController, IScope } from "angular"
import _ from "lodash"
import { html } from "@/util"
import { locObj } from "@/i18n"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { drawBratTree } from "./deptree-util"
import { Token } from "@/backend/types"

type DeptreeController = IController & {
    tokens: Token[]
    corpus: CorpusTransformed
    onClose: () => void
}

type DeptreeScope = IScope & {
    label?: string
    value?: string
}

angular.module("korpApp").component("depTree", {
    template: html`<div>
        <div ng-if="label">{{label | loc:$root.lang}}: {{value | locObj:$root.lang}}</div>
        <div id="magic_secret_id"></div>
        <style>
            /* TODO Move CSS */
            svg {
                border: none;
            }

            .sentnum {
                display: none;
            }
        </style>
    </div> `,
    bindings: {
        tokens: "<",
        corpus: "<",
        onClose: "&",
    },
    controller: [
        "$scope",
        function ($scope: DeptreeScope) {
            let $ctrl = this as DeptreeController

            $ctrl.$onInit = async () => {
                // lazy laod the dependency tree code
                const { default: Visualizer } = await import(/* webpackChunkName: "deptree" */ "./deptree_deps")

                $scope.$apply(() => {
                    drawBratTree(Visualizer, $ctrl.tokens, "magic_secret_id", (msg) => {
                        const [type, val] = _.head(_.toPairs(msg))!
                        $scope.$apply(() => {
                            $scope.label = locObj($ctrl.corpus.attributes[type].label)
                            $scope.value = $ctrl.corpus.attributes[type].translation![val]
                        })
                    })
                })
            }
        },
    ],
})
