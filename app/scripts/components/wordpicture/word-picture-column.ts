import angular, { IController } from "angular"
import { html } from "@/util"
import { MatchedRelation } from "@/word-picture"
import { Lemgram } from "@/lemgram"
import { RelationsSort } from "@/backend/types/relations"
import { StoreService } from "@/services/store.types"
import { loc } from "@/i18n"

type WordPictureColumnController = IController & {
    cssClass: string
    items: MatchedRelation[]
    limit: string
    onClickExample: (args: { relation: MatchedRelation }) => void
    showWordClass: boolean
    sort: RelationsSort
    // Locals
    /** Format the numbers for all stats of a row (freq etc). */
    getStats: (row: MatchedRelation) => Record<RelationsSort, string>
    /** Get the row stats as a string with HTML linebreaks */
    getStatsTooltip: (row: MatchedRelation) => string
    parseLemgram: (row: MatchedRelation) => { label: string; pos?: string; idx?: number }
}

angular.module("korpApp").component("wordPictureColumn", {
    template: html`
        <div class="lemgram_result float-left p-1" ng-class="$ctrl.cssClass">
            <table class="m-0">
                <tbody>
                    <tr ng-repeat="row in $ctrl.rows" ng-init="data = $ctrl.parseLemgram(row)">
                        <td class="px-1 text-right"><span class="enumerate"></span></td>
                        <td
                            ng-click="$ctrl.onClickExample({relation: row})"
                            class="px-1 pr-2 cursor-pointer hover:underline"
                        >
                            <span ng-if="data.label">
                                {{ data.label }}<sup ng-if="data.idx > 1">{{data.idx}}</sup>
                                <span ng-if="$ctrl.showWordClass && data.pos"> ({{data.pos | loc:$root.lang}}) </span>
                            </span>
                            <span ng-if="!data.label" class="opacity-50">&empty;</span>
                        </td>
                        <td uib-tooltip-html="$ctrl.getStatsTooltip(row) | trust" class="px-1 text-right">
                            {{$ctrl.getStats(row)[$ctrl.sort]}}
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
        onClickExample: "&",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        "store",
        function (store: StoreService) {
            const $ctrl = this as WordPictureColumnController

            $ctrl.$onChanges = (changes) => {
                if (changes.limit?.currentValue || changes.items?.currentValue || changes.sort?.currentValue) {
                    // Sort and limit items
                    $ctrl.rows = $ctrl.items.sort((a, b) => b[$ctrl.sort] - a[$ctrl.sort]).slice(0, Number($ctrl.limit))
                }
            }

            $ctrl.getStats = (row) => ({
                freq: String(row.freq),
                freq_relative: formatNumber(row.freq_relative),
                mi: formatNumber(row.mi),
                rmi: formatNumber(row.rmi),
            })

            $ctrl.getStatsTooltip = (row) => {
                const stats = $ctrl.getStats(row)
                return Object.keys(stats)
                    .map((key: RelationsSort) => `${loc(`stat_${key}`, store.lang)}: ${stats[key]}`)
                    .join("<br />")
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

            /** Format a number with two digits. */
            const formatNumber = (number: Number): string =>
                number.toLocaleString(store.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
    ],
})
