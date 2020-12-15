/** @format */
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

korpApp.directive("tabHash", (utils, $location, $timeout) => ({
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
}))

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

        return $scope.$watch("orObj.op", () => ($scope.model = escape($scope.input)))
    },
}))

korpApp.directive("tokenValue", ($compile, $controller, extendedComponents) => ({
    scope: {
        tokenValue: "=",
        model: "=model",
        orObj: "=orObj",
        lang: "=",
    },
    template: `\
<div>{{tokenValue.label}}</div>\
`,
    link(scope, elem, attr) {
        let current = null
        let prevScope = null
        let childWatch = null

        return scope.$watch("tokenValue", function (valueObj) {
            if (scope.orObj.flags) {
                delete scope.orObj.flags["c"]
            }

            let controller, template
            if (!valueObj) {
                return
            }
            if (valueObj.value === (current && current.value)) {
                return
            }

            if (prevScope != null) {
                prevScope.$destroy()
            }
            if (typeof childWatch === "function") {
                childWatch()
            }

            prevScope = null
            current = valueObj

            const childScope = scope.$new(false, scope)
            childWatch = childScope.$watch("model", (val) => (scope.model = val))

            childScope.orObj = scope.orObj
            _.extend(childScope, valueObj)

            const locals = { $scope: childScope }
            prevScope = childScope
            if (valueObj.extendedComponent) {
                ;({ template, controller } = extendedComponents[valueObj.extendedComponent])
            } else {
                if (valueObj.extendedController) {
                    controller = valueObj.extendedController
                } else {
                    controller = extendedComponents.defaultController
                }
                if (valueObj.extendedTemplate) {
                    template = valueObj.extendedTemplate
                } else {
                    let tmplObj
                    if (valueObj.value === "word") {
                        tmplObj = { maybe_placeholder: "placeholder='<{{\"any\" | loc:lang}}>'" }
                    } else {
                        tmplObj = { maybe_placeholder: "" }
                    }

                    template = extendedComponents.defaultTemplate(tmplObj)
                }
            }

            $controller(controller, locals)
            const tmplElem = $compile(template)(childScope)
            return elem.html(tmplElem).addClass("arg_value")
        })
    },
}))

korpApp.directive("constr", ($window) => ({
    scope: true,

    link(scope, elem, attr) {
        const instance = new $window.view[attr.constr](elem, elem, scope)
        if (attr.constrName) {
            $window[attr.constrName] = instance
        }

        scope.instance = instance
        scope.$parent.instance = instance
    },
}))

korpApp.directive("searchSubmit", ($rootElement) => ({
    template: `\
<div class="search_submit">
        <div class="btn-group">
            <button class="btn btn-sm btn-default" id="sendBtn" ng-click="onSendClick()" ng-disabled="searchDisabled">{{'search' | loc:lang}}</button>
            <button class="btn btn-sm btn-default opener" ng-click="togglePopover($event)" ng-disabled="searchDisabled">
                <span class="caret"></span>
            </button>
        </div>
        <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">
            <div class="arrow"></div>
            <h3 class="popover-title">{{'compare_save_header' | loc:lang}}</h3>
            <form class="popover-content" ng-submit="onSubmit()">
                <div>
                    <label>
                        {{'compare_name' | loc:lang}}:
                        <input class="cmp_input" ng-model="name">
                    </label>
                </div>
                <div class="btn_container">
                    <button class="btn btn-primary btn-sm">{{'compare_save' | loc:lang}}</button>
                </div>
            </form>
        </div>
</div>\
`,
    restrict: "E",
    replace: true,
    link(scope, elem, attr) {
        let at, my
        const s = scope
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
            return s.$broadcast("popover_submit", s.name)
        }

        s.onSendClick = () => s.$broadcast("btn_submit")
    },
}))

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

korpApp.directive("popper", ($rootElement) => ({
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
}))

korpApp.directive("tabSpinner", () => ({
    template: `\
<i class="fa fa-times-circle close_icon"></i>
<span class="tab_spinner"
        us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}"></span>\
`,
}))

korpApp.directive("extendedList", () => ({
    templateUrl: require("../views/extendedlist.html"),
    scope: {
        cqp: "=",
        lang: "=",
        repeatError: "=",
    },
    link($scope) {
        const s = $scope

        const setCQP = function (val) {
            let token
            try {
                s.data = CQP.parse(val)
            } catch (error) {
                let output = []
                for (token of val.split("[")) {
                    if (!token) {
                        continue
                    }
                    token = `[${token}`
                    let tokenObj
                    try {
                        tokenObj = CQP.parse(token)
                    } catch (parseError) {
                        tokenObj = [{ cqp: token }]
                    }
                    output = output.concat(tokenObj)
                }

                s.data = output
                c.log("error parsing cqp", s.data)
            }

            for (token of s.data) {
                if (!("and_block" in token) || !token.and_block.length) {
                    token.and_block = CQP.parse('[word = ""]')[0].and_block
                }
            }
        }

        if (s.cqp == null) {
            s.cqp = "[]"
        }
        setCQP(s.cqp)

        s.$watch("data", () => (s.cqp = CQP.stringify(s.data) || ""), true)

        s.addOr = function (and_array) {
            let last = _.last(and_array) || {}
            and_array.push({
                type: last.type || "word",
                op: last.op == "contains" ? "contains" : "=",
                val: "",
            })
            return and_array
        }

        s.addToken = function () {
            const token = { and_block: [s.addOr([])] }
            s.data.push(token)
            s.repeatError = false
        }

        s.removeToken = function (i) {
            if (!(s.data.length > 1)) {
                return
            }
            s.data.splice(i, 1)
            let repeatError = true
            for (let token of s.data) {
                if (!token.repeat || token.repeat[0] > 0) {
                    repeatError = false
                    break
                }
            }
            s.repeatError = repeatError
        }

        s.toggleRepeat = function (token) {
            if (!token.repeat) {
                token.repeat = [1, 1]
                s.repeatError = false
            } else {
                s.repeatError = false
                return delete token.repeat
            }
        }

        s.repeatChange = function (repeat_idx, token_idx) {
            const token = s.data[token_idx]

            if (token.repeat[repeat_idx] === null) {
                return
            }

            if (token.repeat[repeat_idx] === -1) {
                token.repeat[repeat_idx] = 0
            } else if (token.repeat[repeat_idx] < 0) {
                token.repeat[repeat_idx] = 1
            } else if (token.repeat[repeat_idx] > 100) {
                token.repeat[repeat_idx] = 100
            }

            if (token.repeat[1] < token.repeat[0] && repeat_idx === 0) {
                token.repeat[1] = token.repeat[0]
            }

            if (token.repeat[1] < token.repeat[0] && repeat_idx === 1) {
                token.repeat[0] = token.repeat[1]
            }

            if (token.repeat[1] < 1) {
                token.repeat[1] = 1
            }

            if (token.repeat[0] > 0) {
                s.repeatError = false
            }
        }

        s.repeatBlur = function (repeat_idx, token_idx) {
            let token = s.data[token_idx]

            if (token.repeat[repeat_idx] === null) {
                token.repeat[repeat_idx] = token.repeat[repeat_idx === 0 ? 1 : 0]
            }

            let repeatError = true
            for (token of s.data) {
                if (!token.repeat || token.repeat[0] > 0) {
                    repeatError = false
                    break
                }
            }

            s.repeatError = repeatError
        }
    },
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

korpApp.directive("toBody", ($compile) => ({
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
}))

korpApp.directive("warning", () => ({
    restrict: "E",
    transclude: true,
    template: "<div class='korp-warning bs-callout bs-callout-warning' ng-transclude></div>",
}))

korpApp.directive("autoc", ($q, lexicons) => ({
    replace: true,
    restrict: "E",
    scope: {
        placeholder: "=",
        model: "=",
        type: "@",
        variant: "@",
        disableLemgramAutocomplete: "=",
        textInField: "=",
        errorMessage: "@",
        errorOnEmpty: "=",
    },
    template: `\
<div>
        <script type="text/ng-template" id="lemgramautocomplete.html">
            <a style="cursor:pointer">
                <span ng-class="{'autocomplete-item-disabled' : match.model.count == 0, 'none-to-find' : (match.model.variant != 'dalin' && match.model.count == 0)}">
                    <span ng-if="match.model.parts.namespace" class="label lemgram-namespace">{{match.model.parts.namespace | loc}}</span>
                    <span>{{match.model.parts.main}}</span>
                    <sup ng-if="match.model.parts.index != 1">{{match.model.parts.index}}</sup>
                    <span ng-if="match.model.parts.pos">({{match.model.parts.pos}})</span>
                    <span ng-if="match.model.desc" style="color:gray;margin-left:6px">{{match.model.desc.main}}</span>
                    <sup ng-if="match.model.desc && match.model.desc.index != 1" style="color:gray">{{match.model.desc.index}}</sup>
                    <span class="num-to-find" ng-if="match.model.count && match.model.count > 0">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {{match.model.count}}
                    </span>
                </span>
            </a>
        </script>
        <div ng-show="!disableLemgramAutocomplete">
            <div style="float:left"><input
                autofocus
                type="text"
                ng-model="textInField"
                uib-typeahead="row for row in getRows($viewValue)"
                typeahead-wait-ms="500"
                typeahead-template-url="lemgramautocomplete.html"
                typeahead-loading="isLoading"
                typeahead-on-select="selectedItem($item, $model, $label)"
                placeholder="{{placeholderToString(placeholder)}}"
                typeahead-click-open
                typeahead-is-open="typeaheadIsOpen"
                ng-blur="typeaheadClose()"></div>
            <div style="margin-left:-20px;margin-top:6px;float:left" ng-if="isLoading"><i class="fa fa-spinner fa-pulse"></i></div>
        </div>
        <div ng-show="disableLemgramAutocomplete">
            <div style="float:left">
                <input autofocus type="text" ng-model="textInField">
            </div>
        </div>
        <span ng-if='isError' style='color: red; position: relative; top: 3px; margin-left: 6px'>{{errorMessage | loc:lang}}</span>
</div>\
`,
    link(scope) {
        scope.isError = false

        scope.typeaheadClose = function () {
            if (scope.errorOnEmpty) {
                scope.isError = !(scope.model != null && _.isEmpty(scope.textInField))
            }
        }

        scope.lemgramify = function (lemgram) {
            const lemgramRegExp = /([^_.-]*--)?(.*)\.\.(\w+)\.(\d\d?)/
            const match = lemgram.match(lemgramRegExp)
            if (!match) {
                return false
            }
            return {
                main: match[2].replace(/_/g, " "),
                pos: util.getLocaleString(match[3].slice(0, 2)),
                index: match[4],
                namespace: match[1] ? match[1].slice(0, -2) : "",
            }
        }

        scope.sensify = function (sense) {
            const senseParts = sense.split("..")
            return {
                main: senseParts[0].replace(/_/g, " "),
                index: senseParts[1],
            }
        }

        scope.placeholderToString = _.memoize(function (placeholder) {
            if (!placeholder) {
                return
            }
            if (scope.type === "lemgram") {
                return util.lemgramToString(placeholder).replace(/<.*?>/g, "")
            } else {
                return util.saldoToPlaceholderString(placeholder, true)
            }
        })

        scope.selectedItem = function (item, model) {
            if (scope.type === "lemgram") {
                scope.placeholder = model.lemgram
                scope.model = regescape(model.lemgram)
            } else {
                scope.placeholder = model.sense
                scope.model = regescape(model.sense)
            }
            scope.textInField = ""
            return scope.typeaheadClose()
        }

        if (scope.model) {
            if (scope.type === "sense") {
                scope.selectedItem(null, { sense: unregescape(scope.model) })
            } else {
                scope.selectedItem(null, { lemgram: unregescape(scope.model) })
            }
        }

        scope.getMorphologies = function (corporaIDs) {
            const morphologies = []
            if (scope.variant === "dalin") {
                morphologies.push("dalinm")
            } else {
                for (let corporaID of corporaIDs) {
                    const morfs = settings.corpora[corporaID].morphology || ""
                    for (let morf of morfs.split("|")) {
                        if (morf !== "" && !morphologies.includes(morf)) {
                            morphologies.push(morf)
                        }
                    }
                }
                if (morphologies.length === 0) {
                    morphologies.push("saldom")
                }
            }
            return morphologies
        }

        scope.getRows = function (input) {
            const corporaIDs = _.map(settings.corpusListing.selected, "id")
            const morphologies = scope.getMorphologies(corporaIDs)
            if (scope.type === "lemgram") {
                return scope.getLemgrams(input, morphologies, corporaIDs)
            } else if (scope.type === "sense") {
                return scope.getSenses(input, morphologies, corporaIDs)
            }
        }

        scope.getLemgrams = function (input, morphologies, corporaIDs) {
            const deferred = $q.defer()
            const http = lexicons.getLemgrams(
                input,
                morphologies,
                corporaIDs,
                scope.variant === "affix"
            )
            http.then(function (data) {
                data.forEach(function (item) {
                    if (scope.variant === "affix") {
                        item.count = -1
                    }
                    item.parts = scope.lemgramify(item.lemgram)
                    item.variant = scope.variant
                })
                data.sort((a, b) => b.count - a.count)
                return deferred.resolve(data)
            })
            return deferred.promise
        }

        scope.getSenses = function (input, morphologies, corporaIDs) {
            const deferred = $q.defer()
            const http = lexicons.getSenses(input, morphologies.join("|"), corporaIDs)
            http.then(function (data) {
                data.forEach(function (item) {
                    item.parts = scope.sensify(item.sense)
                    if (item.desc) {
                        item.desc = scope.sensify(item.desc)
                    }
                    item.variant = scope.variant
                })
                data.sort(function (a, b) {
                    if (a.parts.main === b.parts.main) {
                        return b.parts.index < a.parts.index
                    } else {
                        return a.sense.length - b.sense.length
                    }
                })
                return deferred.resolve(data)
            })
            return deferred.promise
        }
    },
}))

korpApp.directive("typeaheadClickOpen", function ($timeout) {
    return {
        restrict: "A",
        require: "ngModel",
        link($scope, elem) {
            const triggerFunc = function (event) {
                if (event.keyCode === 40 && !$scope.typeaheadIsOpen) {
                    const ctrl = elem.controller("ngModel")
                    const prev = ctrl.$modelValue || ""
                    if (prev) {
                        ctrl.$setViewValue("")
                        return $timeout(() => ctrl.$setViewValue(`${prev}`))
                    }
                }
            }
            return elem.bind("keyup", triggerFunc)
        },
    }
})

korpApp.directive("timeInterval", () => ({
    scope: {
        dateModel: "=",
        timeModel: "=",
        model: "=",
        minDate: "=",
        maxDate: "=",
    },

    restrict: "E",
    template: `\
<div>
        <div uib-datepicker class="well well-sm" ng-model="dateModel"
            min-date="minDate" max-date="maxDate" init-date="minDate"
            show-weeks="true" starting-day="1"></div>

        <div class="time">
            <i class="fa fa-3x fa-clock-o"></i><div uib-timepicker class="timepicker" ng-model="timeModel"
                hour-step="1" minute-step="1" show-meridian="false"></div>
        </div>
</div>\
`,

    link(s) {
        s.isOpen = false
        s.open = function (event) {
            event.preventDefault()
            event.stopPropagation()
            s.isOpen = true
        }

        const time_units = ["hour", "minute"]
        s.$watchGroup(["dateModel", "timeModel"], function (...args) {
            const [date, time] = args[0]
            if (date && time) {
                const m = moment(moment(date).format("YYYY-MM-DD"))
                for (let t of time_units) {
                    const m_time = moment(time)
                    m.add(m_time[t](), t)
                }
                s.model = m
            }
        })
    },
}))

korpApp.directive("reduceSelect", ($timeout) => ({
    restrict: "AE",
    scope: {
        items: "=reduceItems",
        selected: "=reduceSelected",
        insensitive: "=reduceInsensitive",
        lang: "=reduceLang",
    },
    replace: true,
    template: `\
    <div uib-dropdown auto-close="outsideClick" class="reduce-attr-select" on-toggle="toggled(open)">
      <div uib-dropdown-toggle class="reduce-dropdown-button inline_block bg-white border border-gray-500">
        <div class="reduce-dropdown-button-text">
          <span>{{ "reduce_text" | loc:lang }}:</span>
          <span>
            {{keyItems[selected[0]].label | loc:lang}}
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
            <span class="reduce-label">{{keyItems['word'].label | loc:lang }}</span>
            <span ng-class="keyItems['word'].insensitive ? 'selected':''"
                  class="insensitive-toggle"
                  ng-click="toggleWordInsensitive($event)"><b>Aa</b></span>
          </li>
          <b ng-if="hasWordAttrs">{{'word_attr' | loc:lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'word_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | loc:lang }}</span>
          </li>
          <b ng-if="hasStructAttrs">{{'sentence_attr' | loc:lang}}</b>
          <li ng-repeat="item in items | filter:{ group: 'sentence_attr' }"
              ng-click="toggleSelected(item.value, $event)"
              ng-class="item.selected ? 'selected':''" class="attribute">
            <input type="checkbox" class="reduce-check" ng-checked="item.selected">
            <span class="reduce-label">{{item.label | loc:lang }}</span>
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

                scope.hasWordAttrs = _.filter(scope.keyItems, { group: "word_attr" }).length > 0
                scope.hasStructAttrs =
                    _.filter(scope.keyItems, { group: "sentence_attr" }).length > 0

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
}))

angular.module("template/datepicker/day.html", []).run(($templateCache) =>
    $templateCache.put(
        "template/datepicker/day.html",
        `\
<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}"
  <thead>
    <tr>
      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="fa fa-chevron-left"></i></button></th>
      <th colspan="{{5 + showWeeks}}">
        <button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;">
            <strong>{{title}}</strong>
        </button>
      </th>
      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="fa fa-chevron-right"></i></button></th>
    </tr>
    <tr>
      <th ng-show="showWeeks" class="text-center"></th>
      <th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="row in rows track by $index">
      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>
      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">
        <button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{'btn-info': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1">
            <span ng-class="{'text-muted': dt.secondary, 'text-info': dt.current}">{{dt.label}}</span>
        </button>
      </td>
    </tr>
  </tbody>
</table\
`
    )
)

angular.module("template/datepicker/month.html", []).run(($templateCache) =>
    $templateCache.put(
        "template/datepicker/month.html",
        `\
<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">
  <thead>
    <tr>
      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="fa fa-chevron-left"></i></button></th>
      <th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>
      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="fa fa-chevron-right"></i></button></th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="row in rows track by $index">
      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">
        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{'btn-info': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{'text-info': dt.current}">{{dt.label}}</span></button>
      </td>
    </tr>
  </tbody>
</table>\
`
    )
)

angular.module("template/datepicker/year.html", []).run(($templateCache) =>
    $templateCache.put(
        "template/datepicker/year.html",
        `\
<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">
  <thead>
    <tr>
      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="fa fa-chevron-left"></i></button></th>
      <th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>
      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="fa fa-chevron-right"></i></button></th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="row in rows track by $index">
      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">
        <button type="button" style="width:100%;" class="btn btn-default" ng-class="{'btn-info': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{'text-info': dt.current}">{{dt.label}}</span></button>
      </td>
    </tr>
  </tbody>
</table>\
`
    )
)

angular.module("template/timepicker/timepicker.html", []).run(($templateCache) =>
    $templateCache.put(
        "template/timepicker/timepicker.html",
        `\
<table>
   <tbody>
       <tr class="text-center">
           <td><a ng-click="incrementHours()" class="btn btn-link"><span class="fa fa-chevron-up"></span></a></td>
           <td>&nbsp;</td>
           <td><a ng-click="incrementMinutes()" class="btn btn-link"><span class="fa fa-chevron-up"></span></a></td>
           <td ng-show="showMeridian"></td>
       </tr>
       <tr>
           <td style="width:50px;" class="form-group" ng-class="{'has-error': invalidHours}">
               <input type="text" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-mousewheel="incrementHours()" ng-readonly="readonlyInput" maxlength="2">
           </td>
           <td>:</td>
           <td style="width:50px;" class="form-group" ng-class="{'has-error': invalidMinutes}">
               <input type="text" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2">
           </td>
           <td ng-show="showMeridian"><button type="button" class="btn btn-default text-center" ng-click="toggleMeridian()">{{meridian}}</button></td>
       </tr>
       <tr class="text-center">
           <td><a ng-click="decrementHours()" class="btn btn-link"><span class="fa fa-chevron-down"></span></a></td>
           <td>&nbsp;</td>
           <td><a ng-click="decrementMinutes()" class="btn btn-link"><span class="fa fa-chevron-down"></span></a></td>
           <td ng-show="showMeridian"></td>
       </tr>
   </tbody>
</table>\
`
    )
)
