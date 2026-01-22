import angular, { IController, IScope, ITimeoutService, ui } from "angular"
import { html } from "@/util"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Token } from "@/backend/types"
import { LangString } from "@/i18n/types"
import { getDeptreeAttrMapping } from "@/settings"

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
                    <div ng-if="label">{{label | locObj:$root.lang}}: {{value | locObj:$root.lang}}</div>
                    <div ng-if="!label">&nbsp;</div>
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
                const { drawBratTree } = await import(/* webpackChunkName: "deptree" */ "@/kwic/deptree")

                type ModalScope = IScope & {
                    clickX: () => void
                    label: LangString
                    value: LangString
                }

                const modal = $uibModal.open({
                    templateUrl: "deptreeModal.html",
                    controller: [
                        "$scope",
                        "$timeout",
                        ($scope: ModalScope, $timeout: ITimeoutService) => {
                            const attrMapping = getDeptreeAttrMapping($ctrl.corpus)

                            $scope.clickX = () => {
                                modal.close()
                            }

                            // Wait for target div to be present
                            $timeout(() => {
                                drawBratTree($ctrl.tokens, "magic_secret_id", attrMapping, (msg) => {
                                    const [type, val] = Object.entries(msg)[0]
                                    $scope.$apply((s: ModalScope) => {
                                        const attribute = $ctrl.corpus.attributes[type]
                                        s.label = attribute.label || type
                                        s.value = attribute.translation?.[val] || val
                                    })
                                })
                            })
                        },
                    ],
                    size: "lg",
                })

                modal.result.then(
                    () => $ctrl.onClose(),
                    () => $ctrl.onClose(),
                )
            }
        },
    ],
})
