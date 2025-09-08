import angular, { IController } from "angular"
import { html } from "@/util"
import { TableDrawData } from "@/backend/proxy/relations-proxy"
import { RelationsSort } from "@/backend/types/relations"
import "@/components/util/help-box"
import "./word-picture-section"
import { Lemgram } from "@/lemgram"

type WordPictureController = IController & {
    // Bindings
    data: TableDrawData[]
    onSortChange: (args: { sort: RelationsSort }) => void
    sort: RelationsSort
    warning?: string

    // Locals
    limit: string // Number as string to work with <select ng-model>
    limitOptions: number[]
    showWordClass: boolean
    sortLocal: RelationsSort
    statProp: RelationsSort
    isLemgram: (word: string) => boolean
    lemgramToHtml: (word: string) => string
}

const LIMITS: readonly number[] = [15, 50, 100, 500, 1000]

angular.module("korpApp").component("wordPicture", {
    template: html`
        <div ng-if="$ctrl.warning" class="korp-warning" role="status">{{$ctrl.warning}}</div>

        <div ng-if="$ctrl.data.length">
            <div class="flex flex-wrap items-baseline mb-4 gap-4 bg-gray-100 p-2">
                <label>
                    <input ng-model="$ctrl.showWordClass" type="checkbox" />
                    {{'show_wordclass' | loc:$root.lang}}
                </label>
                <select ng-model="$ctrl.limit">
                    <option ng-repeat="option in $ctrl.limitOptions" value="{{option}}">
                        {{'word_pic_show_some' | loc:$root.lang}} {{option}} {{'word_pic_hits' | loc:$root.lang}}
                    </option>
                </select>
                <div class="flex flex-wrap gap-2">
                    {{'sort_by' | loc:$root.lang}}:
                    <label>
                        <input type="radio" value="mi" ng-model="$ctrl.sortLocal" ng-change="$ctrl.changeSort()" />
                        {{'stat_lmi' | loc:$root.lang}}
                        <i
                            class="fa fa-info-circle text-gray-400 table-cell align-middle mb-0.5"
                            uib-tooltip="{{'stat_lmi_help' | loc:$root.lang}}"
                        ></i>
                    </label>
                    <label>
                        <input type="radio" value="freq" ng-model="$ctrl.sortLocal" ng-change="$ctrl.changeSort()" />
                        {{'stat_frequency' | loc:$root.lang}}
                    </label>
                </div>
            </div>

            <div class="content_target flex flex-wrap gap-4 items-start">
                <section class="radialBkg p-2 border border-gray-400" ng-repeat="word in $ctrl.data">
                    <h2 class="text-xl mb-4">
                        <span
                            ng-if="$ctrl.isLemgram(word.token)"
                            ng-bind-html="$ctrl.lemgramToHtml(word.token) | trust"
                        ></span>
                        <span ng-if="!$ctrl.isLemgram(word.token)">
                            {{word.token}} ({{word.wordClassShort | loc:$root.lang}})
                        </span>
                    </h2>

                    <word-picture-section
                        ng-repeat="section in word.data"
                        limit="$ctrl.limit"
                        parent-index="$index"
                        section="section"
                        show-word-class="$ctrl.showWordClass"
                        sort="$ctrl.statProp"
                        token="word.token"
                        word-class="word.wordClass"
                    >
                    </word-picture-section>
                </section>
            </div>
        </div>

        <help-box>
            <p>{{'word_pic_description' | loc:$root.lang}}</p>
            <p>{{'word_pic_result_description' | loc:$root.lang}}</p>
        </help-box>
    `,
    bindings: {
        data: "<",
        onSortChange: "&",
        sort: "<",
        warning: "<",
    },
    controller: [
        function () {
            const $ctrl = this as WordPictureController

            $ctrl.limitOptions = [...LIMITS]
            $ctrl.limit = String(LIMITS[0])
            $ctrl.showWordClass = false

            $ctrl.$onChanges = (changes) => {
                if ("data" in changes && changes.data.currentValue) {
                    $ctrl.statProp = $ctrl.sort
                    // Find length of longest column
                    const max = Math.max(
                        ...$ctrl.data.flatMap((word) =>
                            word.data.flatMap((table) =>
                                table.flatMap((col) => (Array.isArray(col.table) ? col.table.length : 0)),
                            ),
                        ),
                    )
                    // Include options up to the first that is higher than the longest column
                    const endIndex = LIMITS.findIndex((limit) => limit >= max)
                    $ctrl.limitOptions = LIMITS.slice(0, endIndex + 1)
                    // Clamp previously selected value
                    if (Number($ctrl.limit) > LIMITS[endIndex]) $ctrl.limit = String(LIMITS[endIndex])
                }

                if ("sort" in changes) {
                    $ctrl.sortLocal = changes.sort.currentValue
                }
            }

            $ctrl.changeSort = () => {
                $ctrl.onSortChange({ sort: $ctrl.sortLocal })
            }

            $ctrl.isLemgram = (id) => !!Lemgram.parse(id)
            $ctrl.lemgramToHtml = (id) => Lemgram.parse(id)!.toHtml()
        },
    ],
})
