korpApp = angular.module("korpApp")

korpApp.directive 'kwicWord', ->
    replace: true
    template : """<span class="word" ng-class="getClassObj(wd)">
                    {{::wd.word}} </span>
                """ #ng-click="wordClick($event, wd, sentence)"
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
    scope : true
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
                # contentScope.tabs[index].onSelect()
            else
                (_.last contentScope.tabs)?.active = true
                # (_.last contentScope.tabs)?.onSelect()




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
                val.replace(/\\/g, "")
            else
                val

        $scope.input = unescape $scope.model
        $scope.$watch "orObj.op + input", () ->
            $scope.model = escape($scope.input)



korpApp.directive "tokenValue", ($compile, $controller) ->
    # defaultTmpl = "<input ng-model='model' 
    #             placeholder='{{tokenValue.value == \"word\" && !model.length && \"any\" | loc:lang}} '>"
    
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



    # require:'ngModel',
    scope :
        tokenValue : "="
        model : "=ngModel"
        orObj : "=orObj"
    template : """
        <div>{{tokenValue.label}}</div>
    """
    link : (scope, elem, attr) ->
        current = null
        scope.$watch "tokenValue", (valueObj) ->
            unless valueObj then return
            # c.log "$scope tokenValue link", valueObj
            if valueObj.value == current?.value then return
            current = valueObj

            

            # _.extend scope, (_.pick valueObj, "dataset", "translationKey")
            locals = {$scope : _.extend scope, valueObj} 
            $controller(valueObj.controller or defaultController, locals)

            # valueObj.controller?(scope, _.omit valueObj)
            if valueObj.value == "word"
                tmplObj = {maybe_placeholder : """placeholder='<{{"any" | loc:lang}}>'"""}
            else
                tmplObj = {maybe_placeholder : ""}

            defaultTmpl = getDefaultTmpl(tmplObj)
            tmplElem = $compile(valueObj.extended_template or defaultTmpl)(scope)
            elem.html(tmplElem).addClass("arg_value")


#korpApp.directive "korpAutocomplete", () ->
#    scope : 
#        model : "="
#        stringify : "="
#        sorter : "="
#        type : "@"
#    link : (scope, elem, attr) ->
#        
#        setVal = (lemgram) ->
#            $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, ""))
#                .val("").blur()
#        if scope.model
#            setVal(scope.model)
#        arg_value = elem.korp_autocomplete(
#            labelFunction: scope.stringify
#            sortFunction: scope.sorter
#            type: scope.type
#            select: (lemgram) ->
#                # $(this).data "value", (if data.label is "baseform" then lemgram.split(".")[0] else lemgram)
#                setVal(lemgram)
#                scope.$apply () ->
#                    if scope.type == "baseform"
#                        scope.model = lemgram.split(".")[0]
#                    else 
#                        scope.model = lemgram
#
#            "sw-forms": true
#        )
#        .blur(->
#            input = this
#            setTimeout (->
#
#                if ($(input).val().length and not util.isLemgramId($(input).val())) or $(input).data("value") is null
#                    $(input).addClass("invalid_input").attr("placeholder", null).data("value", null)
#                else
#                    $(input).removeClass("invalid_input")
#                # self._trigger "change"
#            ), 100
#        )




korpApp.directive "constr", ($window, searches) ->
    scope : true

    link : (scope, elem, attr) ->
        instance = new $window.view[attr.constr](elem, elem, scope)
        if attr.constrName
            $window[attr.constrName] = instance

        scope.instance = instance
        scope.$parent.instance = instance
            




korpApp.directive "searchSubmit", ($window, $document, $rootElement) ->
    template : '''
    <div class="search_submit">
        <div class="btn-group">
            <button class="btn btn-sm btn-default" id="sendBtn" ng-click="onSendClick()">{{'search' | loc:lang}}</button>
            <button class="btn btn-sm btn-default opener" ng-click="togglePopover($event)">
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
            <div class="abs badge" tooltip-html-unsafe="{{tooltipHTML}}">{{meter[2]}}</div>
        </div>
    '''
    replace: true
    scope :
        meter : "="
        max : "="
        stringify : "="
    link : (scope, elem, attr) ->
        wds = scope.meter[0]

        bkg = elem.find(".background")
        # bkg.html (_.map (_.compact wds.split("|")), scope.stringify).join(", ")
        if wds == "|"
            scope.displayWd = "&mdash;"
        else
            scope.displayWd = (_.map (_.compact wds.split("|")), scope.stringify).join(", ")
        
        scope.loglike = Math.abs scope.meter[1]


        scope.tooltipHTML = """
            #{util.getLocaleString('statstable_absfreq')}: #{scope.meter[2]}
            <br>
            loglike: #{scope.loglike}
        """

        w = elem.parent().width()
        part = ((scope.loglike) / (Math.abs scope.max))

        bkg.width Math.round (part * w)




korpApp.directive "popper", ($rootElement) ->
    scope: {}
    link : (scope, elem, attrs) ->
        popup = elem.next()
        popup.appendTo("body").hide()
        closePopup = () ->
            popup.hide()
        
        c.log "attrs.noCloseOnClick", attrs.noCloseOnClick?
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
    # scope : true
    scope : {
        cqp : "="
    }, 
    link : ($scope, elem, attr) ->
        s = $scope

        # if $location.search().cqp
        #     try
        #         s.data = CQP.parse($location.search().cqp)
        #     catch e
        #         # TODO: we could traverse the token list, trying to repair parsing, se above
        #         s.data = CQP.parse("[]")
        # else
            # s.data = CQP.parse(val)

        setCQP = (val) ->
            c.log "inner cqp change", val
            try
                s.data = CQP.parse(val)
                c.log "s.data", s.data
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
                c.log "crash", s.data

            for token in s.data
                if "and_block" not of token or not token.and_block.length
                    token.and_block = CQP.parse('[word = ""]')[0].and_block


        # s.$watch "cqp", (val) ->

        s.cqp ?= '[]'
        setCQP(s.cqp)


        s.$watch 'getCQPString()', (val) ->
            c.log "getCQPString", val
            # if val
                # setCQP(val)
            s.cqp = val
            
        s.getCQPString = ->
            return (CQP.stringify s.data) or ""


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

        s.removeToken = (i) ->
            unless s.data.length > 1 then return
            s.data.splice(i, 1)

  
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
    # scope : 
        # clickCover : "="
    link : (scope, elem, attr) ->
        cover = $("<div>").css(
            position: "absolute"
            top: 0
            left: 0
            right : 0
            bottom : 0
        ).on "click", () -> return false
        pos = elem.css("position") or "static"
        scope.$watch () -> 
            scope.$eval attr.clickCover
        , (val) ->
            if val
                elem.prepend(cover)
                elem.css("position", "relative").addClass("covered")
            else
                cover.remove()
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
    <div class="pager-wrapper" ng-show="gotFirstKwic" >
      <pagination
         total-items="hits"
         ng-if="gotFirstKwic"
         ng-model="pageObj.pager"
         ng-click="pageChange($event, pageObj.pager)"
         max-size="15"
         items-per-page="::$root._searchOpts.hits_per_page"
         previous-text="‹" next-text="›" first-text="«" last-text="»" 
         boundary-links="true" 
         rotate="false" 
         num-pages="$parent.numPages"> </pagination>
      <div class="page_input"><span>{{'goto_page' | loc:lang}} </span>
        <input ng-model="gotoPage" ng-keyup="onPageInput($event, gotoPage, numPages)" 
            ng-click="$event.stopPropagation()" />
        {{'of' | loc:lang}} {{numPages}}
      </div>

    </div>
    """

korpApp.directive "autoc", ($q, $http, lexicons) ->
    replace: true
    restrict: "E"
    scope:
        "placeholder" : "="
        "model" : "="
        "type" : "@"
        "variant" : "@"
    template: """
        <div>
            <script type="text/ng-template" id="lemgramautocomplete.html">
                <a style="cursor:pointer">
                    <span ng-class="{'autocomplete-item-disabled' : match.model.count == 0, 'none-to-find' : match.model.count == 0 && noVariant()}">
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
            <div style="float:left"><input
                class="new_simple_text"
                type="text" class="form-control"
                ng-model="textInField"
                typeahead="row for row in getRows($viewValue)"
                typeahead-wait-ms="500"
                typeahead-template-url="lemgramautocomplete.html"
                typeahead-loading="isLoading"
                typeahead-on-select="selectedItem($item, $model, $label)"
                placeholder="{{lemgramToString(placeholder)}}"></div>
            <div style="margin-left:-20px;margin-top:2px;float:left" ng-if="isLoading"><i class="fa fa-spinner fa-pulse"></i></div>
        </div>
    """
    link : (scope, elem, attr) ->
        scope.noVariant = () ->
            return variant isnt 'dalin'
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

        scope.lemgramToString = (lemgram) ->
            unless lemgram then return
            util.lemgramToString(lemgram).replace(/<.*?>/g, "")

        scope.formatPlaceholder = (input) ->
            lemgramRegExp = /([^_\.-]*--)?([^-]*)\.\.(\w+)\.(\d\d?)/
            match = input.match lemgramRegExp
            if match # Lemgram
                return scope.lemgramToString(input)
            else # Sense
                return input

        scope.selectedItem = (item, model, label) ->
            scope.placeholder = model.lemgram
            scope.model = model.lemgram
            scope.textInField = ""

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
                lemgrams = scope.getLemgrams input, morphologies, corporaIDs
                return lemgrams
            else if scope.type is "sense"
                return scope.getSenses input, morphologies, corporaIDs
        scope.getLemgrams = (input, morphologies, corporaIDs) ->
            deferred = $q.defer()
            http = lexicons.getLemgrams input, (morphologies.join "|"), corporaIDs, (scope.variant is "affix")
            http.then (data) ->
                data.forEach (item) ->
                    if scope.variant is 'affix' then item.count = -1
                    item.parts = scope.lemgramify(item.lemgram)
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
                data.sort (a, b) -> b.count - a.count
                deferred.resolve data
            return deferred.promise



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
            <datepicker class="well well-sm" ng-model="dateModel" 
                min-date="minDate" max-date="maxDate" init-date="minDate"
                show-weeks="true" starting-day="1"></datepicker>

            <div class="time">
                <i class="fa fa-3x fa-clock-o"></i><timepicker class="timepicker" ng-model="timeModel" 
                    hour-step="1" minute-step="1" show-meridian="false"></timepicker>
            </div>
        </div>
        """

    link : (s, elem, attr) ->
        s.isOpen = false
        s.open = (event) ->
            event.preventDefault()
            event.stopPropagation()
            s.isOpen = true 

        # s.model = null

        time_units = ["hour", "minute"]

        s.$watchGroup ["dateModel", "timeModel"], ([date, time]) ->
            if date and time
                m = moment(date)
                for t in time_units
                    m_time = moment(time)
                    m.add(t, m_time[t]())

                s.model = m


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