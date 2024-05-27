/** @format */
import angular, { IScope } from "angular"
import { html } from "@/util"
import { type NewsItem, fetchNews, isEnabled } from "@/news-service"

angular.module("korpApp").component("newsdesk", {
    template: html`
        <div ng-if="isEnabled && itemsFiltered && itemsFiltered.length">
            <h2 class="text-xl font-bold">{{ 'newsdesk-header' | loc:$root.lang }}</h2>
            <div class="my-2 flex flex-col gap-2">
                <article ng-repeat="item in itemsFiltered">
                    <div class="my-1">
                        <time datetime="{{item.created}}" class="opacity-75 float-right">{{item.created}}</time>
                        <h3 class="my-0 text-base font-bold">{{item.title | locObj}}</h3>
                    </div>
                    <div ng-bind-html="item.body | locObj | trust"></div>
                </article>

                <div ng-if="items.length > NEWS_LIMIT">
                    <a ng-if="!expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-down"></i>
                        {{"show_more" | loc:$root.lang}}
                    </a>
                    <a ng-if="expanded" ng-click="toggleExpanded()">
                        <i class="fa fa-angle-double-up"></i>
                        {{"show_less" | loc:$root.lang}}
                    </a>
                </div>
            </div>
        </div>
    `,
    controller: [
        "$scope",
        function ($scope: NewsdeskScope) {
            const $ctrl = this

            $scope.isEnabled = isEnabled()
            $scope.items = null
            $scope.itemsFiltered = null
            $scope.expanded = false
            $scope.NEWS_LIMIT = 3

            $ctrl.$onInit = async () => {
                try {
                    $scope.items = await fetchNews()
                    // The watcher may not yet be in place when the fetch finishes.
                    $ctrl.updateItemsFiltered()
                } catch (error) {
                    console.error("Error fetching news:", error)
                    $scope.isEnabled = false
                }
            }

            $scope.toggleExpanded = () => {
                $scope.expanded = !$scope.expanded
            }

            $scope.$watch("expanded", $ctrl.updateItemsFiltered)
            $scope.$watch("items", $ctrl.updateItemsFiltered)

            $ctrl.updateItemsFiltered = () => {
                $scope.itemsFiltered = $scope.items
                    ? $scope.expanded
                        ? [...$scope.items]
                        : $scope.items.slice(0, $scope.NEWS_LIMIT)
                    : null
            }
        },
    ],
})

type NewsdeskScope = IScope & {
    isEnabled: boolean
    items: NewsItem[] | null
    itemsFiltered: NewsItem[] | null
    expanded: boolean
    NEWS_LIMIT: number
    toggleExpanded: () => void
}
