/** @format */
import angular, { IController, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html, LocationService } from "@/util"
import { matomoSend } from "@/matomo"
import "@/components/extended/tokens"
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { SearchesService } from "@/services/searches"
import { StoreService } from "@/services/store"
import { getEnabledLangs, getParallelCqp, ParallelQuery } from "@/parallel/parallel-cqp"

type ExtendedParallelController = IController & {
    langs: ParallelQuery[]
    cqpChange: (idx: number) => (cqp: string) => void
    onLangChange: () => void
    getEnabledLangs: (i?: number) => string[]
    addLangRow: () => void
    removeLangRow: (i: number) => void
    onSubmit: () => void
    keydown: ($event: KeyboardEvent) => void
}

angular.module("korpApp").component("extendedParallel", {
    template: html`
        <div ng-keydown="$ctrl.keydown($event)">
            <div ng-repeat="l in $ctrl.langs">
                <select
                    ng-model="l.lang"
                    ng-options="langstr as (langstr | loc:$root.lang) for langstr in $ctrl.getEnabledLangs($index)"
                    ng-change="$ctrl.onLangChange()"
                ></select>
                <label
                    uib-tooltip="{{'negate_explanation' | loc:$root.lang}} "
                    ng-show="!$first"
                    for="negate_chk{{$index}}"
                    >{{"not_containing" | loc:$root.lang}}</label
                >
                <input type="checkbox" id="negate_chk{{$index}}" ng-show="!$first" ng-model="l.negate" />
                <extended-tokens
                    cqp="l.cqp"
                    cqp-change="$ctrl.cqpChange($index)(cqp)"
                    parallell-lang="l.lang"
                ></extended-tokens>
            </div>
            <input
                class="btn btn-default btn-sm"
                id="linkedLang"
                ng-disabled="!$ctrl.getEnabledLangs($ctrl.langs.length).length"
                ng-click="$ctrl.addLangRow()"
                type="submit"
                value="{{'add_lang' | loc:$root.lang}}"
            />
            <input
                class="btn btn-default btn-sm"
                id="removeLang"
                ng-if="$ctrl.langs.length > 1"
                ng-click="$ctrl.removeLangRow()"
                type="submit"
                value="{{'remove_lang' | loc:$root.lang}}"
            />
            <button class="btn btn-default btn-sm" ng-click="$ctrl.onSubmit()">{{'search' | loc:$root.lang}}</button>
        </div>
    `,
    bindings: {
        parallel: "<",
    },
    controller: [
        "$location",
        "$timeout",
        "searches",
        "store",
        function (
            $location: LocationService,
            $timeout: ITimeoutService,
            searches: SearchesService,
            store: StoreService
        ) {
            const ctrl = this as ExtendedParallelController

            const corpusListing = settings.corpusListing as ParallelCorpusListing

            store.watch("corpus", () => ctrl.onLangChange())

            const newLang = (lang = settings.start_lang!, cqp = "[]") => ({ lang, cqp, negate: false })

            ctrl.langs = store.parallel_corpora.length
                ? store.parallel_corpora.map((lang) => newLang(lang, store.cqpParallel[lang] || "[]"))
                : [newLang()]

            ctrl.cqpChange = (idx) => (cqp) => {
                if (ctrl.langs[idx].cqp != cqp) {
                    ctrl.langs[idx].cqp = cqp
                    updateCqp()
                }
            }

            function updateCqp() {
                store.extendedCqp = getParallelCqp(ctrl.langs)

                store.cqpParallel = {}
                for (const { lang, cqp } of ctrl.langs) {
                    if (lang) store.cqpParallel[lang] = cqp
                }
            }

            ctrl.onLangChange = function () {
                var currentLangList = _.map(ctrl.langs, "lang")
                corpusListing.setActiveLangs(currentLangList)
                store.parallel_corpora = currentLangList
            }

            ctrl.onSubmit = function () {
                $location.replace()
                updateCqp()
                store.search = `cqp|${store.extendedCqp}`
                store.page = 0
                matomoSend("trackEvent", "Search", "Submit search", "Extended")
                searches.doSearch()
            }

            ctrl.keydown = function ($event: KeyboardEvent) {
                if ($event.key === "Enter") {
                    if ($(".arg_value:focus").length) {
                        $timeout(ctrl.onSubmit, 300)
                    }
                }
            }

            ctrl.getEnabledLangs = (i) => getEnabledLangs(ctrl.langs, i)

            ctrl.addLangRow = function () {
                ctrl.langs.push(newLang(ctrl.getEnabledLangs()[0]))
                ctrl.onLangChange()
                updateCqp()
            }

            ctrl.removeLangRow = function () {
                ctrl.langs.pop()
                ctrl.onLangChange()
                updateCqp()
            }
        },
    ],
})
