import angular, { IController } from "angular"
import { html } from "@/util"
import { MatchedRelation, WordPicture } from "@/word-picture"
import { Lemgram } from "@/lemgram"
import { RelationsSort } from "@/backend/types/relations"
import { RootScope } from "@/root-scope.types"
import { WordpicExampleTask } from "@/task/wordpic-example-task"

type WordPictureColumnController = IController & {
    cssClass: string
    items: MatchedRelation[]
    limit: string
    segment: string
    showWordClass: boolean
    sort: RelationsSort
    // Locals
    parseLemgram: (row: MatchedRelation) => { label: string; pos?: string; idx?: number }
    onClickExample: (row: MatchedRelation) => void
}

angular.module("korpApp").component("wordPictureColumn", {
    template: html`
        <div class="lemgram_result float-left p-1" ng-class="$ctrl.cssClass">
            <table class="m-0">
                <tbody>
                    <tr ng-repeat="row in $ctrl.rows" ng-init="data = $ctrl.parseLemgram(row)">
                        <td class="px-1 text-right"><span class="enumerate"></span></td>
                        <td ng-click="$ctrl.onClickExample(row)" class="px-1 pr-2 cursor-pointer hover:underline">
                            <span ng-if="data.label">
                                {{ data.label }}<sup ng-if="data.idx > 1">{{data.idx}}</sup>
                                <span ng-if="$ctrl.showWordClass && data.pos"> ({{data.pos | loc:$root.lang}}) </span>
                            </span>
                            <span ng-if="!data.label" class="opacity-50">&empty;</span>
                        </td>
                        <td
                            ng-if="$ctrl.sort == 'freq'"
                            title="{{'stat_lmi' | loc:$root.lang}}: {{row.stats[$ctrl.segment].mi | number:2}}"
                            class="px-1 text-right"
                        >
                            {{row.stats[$ctrl.segment].freq}}
                        </td>
                        <td
                            ng-if="$ctrl.sort == 'mi'"
                            title="{{'stat_frequency' | loc:$root.lang}}: {{row.stats[$ctrl.segment].freq}}"
                            class="px-1 text-right"
                        >
                            {{row.stats[$ctrl.segment].mi | number:2}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    bindings: {
        cssClass: "<",
        items: "<",
        limit: "<",
        segment: "<",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureColumnController

            $ctrl.$onChanges = (changes) => {
                if (changes.limit?.currentValue || changes.items?.currentValue || changes.segment?.currentValue) {
                    $ctrl.rows = $ctrl.items
                        .filter((item) => item.stats[$ctrl.segment])
                        .sort((a, b) => b.stats[$ctrl.segment][$ctrl.sort] - a.stats[$ctrl.segment][$ctrl.sort])
                        .slice(0, Number($ctrl.limit))
                }
            }

            $ctrl.parseLemgram = function (row) {
                const [other] = row.other.split("|")
                const prefix = row.prefix ? `${row.prefix} ` : ""

                const lemgram = Lemgram.parse(other)
                if (lemgram) {
                    return {
                        label: prefix + lemgram.form,
                        pos: lemgram.pos,
                        idx: lemgram.index,
                    }
                }

                return {
                    label: prefix + other,
                    pos: row.otherpos.toLowerCase(),
                }
            }

            $ctrl.onClickExample = function (row) {
                $rootScope.kwicTabs.push(new WordpicExampleTask(row.stats[$ctrl.segment].source.join(",")))
            }
        },
    ],
})
