/** @format */
export const componentName = "standardReadingMode"

export const component = {
    bindings: {
        data: "<",
        wordClick: "&",
    },
    controller: [
        "$element",
        function ($element) {
            const ctrl = this

            function standardInnerElem(document) {
                const doc = []
                for (let idx = 0; idx < document.tokens.length; idx++) {
                    let token = document.tokens[idx]
                    if (!token.tokens) {
                        doc.push(
                            `<span class="word" data-idx="${idx}">${token.attrs.head}${token.attrs.word}${token.attrs.tail}</span>`
                        )
                    } else {
                        doc.push(`<div>${standardInnerElem(token.tokens)}</div>`)
                    }
                }
                return `${doc.join("")}`
            }

            function standardOuterElem(data) {
                return `<div class="text-container m-md-5">${standardInnerElem(data.document)}</div>`
            }

            ctrl.$onInit = () => {
                $element[0].innerHTML = standardOuterElem(ctrl.data)

                $element[0].addEventListener("click", (e) => {
                    if (e.target.dataset.idx) {
                        const idx = e.target.dataset.idx
                        const token = ctrl.data.document.tokens[idx]
                        ctrl.wordClick(["wordClick"])(token)
                    }
                })
            }
        },
    ],
}
