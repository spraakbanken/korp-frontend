import { IController, IScope } from "angular"
import { html, regescape } from "@/util"
import { Attribute, MaybeConfigurable } from "@/settings/config.types"
import { locAttribute } from "@/i18n"
import { StoreService } from "@/services/store.types"
import { getStringifier } from "@/services/stringify"
import { template } from "lodash"
import statemachine from "@/statemachine"
import { CqpSearchEvent } from "@/statemachine/types"
import { Token } from "@/backend/types"

/** A custom component for showing an attribute in the sidebar. */
type SidebarComponentDefinition = MaybeConfigurable<SidebarComponent>

type SidebarComponent = {
    template: string
    controller: IController
}

// Load custom components.
export const sidebarComponents: Record<string, SidebarComponentDefinition> = {}
try {
    Object.assign(sidebarComponents, require("custom/sidebar.js").default)
} catch (error) {
    console.log("No module for sidebar components available")
}

type SidebarDefaultComponentScope = IScope & {
    attrs: Attribute
    decodeURI: typeof decodeURI
    getExternalUrl: (value: string) => string
    internalSearch: (value: string) => void
    isEmpty: boolean
    key: string
    renderValue: (value: string) => string
    sentenceData: Record<string, string>
    value: string
    valueArray: string[]
    wordData: Token
}

export const sidebarDefaultComponent: SidebarComponent = {
    // Three types of output: empty, list or single value.
    // For a list, the info link comes above. For single value it comes last.
    template: html`<span>
        <span ng-if="isEmpty" class="opacity-50">&empty;</span>

        <span ng-if="!isEmpty && attrs.type == 'set'">
            <a ng-if="attrs['sidebar_info_url']" ng-href="{{attrs['sidebar_info_url']}}" target="_blank">
                <i class="fa-solid fa-info-circle"></i>
            </a>

            <ul>
                <li ng-repeat="item in valueArray">
                    <span ng-if="!attrs['internal_search']" ng-bind-html="renderValue(item) | trust"></span>
                    <span
                        ng-if="attrs['internal_search']"
                        ng-bind-html="renderValue(item, $index) | trust"
                        ng-click="internalSearch(item)"
                        class="link"
                    ></span>
                    <a
                        ng-if="attrs['external_search']"
                        ng-href="{{getExternalUrl(item)}}"
                        class="external_link"
                        target="_blank"
                    ></a>
                </li>
            </ul>
        </span>

        <span ng-if="!isEmpty && attrs.type != 'set'">
            <span ng-if="attrs.type != 'set'" ng-bind-html="renderValue(value) | trust"></span>

            <a ng-if="attrs['sidebar_info_url']" ng-href="{{attrs['sidebar_info_url']}}" target="_blank">
                <i class="fa-solid fa-info-circle"></i>
            </a>
        </span>
    </span>`,
    controller: [
        "$scope",
        "store",
        function ($scope: SidebarDefaultComponentScope, store: StoreService) {
            $scope.decodeURI = decodeURI
            $scope.isEmpty = !$scope.value || ($scope.attrs.type == "set" && $scope.value == "|")
            $scope.valueArray = ($scope.value?.split("|") || []).filter(Boolean)

            /** Render a single value using attribute options. */
            $scope.renderValue = (value: string, key = $scope.key) => {
                if ($scope.attrs.stringify) value = getStringifier($scope.attrs.stringify)(value)
                if ($scope.attrs.translation) value = locAttribute($scope.attrs.translation, value, store.lang)
                if ($scope.attrs.pattern)
                    value = template($scope.attrs.pattern)({
                        key,
                        val: value,
                        pos_attrs: $scope.wordData,
                        struct_attrs: $scope.sentenceData,
                    })
                if ($scope.attrs.type == "url")
                    value = `<a href="${value}" class="exturl sidebar_url" target="_blank">
                        ${decodeURI(value)}</a>`
                return value
            }

            $scope.internalSearch = (x) => {
                if ($scope.key == "lex") {
                    statemachine.send("SEARCH_LEMGRAM", { value: x })
                } else {
                    const cqp = `[${$scope.key} contains "${regescape(x)}"]`
                    statemachine.send("SEARCH_CQP", { cqp } as CqpSearchEvent)
                }
            }

            $scope.getExternalUrl = (val) => template($scope.attrs["external_search"])({ val })
        },
    ],
}
