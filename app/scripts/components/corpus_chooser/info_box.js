/** @format */

export const ccInfoBox = {
    template: `
    <ng-transclude
        uib-popover-template="'chooserpopover.html'"
        popover-placement="right"
        popover-trigger="'mouseenter'"
        popover-class="corpus-info-space"
    ></ng-transclude>
    `,
    transclude: true,
    bindings: {
        object: "<",
    },
    controller: [
        function () {
            let $ctrl = this

            $ctrl.$onInit = function () {
                $ctrl.title = $ctrl.object.title
                $ctrl.description = $ctrl.object.description
                $ctrl.limitedAccess = true // TODO
                $ctrl.context = true // TODO
                $ctrl.numberOfChildren = $ctrl.object.numberOfChildren
                $ctrl.isFolder = $ctrl.object.numberOfChildren > 0
                $ctrl.isCorpus = $ctrl.object.numberOfChildren == 0
                $ctrl.tokens = 1012341512
                $ctrl.sentences = 12341
            }
        },
    ],
}
