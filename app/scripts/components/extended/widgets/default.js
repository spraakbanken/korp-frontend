/** @format */
import { html } from "@/util"

export const defaultWidget = {
    template: ({ placeholder }) => html`
        <input
            ng-model="input"
            class="arg_value"
            escaper
            ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: "default blur"}'
            placeholder="${placeholder}"
        />

        <span uib-dropdown>
            <span
                ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'
                class="val_mod"
                uib-dropdown-toggle
            >
                Aa
            </span>
            <ul class="mod_menu" uib-dropdown-menu>
                <li><a ng-click="makeSensitive()">{{'case_sensitive' | loc:$root.lang}}</a></li>
                <li><a ng-click="makeInsensitive()">{{'case_insensitive' | loc:$root.lang}}</a></li>
            </ul>
        </span>
    `,
    controller: [
        "$scope",
        function ($scope) {
            if ($scope.orObj.flags && $scope.orObj.flags.c) {
                $scope.case = "insensitive"
            } else {
                $scope.case = "sensitive"
            }

            $scope.makeSensitive = function () {
                $scope.case = "sensitive"
                if ($scope.orObj.flags) {
                    delete $scope.orObj.flags["c"]
                }
            }

            $scope.makeInsensitive = function () {
                const flags = $scope.orObj.flags || {}
                flags["c"] = true
                $scope.orObj.flags = flags

                $scope.case = "insensitive"
            }
        },
    ],
}
