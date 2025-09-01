/** @format */
import angular, { IController } from "angular"
import { html } from "@/util"
import { LangString } from "@/i18n/types"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import {
    ChooserFolderSub,
    CorpusLinkInfo,
    CorpusSizeInfo,
    getSizeInfo,
    isFolder,
    makeLink,
} from "@/corpora/corpus-chooser"
import { StoreService } from "@/services/store"

type CcInfoBoxController = IController & {
    object: ChooserFolderSub | CorpusTransformed
    isCorpus: boolean
    isFolder: boolean
    title: LangString
    description?: LangString
    link?: CorpusLinkInfo
    numberOfChildren: number
    langStats: CorpusSizeInfo[]
    context: boolean
    limitedAccess: boolean
    lastUpdated?: string
}

angular.module("korpApp").component("ccInfoBox", {
    template: html`
        <div class="p-5 m-8 bg-white">
            <h3 class="mt-0 mb-6">
                <i class="fa-solid fa-file-text-o text-blue-700" ng-if="$ctrl.isCorpus"></i>
                <i class="fa-solid fa-folder-open-o text-blue-700" ng-if="$ctrl.isFolder"></i>
                {{ $ctrl.title | locObj:$root.lang }}
            </h3>
            <div class="text-base my-3" ng-bind-html="$ctrl.description | locObj:$root.lang | trust"></div>
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
        "store",
        function (store: StoreService) {
            let $ctrl = this as CcInfoBoxController

            $ctrl.$onChanges = () => {
                $ctrl.title = $ctrl.object.title
                $ctrl.description = $ctrl.object.description

                $ctrl.isFolder = isFolder($ctrl.object)
                $ctrl.isCorpus = !$ctrl.isFolder
                if (isFolder($ctrl.object)) $ctrl.numberOfChildren = $ctrl.object.numberOfChildren

                $ctrl.limitedAccess = false
                $ctrl.context = false
                $ctrl.link = undefined

                if (!isFolder($ctrl.object)) {
                    $ctrl.limitedAccess = $ctrl.object["limited_access"] || false
                    $ctrl.context = Object.keys($ctrl.object.context).length > 1
                    $ctrl.langStats = getSizeInfo($ctrl.object)
                    $ctrl.lastUpdated = $ctrl.object.info.Updated
                    $ctrl.link = makeLink($ctrl.object.id, store.lang)
                } else {
                    $ctrl.langStats = [{ tokens: $ctrl.object.tokens!, sentences: $ctrl.object.sentences! }]
                }
            }
        },
    ],
})
