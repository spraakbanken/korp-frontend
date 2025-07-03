/** @format */
import angular, { ICompileService, IScope } from "angular"
import { html } from "@/util"
import { StoreService } from "@/services/store"
import { Modal } from "bootstrap"

export type ModalData = {
    buttonText?: string
    content: string
    onClose?: () => void
    scopeData?: Record<string, any>
    size?: "sm" | "lg" | "xl"
    title?: string
    uncloseable?: boolean
}

type AppModalScope = IScope & {
    buttonText: string
    closeable: boolean
    onClose: () => void
    size?: "sm" | "lg" | "xl"
    title: string
    /** Allow closing from content template. */
    $close: () => void
}

angular.module("korpApp").component("appModal", {
    template: html`<div id="app-modal" class="modal" aria-hidden>
        <div class="modal-dialog" ng-class="size ? 'modal-' + size : ''">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">{{title}}</h3>
                    <button
                        ng-if="closeable"
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="{{ buttonText | loc:$root.lang }}"
                    ></button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button ng-if="closeable" data-bs-dismiss="modal" class="btn btn-primary">
                        {{ buttonText | loc:$root.lang }}
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    bindings: {},
    controller: [
        "$compile",
        "$element",
        "$scope",
        "store",
        function ($compile: ICompileService, $element: JQLite, $scope: AppModalScope, store: StoreService) {
            let modal: Modal | undefined

            // Show modal whenever store.modal is set
            store.watch(
                "modal",
                (data) => {
                    if (data) show(data)
                },
                true
            )

            function show(data: ModalData) {
                // There can be only one modal, ignore other with a warning
                if (modal) {
                    console.warn("Modal was replaced before it was closed", data)
                    return
                }

                $scope.buttonText = data.buttonText || "modal_close"
                $scope.title = data.title || ""
                $scope.onClose = data.onClose || (() => {})
                $scope.closeable = !data.uncloseable
                $scope.size = data.size

                const modalScope = $scope.$new() as any
                for (const key in data.scopeData) {
                    modalScope[key] = data.scopeData[key]
                }

                // Render content
                const contentEl = $compile(data.content)(modalScope)
                $element.find(".modal-body").empty().append(contentEl)

                // Create and show modal
                modal = new Modal("#app-modal", {
                    backdrop: $scope.closeable || "static",
                    keyboard: $scope.closeable,
                })
                modal.show()
            }

            document.getElementById("app-modal")?.addEventListener("hidden.bs.modal", () =>
                $scope.$applyAsync(() => {
                    store.modal = undefined
                    modal = undefined
                    $scope.onClose()
                })
            )

            $scope.$close = () => modal?.hide()
        },
    ],
})
