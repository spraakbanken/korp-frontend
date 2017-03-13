korpApp = angular.module("korpApp")



korpApp.directive 'kwicWord', ->
    replace: true
    template : """<span class="word" ng-class="getClassObj(wd)">
                    {{::wd.word}} </span>
                """
    link : (scope, element) ->
        scope.getClassObj = (wd) ->
            output =
                reading_match : wd._match
                punct : wd._punct
                match_sentence : wd._matchSentence
                link_selected : wd._link_selected

            for struct in (wd._struct or [])
                output["struct_" + struct] = true

            for struct in (wd._open or [])
                output["open_" + struct] = true
            for struct in (wd._close or [])
                output["close_" + struct] = true

            return (x for [x, y] in _.pairs output when y).join " "



korpApp.directive "tabHash", (utils, $location) ->
    link : (scope, elem, attr) ->
        s = scope
        contentScope = elem.find(".tab-content").scope()


        watchHash = () ->
            utils.setupHash s,[
                expr : "getSelected()"
                val_out : (val) ->
                    return val
                val_in : (val) ->
                    s.setSelected parseInt(val)
                    return parseInt(val)
                key : attr.tabHash
                default : 0
            ]

        init_tab = parseInt($location.search()[attr.tabHash]) or 0


        w = contentScope.$watch "tabs.length", (len) ->
            if len
                s.setSelected(init_tab)
                watchHash()
                w()

        s.getSelected = () ->
            out = null
            for p, i in contentScope.tabs
                out = i if p.active

            unless out? then out = contentScope.tabs.length - 1
            return out

        s.setSelected = (index) ->
            for t in contentScope.tabs
                t.active = false
                t.onDeselect?()
            if contentScope.tabs[index]
                contentScope.tabs[index].active = true
            else
                (_.last contentScope.tabs)?.active = true


korpApp.directive "escaper", () ->
    link : ($scope, elem, attr) ->
        doNotEscape = ["*=", "!*="]
        escape = (val) ->
            if $scope.orObj.op not in doNotEscape
                regescape(val)
            else
                val

        unescape = (val) ->
            if $scope.orObj.op not in doNotEscape
                unregescape(val)
            else
                val

        $scope.input = unescape $scope.model
        $scope.$watch "input", () ->
            $scope.model = escape($scope.input)

        $scope.$watch "orObj.op", () ->
            $scope.model = escape($scope.input)


korpApp.directive "tokenValue", ($compile, $controller) ->

    getDefaultTmpl = _.template """
                <input ng-model='input' class='arg_value' escaper ng-model-options='{debounce : {default : 300, blur : 0}, updateOn: "default blur"}'
                <%= maybe_placeholder %>>
                <span class='val_mod' popper
                    ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'>
                        Aa
                </span>
                <ul class='mod_menu popper_menu dropdown-menu'>
                    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc:lang}}</a></li>
                    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc:lang}}</a></li>
                </ul>
                """
    defaultController = ["$scope", ($scope) ->
        if $scope.orObj.flags?.c
            $scope.case = "insensitive"
        else
            $scope.case = "sensitive"

        $scope.makeSensitive = () ->
            $scope.case = "sensitive"
            delete $scope.orObj.flags?["c"]

        $scope.makeInsensitive = () ->
            flags = ($scope.orObj.flags or {})
            flags["c"] = true
            $scope.orObj.flags = flags

            $scope.case = "insensitive"
    ]

    scope :
        tokenValue : "="
        model : "=model"
        orObj : "=orObj"
        lang : "="
    template : """
        <div>{{tokenValue.label}}</div>
    """
    link : (scope, elem, attr) ->
        current = null
        prevScope = null
        childWatch = null

        scope.$watch "tokenValue", (valueObj) ->
            unless valueObj then return
            if valueObj.value == current?.value then return

            prevScope?.$destroy()
            childWatch?()

            prevScope = null
            current = valueObj

            childScope = scope.$new(false, scope)
            childWatch = childScope.$watch "model", (val) ->
                scope.model = val

            childScope.orObj = scope.orObj
            _.extend childScope, valueObj

            locals = {$scope : childScope}
            prevScope = childScope
            $controller(valueObj.extendedController or defaultController, locals)

            if valueObj.value == "word"
                tmplObj = {maybe_placeholder : """placeholder='<{{"any" | loc:lang}}>'"""}
            else
                tmplObj = {maybe_placeholder : ""}

            defaultTmpl = getDefaultTmpl tmplObj
            tmplElem = $compile(valueObj.extendedTemplate or defaultTmpl)(childScope)
            elem.html(tmplElem).addClass("arg_value")



korpApp.directive "constr", ($window, searches) ->
    scope : true

    link : (scope, elem, attr) ->
        instance = new $window.view[attr.constr](elem, elem, scope)
        if attr.constrName
            c.log "attr.constrName", attr.constrName
            $window[attr.constrName] = instance

        scope.instance = instance
        scope.$parent.instance = instance



korpApp.directive "searchSubmit", ($window, $document, $rootElement) ->
    template : '''
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
                    <label for="cmp_input">{{'compare_name' | loc:lang}} :</label> <input id="cmp_input" ng-model="name">
                </div>
                <div class="btn_container">
                    <button class="btn btn-primary btn-sm">{{'compare_save' | loc:lang}}</button>
                </div>
            </form>
        </div>
    </div>
    '''
    restrict : "E"
    replace : true
    link : (scope, elem, attr) ->
        s = scope
        s.pos = attr.pos or "bottom"
        s.togglePopover = (event) ->
            if s.isPopoverVisible
                s.popHide()
            else
                s.popShow()
            event.preventDefault()
            event.stopPropagation()

        popover = elem.find(".popover")
        s.onPopoverClick = (event) ->
            unless event.target == popover.find(".btn")[0]
                event.preventDefault()
                event.stopPropagation()
        s.isPopoverVisible = false
        trans =
            bottom : "top"
            top : "bottom"
            right : "left"
            left : "right"
        horizontal = s.pos in ["top", "bottom"]
        if horizontal
            my = "center " + trans[s.pos]
            at = "center " + s.pos + "+10"
        else
            my = trans[s.pos] + " center"
            at = s.pos + "+10 center"


        onEscape = (event) ->
            if event.which == 27 #escape
                s.popHide()
                return false

        s.popShow = () ->
            s.isPopoverVisible = true
            popover.show("fade", "fast").focus().position
                my : my
                at : at
                of : elem.find(".opener")

            $rootElement.on "keydown", onEscape
            $rootElement.on "click", s.popHide
            return

        s.popHide = () ->
            s.isPopoverVisible = false
            popover.hide("fade", "fast")
            $rootElement.off "keydown", onEscape
            $rootElement.off "click", s.popHide
            return


        s.onSubmit = () ->
            s.popHide()
            s.$broadcast('popover_submit', s.name)

        s.onSendClick = () ->
            s.$broadcast('btn_submit')



korpApp.directive "meter", () ->
    template: '''
        <div>
            <div class="background" ng-bind-html="displayWd | trust"></div>
            <div class="abs badge" uib-tooltip-html="tooltipHTML | trust">{{meter.abs}}</div>
        </div>
    '''
    replace: true
    scope :
        meter : "="
        max : "="
        stringify : "="
    link : (scope, elem, attr) ->

        zipped = _.zip scope.meter.tokenLists, scope.stringify
        scope.displayWd = (_.map zipped, ([tokens, stringify]) ->
            (_.map tokens, (token) ->
                if token == "|"
                    return "&mdash;"
                else
                    return stringify(token)).join " ").join ";"

        scope.loglike = Math.abs scope.meter.loglike

        scope.tooltipHTML = """
            #{util.getLocaleString('statstable_absfreq')}: #{scope.meter.abs}
            <br>
            loglike: #{scope.loglike}
        """

        w = elem.parent().width()
        part = ((scope.loglike) / (Math.abs scope.max))

        bkg = elem.find(".background")
        bkg.width Math.round (part * w)



korpApp.directive "popper", ($rootElement) ->
    scope: {}
    link : (scope, elem, attrs) ->
        popup = elem.next()
        popup.appendTo("body").hide()
        closePopup = () ->
            popup.hide()

        if !attrs.noCloseOnClick?
            popup.on "click", (event) ->
                closePopup()
                return false

        elem.on "click", (event) ->
            other = $(".popper_menu:visible").not(popup)
            if other.length
                other.hide()
            if popup.is(":visible") then closePopup()
            else popup.show()

            pos =
                my : attrs.my or "right top"
                at : attrs.at or "bottom right"
                of : elem
            if scope.offset
                pos.offset = scope.offset

            popup.position pos

            return false

        $rootElement.on "click", () ->
            closePopup()



korpApp.directive "tabSpinner", ($rootElement) ->
    template : """
    <i class="fa fa-times-circle close_icon"></i>
    <span class="tab_spinner"
        us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 4, top : -12}"></span>
    """


korpApp.directive "extendedList", ($location, $rootScope) ->
    templateUrl : "views/extendedlist.html"
    scope : {
        cqp : "="
        lang: "="
        repeatError: "="
    },
    link : ($scope, elem, attr) ->
        s = $scope

        setCQP = (val) ->
            try
                s.data = CQP.parse(val)
            catch error
                output = []
                for token in val.split("[")
                    if not token
                        continue
                    token = "[" + token
                    try
                        tokenObj = CQP.parse(token)
                    catch error
                        tokenObj = [{cqp : token}]
                    output = output.concat(tokenObj)

                s.data = output
                c.log "error parsing cqp", s.data

            for token in s.data
                if "and_block" not of token or not token.and_block.length
                    token.and_block = CQP.parse('[word = ""]')[0].and_block

        s.cqp ?= '[]'
        setCQP(s.cqp)

        s.$watch 'data', (() -> s.cqp = (CQP.stringify s.data) or ""), true

        s.addOr = (and_array) ->
            and_array.push
                type : "word"
                op : "="
                val : ""
            return and_array

        s.addToken = ->
            token = {and_block : [[]]}
            s.data.push token
            s.addOr token.and_block[0]
            s.repeatError = false

        s.removeToken = (i) ->
            unless s.data.length > 1 then return
            s.data.splice(i, 1)
            repeatError = true
            for token in s.data
                if not token.repeat or token.repeat[0] > 0
                    repeatError = false
                    break
            s.repeatError = repeatError

        s.toggleRepeat = (token) ->
            unless token.repeat
                token.repeat = [1,1]
                s.repeatError = false
            else
                s.repeatError = false
                delete token.repeat

        s.repeatChange = (repeat_idx, token_idx) ->
            token = s.data[token_idx]
            
            if token.repeat[repeat_idx] is null
                return

            if token.repeat[repeat_idx] is -1
                token.repeat[repeat_idx] = 0
            else if token.repeat[repeat_idx] < 0
                token.repeat[repeat_idx] = 1
            else if token.repeat[repeat_idx] > 100
                token.repeat[repeat_idx] = 100

            if token.repeat[1] < token.repeat[0] and repeat_idx is 0
                token.repeat[1] = token.repeat[0]

            if token.repeat[1] < token.repeat[0] and repeat_idx is 1
                token.repeat[0] = token.repeat[1]
            
            if token.repeat[1] < 1
                token.repeat[1] = 1
            
            if token.repeat[0] > 0
                s.repeatError = false

        s.repeatBlur = (repeat_idx, token_idx) ->
            token = s.data[token_idx]

            if token.repeat[repeat_idx] is null
                token.repeat[repeat_idx] = token.repeat[if repeat_idx is 0 then 1 else 0]
            
            repeatError = true
            for token in s.data
                if not token.repeat or token.repeat[0] > 0
                    repeatError = false
                    break

            s.repeatError = repeatError


korpApp.directive "tabPreloader", () ->
    restrict : "E"
    scope :
        value : "="
        spinner : "="
    replace : true
    template : """
        <div class="tab_preloaders">
            <div ng-if="!spinner" class="tab_progress" style="width:{{value || 0}}%"></div>
                <span ng-if="spinner" class="preloader_spinner"
                    us-spinner="{lines : 8 ,radius:4, width:1.5, length: 2.5, left : 7, top : -12}"></span>
        </div>
    """

    link : (scope, elem, attr) ->



korpApp.directive "clickCover", () ->

    link : (scope, elem, attr) ->
        cover = $("<div class='click-cover'>").on "click", () -> return false
            
        pos = elem.css("position") or "static"
        scope.$watch () ->
            scope.$eval attr.clickCover
        , (val) ->
            if val
                elem.prepend(cover)
                elem.css "pointer-events" ,"none"
                elem.css("position", "relative").addClass("covered")
            else
                cover.remove()
                elem.css "pointer-events", ""
                elem.css("position", pos).removeClass("covered")



korpApp.directive 'toBody', ($compile) ->
    restrict : "A"
    compile : (elm, attrs) ->
        elm.remove()
        elm.attr("to-body", null)
        wrapper = $("<div>").append(elm)
        cmp = $compile(wrapper.html())

        return (scope, iElement, iAttrs) ->
            newElem = cmp(scope)
            $("body").append(newElem)
            scope.$on "$destroy", () ->
                newElem.remove()



korpApp.directive "warning", () ->
    restrict : "E"
    transclude : true
    template : "<div class='korp-warning bs-callout bs-callout-warning' ng-transclude></div>"



korpApp.directive "kwicPager", () ->
    replace: true
    restrict: "E"
    scope: false
    template: """
    <div class="pager-wrapper" ng-show="gotFirstKwic && hits > 0" >
      <uib-pagination
         total-items="hits"
         ng-if="gotFirstKwic"
         ng-model="pageObj.pager"
         ng-click="pageChange($event, pageObj.pager)"
         max-size="15"
         items-per-page="::$root._searchOpts.hits_per_page"
         previous-text="‹" next-text="›" first-text="«" last-text="»"
         boundary-links="true"
         rotate="false"
         num-pages="$parent.numPages"> </uib-pagination>
      <div class="page_input"><span>{{'goto_page' | loc:lang}} </span>
        <input ng-model="gotoPage" ng-keyup="onPageInput($event, gotoPage, numPages)"
            ng-click="$event.stopPropagation()" />
        {{'of' | loc:lang}} {{numPages}}
      </div>

    </div>
    """



korpApp.directive "autoc", ($q, $http, $timeout, lexicons) ->
    replace: true
    restrict: "E"
    scope:
        "placeholder" : "="
        "model" : "="
        "type" : "@"
        "variant" : "@"
        "disableLemgramAutocomplete" : "="
        "textInField": "="
        "typeaheadCloseCallback": "&"
    template: """
        <div>
            <script type="text/ng-template" id="lemgramautocomplete.html">
                <a style="cursor:pointer">
                    <span ng-class="{'autocomplete-item-disabled' : match.model.count == 0, 'none-to-find' : (match.model.variant != 'dalin' && match.model.count == 0)}">
                        <span ng-if="match.model.parts.namespace" class="label">{{match.model.parts.namespace | loc}}</span>
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
                <div style="margin-left:-20px;margin-top:2px;float:left" ng-if="isLoading"><i class="fa fa-spinner fa-pulse"></i></div>
            </div>
            <div ng-show="disableLemgramAutocomplete">
                <div style="float:left">
                    <input autofocus type="text" ng-model="textInField">
                </div>
            </div>
        </div>
    """
    link : (scope, elem, attr) ->

        scope.typeaheadClose = () ->
            if scope.typeaheadCloseCallback
                scope.typeaheadCloseCallback({
                    valueSelected: scope.model? and _.isEmpty scope.textInField
                })

        scope.lemgramify = (lemgram) ->
            lemgramRegExp = /([^_\.-]*--)?([^-]*)\.\.(\w+)\.(\d\d?)/
            match = lemgram.match lemgramRegExp
            unless match then return false
            return {
                "main" : match[2].replace(/_/g, " "),
                "pos" : util.getLocaleString(match[3].slice(0, 2)),
                "index" : match[4],
                "namespace" : if match[1] then match[1].slice(0, -2) else "" }

        scope.sensify = (sense) ->
            senseParts = sense.split ".."
            return {
                "main" : senseParts[0].replace(/_/g, " "),
                "index" : senseParts[1]
            }

        scope.placeholderToString = _.memoize (placeholder) ->
            unless placeholder then return
            if scope.type is "lemgram"
                util.lemgramToString(placeholder).replace(/<.*?>/g, "")
            else
                util.saldoToPlaceholderString placeholder, true

        scope.selectedItem = (item, model, label) ->
            if scope.type is "lemgram"
                scope.placeholder = model.lemgram
                scope.model = regescape(model.lemgram)
            else
                scope.placeholder = model.sense
                scope.model = regescape(model.sense)
            scope.textInField = ""
            scope.typeaheadClose()

        if scope.model
            if scope.type == "sense"
                scope.selectedItem null, {sense : unregescape scope.model }
            else
                scope.selectedItem null, {lemgram : unregescape scope.model }

        scope.getMorphologies = (corporaIDs) ->
            morphologies = []
            if scope.variant is "dalin"
                morphologies.push "dalinm"
            else
                for corporaID in corporaIDs
                    morfs = settings.corpora[corporaID].morf?.split("|") or []
                    for morf in morfs
                        unless morf in morphologies then morphologies.push morf
                if morphologies.length is 0 then morphologies.push "saldom"
            return morphologies

        scope.getRows = (input) ->
            corporaIDs = _.pluck settings.corpusListing.selected, "id"
            morphologies = scope.getMorphologies corporaIDs
            if scope.type is "lemgram"
                return scope.getLemgrams input, morphologies, corporaIDs
            else if scope.type is "sense"
                return scope.getSenses input, morphologies, corporaIDs

        scope.getLemgrams = (input, morphologies, corporaIDs) ->
            deferred = $q.defer()
            http = lexicons.getLemgrams input, morphologies, corporaIDs, (scope.variant is "affix")
            http.then (data) ->
                data.forEach (item) ->
                    if scope.variant is 'affix' then item.count = -1
                    item.parts = scope.lemgramify(item.lemgram)
                    item.variant = scope.variant
                data.sort (a, b) -> b.count - a.count
                deferred.resolve data
            return deferred.promise

        scope.getSenses = (input, morphologies, corporaIDs) ->
            deferred = $q.defer()
            http = lexicons.getSenses input, (morphologies.join "|"), corporaIDs
            http.then (data) ->
                data.forEach (item) ->
                    item.parts = scope.sensify(item.sense)
                    if item.desc then item.desc = scope.sensify(item.desc)
                    item.variant = scope.variant
                data.sort (a, b) ->
                    if a.parts.main is b.parts.main
                        b.parts.index < a.parts.index
                    else
                        a.sense.length - b.sense.length
                deferred.resolve data
            return deferred.promise



korpApp.directive "typeaheadClickOpen", ($parse, $timeout)->
    dir =
        restrict: "A"
        require: "ngModel"
        link: ($scope, elem, attrs)->
            triggerFunc = (event)->
                if event.keyCode is 40 and not $scope.typeaheadIsOpen
                    ctrl = elem.controller 'ngModel'
                    prev = ctrl.$modelValue || ''
                    if prev
                        ctrl.$setViewValue ''
                        $timeout -> ctrl.$setViewValue "#{prev}"
            elem.bind 'keyup', triggerFunc



korpApp.directive "timeInterval", () ->
    scope :
        dateModel : "="
        timeModel : "="
        model : "="
        minDate : "="
        maxDate : "="

    restrict : "E"
    template : """
        <div>
            <uib-datepicker class="well well-sm" ng-model="dateModel"
                min-date="minDate" max-date="maxDate" init-date="minDate"
                show-weeks="true" starting-day="1"></uib-datepicker>

            <div class="time">
                <i class="fa fa-3x fa-clock-o"></i><uib-timepicker class="timepicker" ng-model="timeModel"
                    hour-step="1" minute-step="1" show-meridian="false"></uib-timepicker>
            </div>
        </div>
        """

    link : (s, elem, attr) ->
        s.isOpen = false
        s.open = (event) ->
            event.preventDefault()
            event.stopPropagation()
            s.isOpen = true

        time_units = ["hour", "minute"]
        w = s.$watchGroup ["dateModel", "timeModel"], ([date, time]) ->
            if date and time
                m = moment(moment(date).format("YYYY-MM-DD"))
                for t in time_units
                    m_time = moment(time)
                    m.add(m_time[t](), t)
                s.model = m



korpApp.directive 'reduceSelect', ($timeout) ->
    restrict: 'AE'
    scope:
      items: '=reduceItems'
      selected: '=reduceSelected'
      insensitive: '=reduceInsensitive'
      lang: '=reduceLang'
    replace : true
    template: '''
                  <div uib-dropdown auto-close="outsideClick" class="reduce-attr-select" on-toggle="toggled(open)">
                    <div uib-dropdown-toggle class="reduce-dropdown-button inline_block ui-state-default">
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
                  </div>'''

    link: (scope, element, attribute) ->

        scope.$watchCollection 'items', (() ->
            if scope.items
                scope.keyItems = {}
                for item in scope.items
                    scope.keyItems[item.value] = item

                scope.hasWordAttrs = _.filter(scope.keyItems, { 'group': 'word_attr' }).length > 0
                scope.hasStructAttrs = _.filter(scope.keyItems, { 'group': 'sentence_attr' }).length > 0

                if scope.selected and scope.selected.length > 0
                    for select in scope.selected
                        item = scope.keyItems[select]
                        if item
                            item.selected = true
                else
                    scope.keyItems["word"].selected = true
                if scope.insensitive
                    for insensitive in scope.insensitive
                        scope.keyItems[insensitive].insensitive = true
                updateSelected scope
        )

        updateSelected = (scope) ->
            scope.selected = _.pluck (_.filter scope.keyItems, (item, key) -> item.selected), "value"
            scope.numberAttributes = scope.selected.length

        scope.toggleSelected = (value, event) ->
            item = scope.keyItems[value]
            item.selected = not item.selected
            if value == "word" and not item.selected
                item.insensitive = false
                scope.insensitive = []
            updateSelected scope

            event.stopPropagation()

        scope.toggleWordInsensitive = (event) ->
            event.stopPropagation()
            scope.keyItems["word"].insensitive = not scope.keyItems["word"].insensitive
            if scope.keyItems["word"].insensitive
                scope.insensitive = ["word"]
            else
                scope.insensitive = []

            if not scope.keyItems["word"].selected
                scope.toggleSelected "word"

        scope.toggled = (open) ->
            # if no element is selected when closing popop, select word
            if not open and scope.numberAttributes == 0
                $timeout (() -> scope.toggleSelected "word"), 0

korpApp.directive "globalFilters", ($rootScope, $location, $q, structService) ->
    restrict: "E"
    scope: 
        lang: '='
    template: '''
                <div ng-if="showDirective" class="global-filters-container">
                  <span style="font-weight: bold"> {{ 'global_filter' | loc:lang}}:</span>
                  <global-filter lang="lang" ng-repeat="filterKey in showFilters"
                                 attr-value="filterValues[filterKey].value", 
                                 attr-label="getFilterLabel(filterKey)",
                                 possible-values="filterValues[filterKey].possibleValues" />'''
    link: (scope, element, attribute) ->

        def = $q.defer()

        $rootScope.$on "corpuschooserchange", () ->
            scope.showDirective = false
            if settings.corpusListing.selected.length is 1 and not _.isEmpty settings.globalFilterCorpora 
                corpus = settings.corpusListing.selected[0]
                if corpus.id in settings.globalFilterCorpora
                    scope.showDirective = true
                    scope.corpus = corpus.id

            if scope.showDirective
                scope.showFilters = settings.corpora[scope.corpus].showFilters
                if $location.search().global_filter
                    scope.initFilters()
                    scope.setFromLocation $location.search().global_filter
                else
                    scope.initFilters()
            else
                scope.showFilters = []
                scope.filterValues = {}
            def.resolve()

        scope.initFilters = () ->
            filterValues = {}
            filters = scope.showFilters

            for filter in filters
                filterValues[filter] = {}
                filterValues[filter].value = []
                filterValues[filter].possibleValues = []

            if not _.isEmpty filters
                structService.getStructValues(scope.corpus, filters).then (data) ->
                    for filter in filters
                        filterValues[filter].possibleValues = data[scope.corpus.toUpperCase()][filter]

            scope.filterValues = filterValues

        def.promise.then(() -> scope.$watch "filterValues", (() ->
            rep = {}
            for attrKey, attrValues of scope.filterValues
                if not _.isEmpty attrValues.value
                    rep[attrKey] = attrValues.value
            if not _.isEmpty rep
                $location.search("global_filter", JSON.stringify rep)
                $rootScope.globalFilter = scope.makeCqp()
            else
                $location.search("global_filter", null)
                $rootScope.globalFilter = null
            $rootScope.globalFilterDef.resolve()
        ), true)

        scope.$watch (() -> $location.search().global_filter), (filter) ->
            scope.setFromLocation filter
        
        scope.setFromLocation = (globalFilter) ->
            unless globalFilter then return
            unless scope.filterValues then return
            parsedFilter = JSON.parse globalFilter
            for attrKey, attrValues of parsedFilter
                scope.filterValues[attrKey].value = attrValues
            
            for attrKey, _ of scope.filterValues
                if attrKey not of parsedFilter
                    scope.filterValues[attrKey].value = []

        scope.getFilterLabel = (filterKey) -> 
            settings.corpora[scope.corpus].struct_attributes[filterKey].label

        scope.makeCqp = () ->
            exprs = []
            andArray = for attrKey, attrValues of scope.filterValues
                for attrValue in attrValues.value
                    { type: "_." + attrKey, op: "=", val: attrValue }

            return [{ and_block: andArray }]

korpApp.directive "globalFilter", () ->
    restrict: "E"
    scope:
      attrLabel: "="
      attrValue: "="
      possibleValues: "="
      lang: '='
    template: '''
                  <span uib-dropdown auto-close="outsideClick">
                    <button uib-dropdown-toggle class="btn btn-sm btn-default global-filter-toggle">
                      <div ng-if="attrValue.length == 0">
                        <span>{{ "filter_add" | loc:lang }}</span>
                        <span>{{attrLabel | loc:lang}}</span>
                      </div>
                      <div ng-if="attrValue.length != 0">
                        <span style="text-transform: capitalize">{{attrLabel | loc:lang}}:</span>
                        <span ng-repeat="selected in attrValue" class="selected-attr-value">{{selected}} </span>
                      </div>
                    </button>
                    <div uib-dropdown-menu class="global-filter-dropdown">
                      <ul>
                        <li ng-repeat="value in possibleValues" ng-class="{'selected': isSelected(value)}" class="attribute"
                            ng-click="toggleSelected(value, $event)">
                          <span ng-show="isSelected(value)">✔</span>
                          <span>{{value | loc:lang }}</span>
                        </li>
                      </ul>
                    </div>
                  </span>'''

    link: (scope, element, attribute) ->

        scope.toggleSelected = (value, event) ->
            if value in scope.attrValue
                scope.attrValue.splice (scope.attrValue.indexOf value), 1
            else
                scope.attrValue.push value
            event.stopPropagation()
        
        scope.isSelected = (value) ->
            return value in scope.attrValue


angular.module("template/datepicker/day.html", []).run ($templateCache) ->
    $templateCache.put "template/datepicker/day.html", """
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
        </table
    """

angular.module("template/datepicker/month.html", []).run ($templateCache) ->
  $templateCache.put "template/datepicker/month.html", """
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
    </table>
    """


angular.module("template/datepicker/year.html", []).run ($templateCache) ->
  $templateCache.put "template/datepicker/year.html", """
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
    </table>
    """


angular.module("template/timepicker/timepicker.html", []).run ($templateCache) ->
  $templateCache.put "template/timepicker/timepicker.html", """
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
    </table>
    """
