/** @format */
import angular from "angular"
import _ from "lodash"
import settings from "@/settings"
import { html, locObj } from "@/util"

angular.module("korpApp").component("ccInfoBox", {
    template: html`
        <div class="p-5 m-8 bg-white">
            <h3 class="mt-0 mb-6">
                <i class="fa-solid fa-file-text-o text-blue-700" ng-if="$ctrl.isCorpus"></i>
                <i class="fa-solid fa-folder-open-o text-blue-700" ng-if="$ctrl.isFolder"></i>
                {{ $ctrl.title | locObj:lang }}
            </h3>
            <div class="text-base my-3" ng-bind-html="$ctrl.description | locObj:lang | trust"></div>
            <div ng-if="$ctrl.link" class="my-3">
                <a ng-href="{{$ctrl.link.url}}" target="_blank">
                    {{$ctrl.link.label}}
                    <i class="fa-solid fa-up-right-from-square fa-sm mx-1"></i>
                </a>
            </div>
            <ul class="border-l-4 border-blue-500 pl-3 leading-none space-y-1">
                <li ng-if="$ctrl.isFolder">
                    <strong>{{$ctrl.numberOfChildren}}</strong>
                    {{$ctrl.numberOfChildren == 1 ? 'corpselector_corporawith_sing' : 'corpselector_corporawith_plur' |
                    loc:$root.lang}}
                </li>
                <li ng-repeat-start="stats in $ctrl.langStats">
                    <strong>{{ stats.tokens | prettyNumber }}</strong>
                    {{ 'corpselector_tokens' | loc:$root.lang }}
                    <span ng-if="$ctrl.langStats.length > 1">({{ stats.lang | loc:$root.lang }})</span>
                </li>
                <li ng-repeat-end ng-if="stats.sentences > 0">
                    <strong>{{ stats.sentences | prettyNumber }}</strong>
                    {{ 'corpselector_sentences' | loc:$root.lang }}
                    <span ng-if="$ctrl.langStats.length > 1">({{ stats.lang | loc:$root.lang }})</span>
                </li>
            </ul>
            <div ng-if="$ctrl.context">{{'corpselector_supports' | loc:$root.lang}}</div>
            <div ng-if="$ctrl.limitedAccess">{{'corpselector_limited' | loc:$root.lang}}</div>
            <div class="text-sm mt-3" ng-if="$ctrl.isCorpus">
                <span class="mr-1">{{'corpselector_lastupdate' | loc:$root.lang}}:</span>
                <span class="font-bold">{{ $ctrl.lastUpdated }}</span>
            </div>
        </div>
    `,
    bindings: {
        object: "<",
    },
    controller: [
        "$rootScope",
        function ($rootScope) {
            let $ctrl = this

            $ctrl.$onChanges = () => {
                $ctrl.title = $ctrl.object.title
                $ctrl.description = $ctrl.object.description

                $ctrl.numberOfChildren = $ctrl.object.numberOfChildren
                $ctrl.isFolder = $ctrl.object.numberOfChildren > 0
                $ctrl.isCorpus = !($ctrl.object.numberOfChildren > 0)

                $ctrl.langStats = []
                $ctrl.link = undefined

                if ($ctrl.isCorpus) {
                    $ctrl.limitedAccess = $ctrl.object["limited_access"]
                    $ctrl.context = _.keys($ctrl.object.context).length > 1

                    if ($ctrl.object["linked_to"]) {
                        for (const linkedCorpusId of $ctrl.object["linked_to"]) {
                            const linkedCorpus = settings.corpora[linkedCorpusId]
                            const sentences = parseInt(linkedCorpus.info.Sentences) || 0
                            const tokens = parseInt(linkedCorpus.info.Size) || 0
                            const lang = linkedCorpus.lang
                            $ctrl.langStats.push({ lang, tokens, sentences })
                        }
                    }
                    $ctrl.lastUpdated = $ctrl.object.info.Updated
                    $ctrl.link = makeLink()
                } else {
                    $ctrl.limitedAccess = false
                    $ctrl.context = false
                }

                $ctrl.langStats.push({
                    lang: $ctrl.object.lang,
                    tokens: $ctrl.object.tokens,
                    sentences: $ctrl.object.sentences,
                })
            }

            /** Create data for corpus link. */
            function makeLink() {
                if (!settings["corpus_info_link"]) return
                const urlTemplate = locObj(settings["corpus_info_link"]["url_template"], $rootScope.lang)
                const label = locObj(settings["corpus_info_link"]["label"], $rootScope.lang)
                if (!urlTemplate || !label) {
                    console.error(`Invalid setting "corpus_info_link"`, settings["corpus_info_link"])
                    return
                }
                const url = urlTemplate.replace("%s", $ctrl.object.id)
                return { url, label }
            }
        },
    ],
})
