/** @format */

export const ccInfoBox = {
    template: `
    <ng-transclude
        uib-popover-template="'chooserpopover.html'"
        popover-placement="right"
        popover-trigger="'mouseenter'"
        popover-class="corpus-info-space"
        popover-popup-delay="300"
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

                $ctrl.langStats = []
                if ($ctrl.isCorpus) {
                    $ctrl.limitedAccess = $ctrl.object.limitedAccess
                    $ctrl.context = _.keys($ctrl.object.context).length > 1

                    if ($ctrl.object.linkedTo) {
                        for (const linkedCorpusId of $ctrl.object.linkedTo) {
                            const linkedCorpus = settings.corpora[linkedCorpusId]
                            const sentences = parseInt(linkedCorpus.info.Sentences) || 0
                            const tokens = parseInt(linkedCorpus.info.Size) || 0
                            const lang = linkedCorpus.lang
                            $ctrl.langStats.push({ lang, tokens, sentences })
                        }
                    }
                    $ctrl.lastUpdated = $ctrl.object.info.Updated
                }

                $ctrl.langStats.push({
                    lang: $ctrl.object.lang,
                    tokens: $ctrl.object.tokens,
                    sentences: $ctrl.object.sentences,
                })
            }
        },
    ],
}
