/** @format */
const korpApp = angular.module("korpApp")

korpApp.directive("scrollToStart", function () {
    return {
        restrict: "A",
        link: function (scope, elm, attr) {
            const pElm = elm[0].parentElement.parentElement

            let isStart
            scope.$watch(attr.scrollToStart, function (newValue) {
                newValue = !!newValue
                console.log("## watch", newValue)
                if (!isStart && newValue) {
                    console.log("## lets scroll!!!!")
                    pElm.scrollTo(0, 0)
                }
                isStart = newValue
            })

            angular.element(pElm).bind("scroll", function () {
                if (pElm.scrollLeft !== 0 && isStart) {
                    scope.$apply(function () {
                        console.log("## fixit")
                        scope[attr.scrollToStart] = false
                        isStart = false
                    })
                }
            })
        },
    }
})
