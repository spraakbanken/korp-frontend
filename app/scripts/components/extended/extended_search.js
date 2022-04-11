/** @format */

let html = String.raw
export const extendedSearchComponent = {
    template: html`
        <div>
            <standard-extended ng-if="!$ctrl.parallel"></standard-extended>
            <parallel-extended ng-if="$ctrl.parallel"></parallel-extended>
        </div>
    `,
    bindings: {
        parallel: "<",
    },
    controller: [
        "$location",
        function ($location) {
            const ctrl = this
        
        },
    ],
}
