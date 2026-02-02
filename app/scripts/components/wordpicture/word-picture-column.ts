import angular, { IController } from "angular"
import { html } from "@/util"
import { MatchedRelation } from "@/word-picture"
import { Lemgram } from "@/lemgram"
import { RelationsSort } from "@/backend/types/relations"
import { StoreService } from "@/services/store.types"
import { loc } from "@/i18n"
import { sortBy } from "lodash"

type RelationBase = Omit<MatchedRelation, RelationsSort>
type RelationStats = Pick<MatchedRelation, RelationsSort>

type Row = RelationBase & {
    currentStats?: RelationStats
    prevStats?: RelationStats
}

type WordPictureColumnController = IController & {
    // Bindings
    cssClass: string
    items: MatchedRelation[]
    limit: string
    onClickExample: (args: { relation: MatchedRelation }) => void
    prevPeriodItems?: MatchedRelation[]
    showWordClass: boolean
    sort: RelationsSort

    // Locals
    /** Processed items */
    rows: Row[]
    /** Format the numbers for all stats of a row (freq etc). */
    formatStats: (stats: RelationStats) => Record<RelationsSort, string>
    /** Get the row stats as a string with HTML linebreaks */
    getStatsTooltip: (row: Row) => string
    getTrendMarker: (item: Row) => string
    parseLemgram: (row: Row) => { label: string; pos?: string; idx?: number }
}

angular.module("korpApp").component("wordPictureColumn", {
    template: html`
        <div class="lemgram_result float-left p-1" ng-class="$ctrl.cssClass">
            <table class="m-0">
                <tbody>
                    <tr
                        ng-repeat="row in $ctrl.rows"
                        ng-init="data = $ctrl.parseLemgram(row)"
                        ng-class="{'opacity-50': !row.currentStats }"
                    >
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
                        <td
                            ng-if="row.currentStats"
                            uib-tooltip-html="$ctrl.getStatsTooltip(row.currentStats) | trust"
                            class="px-1 text-right"
                        >
                            {{$ctrl.formatStats(row.currentStats)[$ctrl.sort]}}
                        </td>
                        <td ng-if="!row.currentStats" />
                        <td class="px-1 cursor-default">{{ $ctrl.getTrendMarker(row) }}</td>
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
        prevPeriodItems: "<",
        showWordClass: "<",
        sort: "<",
    },
    controller: [
        "store",
        function (store: StoreService) {
            const $ctrl = this as WordPictureColumnController

            $ctrl.$onChanges = (changes) => {
                if (changes.limit?.currentValue || changes.items?.currentValue || changes.sort?.currentValue) {
                    // Join current and previous period items
                    const rows: Row[] = $ctrl.items.map((item) => ({
                        ...item,
                        currentStats: { ...item },
                        prevStats: getPrevPeriodItem(item),
                    }))
                    for (const item of $ctrl.prevPeriodItems || []) {
                        if (!rows.some((current) => isRelationEqual(current, item)))
                            rows.push({ ...item, prevStats: { ...item } })
                    }

                    // Sort and limit items
                    $ctrl.rows = sortBy(rows, (row) => row.currentStats?.[$ctrl.sort] ?? -Infinity)
                        .reverse()
                        .slice(0, Number($ctrl.limit))

                    // Find rows from previous period that are missing now
                    const rowsLost =
                        $ctrl.prevPeriodItems?.filter(
                            (prevItem) => !$ctrl.rows.some((currentItem) => isRelationEqual(currentItem, prevItem)),
                        ) || []
                    $ctrl.rowsLost = rowsLost.slice(0, Number($ctrl.limit) - $ctrl.rows.length)
                }
            }

            $ctrl.formatStats = (row) => ({
                freq: String(row.freq),
                freq_relative: formatNumber(row.freq_relative),
                mi: formatNumber(row.mi),
                rmi: formatNumber(row.rmi),
            })

            $ctrl.getStatsTooltip = (row) => {
                if (!row.currentStats) return ""
                const stats = $ctrl.formatStats(row.currentStats)
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

            $ctrl.getTrendMarker = function (row: Row): string {
                if (!$ctrl.prevPeriodItems) return "" // No previous period data
                if (!row.prevStats) return "✴" // New item
                if (!row.currentStats) return "−" // Lost item
                const delta = row.currentStats[$ctrl.sort] - row.prevStats[$ctrl.sort]
                if (delta > 0) return "↗"
                if (delta < 0) return "↘"
                return "" // No change
            }

            /** Find equivalent item in the previous period */
            function getPrevPeriodItem(item: MatchedRelation): MatchedRelation | undefined {
                return $ctrl.prevPeriodItems?.find((prevItem) => isRelationEqual(prevItem, item))
            }

            const isRelationEqual = (a: RelationBase, b: RelationBase): boolean =>
                a.other == b.other && a.otherpos == b.otherpos && a.prefix == b.prefix
        },
    ],
})
