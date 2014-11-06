korpApp = angular.module("korpApp")

korpApp.directive 'kwicWord', ->
    replace: true
    template : """<span class="word" ng-class="getClassObj(wd)"
                    set-text="wd.word + ' '" ></span>
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
                val.replace(/\\/g, "")
            else
                val

        $scope.input = unescape $scope.model
        $scope.$watch "orObj.op + input", () ->
            $scope.model = escape($scope.input)



korpApp.directive "tokenValue", ($compile, $controller) ->
    # defaultTmpl = "<input ng-model='model' 
    #             placeholder='{{tokenValue.value == \"word\" && !model.length && \"any\" | loc}} '>"
    
    getDefaultTmpl = _.template """
                <input ng-model='input' class='arg_value' escaper ng-model-options='{debounce : 300}'
                <%= maybe_placeholder %>>
                <span class='val_mod' popper
                    ng-class='{sensitive : case == "sensitive", insensitive : case == "insensitive"}'>
                        Aa
                </span> 
                <ul class='mod_menu popper_menu dropdown-menu'>
                    <li><a ng-click='makeSensitive()'>{{'case_sensitive' | loc}}</a></li>
                    <li><a ng-click='makeInsensitive()'>{{'case_insensitive' | loc}}</a></li>
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
                tmplObj = {maybe_placeholder : """placeholder='<{{"any" | loc}}>'"""}
            else
                tmplObj = {maybe_placeholder : ""}

            defaultTmpl = getDefaultTmpl(tmplObj)
            tmplElem = $compile(valueObj.extended_template or defaultTmpl)(scope)
            elem.html(tmplElem).addClass("arg_value")


korpApp.directive "korpAutocomplete", () ->
    scope : 
        model : "="
        stringify : "="
        sorter : "="
        type : "@"
    link : (scope, elem, attr) ->
        
        setVal = (lemgram) ->
            $(elem).attr("placeholder", scope.stringify(lemgram, true).replace(/<\/?[^>]+>/g, ""))
                .val("").blur().placeholder()
        if scope.model
            setVal(scope.model)
        arg_value = elem.korp_autocomplete(
            labelFunction: scope.stringify
            sortFunction: scope.sorter
            type: scope.type
            select: (lemgram) ->
                # $(this).data "value", (if data.label is "baseform" then lemgram.split(".")[0] else lemgram)
                setVal(lemgram)
                scope.$apply () ->
                    if scope.type == "baseform"
                        scope.model = lemgram.split(".")[0]
                    else 
                        scope.model = lemgram

            "sw-forms": true
        )
        .blur(->
            input = this
            setTimeout (->

                if ($(input).val().length and not util.isLemgramId($(input).val())) or $(input).data("value") is null
                    $(input).addClass("invalid_input").attr("placeholder", null).data("value", null).placeholder()
                else
                    $(input).removeClass("invalid_input")
                # self._trigger "change"
            ), 100
        )




korpApp.directive "constr", ($window, searches) ->
    scope : true

    link : (scope, elem, attr) ->
        # searches.modeDef.then () ->
        instance = new $window.view[attr.constr](elem, elem, scope)
        if attr.constrName
            $window[attr.constrName] = instance

        scope.instance = instance
        scope.$parent.instance = instance
            

        # c.log "$window[attr.constrName]", $window[attr.constrName], elem




korpApp.directive "searchSubmit", ($window, $document, $rootElement) ->
    template : '''
    <div class="search_submit">
        <div class="btn-group">
            <button class="btn btn-small" id="sendBtn" ng-click="onSendClick()">{{'search' | loc}}</button>
            <button class="btn btn-small opener" ng-click="togglePopover($event)">
                <span class="caret"></span>
            </button>
        </div>
        <div class="popover compare {{pos}}" ng-click="onPopoverClick($event)">
            <div class="arrow"></div>
            <h3 class="popover-title">{{'compare_save_header' | loc}}</h3>
            <form class="popover-content" ng-submit="onSubmit()">
                <div>
                    <label for="cmp_input">{{'compare_name' | loc}} :</label> <input id="cmp_input" ng-model="name">
                </div>
                <div class="btn_container">
                    <button class="btn btn-primary btn-small">{{'compare_save' | loc}}</button>
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
        
        popup.on "click", (event) ->
            closePopup()
            return false

        elem.on "click", (event) ->
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
    scope : 
        clickCover : "="
    link : (scope, elem, attr) ->
        cover = $("<div>").css(
            position: "absolute"
            top: 0
            left: 0
            right : 0
            bottom : 0
        ).on "click", () -> return false
        pos = elem.css("position") or "static"
        scope.$watch "clickCover", (val) ->
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

