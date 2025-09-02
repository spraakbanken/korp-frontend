/** @format */
import angular, { IController, IRootElementService } from "angular"
import { ReaderToken, ReaderTokenContainer, TextReaderDataContainer } from "@/backend/task/text-task"

type StandardReadingModeController = IController & {
    data: TextReaderDataContainer
    wordClick: (token: ReaderToken) => void
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

            function standardInnerElem(document: ReaderTokenContainer) {
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
                        // Handle click unless data is grouped with the `reading_mode.group_element` setting
                        if (!("tokens" in token)) ctrl.wordClick(token)
                    }
                })
            }
        },
    ],
})
