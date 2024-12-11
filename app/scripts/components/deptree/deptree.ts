/** @format */
import angular, { IController, IScope, ITimeoutService, ui } from "angular"
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

angular.module("korpApp").component("depTree", {
    template: html`
        <div>
            <script type="text/ng-template" id="deptreeModal.html">
                <div class="modal-header py-0">
                    <h3 class="modal-title">{{ 'dep_tree' | loc:$root.lang }}</h3>
                    <span ng-click="clickX()" class="close-x">×</span>
                </div>
                <div class="modal-body">
                    <div ng-if="label">{{label | loc:$root.lang}}: {{value | locObj:$root.lang}}</div>
                    <div id="magic_secret_id"></div>
                </div>
            </script>
            <style>
                svg {
                    border: none;
                }

                .sentnum {
                    display: none;
                }
            </style>
        </div>
    `,
    bindings: {
        tokens: "<",
        corpus: "<",
        onClose: "&",
    },
    controller: [
        "$uibModal",
        function ($uibModal: ui.bootstrap.IModalService) {
            let $ctrl = this as DeptreeController

            $ctrl.$onInit = async () => {
                // lazy laod the dependency tree code
                const { default: Visualizer } = await import(/* webpackChunkName: "deptree" */ "./deptree_deps")

                type ModalScope = IScope & {
                    clickX: () => void
                    label: string
                    value: string
                }

                const modal = $uibModal.open({
                    templateUrl: "deptreeModal.html",
                    controller: [
                        "$scope",
                        "$timeout",
                        ($scope: ModalScope, $timeout: ITimeoutService) => {
                            $scope.clickX = () => {
                                modal.close()
                            }

                            $timeout(() => {
                                drawBratTree(Visualizer, $ctrl.tokens, "magic_secret_id", (msg) => {
                                    const [type, val] = _.head(_.toPairs(msg))!
                                    $scope.$apply((s: ModalScope) => {
                                        s.label = locObj($ctrl.corpus.attributes[type].label)
                                        s.value = $ctrl.corpus.attributes[type].translation![val]
                                    })
                                })
                            }, 0)
                        },
                    ],
                    size: "lg",
                })

                modal.result.then(
                    () => $ctrl.onClose(),
                    () => $ctrl.onClose()
                )
            }
        },
    ],
})
