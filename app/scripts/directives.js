/** @format */
import _ from "lodash"

const korpApp = angular.module("korpApp")

korpApp.directive("popper", [
    "$rootElement",
    ($rootElement) => ({
        scope: {},
        link(scope, elem, attrs) {
            const popup = elem.next()
            popup.appendTo("body").hide()
            const closePopup = () => popup.hide()

            if (attrs.noCloseOnClick == null) {
                popup.on("click", function () {
                    closePopup()
                    return false
                })
            }

            elem.on("click", function () {
                const other = $(".popper_menu:visible").not(popup)
                if (other.length) {
                    other.hide()
                }
                if (popup.is(":visible")) {
                    closePopup()
                } else {
                    popup.show()
                }

                const pos = {
                    my: attrs.my || "right top",
                    at: attrs.at || "bottom right",
                    of: elem,
                }
                if (scope.offset) {
                    pos.offset = scope.offset
                }

                popup.position(pos)

                return false
            })

            return $rootElement.on("click", () => closePopup())
        },
    }),
])

korpApp.directive("tabSpinner", () => ({
    template: `\
<i class="fa-solid fa-times-circle close_icon"></i>
<span class="tab_spinner"
        us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}"></span>\
`,
}))

korpApp.directive("tabPreloader", () => ({
    restrict: "E",
    scope: {
        value: "=",
        spinner: "=",
    },
    replace: true,
    template: `\
<div class="tab_preloaders">
        <div ng-if="!spinner" class="tab_progress" style="width:{{value || 0}}%"></div>
            <span ng-if="spinner" class="preloader_spinner"
                us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 7, top : -12}"></span>
</div>\
`,

    link() {},
}))

korpApp.directive("clickCover", () => ({
    link(scope, elem, attr) {
        const cover = $("<div class='click-cover'>").on("click", () => false)

        const pos = elem.css("position") || "static"
        return scope.$watch(
            () => scope.$eval(attr.clickCover),
            function (val) {
                if (val) {
                    elem.prepend(cover)
                    elem.css("pointer-events", "none")
                    return elem.css("position", "relative").addClass("covered")
                } else {
                    cover.remove()
                    elem.css("pointer-events", "")
                    return elem.css("position", pos).removeClass("covered")
                }
            }
        )
    },
}))

// This directive is only used by the autoc-component (autoc.js)
// It is therefore made to work with magic variables such as $scope.$ctrl.typeaheadIsOpen
korpApp.directive("typeaheadClickOpen", [
    "$timeout",
    ($timeout) => ({
        restrict: "A",
        require: ["ngModel"],
        link($scope, elem, attrs, ctrls) {
            const triggerFunc = function (event) {
                if (event.keyCode === 40 && !$scope.$ctrl.typeaheadIsOpen) {
                    const prev = ctrls[0].$modelValue || ""
                    if (prev) {
                        ctrls[0].$setViewValue("")
                        $timeout(() => ctrls[0].$setViewValue(`${prev}`))
                    }
                }
            }
            elem.bind("keyup", triggerFunc)
        },
    }),
])

korpApp.directive("reduceSelect", [
    "$timeout",
    ($timeout) => ({
        restrict: "AE",
        scope: {
            items: "=reduceItems",
            selected: "=reduceSelected",
            insensitive: "=reduceInsensitive",
            lang: "=reduceLang",
            onChange: "<",
        },
        replace: true,
        template: `\
    <div uib-dropdown auto-close="outsideClick" class="reduce-attr-select" on-toggle="toggled(open)">
      <div uib-dropdown-toggle class="reduce-dropdown-button inline-block align-middle bg-white border border-gray-500">
        <div class="reduce-dropdown-button-text">
          <span>{{ "reduce_text" | loc:$root.lang }}:</span>
          <span>
            {{keyItems[selected[0]].label | locObj:$root.lang}}
          </span>
          <span ng-if="selected.length > 1">
            (+{{ numberAttributes - 1 }})
          </span>
          <span class="caret"></span>
        </div>
      </div>
      <div class="reduce-dropdown-menu " uib-dropdown-menu>
        <ul>
          <li ng-click="toggleSelected('word', $event)" ng-class="keyItems['word'].selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="keyItems['word'].selected">
            <span class="reduce-label">{{keyItems['word'].label | locObj:$root.lang }}</span>
            <span ng-class="keyItems['word'].insensitive ? 'selected':''"
                  class="insensitive-toggle"
                  ng-click="toggleWordInsensitive($event)"><b>Aa</b></span>
          </li>
          <b ng-if="hasWordAttrs">{{'word_attr' | loc:$root.lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'word_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | locObj:$root.lang }}</span>
          </li>
          <b ng-if="hasStructAttrs">{{'sentence_attr' | loc:$root.lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'sentence_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | locObj:$root.lang }}</span>
          </li>
        </ul>
      </div>
    </div>`,

        link(scope) {
            scope.$watchCollection("items", function () {
                if (scope.items) {
                    scope.keyItems = {}
                    for (let item of scope.items) {
                        scope.keyItems[item.value] = item
                    }

                    scope.hasWordAttrs = _.find(scope.keyItems, { group: "word_attr" }) != undefined
                    scope.hasStructAttrs = _.find(scope.keyItems, { group: "sentence_attr" }) != undefined

                    let somethingSelected = false
                    if (scope.selected && scope.selected.length > 0) {
                        for (let select of scope.selected) {
                            const item = scope.keyItems[select]
                            if (item) {
                                item.selected = true
                                somethingSelected = true
                            }
                        }
                    }

                    if (!somethingSelected) {
                        scope.keyItems["word"].selected = true
                    }

                    if (scope.insensitive) {
                        for (let insensitive of scope.insensitive) {
                            scope.keyItems[insensitive].insensitive = true
                        }
                    }
                    return updateSelected(scope)
                }
            })

            var updateSelected = function (scope) {
                scope.selected = _.map(
                    _.filter(scope.keyItems, (item, key) => item.selected),
                    "value"
                )
                scope.numberAttributes = scope.selected.length
                $timeout(() => scope.onChange())
            }

            scope.toggleSelected = function (value, event) {
                const item = scope.keyItems[value]
                const isLinux = window.navigator.userAgent.indexOf("Linux") !== -1
                if (event && ((!isLinux && event.altKey) || (isLinux && event.ctrlKey))) {
                    _.map(_.values(scope.keyItems), (item) => (item.selected = false))
                    item.selected = true
                } else {
                    item.selected = !item.selected
                    if (value === "word" && !item.selected) {
                        item.insensitive = false
                        scope.insensitive = []
                    }
                }

                updateSelected(scope)

                if (event) {
                    return event.stopPropagation()
                }
            }

            scope.toggleWordInsensitive = function (event) {
                event.stopPropagation()
                scope.keyItems["word"].insensitive = !scope.keyItems["word"].insensitive
                if (scope.keyItems["word"].insensitive) {
                    scope.insensitive = ["word"]
                } else {
                    scope.insensitive = []
                }
                $timeout(() => scope.onChange())

                if (!scope.keyItems["word"].selected) {
                    return scope.toggleSelected("word")
                }
            }

            scope.toggled = function (open) {
                // if no element is selected when closing popop, select word
                if (!open && scope.numberAttributes === 0) {
                    return $timeout(() => scope.toggleSelected("word"), 0)
                }
            }
        },
    }),
])
