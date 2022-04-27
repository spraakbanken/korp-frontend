/** @format */
let html = String.raw
export const extendedStructTokenComponent = {
    template: html`
        <div class="query_token mt-8">
            <div class="token_header">
                <i class="close_btn fa-solid fa-circle-xmark text-gray-600" ng-click="$ctrl.remove()"></i>
                <div style="clear:both;"></div>
            </div>

            <div class="args">
                <div class="query_arg tag-box">
                    <div class="or or_arg">
                        <div>{{ 'boundary_unit' | loc:$root.lang }}</div>
                        <select
                            class="tag_arg"
                            ng-options="tag as ('tag_' + label | loc:$root.lang) for (tag, label) in $ctrl.tagTypes"
                            ng-model="$ctrl.token.struct"
                            ng-change="$ctrl.change()"
                        ></select>
                    </div>
                    <div>
                        <label class="px-2">
                            <input
                                class="mr-1"
                                type="radio"
                                ng-model="$ctrl.token.start"
                                ng-value="true"
                                ng-change="$ctrl.change()"
                            />
                            {{'starts' | loc:$root.lang }}
                        </label>
                        <label class="px-2">
                            <input
                                class="mr-1"
                                type="radio"
                                ng-model="$ctrl.token.start"
                                ng-value="false"
                                ng-change="$ctrl.change()"
                            />
                            {{'ends' | loc:$root.lang }}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `,
    bindings: {
        token: "<",
        remove: "&",
        change: "&",
    },
    controller: [
        "$scope",
        function ($scope) {
            const ctrl = this

            ctrl.$onInit = () => {
                onCorpusChange()
                if (!ctrl.token.struct) {
                    const structs = Object.keys(ctrl.tagTypes)
                    if (structs.includes("sentence")) {
                        ctrl.token.struct = "sentence"
                    } else {
                        ctrl.token.struct = structs[0]
                    }
                    ctrl.change()
                }

                $scope.$on("corpuschooserchange", onCorpusChange)
            }

            const onCorpusChange = () => {
                ctrl.tagTypes = settings.corpusListing.getCommonWithins()
            }
        },
    ],
}
