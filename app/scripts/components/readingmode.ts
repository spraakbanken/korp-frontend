/** @format */
import {
    TextReaderDataContainer,
    TextReaderTokenContainer,
    TextReaderWordHandler,
} from "@/controllers/text_reader_controller"
import angular, { IController, IRootElementService } from "angular"

type StandardReadingModeController = IController & {
    data: TextReaderDataContainer
    wordClick: TextReaderWordHandler
}

angular.module("korpApp").component("standardReadingMode", {
    bindings: {
        data: "<",
        wordClick: "<",
    },
    controller: [
        "$element",
        function ($element: IRootElementService) {
            const ctrl = this as StandardReadingModeController

            function standardInnerElem(document: TextReaderTokenContainer) {
                const doc: string[] = []
                for (let idx = 0; idx < document.tokens.length; idx++) {
                    let token = document.tokens[idx]
                    if ("tokens" in token && token.tokens) {
                        doc.push(`<div>${standardInnerElem(token)}</div>`)
                    } else {
                        doc.push(
                            `<span class="word" data-idx="${idx}">${token.attrs.head}${token.attrs.word}${token.attrs.tail}</span>`
                        )
                    }
                }
                return `${doc.join("")}`
            }

            function standardOuterElem(data: TextReaderDataContainer) {
                return `<div class="text-container m-md-5">${standardInnerElem(data.document)}</div>`
            }

            ctrl.$onInit = () => {
                $element[0].innerHTML = standardOuterElem(ctrl.data)

                $element[0].addEventListener("click", (e: MouseEvent) => {
                    const element = e.target as HTMLElement
                    if (element.dataset.idx) {
                        document.querySelector(".word.selected")?.classList.remove("selected")
                        element.classList.add("selected")
                        const idx = element.dataset.idx
                        const token = ctrl.data.document.tokens[Number(idx)]
                        ctrl.wordClick(token)
                    }
                })
            }
        },
    ],
})
