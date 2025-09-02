/** @format */
import angular, { IController, IScope, ITimeoutService, ui } from "angular"
import { remove } from "lodash"
import korpLogo from "../../img/korp.svg"
import settings from "@/settings"
import currentMode from "@/mode"
import { addImgHash, html } from "@/util"
import { collatorSort } from "@/i18n/util"
import "@/services/utils"
import "@/components/corpus-chooser/corpus-chooser"
import "@/components/util/radio-list"
import { matomoSend } from "@/matomo"
import { RootScope } from "@/root-scope.types"
import { StoreService } from "@/services/store"
import { Labeled } from "@/i18n/types"
import { Config } from "@/settings/config.types"
import { AppSettings } from "@/settings/app-settings.types"

type HeaderController = IController & {
    citeClick: () => void
    getUrl: (modeId: string) => string
    getUrlParts: (modeId: string) => string[]
    languages: Labeled[]
    logoClick: () => void
    menu: Config["modes"]
    modes: Config["modes"]
    visible: Config["modes"]
}

type LogoConfig = Exclude<AppSettings["logo"], undefined>

/** Return the logo HTML for key logoKey in the configuration; if not defined, return "". */
const getLogo = (logoKey: keyof LogoConfig): string => addImgHash(settings["logo"]?.[logoKey] || "")

const korpLogoHtml: string = getLogo("korp") || html`<img src="${korpLogo}" height="300" width="300" />`
const orgLogoHtml: string = getLogo("organization")
const chooserRightLogoHtml: string = getLogo("chooser_right")

angular.module("korpApp").component("appHeader", {
    template: html`
        <div id="header">
            <div class="flex items-center justify-between px-3 py-2" id="top_bar">
                <ul id="mode_switch">
                    <li class="visible" ng-repeat="mode in $ctrl.visible" ng-class="{selected: mode.selected}">
                        <a ng-href="{{$ctrl.getUrl(mode.mode)}}"> {{mode.label | locObj:$oot.lang}}</a>
                    </li>
                    <li class="menu_more visible" ng-if="$ctrl.menu.length" uib-dropdown>
                        <a uib-dropdown-toggle>
                            {{'more' | loc:$root.lang}}
                            <i class="fa fa-angle-double-down ml-1"></i>
                        </a>

                        <ul uib-dropdown-menu>
                            <li ng-repeat="mode in $ctrl.menu" ng-class="{selected: mode.selected}">
                                <a ng-href="{{$ctrl.getUrl(mode.mode)}}"> {{mode.label | locObj:$root.lang}}</a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <div class="flex items-center gap-4">
                    <login-status></login-status>

                    <radio-list options="$ctrl.languages" ng-model="$root.lang"> </radio-list>

                    <a class="transiton duration-200 hover:text-blue-600" ng-click="$ctrl.citeClick()">
                        {{'about_cite_header' | loc:$root.lang}}
                    </a>

                    <div uib-dropdown>
                        <button
                            uib-dropdown-toggle
                            class="px-2 py-1 border border-gray-300 bg-gray-200 rounded text-gray-800"
                        >
                            <span class="font-bold uppercase"> {{'menu' | loc:$root.lang}} </span>
                            <i class="fa fa-lg fa-bars ml-2 align-middle text-indigo-600"></i>
                        </button>
                        <ul uib-dropdown-menu class="dropdown-menu-right">
                            <li>
                                <a id="about" ng-click="$ctrl.citeClick()"> {{'about' | loc:$root.lang}} </a>
                            </li>
                            <li>
                                <a href="https://spraakbanken.gu.se/verktyg/korp/användarhandledning" target="_blank">
                                    {{'docs' | loc:$root.lang}}
                                </a>
                            </li>
                            <li id="korplink">
                                <a href="/korp"> {{'korp' | loc:$root.lang}} </a>
                            </li>
                            <li id="korplablink">
                                <a href="/korplabb"> {{'korp_lab' | loc:$root.lang}} </a>
                            </li>
                            <li>
                                <a href="https://spraakbanken.gu.se/sparv" target="_blank">
                                    {{'import_chain' | loc:$root.lang}}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- TODO too many divs -->
            </div>

            <div class="flex justify-between items-end gap-3 my-3 px-3" id="header_left">
                <a class="shrink-0 relative ml-4 pl-0.5" ng-click="$ctrl.logoClick()"> ${korpLogoHtml} </a>
                <div id="labs_logo">
                    <svg
                        height="60"
                        version="1.1"
                        width="39"
                        xmlns="http://www.w3.org/2000/svg"
                        style="overflow: hidden; position: relative; left: -0.625px;"
                    >
                        <desc style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);">Created with Raphaël 2.1.0</desc>
                        <defs style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></defs>
                        <path
                            fill="#333333"
                            stroke="none"
                            d="M22.121,24.438L18.759,16.590999999999998C18.43,15.821999999999997,18.16,14.509999999999998,18.16,13.673999999999998S18.673000000000002,12.152999999999999,19.3,12.152999999999999S20.441000000000003,11.639999999999999,20.441000000000003,11.012999999999998S19.756000000000004,9.872999999999998,18.92,9.872999999999998H12.080000000000002C11.244000000000002,9.872999999999998,10.560000000000002,10.385999999999997,10.560000000000002,11.012999999999998S11.073000000000002,12.152999999999999,11.700000000000003,12.152999999999999S12.840000000000003,12.838,12.840000000000003,13.674S12.571000000000003,15.822,12.241000000000003,16.591L8.879000000000003,24.438000000000002C8.55,25.206,8.28,26.177,8.28,26.595S8.622,27.698,9.04,28.116S10.483999999999998,28.876,11.319999999999999,28.876H19.679C20.514999999999997,28.876,21.540999999999997,28.534000000000002,21.959,28.116S22.719,27.012999999999998,22.719,26.595S22.45,25.206,22.121,24.438ZM16.582,7.625C16.582,8.224,17.066000000000003,8.708,17.665,8.708S18.747999999999998,8.224,18.747999999999998,7.625S18.263999999999996,6.541,17.665,6.541S16.582,7.026,16.582,7.625ZM13.667,7.792C13.943,7.792,14.167,7.568,14.167,7.292S13.943,6.792,13.667,6.792S13.167,7.016,13.167,7.292S13.391,7.792,13.667,7.792ZM15.584,5.292C16.458,5.292,17.166999999999998,4.583,17.166999999999998,3.7089999999999996C17.166999999999998,2.8339999999999996,16.458,2.1249999999999996,15.583999999999998,2.1249999999999996C14.709,2.125,14,2.834,14,3.709C14,4.583,14.709,5.292,15.584,5.292Z"
                            transform="matrix(1.7,0,0,1.7,-10.8497,7.1497)"
                            stroke-width="0.5882352941176471"
                            style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"
                        ></path>
                    </svg>
                </div>

                <div class="grow min-[1150px]:hidden"></div>
                <corpus-chooser></corpus-chooser>
                ${chooserRightLogoHtml}
                <div class="grow hidden min-[1150px]:block"></div>

                ${orgLogoHtml}
            </div>
        </div>
    `,
    bindings: {},
    controller: [
        "$uibModal",
        "$rootScope",
        "$timeout",
        "store",
        function (
            $uibModal: ui.bootstrap.IModalService,
            $rootScope: RootScope,
            $timeout: ITimeoutService,
            store: StoreService
        ) {
            const $ctrl = this as HeaderController

            $ctrl.logoClick = function () {
                const [baseUrl, modeParam, langParam] = $ctrl.getUrlParts(currentMode)
                window.location.href = baseUrl + modeParam + langParam
                if (langParam.length > 0) {
                    window.location.reload()
                }
            }

            $ctrl.languages = settings.languages

            $ctrl.citeClick = () => {
                store.display = "about"
            }

            let modal: ui.bootstrap.IModalInstanceService | null = null

            store.watch("display", (val) => {
                if (val) showAbout()
                else {
                    modal?.close()
                    modal = null
                }
            })

            const closeModals = function () {
                store.display = undefined
            }

            type ModalScope = IScope & {
                clickX: () => void
            }

            const modalScope = $rootScope.$new(true) as ModalScope
            modalScope.clickX = () => closeModals()

            function showAbout() {
                // $timeout is used to let localization happen before modal is shown (if loaded with "display=about")
                $timeout(() => {
                    modal = $uibModal.open({
                        template: require("../../markup/about.html"),
                        scope: modalScope,
                        windowClass: "about",
                    })
                    modal.result.catch(() => closeModals())
                })
            }

            const N_VISIBLE = settings["visible_modes"]

            $ctrl.modes = settings["modes"].filter(Boolean)
            if (process.env.ENVIRONMENT == "production") {
                $ctrl.modes = settings["modes"].filter((item) => !item.labOnly)
            }

            // Split modes into visible and menu
            $ctrl.visible = $ctrl.modes.slice(0, N_VISIBLE)
            $ctrl.menu = $ctrl.modes.slice(N_VISIBLE)

            // If current mode is in menu, promote it to visible
            const modesInMenu = remove($ctrl.menu, (item) => item.mode == currentMode)
            $ctrl.visible.push(...modesInMenu)

            let hasLangChanged = false
            store.watch("lang", () => {
                if (!store.lang) return
                // Re-sort menu but not visible options
                $ctrl.menu = collatorSort($ctrl.menu, "label", store.lang)
                if (!hasLangChanged) matomoSend("trackEvent", "UI", "Locale init", store.lang)
                else matomoSend("trackEvent", "UI", "Locale switch", store.lang)
                hasLangChanged = true
            })

            $ctrl.getUrl = function (modeId) {
                return $ctrl.getUrlParts(modeId).join("")
            }

            $ctrl.getUrlParts = function (modeId) {
                const langParam = settings["default_language"] === store.lang ? "" : `#?lang=${store.lang}`
                const modeParam = modeId === "default" ? "" : `?mode=${modeId}`
                return [location.pathname, modeParam, langParam]
            }
        },
    ],
})
