/** @format */
let html = String.raw
export const compareSearchComponent = {
    template: html`
        <div class="search_compare">
            <button
                class="btn btn-sm btn-danger delete"
                ng-click="$ctrl.deleteCompares()"
                ng-show="$ctrl.savedSearches.length > 1"
            >
                <i class="fa fa-trash-o"></i>{{'compare_delete' | loc:$root.lang}}
            </button>
            <div ng-show="$ctrl.savedSearches.length < 2">
                <div class="bs-callout bs-callout-warning">{{'compare_warning' | loc:$root.lang}}</div>
            </div>
            <div ng-show="$ctrl.savedSearches.length > 1">
                {{'compare_vb' | loc:$root.lang}}
                <select
                    ng-options="search.label for search in $ctrl.savedSearches"
                    ng-model="$ctrl.cmp1"
                    ng-change="$ctrl.updateAttributes()"
                ></select>
                {{'compare_with' | loc:$root.lang}}
                <select
                    ng-options="search.label for search in $ctrl.savedSearches"
                    ng-model="$ctrl.cmp2"
                    ng-change="$ctrl.updateAttributes()"
                ></select>
                {{'compare_reduce' | loc:$root.lang}}
                <select
                    ng-model="$ctrl.reduce"
                    ng-options="obj | mapper:$ctrl.valfilter as obj.label | locObj:$root.lang group by obj.group | loc for obj in $ctrl.currentAttrs"
                ></select>
                <button class="btn btn-sm btn-default search" ng-click="$ctrl.sendCompare()">
                    {{'compare_vb' | loc:$root.lang}}
                </button>
            </div>
        </div>
    `,
    controller: [
        "utils",
        "backend",
        "$rootScope",
        "compareSearches",
        function (utils, backend, $rootScope, compareSearches) {
            const $ctrl = this

            $ctrl.valfilter = utils.valfilter

            let prev
            $ctrl.savedSearches = compareSearches.savedSearches
            $ctrl.$doCheck = () => {
                if (!_.isEqual(prev, compareSearches.savedSearches)) {
                    $ctrl.cmp1 = compareSearches.savedSearches[0]
                    $ctrl.cmp2 = compareSearches.savedSearches[1]
                    $ctrl.updateAttributes()
                    prev = Array.from(compareSearches.savedSearches)
                    $ctrl.savedSearches = prev
                }
            }

            $ctrl.updateAttributes = () => {
                if ($ctrl.cmp1 && $ctrl.cmp2) {
                    const listing = settings.corpusListing.subsetFactory(
                        _.uniq([].concat($ctrl.cmp1.corpora, $ctrl.cmp2.corpora))
                    )
                    const allAttrs = listing.getAttributeGroups()
                    $ctrl.currentAttrs = _.filter(allAttrs, (item) => !item["hide_compare"])
                }
            }

            $ctrl.reduce = "word"

            $ctrl.sendCompare = () =>
                $rootScope.compareTabs.push(backend.requestCompare($ctrl.cmp1, $ctrl.cmp2, [$ctrl.reduce]))

            $ctrl.deleteCompares = () => compareSearches.flush()
        },
    ],
}
