import angular, { IController } from "angular"
import { html } from "@/util"
import { AlignedApiRelation, WordPictureColumn } from "@/word-picture"
import { Lemgram } from "@/lemgram"
import { RelationsSort } from "@/backend/types/relations"
import { RootScope } from "@/root-scope.types"
import { WordpicExampleTask } from "@/task/wordpic-example-task"

type WordPictureColumnController = IController & {
    column: WordPictureColumn
    limit: string
    showWordClass: boolean
    sort: RelationsSort
    // Locals
    rows: AlignedApiRelation[]
    parseLemgram: (row: AlignedApiRelation) => { label: string; pos?: string; idx?: number }
    onClickExample: (row: AlignedApiRelation) => void
}

angular.module("korpApp").component("wordPictureColumn", {
    template: html`
        <div class="lemgram_result float-left p-1" ng-class="$ctrl.column.config.css_class">
            <table class="m-0 p-0">
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
                            title="{{'stat_lmi' | loc:$root.lang}}: {{row.mi | number:2}}"
                            class="px-1 text-right"
                        >
                            {{row.freq}}
                        </td>
                        <td
                            ng-if="$ctrl.sort == 'mi'"
                            title="{{'stat_frequency' | loc:$root.lang}}: {{row.freq}}"
                            class="px-1 text-right"
                        >
                            {{row.mi | number:2}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    bindings: {
        column: "<",
        limit: "<",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope: RootScope) {
            const $ctrl = this as WordPictureColumnController

            $ctrl.$onChanges = (changes) => {
                if (changes.limit?.currentValue) {
                    $ctrl.rows = $ctrl.column.rows.slice(0, Number($ctrl.limit))
                }
            }

            $ctrl.parseLemgram = function (row) {
                const [id] = row.other.split("|")
                const prefix = row.depextra ? `${row.depextra} ` : ""

                const lemgram = Lemgram.parse(id)
                if (lemgram) {
                    const concept = row.dep ? lemgram.form : "-"
                    return {
                        label: prefix + concept,
                        pos: lemgram.pos,
                        idx: lemgram.index,
                    }
                }

                return { label: prefix + id }
            }

            $ctrl.onClickExample = function (row) {
                $rootScope.kwicTabs.push(new WordpicExampleTask(row.source.join(",")))
            }
        },
    ],
})
