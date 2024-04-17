/** @format */
import angular from "angular"
import { html } from "@/util"
import { fetchNews, isEnabled } from "@/news-service"

angular.module("korpApp").component("newsdesk", {
    template: html`
        <div ng-if="isEnabled">
            <h2 class="text-xl font-bold">{{ 'newsdesk-header' | loc:$root.lang }}</h2>
            <div class="my-2 flex flex-col gap-2">
                <article ng-repeat="item in items">
                <div class=my-1">
                    <time datetime="{{item.created}}" class="opacity-75 float-right">{{item.created}}</time>
                    <h3 class="my-0 text-base font-bold">{{item.title | locObj}}</h3>
                    </div>
                    <div ng-bind-html="item.body | locObj | trust"></div>
                </article>
            </div>
        </div>
    `,
    controller: [
        "$scope",
        function ($scope) {
            const $ctrl = this

            $scope.isEnabled = isEnabled()
            $scope.items = null

            $ctrl.$onInit = async () => {
                try {
                    $scope.items = await fetchNews()
                } catch (error) {
                    console.error("Error fetching news:", error)
                    $scope.isEnabled = false
                }
            }
        },
    ],
})
