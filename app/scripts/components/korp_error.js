/** @format */
const korpFailImg = require("../../img/korp_fail.svg")

let html = String.raw

export const korpErrorComponent = {
    template: html`
        <div>
            <object class="korp_fail inline-block" type="image/svg+xml" data="${korpFailImg}">
                <img class="korp_fail" src="${korpFailImg}" />
            </object>
            <div class="fail_text inline-block">{{'fail_text' | loc:lang}}</div>
        </div>
    `,
}
