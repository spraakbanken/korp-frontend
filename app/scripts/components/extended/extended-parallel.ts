/** @format */
import angular, { IController, ITimeoutService } from "angular"
import _ from "lodash"
import settings from "@/settings"
import { expandOperators } from "@/cqp_parser/cqp"
import { html } from "@/util"
import { matomoSend } from "@/matomo"
import "@/components/extended/tokens"
import { ParallelCorpusListing } from "@/parallel/corpus_listing"
import { LocationService } from "@/urlparams"
import { RootScope } from "@/root-scope.types"
import { SearchesService } from "@/services/searches"

type ExtendedParallelController = IController & {
    langs: { lang: string; cqp: string }[]
    negates: boolean[]
    initialized: boolean
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
                <input type="checkbox" id="negate_chk{{$index}}" ng-show="!$first" ng-model="$ctrl.negates[$index]" />
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
        "$rootScope",
        "$timeout",
        "searches",
        function (
            $location: LocationService,
            $rootScope: RootScope,
            $timeout: ITimeoutService,
            searches: SearchesService
        ) {
            const ctrl = this as ExtendedParallelController

            const corpusListing = settings.corpusListing as ParallelCorpusListing

            ctrl.initialized = false

            ctrl.$onInit = () => {
                ctrl.onLangChange()
                ctrl.initialized = true

                $rootScope.$on("corpuschooserchange", () => ctrl.onLangChange())
            }

            ctrl.negates = []

            const langs = $location.search().parallel_corpora
            if (langs) {
                ctrl.langs = langs.split(",").map((lang) => ({
                    lang,
                    cqp: $location.search()[`cqp_${lang}`] || "[]",
                }))
            } else {
                ctrl.langs = [{ lang: settings.start_lang!, cqp: "[]" }]
            }

            ctrl.cqpChange = (idx) => (cqp) => {
                if (ctrl.langs[idx].cqp != cqp) {
                    ctrl.langs[idx].cqp = cqp
                    onCQPChange()
                }
            }

            const onCQPChange = () => {
                const currentLangList = _.map(ctrl.langs, "lang")
                var struct = corpusListing.getLinksFromLangs(currentLangList)
                function getLangMapping(excludeLangs: string[]) {
                    return _(struct)
                        .flatten()
                        .filter(function (item) {
                            return !_.includes(excludeLangs, item.lang)
                        })
                        .groupBy("lang")
                        .value()
                }
                function expandCQP(cqp: string) {
                    try {
                        return expandOperators(cqp)
                    } catch (e) {
                        console.log("parallel cqp parsing error", e)
                        return cqp
                    }
                }

                var output = expandCQP(ctrl.langs[0].cqp)

                output += _.map(ctrl.langs.slice(1), function (langobj, i) {
                    const langMapping = getLangMapping(currentLangList.slice(0, i + 1))
                    const linkedCorpus = _(langMapping[langobj.lang]).map("id").invokeMap("toUpperCase").join("|")
                    const expanded = expandCQP(langobj.cqp)
                    const neg = ctrl.negates[i + 1] ? "!" : ""
                    return ":LINKED_CORPUS:" + linkedCorpus + " " + neg + " " + expanded
                }).join("")

                _.each(ctrl.langs, function (langobj, i) {
                    if (!_.isEmpty(langobj.lang)) {
                        $location.search(`cqp_${langobj.lang}`, langobj.cqp)
                    }
                })
                $rootScope.extendedCQP = output
                return output
            }

            ctrl.onLangChange = function () {
                var currentLangList = _.map(ctrl.langs, "lang")
                corpusListing.setActiveLangs(currentLangList)
                $location.search("parallel_corpora", currentLangList.join(","))
                $rootScope.langDef.resolve()
            }

            ctrl.onSubmit = function () {
                $location.replace()
                $location.search("search", `cqp|${onCQPChange()}`)
                $location.search("page", null)
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

            const enabledLangsHelper = function (lang: string) {
                return _(corpusListing.getLinksFromLangs([lang]))
                    .flatten()
                    .map("lang")
                    .uniq()
                    .value()
            }

            ctrl.getEnabledLangs = function (i) {
                if (i === 0) {
                    ctrl.langs[0].lang ??= settings.start_lang!
                    return enabledLangsHelper(settings.start_lang!)
                }
                var currentLangList = _.map(ctrl.langs, "lang")
                if (i != undefined) delete currentLangList[i]
                const firstlang = ctrl.langs[0]?.lang || settings.start_lang!
                var other = enabledLangsHelper(firstlang)
                var langResult = _.difference(other, currentLangList)
                if (i != undefined && ctrl.langs[i] && !ctrl.langs[i].lang) {
                    ctrl.langs[i].lang = langResult[0]
                }
                return langResult
            }

            ctrl.addLangRow = function () {
                ctrl.langs.push({ lang: ctrl.getEnabledLangs()[0], cqp: "[]" })
                ctrl.onLangChange()
            }
            ctrl.removeLangRow = function () {
                const lang = ctrl.langs.pop()!
                $location.search(`cqp_${lang.lang}`, null)
                ctrl.onLangChange()
            }
        },
    ],
})
