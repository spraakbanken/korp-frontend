import angular, { ITimeoutService } from "angular"

// Enable triggering the autocomplete dropdown by pressing the down arrow key.
// This directive is only used by the autoc-component (autoc.js)
// It is therefore made to work with magic variables such as $scope.$ctrl.typeaheadIsOpen
angular.module("korpApp").directive("typeaheadClickOpen", [
    "$timeout",
    ($timeout: ITimeoutService) => ({
        restrict: "A",
        require: ["ngModel"],
        link($scope, elem, attrs, ctrls: [angular.INgModelController]) {
            elem.bind("keyup", (event) => {
                if (event.key == "ArrowDown" && !($scope as any).$ctrl.typeaheadIsOpen) {
                    // Get entered text
                    const prev = ctrls[0].$modelValue || ""
                    // Empty and refill the input to trigger autocomplete
                    if (prev) {
                        ctrls[0].$setViewValue("")
                        $timeout(() => ctrls[0].$setViewValue(`${prev}`))
                    }
                }
            })
        },
    }),
])
