import angular, { ICompileService, IController, IControllerService, IScope } from "angular"
import "../../../styles/sidebar.scss"
import statemachine from "@/statemachine"
import settings from "@/settings"
import { html } from "@/util"
import { getConfigurable } from "@/settings"
import { safeApply } from "@/angular-util"
import { locObj } from "@/i18n"
import "@/services/utils"
import "./deptree"
import "./sidebar-section"
import "@/kwic/video-controller" // May be used by custom code
import { RootScope } from "@/root-scope.types"
import { SelectWordEvent } from "@/statemachine/types"
import { CorpusTransformed } from "@/settings/config-transformed.types"
import { Attribute, CustomAttribute } from "@/settings/config.types"
import { JQueryExtended } from "@/jquery.types"
import { Token } from "@/backend/types"
import { TextTask } from "@/task/text-task"
import { corpusListing } from "@/corpora/corpus_listing"
import deptreeImg from "@/../img/deptree.svg"
import { sidebarComponents, sidebarDefaultComponent } from "./sidebar-components"

type SidebarController = IController & {
    // Bindings
    lang: string
    onShow: () => void
    onHide: () => void
    // Locals
    data: SelectWordEvent | null
    corpusObj: CorpusTransformed
    sentenceData: Record<string, string>
    inReadingMode: boolean
    tokens: Token[]
    showDepTree: boolean
    openReadingMode: () => void
    updateContent: (event: SelectWordEvent) => void
    openDepTree: () => void
    closeDepTree: () => void
    renderCorpusContent: (
        type: string,
        wordData: Token,
        sentenceData: Record<string, string>,
        corpus_attrs: Record<string, Attribute>,
        tokens: Token[],
        customAttrs: Record<string, CustomAttribute>,
        customData: [string, HTMLElement][],
    ) => JQLite
    renderCustomContent: (
        wordData: Token,
        sentenceData: Record<string, string>,
        corpus_attrs: Record<string, CustomAttribute> | undefined,
        tokens: Token[],
    ) => { pos: [string, HTMLElement][]; struct: [string, HTMLElement][] }
    renderItem: (
        type: string | null,
        key: string,
        value: string,
        attrs: Attribute,
        wordData: Token,
        sentenceData: Record<string, string>,
        tokens: Token[],
    ) => JQLite
    applyEllipse: () => void
}

type SidebarScope = IScope & {
    posData: JQLite | null
    structData: JQLite | null
}

angular.module("korpApp").component("sidebar", {
    template: html`
        <div class="sticky top-2 flex flex-col gap-4" ng-show="$ctrl.corpusObj">
            <div>
                <h4 class="font-normal uppercase text-gray-800 mt-0 mb-1 text-sm tracking-tight">
                    {{'corpus' | loc:$root.lang}}
                </h4>
                <div class="text-lg">{{$ctrl.corpusObj.title| locObj:$root.lang}}</div>
            </div>

            <div class="openReadingMode" ng-show="!$ctrl.inReadingMode && $ctrl.corpusObj['reading_mode']">
                <span ng-click="$ctrl.openReadingMode()" class="link"> {{'read_in_korp' | loc:$root.lang}} </span>
            </div>

            <sidebar-section ng-show="structData" title="{{'sentence_attr' | loc:$root.lang}}">
                <div id="selected_sentence"></div>
            </sidebar-section>

            <sidebar-section ng-show="posData" title="{{'word_attr' | loc:$root.lang}}">
                <div id="selected_word"></div>
            </sidebar-section>

            <button
                ng-show="$ctrl.corpusObj.attributes.deprel"
                ng-click="$ctrl.openDepTree()"
                class="btn btn-link text-center w-full"
            >
                <img src="${deptreeImg}" class="block mx-auto" />
                {{'show_deptree' | loc:$root.lang}}
            </button>
            <dep-tree
                ng-if="$ctrl.showDepTree"
                tokens="$ctrl.tokens"
                corpus="$ctrl.corpusObj"
                on-close="$ctrl.closeDepTree()"
            ></dep-tree>
        </div>
    `,
    bindings: {
        onShow: "&",
        onHide: "&",
        lang: "<",
    },
    controller: [
        "$compile",
        "$controller",
        "$element",
        "$rootScope",
        "$scope",
        function (
            $compile: ICompileService,
            $controller: IControllerService,
            $element: JQLite,
            $rootScope: RootScope,
            $scope: SidebarScope,
        ) {
            let $ctrl = this as SidebarController

            $scope.posData = null
            $scope.structData = null

            statemachine.listen("select_word", function (data) {
                safeApply($rootScope, () => {
                    $ctrl.data = data
                    if (data == null) {
                        $ctrl.onHide()
                    } else {
                        $ctrl.onShow()
                        $ctrl.updateContent(data)
                    }
                })
            })

            $ctrl.$onChanges = (changesObj) => {
                if (changesObj["lang"]) {
                    if ($ctrl.data) {
                        $ctrl.updateContent($ctrl.data)
                    }
                }
            }

            $ctrl.openDepTree = () => {
                $ctrl.showDepTree = true
            }

            $ctrl.closeDepTree = () => {
                $ctrl.showDepTree = false
            }

            $ctrl.openReadingMode = () => {
                $rootScope.textTabs.push(new TextTask($ctrl.corpusObj.id, $ctrl.sentenceData))
            }

            $ctrl.updateContent = ({ sentenceData, wordData, corpus, tokens, inReadingMode }) => {
                // TODO: this is pretty broken
                const corpusObj = settings.corpora[corpus] || corpusListing.get(corpus)
                $ctrl.corpusObj = corpusObj
                $ctrl.sentenceData = sentenceData
                $ctrl.inReadingMode = inReadingMode
                $ctrl.tokens = tokens

                const customContentPos: [string, HTMLElement][] = []
                const customContentStruct: [string, HTMLElement][] = []
                if (!$.isEmptyObject(corpusObj["custom_attributes"])) {
                    const { pos, struct } = $ctrl.renderCustomContent(
                        wordData,
                        sentenceData,
                        corpusObj.custom_attributes,
                        tokens,
                    )
                    customContentPos.push(...pos)
                    customContentStruct.push(...struct)
                }

                $scope.posData = null
                if (!$.isEmptyObject(corpusObj.attributes)) {
                    $scope.posData = $ctrl.renderCorpusContent(
                        "pos",
                        wordData,
                        sentenceData,
                        corpusObj.attributes,
                        tokens,
                        corpusObj.custom_attributes || {},
                        customContentPos,
                    )
                }

                $scope.structData = null
                if (!$.isEmptyObject(corpusObj["struct_attributes"])) {
                    $scope.structData = $ctrl.renderCorpusContent(
                        "struct",
                        wordData,
                        sentenceData,
                        corpusObj.struct_attributes,
                        tokens,
                        corpusObj.custom_attributes || {},
                        customContentStruct,
                    )
                }
                ;($element as JQueryExtended).localize()
                $ctrl.applyEllipse()
            }

            $ctrl.renderCorpusContent = (
                type,
                wordData,
                sentenceData,
                corpus_attrs,
                tokens,
                customAttrs,
                customData,
            ) => {
                let pairs: [string, any][] = []
                let sortingArr: string[] = []
                if (type === "struct") {
                    pairs = Object.entries(sentenceData)
                    sortingArr = $ctrl.corpusObj["_struct_attributes_order"]
                } else if (type === "pos") {
                    pairs = Object.entries(wordData)
                    sortingArr = $ctrl.corpusObj["_attributes_order"]
                }

                pairs = pairs.filter(([key]) => corpus_attrs[key])
                pairs = pairs.filter(
                    ([key]) => corpus_attrs[key]["display_type"] != "hidden" && !corpus_attrs[key]["hide_sidebar"],
                )
                pairs.sort((a, b) => sortingArr.indexOf(a[0]) - sortingArr.indexOf(b[0]))

                pairs.push(...customData)

                let items: HTMLElement[] = []
                for (const [key, value] of pairs) {
                    if (key in customAttrs && value) {
                        items.push(value as HTMLElement)
                    } else {
                        const item = $ctrl.renderItem(
                            type,
                            key,
                            value,
                            corpus_attrs[key],
                            wordData,
                            sentenceData,
                            tokens,
                        )
                        const el = item.get(0)
                        if (el) items.push(el)
                    }
                }

                return $(items)
            }

            $ctrl.renderCustomContent = (wordData, sentenceData, corpus_attrs, tokens) => {
                const struct: [string, HTMLElement][] = []
                const pos: [string, HTMLElement][] = []
                for (const key in corpus_attrs) {
                    const attrs = corpus_attrs[key]
                    try {
                        const output = (
                            $ctrl.renderItem(null, key, "not_used", attrs, wordData, sentenceData, tokens) || $()
                        ).get(0)!
                        if (attrs["custom_type"] === "struct") {
                            struct.push([key, output])
                        } else if (attrs["custom_type"] === "pos") {
                            pos.push([key, output])
                        }
                    } catch (e) {
                        console.log("failed to render custom attribute", e)
                    }
                }
                return { pos, struct }
            }

            $ctrl.renderItem = (type, key, value, attrs, wordData, sentenceData, tokens) => {
                const output =
                    attrs.label && !attrs["sidebar_hide_label"]
                        ? $(`<p><strong>${locObj(attrs.label, $ctrl.lang)}</strong>: </p>`)
                        : $("<p></p>")

                const component =
                    (attrs["sidebar_component"] && getConfigurable(sidebarComponents, attrs["sidebar_component"])) ||
                    sidebarDefaultComponent

                const { template, controller } = component
                const scope = $rootScope.$new()
                const locals = { $scope: scope }
                Object.assign(scope, {
                    type,
                    key,
                    value,
                    attrs,
                    wordData,
                    sentenceData,
                    tokens,
                })

                // @ts-ignore
                $controller(controller, locals)
                return output.append($compile(template)(scope))
            }

            /** Iteratively shorten displayed URL from the middle until it fits inside the container element */
            $ctrl.applyEllipse = () => {
                $element
                    .find(".sidebar_url")
                    .css("white-space", "nowrap")
                    .each(function () {
                        // TODO This happens before sidebar is actually showing, so parent width is 0 the first time
                        const totalWidth = $(this).closest("div").width() || 240
                        // Drop the scheme part ("https://")
                        let text = $(this)
                            .text()
                            .replace(/[^/]*\/\//, "")
                        // Replace a larger part at each iteration
                        while (($(this).width() || 0) > totalWidth) {
                            // Drop first two chars after first slash
                            const textNew = text.replace(/\/…?../, "/…")
                            // Abort if there is no change (ellipsis reached the end, or URL is malformed)
                            if (textNew == text) break
                            // Replace text
                            text = textNew
                            $(this).text(text)
                        }
                    })
            }

            $scope.$watch("posData", () => {
                $element
                    .find("#selected_word")
                    .empty()
                    .append($scope.posData || "")
            })

            $scope.$watch("structData", () => {
                $element
                    .find("#selected_sentence")
                    .empty()
                    .append($scope.structData || "")
            })
        },
    ],
})
