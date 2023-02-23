/** @format */

let html = String.raw

const korpApp = angular.module("korpApp")

korpApp.directive("kwicWord", () => ({
    replace: true,
    template: `<span class="word" ng-class="getClassObj(wd)">
{{::wd.word}} </span>\
`,
    link(scope) {
        scope.getClassObj = function (wd) {
            let struct
            const output = {
                reading_match: wd._match,
                punct: wd._punct,
                match_sentence: wd._matchSentence,
                link_selected: wd._link_selected,
            }

            if ("_open_sentence" in wd) {
                output[`open_sentence`] = true
            }

            const result = []
            for (let [x, y] of _.toPairs(output)) {
                if (y) {
                    result.push(x)
                }
            }
            return result.join(" ")
        }
    },
}))

korpApp.directive("tabHash", [
    "utils",
    "$location",
    "$timeout",
    (utils, $location, $timeout) => ({
        link(scope, elem, attr) {
            const s = scope
            const contentScope = elem.find(".tab-content").scope()

            const watchHash = () =>
                utils.setupHash(s, [
                    {
                        expr: "activeTab",
                        val_out(val) {
                            return val
                        },
                        val_in(val) {
                            s.setSelected(parseInt(val))
                            return s.activeTab
                        },
                        key: attr.tabHash,
                        default: 0,
                    },
                ])

            s.setSelected = function (index, ignoreCheck) {
                if (!ignoreCheck && !(index in s.fixedTabs)) {
                    index = s.maxTab
                }

                s.activeTab = index
            }

            const initTab = parseInt($location.search()[attr.tabHash]) || 0
            $timeout(function () {
                s.fixedTabs = {}
                s.maxTab = -1
                for (let tab of contentScope.tabset.tabs) {
                    s.fixedTabs[tab.index] = tab
                    if (tab.index > s.maxTab) {
                        s.maxTab = tab.index
                    }
                }
                s.setSelected(initTab)
                return watchHash()
            }, 0)

            s.newDynamicTab = function () {
                return $timeout(function () {
                    s.setSelected(s.maxTab + 1, true)
                    s.maxTab += 1
                }, 0)
            }

            s.closeDynamicTab = function () {
                $timeout(function () {
                    s.maxTab = -1
                    for (let tab of contentScope.tabset.tabs) {
                        if (tab.index > s.maxTab) {
                            s.maxTab = tab.index
                        }
                    }
                }, 0)
            }
        },
    }),
])

korpApp.directive("escaper", () => ({
    link($scope) {
        let escape, unescape
        if ($scope.escape === false) {
            escape = (val) => val
            unescape = (val) => val
        } else {
            const doNotEscape = ["*=", "!*=", "regexp_contains", "not_regexp_contains"]
            escape = function (val) {
                if (!doNotEscape.includes($scope.orObj.op)) {
                    return regescape(val)
                } else {
                    return val
                }
            }

            unescape = function (val) {
                if (!doNotEscape.includes($scope.orObj.op)) {
                    return unregescape(val)
                } else {
                    return val
                }
            }
        }

        $scope.input = unescape($scope.model)
        $scope.$watch("input", () => ($scope.model = escape($scope.input)))

        $scope.$watch("orObj.op", () => ($scope.model = escape($scope.input)))
    },
}))

korpApp.directive("searchSubmit", [
    "$rootElement",
    ($rootElement) => ({
        template: `\
<div class="search_submit">
        <div class="btn-group">
            <button class="btn btn-sm btn-default" id="sendBtn" ng-click="onSendClick()" ng-disabled="disabled">{{'search' | loc:$root.lang}}</button>
            <button class="btn btn-sm btn-default opener" ng-click="togglePopover($event)" ng-disabled="disabled">
                <span class="caret"></span>
            </button>
        </div>
        <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">
            <div class="arrow"></div>
            <h3 class="popover-title">{{'compare_save_header' | loc:$root.lang}}</h3>
            <form class="popover-content" ng-submit="onSubmit()">
                <div>
                    <label>
                        {{'compare_name' | loc:$root.lang}}:
                        <input class="cmp_input" ng-model="name">
                    </label>
                </div>
                <div class="btn_container">
                    <button class="btn btn-primary btn-sm">{{'compare_save' | loc:$root.lang}}</button>
                </div>
            </form>
        </div>
</div>\
`,
        restrict: "E",
        replace: true,
        scope: {
            onSearch: "&",
            onSearchSave: "&",
            disabled: "<",
        },
        link(scope, elem, attr) {
            let at, my
            const s = scope

            s.disabled = angular.isDefined(s.disabled) ? s.disabled : false

            s.pos = attr.pos || "bottom"
            s.togglePopover = function (event) {
                if (s.isPopoverVisible) {
                    s.popHide()
                } else {
                    s.popShow()
                }
                event.preventDefault()
                return event.stopPropagation()
            }

            const popover = elem.find(".popover")
            s.onPopoverClick = function (event) {
                if (event.target !== popover.find(".btn")[0]) {
                    event.preventDefault()
                    return event.stopPropagation()
                }
            }
            s.isPopoverVisible = false
            const trans = {
                bottom: "top",
                top: "bottom",
                right: "left",
                left: "right",
            }
            const horizontal = ["top", "bottom"].includes(s.pos)
            if (horizontal) {
                my = `center ${trans[s.pos]}`
                at = `center ${s.pos}+10`
            } else {
                my = trans[s.pos] + " center"
                at = s.pos + "+10 center"
            }

            const onEscape = function (event) {
                if (event.which === 27) {
                    // escape
                    s.popHide()
                    return false
                }
            }

            s.popShow = function () {
                s.isPopoverVisible = true
                popover
                    .fadeIn("fast")
                    .focus()
                    .position({
                        my,
                        at,
                        of: elem.find(".opener"),
                    })

                $rootElement.on("keydown", onEscape)
                $rootElement.on("click", s.popHide)
            }

            s.popHide = function () {
                s.isPopoverVisible = false
                popover.fadeOut("fast")
                $rootElement.off("keydown", onEscape)
                $rootElement.off("click", s.popHide)
            }

            s.onSubmit = function () {
                s.popHide()
                s.onSearchSave({ name: s.name })
            }

            s.onSendClick = () => s.onSearch()
        },
    }),
])

korpApp.directive("meter", () => ({
    template: `\
<div>
        <div class="background" ng-bind-html="displayWd | trust"></div>
        <div class="abs badge" uib-tooltip-html="tooltipHTML | trust">{{meter.abs}}</div>
</div>\
`,
    replace: true,
    scope: {
        meter: "=",
        max: "=",
        stringify: "=",
    },
    link(scope, elem, attr) {
        const zipped = _.zip(scope.meter.tokenLists, scope.stringify)
        scope.displayWd = _.map(zipped, function (...args) {
            const [tokens, stringify] = args[0]
            return _.map(tokens, function (token) {
                if (token === "|" || token === "") {
                    return "&mdash;"
                } else {
                    return stringify(token)
                }
            }).join(" ")
        }).join(";")

        scope.loglike = Math.abs(scope.meter.loglike)

        scope.tooltipHTML = `\
            ${util.getLocaleString("statstable_absfreq")}: ${scope.meter.abs}
            <br>
            loglike: ${scope.loglike}\
`

        const w = 394
        const part = scope.loglike / Math.abs(scope.max)

        const bkg = elem.find(".background")
        return bkg.width(Math.round(part * w))
    },
}))

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

korpApp.directive("toBody", [
    "$compile",
    ($compile) => ({
        restrict: "A",
        compile(elm) {
            elm.remove()
            elm.attr("to-body", null)
            const wrapper = $("<div>").append(elm)
            const cmp = $compile(wrapper.html())

            return function (scope) {
                const newElem = cmp(scope)
                $("body").append(newElem)
                return scope.$on("$destroy", () => newElem.remove())
            }
        },
    }),
])

korpApp.directive("warning", () => ({
    restrict: "E",
    transclude: true,
    template: "<div class='korp-warning bs-callout bs-callout-warning' ng-transclude></div>",
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

korpApp.directive("timeInterval", () => ({
    scope: {
        label: "@",
        dateModel: "=",
        timeModel: "=",
        minDate: "=",
        maxDate: "=",
        update: "&",
    },

    restrict: "E",
    template: html`
        <button class="btn btn-default btn-sm" popper no-close-on-click my="left top" at="right top">
            <i class="fa fa-calendar"></i> <span style="text-transform: capitalize;">{{label | loc:$root.lang}} </span>
        </button>
        {{ combined.format("YYYY-MM-DD HH:mm") }}
        <div ng-click="handleClick($event)" class="date_interval popper_menu dropdown-menu">
            <div
                uib-datepicker
                class="well well-sm"
                ng-model="dateModel"
                min-date="minDate"
                max-date="maxDate"
                init-date="minDate"
                show-weeks="true"
                starting-day="1"
            ></div>

            <div class="time">
                <i class="fa-solid fa-3x fa-clock-o"></i>
                <div
                    uib-timepicker
                    class="timepicker"
                    ng-model="timeModel"
                    hour-step="1"
                    minute-step="1"
                    show-meridian="false"
                ></div>
            </div>
        </div>
    `,
    link(s) {
        const timeUnits = ["hour", "minute"]
        s.$watchGroup(["dateModel", "timeModel"], function (...args) {
            const [date, time] = args[0]
            if (date && time) {
                const m = moment(moment(date).format("YYYY-MM-DD"))
                for (let t of timeUnits) {
                    const m_time = moment(time)
                    m.add(m_time[t](), t)
                }
                s.update({})
                s.combined = m
            }
        })

        s.handleClick = function (event) {
            event.originalEvent.preventDefault()
            event.originalEvent.stopPropagation()
        }
    },
}))

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
            {{keyItems[selected[0]].label | locObj:lang}}
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
            <span class="reduce-label">{{keyItems['word'].label | locObj:lang }}</span>
            <span ng-class="keyItems['word'].insensitive ? 'selected':''"
                  class="insensitive-toggle"
                  ng-click="toggleWordInsensitive($event)"><b>Aa</b></span>
          </li>
          <b ng-if="hasWordAttrs">{{'word_attr' | loc:$root.lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'word_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | locObj:lang }}</span>
          </li>
          <b ng-if="hasStructAttrs">{{'sentence_attr' | loc:$root.lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'sentence_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | locObj:lang }}</span>
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
