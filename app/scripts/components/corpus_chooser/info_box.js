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

                $ctrl.numberOfChildren = $ctrl.object.numberOfChildren
                $ctrl.isFolder = $ctrl.object.numberOfChildren > 0
                $ctrl.isCorpus = !($ctrl.object.numberOfChildren > 0)

                if ($ctrl.isCorpus) {
                    $ctrl.limitedAccess = $ctrl.object.limitedAccess
                    $ctrl.context = _.keys($ctrl.object.context).length > 1
                }

                $ctrl.tokens = $ctrl.object.tokens
                $ctrl.sentences = $ctrl.object.sentences
                $ctrl.showSentences = $ctrl.object.sentences > 0
            }
        },
    ],
}
