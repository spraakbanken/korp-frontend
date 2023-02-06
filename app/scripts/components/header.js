/** @format */
import korpLogo from "../../img/korplogo_block.svg"
import sbxLogo from "../../img/sbx1r.svg"
import sweClarinLogo from "../../img/sweclarin_logo.png"

let html = String.raw
export const headerComponent = {
    template: html`
        <div id="header">
            <div class="flex items-center justify-between px-3 py-2" id="top_bar">
                <ul id="mode_switch">
                    <li class="visible" ng-repeat="mode in $ctrl.visible" ng-class="{selected: mode.selected}">
                        <a ng-href="{{$ctrl.getUrl(mode.mode)}}"> {{mode.label | locObj:lang}}</a>
                    </li>
                    <li class="menu_more visible" ng-if="$ctrl.menu.length">
                        <a
                            class="dropdown-toggle"
                            popper="popper"
                            no-close-on-click="true"
                            my="right+15% top+10"
                            at="bottom right"
                            >{{'more' | loc:$root.lang}}<i class="fa fa-angle-double-down"></i
                        ></a>
                        <ul class="dropdown-menu popper_menu">
                            <li ng-repeat="mode in $ctrl.menu">
                                <a ng-href="{{$ctrl.getUrl(mode.mode)}}"> {{mode.label | locObj:lang}}</a>
                            </li>
                        </ul>
                    </li>
                </ul>

                <script type="text/ng-template" id="aboutTemplate.html">
                    <ul class="my-0 py-1 text-right" ng-click="$root.isPopoverOpen = false">
                        <li class="bg-white hover_bg-gray-200 p-1 transition duration-200">
                            <a
                                class="block transiton duration-200 hover_text-blue-600"
                                id="about"
                                ng-click="$ctrl.citeClick()"
                                >{{'about' | loc:lang}}</a
                            >
                        </li>
                        <li class="bg-white hover_bg-gray-200 p-1 transition duration-500">
                            <a
                                class="block transiton duration-200 hover_text-blue-600"
                                href="https://spraakbanken.gu.se/verktyg/korp/användarhandledning"
                                target="_blank"
                                >{{'docs' | loc:lang}}</a
                            >
                        </li>
                        <li class="bg-white hover_bg-gray-200 p-1 transition duration-200" id="korplink">
                            <a class="block transiton duration-200 hover_text-blue-600" href="/korp"
                                >{{'korp' | loc:lang}}</a
                            >
                        </li>
                        <li class="bg-white hover_bg-gray-200 p-1 transition duration-200" id="korplablink">
                            <a class="block transiton duration-200 hover_text-blue-600" href="/korplabb"
                                >{{'korp_lab' | loc:lang}}</a
                            >
                        </li>
                        <li class="bg-white hover_bg-gray-200 p-1 transition duration-200">
                            <a
                                class="block transiton duration-200 hover_text-blue-600"
                                href="https://spraakbanken.gu.se/sparv"
                                target="_blank"
                                >{{'import_chain' | loc:lang}}</a
                            >
                        </li>
                    </ul>
                </script>

                <div class="flex items-center">
                    <login-status></login-status>
                    <div id="languages">
                        <a
                            ng-repeat="langObj in $ctrl.languages"
                            data-mode="{{langObj.value}}"
                            ng-click="lang = langObj.value"
                            >{{langObj.label | locObj:lang}}</a
                        >
                    </div>
                    <div id="news_area">
                        <div news-desk="" header="'newsdesk-header'" storage="'korp_last_read_newsitem'"></div>
                    </div>
                    <a class="mr-2 transiton duration-200 hover_text-blue-600 mx-2" ng-click="$ctrl.citeClick()"
                        >{{'about_cite_header' | loc:$root.lang}}</a
                    ><button
                        class="px-2 py-1 border border-gray-300 bg-gray-200 rounded text-gray-800"
                        popover-class="cog_menu"
                        popover-placement="bottom-right"
                        uib-popover-template="'aboutTemplate.html'"
                        type="button"
                        popover-trigger="'outsideClick'"
                        popover-is-open="$root.isPopoverOpen"
                    >
                        <span class="font-bold uppercase">{{'menu' | loc:$root.lang}}</span
                        ><i class="fa fa-lg fa-bars ml-2 align-middle text-indigo-600"></i>
                    </button>
                </div>
                <!-- TODO too many divs -->
            </div>
            <div class="flex items-end ml-2 pb-1 mb-3 mt-3 px-3" id="header_left">
                <a class="shrink-0 ml-4 relative" ng-click="$ctrl.logoClick()"
                    ><img class="-mb-1" src="${korpLogo}" height="300" width="300" /><span
                        class="version absolute bottom-0"
                        >{{isLab ? 'v10' : 'v9'}}</span
                    ></a
                >
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
                <corpus-chooser></corpus-chooser
                ><!-- spacer-->
                <div class="grow"></div>
                <span class="flex items-end mr-4 max-w-lg justify-end"
                    ><a class="hidden lg_inline" href="https://spraakbanken.gu.se" target="_blank"
                        ><img src="${sbxLogo}" style="margin-bottom: -6%;" /></a
                    ><a class="hidden lg_inline grow-0" href="https://sweclarin.se" target="_blank"
                        ><img src="${sweClarinLogo}" style="margin-bottom: 2px" /></a></span
                ><select class="hidden md_block shrink min-w-0" id="search_history"></select>
            </div>
        </div>
    `,
    bindings: {},
    controller: [
        "$uibModal",
        "$rootScope",
        "utils",
        function ($uibModal, $rootScope, utils) {
            const $ctrl = this

            $ctrl.logoClick = function () {
                const [baseUrl, modeParam, langParam] = $ctrl.getUrlParts(currentMode)
                window.location = baseUrl + modeParam + langParam
                if (langParam.length > 0) {
                    window.location.reload()
                }
            }

            $ctrl.languages = settings["languages"]

            $ctrl.citeClick = () => {
                $rootScope.show_modal = "about"
            }

            $rootScope.show_modal = false

            let modal = null
            utils.setupHash($rootScope, [
                {
                    key: "display",
                    scope_name: "show_modal",
                    post_change(val) {
                        if (val) {
                            showAbout()
                        } else {
                            if (modal != null) {
                                modal.close()
                            }
                            modal = null
                        }
                    },
                },
            ])

            const closeModals = function () {
                $rootScope.show_modal = false
            }

            const modalScope = $rootScope.$new(true)
            modalScope.clickX = () => closeModals()
            var showAbout = function () {
                const params = {
                    template: require("../../markup/about.html"),
                    scope: modalScope,
                    windowClass: "about",
                }
                modal = $uibModal.open(params)

                modal.result.then(
                    () => closeModals(),
                    () => closeModals()
                )
            }

            const N_VISIBLE = settings["visible_modes"]

            $ctrl.modes = _.filter(settings["modes"])
            if (!isLab) {
                $ctrl.modes = _.filter(settings["modes"], (item) => item.labOnly !== true)
            }

            $ctrl.visible = $ctrl.modes.slice(0, N_VISIBLE)

            $rootScope.$watch("lang", () => {
                $ctrl.menu = util.collatorSort($ctrl.modes.slice(N_VISIBLE), "label", $rootScope.lang)
            })

            $ctrl.getUrl = function (modeId) {
                return $ctrl.getUrlParts(modeId).join("")
            }

            $ctrl.getUrlParts = function (modeId) {
                const langParam = settings["default_language"] === $rootScope.lang ? "" : `#?lang=${$rootScope.lang}`
                const modeParam = modeId === "default" ? "" : `?mode=${modeId}`
                return [location.pathname, modeParam, langParam]
            }

            const i = _.map($ctrl.menu, "mode").indexOf(currentMode)
            if (i !== -1) {
                $ctrl.visible.push(s.menu[i])
                $ctrl.menu.splice(i, 1)
            }

            for (let mode of $ctrl.modes) {
                mode.selected = false
                if (mode.mode === currentMode) {
                    window.settings.mode = mode
                    mode.selected = true
                }
            }
        },
    ],
}
