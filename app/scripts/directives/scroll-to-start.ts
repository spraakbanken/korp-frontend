/** @format */
import angular, { IAttributes } from "angular"

type ScrollToStartAttrs = IAttributes & {
    scrollToStart: string
}

angular.module("korpApp").directive("scrollToStart", function () {
    return {
        restrict: "A",
        link: function (scope, elm, attr: ScrollToStartAttrs) {
            const pElm = elm[0].parentElement?.parentElement
            if (!pElm) return

            let isStart: boolean

            // If the attribute value is switched from `false` to `true`, scroll to start.
            scope.$watch(attr.scrollToStart, function (newValue: boolean) {
                if (!isStart && newValue) {
                    pElm.scrollTo(0, 0)
                }
                isStart = newValue
            })

            // When user scrolls away from start, reset.
            angular.element(pElm).bind("scroll", function () {
                if (pElm.scrollLeft !== 0 && isStart) {
                    scope.$apply(function () {
                        scope[attr.scrollToStart] = false
                        isStart = false
                    })
                }
            })
        },
    }
})
